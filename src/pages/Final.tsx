import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box3, Vector3, Mesh, TextureLoader, Texture, Color, ShaderMaterial, DataTexture, RGBAFormat, FloatType, SphereGeometry, MeshBasicMaterial } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment Shader
const fragmentShader = `
    uniform vec3 uColor;
    uniform vec3 uEmissive;
    uniform sampler2D map_Empty;
    uniform sampler2D map_BackAndPinky;
    uniform float opacity_BackAndPinky;
    uniform sampler2D map_BackAndPinkyLeft;
    uniform float opacity_BackAndPinkyLeft;
    uniform sampler2D map_HeadInner;
    uniform float opacity_HeadInner;
    uniform sampler2D map_HeadInnerLeft;
    uniform float opacity_HeadInnerLeft;
    uniform sampler2D map_HeadOuter;
    uniform float opacity_HeadOuter;
    uniform sampler2D map_HeadOuterLeft;
    uniform float opacity_HeadOuterLeft;
    uniform sampler2D map_Neck;
    uniform float opacity_Neck;
    uniform sampler2D map_NeckLeft;
    uniform float opacity_NeckLeft;
    uniform sampler2D map_NeckInner;
    uniform float opacity_NeckInner;
    uniform sampler2D map_NeckInnerLeft;
    uniform float opacity_NeckInnerLeft;
    uniform sampler2D map_NeckOuter;
    uniform float opacity_NeckOuter;
    uniform sampler2D map_NeckOuterLeft;
    uniform float opacity_NeckOuterLeft;
    uniform sampler2D map_NeckSlice;
    uniform float opacity_NeckSlice;
    uniform sampler2D map_NeckSliceLeft;
    uniform float opacity_NeckSliceLeft;
    uniform sampler2D map_NeckToElbow;
    uniform float opacity_NeckToElbow;
    uniform sampler2D map_NeckToElbowLeft;
    uniform float opacity_NeckToElbowLeft;
    uniform sampler2D map_NeckToMiddleFinger;
    uniform float opacity_NeckToMiddleFinger;
    uniform sampler2D map_NeckToMiddleFingerLeft;
    uniform float opacity_NeckToMiddleFingerLeft;
    uniform sampler2D map_NeckToThumb;
    uniform float opacity_NeckToThumb;
    uniform sampler2D map_NeckToThumbLeft;
    uniform float opacity_NeckToThumbLeft;
    uniform sampler2D map_Shoulder;
    uniform float opacity_Shoulder;
    uniform sampler2D map_ShoulderLeft;
    uniform float opacity_ShoulderLeft;
    uniform sampler2D map_ShoulderInner;
    uniform float opacity_ShoulderInner;
    uniform sampler2D map_ShoulderInnerLeft;
    uniform float opacity_ShoulderInnerLeft;
    uniform sampler2D map_ShoulderOuter;
    uniform float opacity_ShoulderOuter;
    uniform sampler2D map_ShoulderOuterLeft;
    uniform float opacity_ShoulderOuterLeft;
    uniform sampler2D map_ThighToElbow;
    uniform float opacity_ThighToElbow;
    uniform sampler2D map_ThighToElbowLeft;
    uniform float opacity_ThighToElbowLeft;
    varying vec2 vUv;

    void main() {
        vec4 tex_Empty = texture2D(map_Empty, vUv);
        if (tex_Empty.g > 0.0)
            discard;

        vec4 tex_BackAndPinky = texture2D(map_BackAndPinky, vUv);
        float alpha_BackAndPinky = tex_BackAndPinky.g * opacity_BackAndPinky;

        vec4 tex_HeadInner = texture2D(map_HeadInner, vUv);
        float alpha_HeadInner = tex_HeadInner.g * opacity_HeadInner;

        vec4 tex_HeadOuter = texture2D(map_HeadOuter, vUv);
        float alpha_HeadOuter = tex_HeadOuter.g * opacity_HeadOuter;

        vec4 tex_Neck = texture2D(map_Neck, vUv);
        float alpha_Neck = tex_Neck.g * opacity_Neck;

        vec4 tex_NeckInner = texture2D(map_NeckInner, vUv);
        float alpha_NeckInner = tex_NeckInner.g * opacity_NeckInner;

        vec4 tex_NeckOuter = texture2D(map_NeckOuter, vUv);
        float alpha_NeckOuter = tex_NeckOuter.g * opacity_NeckOuter;

        vec4 tex_NeckSlice = texture2D(map_NeckSlice, vUv);
        float alpha_NeckSlice = tex_NeckSlice.g * opacity_NeckSlice;

        vec4 tex_NeckToElbow = texture2D(map_NeckToElbow, vUv);
        float alpha_NeckToElbow = tex_NeckToElbow.g * opacity_NeckToElbow;

        vec4 tex_NeckToMiddleFinger = texture2D(map_NeckToMiddleFinger, vUv);
        float alpha_NeckToMiddleFinger = tex_NeckToMiddleFinger.g * opacity_NeckToMiddleFinger;

        vec4 tex_NeckToThumb = texture2D(map_NeckToThumb, vUv);
        float alpha_NeckToThumb = tex_NeckToThumb.g * opacity_NeckToThumb;

        vec4 tex_Shoulder = texture2D(map_Shoulder, vUv);
        float alpha_Shoulder = tex_Shoulder.g * opacity_Shoulder;

        vec4 tex_ShoulderInner = texture2D(map_ShoulderInner, vUv);
        float alpha_ShoulderInner = tex_ShoulderInner.g * opacity_ShoulderInner;

        vec4 tex_ShoulderOuter = texture2D(map_ShoulderOuter, vUv);
        float alpha_ShoulderOuter = tex_ShoulderOuter.g * opacity_ShoulderOuter;

        vec4 tex_ThighToElbow = texture2D(map_ThighToElbow, vUv);
        float alpha_ThighToElbow = tex_ThighToElbow.g * opacity_ThighToElbow;


        vec3 color = uColor + uEmissive;
        float opacity = 
            alpha_BackAndPinky
            + alpha_HeadInner
            + alpha_HeadOuter
            + alpha_Neck
            + alpha_NeckInner
            + alpha_NeckOuter
            + alpha_NeckSlice
            + alpha_NeckToElbow
            + alpha_NeckToMiddleFinger
            + alpha_NeckToThumb
            + alpha_Shoulder
            + alpha_ShoulderInner
            + alpha_ShoulderOuter
            + alpha_ThighToElbow;
        gl_FragColor = vec4(color, opacity);
    }
`;

interface EditableDataTexture extends DataTexture {
    origWidth: number;
    origHeight: number;
}

const createEditableTexture = (originalTexture: Texture): EditableDataTexture => {
    const width = originalTexture.image.width;
    const height = originalTexture.image.height;

    // Create a canvas to read the original texture
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Could not create canvas context");
    }

    // Draw the original texture onto the canvas
    ctx.drawImage(originalTexture.image, 0, 0);

    // Get the pixel data
    const imageData = ctx.getImageData(0, 0, width, height);

    // Create a new data texture that we can modify
    const data = new Float32Array(width * height * 4);

    // Copy the data from the original
    for (let i = 0; i < width * height * 4; i++) {
        data[i] = imageData.data[i] / 255;
    }

    const texture = new DataTexture(data, width, height, RGBAFormat, FloatType) as EditableDataTexture;
    texture.needsUpdate = true;
    texture.origWidth = width;
    texture.origHeight = height;
    texture.flipY = originalTexture.flipY; // Match the original texture's flipY setting

    return texture;
};

interface EraserToolProps {
    editableTexture: EditableDataTexture | null;
    modelMesh: Mesh | null;
    isErasing: boolean;
}

const EraserTool = ({ editableTexture, modelMesh, isErasing }: EraserToolProps) => {
    const { camera, gl, raycaster, pointer, scene } = useThree();
    const [isActive, setIsActive] = useState<boolean>(false);
    const eraserCursor = useRef<Mesh | null>(null);
    const eraserSize = useRef<number>(8); // Eraser size in pixels
    const textureNeedsUpdate = useRef<boolean>(false); // <-- Add Ref to track update necessity

    // Create a visible cursor for the eraser
    useEffect(() => {
        if (!scene) return;

        const geometry = new SphereGeometry(eraserSize.current/60, 16, 16);
        const material = new MeshBasicMaterial({
            color: 0x336666,
            transparent: true,
            opacity: 0.5
        });

        const eraserSphere = new Mesh(geometry, material);
        eraserSphere.visible = false;
        scene.add(eraserSphere);
        eraserCursor.current = eraserSphere;

        return () => {
            if (eraserCursor.current && scene) {
                scene.remove(eraserCursor.current);
            }
        };
    }, [scene]);

    // Update cursor visibility based on isErasing prop
    useEffect(() => {
        if (eraserCursor.current) {
            eraserCursor.current.visible = isErasing;
        }
    }, [isErasing]);

    // --- Update texture in render loop ---
    useFrame(() => {
        // If the flag is set, update the texture and reset the flag
        if (textureNeedsUpdate.current && editableTexture) {
            editableTexture.needsUpdate = true;
            textureNeedsUpdate.current = false;
        }
    });

    // Update cursor position and handle erasing on pointer move
    useEffect(() => {
        if (!modelMesh || !editableTexture || !isErasing) return;

        const updateCursorAndErase = () => {
            if (!eraserCursor.current || !modelMesh) return;

            // Update raycaster with current pointer position
            raycaster.setFromCamera(pointer, camera);

            // Check if we're hovering over the model
            const intersects = raycaster.intersectObject(modelMesh, true);

            if (intersects.length > 0) {
                // Position the eraser cursor at the intersection point
                eraserCursor.current.position.copy(intersects[0].point);
                eraserCursor.current.visible = true;

                // If we're actively erasing and have UV coordinates, modify the texture
                if (isActive && intersects[0].uv) {
                    erase(intersects[0].uv.x, intersects[0].uv.y);
                }
            } else {
                if (eraserCursor.current) {
                    eraserCursor.current.visible = false;
                }
            }
        };

        // Erase function that modifies the texture
        const erase = (uvX: number, uvY: number) => {
            if (!editableTexture || !editableTexture.image) return;

            const width = editableTexture.origWidth;
            const height = editableTexture.origHeight;
            const data = editableTexture.image.data as Float32Array;
            const radius = eraserSize.current;
            let modified = false; // Track if any pixel was changed in *this* call

            // Convert UV coordinates to pixel coordinates
            const x = Math.floor(uvX * width);
            const y = Math.floor(uvY * height);

            // Apply eraser
            for (let i = -radius; i <= radius; i++) {
                for (let j = -radius; j <= radius; j++) {
                    if (i * i + j * j <= radius * radius) { // Circle check
                        const px = x + i;
                        const py = y + j;

                        // Check bounds
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            const idx = (py * width + px) * 4;

                            // Set the green channel to 1.0 for erasing
                            // Only update if it's not already erased
                            if (data[idx + 1] < 1.0) {
                                data[idx + 1] = 1.0;
                                modified = true; // Mark that we changed a pixel
                            }
                        }
                    }
                }
            }

            // If we modified any pixel in this erase call, set the flag
            if (modified) {
                textureNeedsUpdate.current = true;
            }
        };

        // Add event listeners
        const handleMouseDown = (e: MouseEvent | TouchEvent) => {
            if (e instanceof MouseEvent && e.button === 0 || e instanceof TouchEvent) { // Left mouse button
                setIsActive(true);
                updateCursorAndErase();
            }
        };

        const handleMouseUp = () => {
            setIsActive(false);
        };

        const handleMouseMove = () => {
            if(isActive) { // Only erase if mouse button is down
                updateCursorAndErase();
            } else if (eraserCursor.current && isErasing) { // Update cursor position even if not erasing
                raycaster.setFromCamera(pointer, camera);
                const intersects = raycaster.intersectObject(modelMesh, true);
                if (intersects.length > 0) {
                    eraserCursor.current.position.copy(intersects[0].point);
                    eraserCursor.current.visible = true;
                } else {
                    eraserCursor.current.visible = false;
                }
            }
        };

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) { // Only when holding Ctrl/Cmd
                e.preventDefault();
                eraserSize.current = Math.max(5, Math.min(16, eraserSize.current - Math.sign(e.deltaY) * 5));

                // Update cursor size
                if (eraserCursor.current) {
                    const scale = eraserSize.current / 8; // Base size is 15
                    eraserCursor.current.scale.set(scale, scale, scale);
                }
            }
        };

        gl.domElement.addEventListener("mousedown", handleMouseDown);
        gl.domElement.addEventListener("mouseup", handleMouseUp);
        gl.domElement.addEventListener("mousemove", handleMouseMove);
        gl.domElement.addEventListener("touchstart", handleMouseDown);
        gl.domElement.addEventListener("touchend", handleMouseUp);
        gl.domElement.addEventListener("touchmove", handleMouseMove);
        gl.domElement.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            gl.domElement.removeEventListener("mousedown", handleMouseDown);
            gl.domElement.removeEventListener("mouseup", handleMouseUp);
            gl.domElement.removeEventListener("mousemove", handleMouseMove);
            gl.domElement.removeEventListener("touchstart", handleMouseDown);
            gl.domElement.removeEventListener("touchend", handleMouseUp);
            gl.domElement.removeEventListener("touchmove", handleMouseMove);
            gl.domElement.removeEventListener("wheel", handleWheel);
        };
    }, [
        camera,
        gl.domElement,
        raycaster,
        pointer,
        editableTexture,
        modelMesh,
        isActive,
        isErasing
    ]);

    return null;
};

const Final = ({ sliderValues, isErasing } : { sliderValues: Record<string, number>, isErasing: boolean }) => {
    const [tex_BackAndPinky, setTex_BackAndPinky] = useState<Texture | null>(null);
    const [tex_BackAndPinkyLeft, setTex_BackAndPinkyLeft] = useState<Texture | null>(null);
    const [tex_HeadInner, setTex_HeadInner] = useState<Texture | null>(null);
    const [tex_HeadInnerLeft, setTex_HeadInnerLeft] = useState<Texture | null>(null);
    const [tex_HeadOuter, setTex_HeadOuter] = useState<Texture | null>(null);
    const [tex_HeadOuterLeft, setTex_HeadOuterLeft] = useState<Texture | null>(null);
    const [tex_Neck, setTex_Neck] = useState<Texture | null>(null);
    const [tex_NeckLeft, setTex_NeckLeft] = useState<Texture | null>(null);
    const [tex_NeckInner, setTex_NeckInner] = useState<Texture | null>(null);
    const [tex_NeckInnerLeft, setTex_NeckInnerLeft] = useState<Texture | null>(null);
    const [tex_NeckOuter, setTex_NeckOuter] = useState<Texture | null>(null);
    const [tex_NeckOuterLeft, setTex_NeckOuterLeft] = useState<Texture | null>(null);
    const [tex_NeckSlice, setTex_NeckSlice] = useState<Texture | null>(null);
    const [tex_NeckSliceLeft, setTex_NeckSliceLeft] = useState<Texture | null>(null);
    const [tex_NeckToElbow, setTex_NeckToElbow] = useState<Texture | null>(null);
    const [tex_NeckToElbowLeft, setTex_NeckToElbowLeft] = useState<Texture | null>(null);
    const [tex_NeckToMiddleFinger, setTex_NeckToMiddleFinger] = useState<Texture | null>(null);
    const [tex_NeckToMiddleFingerLeft, setTex_NeckToMiddleFingerLeft] = useState<Texture | null>(null);
    const [tex_NeckToThumb, setTex_NeckToThumb] = useState<Texture | null>(null);
    const [tex_NeckToThumbLeft, setTex_NeckToThumbLeft] = useState<Texture | null>(null);
    const [tex_Shoulder, setTex_Shoulder] = useState<Texture | null>(null);
    const [tex_ShoulderLeft, setTex_ShoulderLeft] = useState<Texture | null>(null);
    const [tex_ShoulderInner, setTex_ShoulderInner] = useState<Texture | null>(null);
    const [tex_ShoulderInnerLeft, setTex_ShoulderInnerLeft] = useState<Texture | null>(null);
    const [tex_ShoulderOuter, setTex_ShoulderOuter] = useState<Texture | null>(null);
    const [tex_ShoulderOuterLeft, setTex_ShoulderOuterLeft] = useState<Texture | null>(null);
    const [tex_ThighToElbow, setTex_ThighToElbow] = useState<Texture | null>(null);
    const [tex_ThighToElbowLeft, setTex_ThighToElbowLeft] = useState<Texture | null>(null);
    const [tex_Empty, setTex_Empty] = useState<Texture | null>(null);
    const gltf = useLoader(GLTFLoader, "/models/model_final.glb");
    const baseScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
    const leftScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
    const [editableTexture, setEditableTexture] = useState<EditableDataTexture | null>(null);
    const modelRef = useRef<Mesh | null>(null);

    useEffect(() => {
        const texLoader = new TextureLoader();
        texLoader.load("/textures/Empty.png", t => {
            t.flipY = false;
            setTex_Empty(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/BackAndPinky.png", t => {
            t.flipY = false;
            setTex_BackAndPinky(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/BackAndPinky_left.png", t => {
            t.flipY = false;
            setTex_BackAndPinkyLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/HeadInner.png", t => {
            t.flipY = false;
            setTex_HeadInner(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/HeadInner_left.png", t => {
            t.flipY = false;
            setTex_HeadInnerLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/HeadOuter.png", t => {
            t.flipY = false;
            setTex_HeadOuter(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/HeadOuter_left.png", t => {
            t.flipY = false;
            setTex_HeadOuterLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/Neck.png", t => {
            t.flipY = false;
            setTex_Neck(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/Neck_left.png", t => {
            t.flipY = false;
            setTex_NeckLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckInner.png", t => {
            t.flipY = false;
            setTex_NeckInner(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckInner_left.png", t => {
            t.flipY = false;
            setTex_NeckInnerLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckOuter.png", t => {
            t.flipY = false;
            setTex_NeckOuter(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckOuter_left.png", t => {
            t.flipY = false;
            setTex_NeckOuterLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckSlice.png", t => {
            t.flipY = false;
            setTex_NeckSlice(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckSlice_left.png", t => {
            t.flipY = false;
            setTex_NeckSliceLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckToElbow.png", t => {
            t.flipY = false;
            setTex_NeckToElbow(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckToElbow_left.png", t => {
            t.flipY = false;
            setTex_NeckToElbowLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckToMiddleFinger.png", t => {
            t.flipY = false;
            setTex_NeckToMiddleFinger(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckToMiddleFinger_left.png", t => {
            t.flipY = false;
            setTex_NeckToMiddleFingerLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckToThumb.png", t => {
            t.flipY = false;
            setTex_NeckToThumb(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/NeckToThumb_left.png", t => {
            t.flipY = false;
            setTex_NeckToThumbLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/Shoulder.png", t => {
            t.flipY = false;
            setTex_Shoulder(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/Shoulder_left.png", t => {
            t.flipY = false;
            setTex_ShoulderLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/ShoulderInner.png", t => {
            t.flipY = false;
            setTex_ShoulderInner(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/ShoulderInner_left.png", t => {
            t.flipY = false;
            setTex_ShoulderInnerLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/ShoulderOuter.png", t => {
            t.flipY = false;
            setTex_ShoulderOuter(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/ShoulderOuter_left.png", t => {
            t.flipY = false;
            setTex_ShoulderOuterLeft(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/ThighToElbow.png", t => {
            t.flipY = false;
            setTex_ThighToElbow(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Final/ThighToElbow_left.png", t => {
            t.flipY = false;
            setTex_ThighToElbowLeft(t);
        }, () => {}, e => console.log(e));
    }, []);

    // Create editable texture once the original is loaded
    useEffect(() => {
        if (tex_Empty && tex_Empty.image) {
            const editableTex = createEditableTexture(tex_Empty);
            setEditableTexture(editableTex);
        }
    }, [tex_Empty]);

    const pos = useMemo(() => {
        const box = new Box3();
        box.expandByObject(gltf.scene);
        const pos = box.getCenter(new Vector3());
        return new Vector3(-pos.x, -pos.y-5, -pos.z);
    }, [gltf.scene]);

    useEffect(() => {
        if (!editableTexture) return;

        gltf.scene.traverse(obj => {
            if (obj instanceof Mesh && obj.name === "FinalBaseMesh") {
                modelRef.current = obj;
                obj.material = new ShaderMaterial({
                    polygonOffset: true,
                    polygonOffsetFactor: -1,
                    polygonOffsetUnits: -1,
                    vertexShader,
                    fragmentShader,
                    uniforms: {
                        uColor: { value: new Color("#ff3333") },
                        uEmissive: { value: new Color("#550000") },
                        map_Empty: { value: editableTexture },
                        map_BackAndPinky: { value: tex_BackAndPinky },
                        opacity_BackAndPinky: { value: sliderValues["BackAndPinky"]/100.0 },
                        map_HeadInner: { value: tex_HeadInner },
                        opacity_HeadInner: { value: sliderValues["HeadInner"]/100.0 },
                        map_HeadOuter: { value: tex_HeadOuter },
                        opacity_HeadOuter: { value: sliderValues["HeadOuter"]/100.0 },
                        map_Neck: { value: tex_Neck },
                        opacity_Neck: { value: sliderValues["Neck"]/100.0 },
                        map_NeckInner: { value: tex_NeckInner },
                        opacity_NeckInner: { value: sliderValues["NeckInner"]/100.0 },
                        map_NeckOuter: { value: tex_NeckOuter },
                        opacity_NeckOuter: { value: sliderValues["NeckOuter"]/100.0 },
                        map_NeckSlice: { value: tex_NeckSlice },
                        opacity_NeckSlice: { value: sliderValues["NeckSlice"]/100.0 },
                        map_NeckToElbow: { value: tex_NeckToElbow },
                        opacity_NeckToElbow: { value: sliderValues["NeckToElbow"]/100.0 },
                        map_NeckToMiddleFinger: { value: tex_NeckToMiddleFinger },
                        opacity_NeckToMiddleFinger: { value: sliderValues["NeckToMiddleFinger"]/100.0 },
                        map_NeckToThumb: { value: tex_NeckToThumb },
                        opacity_NeckToThumb: { value: sliderValues["NeckToThumb"]/100.0 },
                        map_Shoulder: { value: tex_Shoulder },
                        opacity_Shoulder: { value: sliderValues["Shoulder"]/100.0 },
                        map_ShoulderInner: { value: tex_ShoulderInner },
                        opacity_ShoulderInner: { value: sliderValues["ShoulderInner"]/100.0 },
                        map_ShoulderOuter: { value: tex_ShoulderOuter },
                        opacity_ShoulderOuter: { value: sliderValues["ShoulderOuter"]/100.0 },
                        map_ThighToElbow: { value: tex_ThighToElbow },
                        opacity_ThighToElbow: { value: sliderValues["ThighToElbow"]/100.0 },
                    },
                    transparent: true,
                    depthWrite: false,
                    depthTest: true,
                });
            }
        });
        leftScene.traverse(obj => {
            if (obj instanceof Mesh && obj.name === "FinalBaseMesh") {
                obj.material = new ShaderMaterial({
                    polygonOffset: true,
                    polygonOffsetFactor: -1,
                    polygonOffsetUnits: -1,
                    vertexShader,
                    fragmentShader,
                    uniforms: {
                        uColor: { value: new Color("#ff3333") },
                        uEmissive: { value: new Color("#550000") },
                        map_Empty: { value: editableTexture },
                        map_BackAndPinky: { value: tex_BackAndPinkyLeft },
                        opacity_BackAndPinky: { value: sliderValues["left_BackAndPinky"]/100.0 },
                        map_HeadInner: { value: tex_HeadInnerLeft },
                        opacity_HeadInner: { value: sliderValues["left_HeadInner"]/100.0 },
                        map_HeadOuter: { value: tex_HeadOuterLeft },
                        opacity_HeadOuter: { value: sliderValues["left_HeadOuter"]/100.0 },
                        map_Neck: { value: tex_NeckLeft },
                        opacity_Neck: { value: sliderValues["left_Neck"]/100.0 },
                        map_NeckInner: { value: tex_NeckInnerLeft },
                        opacity_NeckInner: { value: sliderValues["left_NeckInner"]/100.0 },
                        map_NeckOuter: { value: tex_NeckOuterLeft },
                        opacity_NeckOuter: { value: sliderValues["left_NeckOuter"]/100.0 },
                        map_NeckSlice: { value: tex_NeckSliceLeft },
                        opacity_NeckSlice: { value: sliderValues["left_NeckSlice"]/100.0 },
                        map_NeckToElbow: { value: tex_NeckToElbowLeft },
                        opacity_NeckToElbow: { value: sliderValues["left_NeckToElbow"]/100.0 },
                        map_NeckToMiddleFinger: { value: tex_NeckToMiddleFingerLeft },
                        opacity_NeckToMiddleFinger: { value: sliderValues["left_NeckToMiddleFinger"]/100.0 },
                        map_NeckToThumb: { value: tex_NeckToThumbLeft },
                        opacity_NeckToThumb: { value: sliderValues["left_NeckToThumb"]/100.0 },
                        map_Shoulder: { value: tex_ShoulderLeft },
                        opacity_Shoulder: { value: sliderValues["left_Shoulder"]/100.0 },
                        map_ShoulderInner: { value: tex_ShoulderInnerLeft },
                        opacity_ShoulderInner: { value: sliderValues["left_ShoulderInner"]/100.0 },
                        map_ShoulderOuter: { value: tex_ShoulderOuterLeft },
                        opacity_ShoulderOuter: { value: sliderValues["left_ShoulderOuter"]/100.0 },
                        map_ThighToElbow: { value: tex_ThighToElbowLeft },
                        opacity_ThighToElbow: { value: sliderValues["left_ThighToElbow"]/100.0 },
                    },
                    transparent: true,
                    depthWrite: false,
                    depthTest: true,
                });
            }
        });
    }, [
        editableTexture,
        gltf.scene,
        leftScene,
        sliderValues,
        tex_BackAndPinky,
        tex_BackAndPinkyLeft,
        tex_Empty,
        tex_HeadInner,
        tex_HeadInnerLeft,
        tex_HeadOuter,
        tex_HeadOuterLeft,
        tex_Neck,
        tex_NeckInner,
        tex_NeckInnerLeft,
        tex_NeckLeft,
        tex_NeckOuter,
        tex_NeckOuterLeft,
        tex_NeckSlice,
        tex_NeckSliceLeft,
        tex_NeckToElbow,
        tex_NeckToElbowLeft,
        tex_NeckToMiddleFinger,
        tex_NeckToMiddleFingerLeft,
        tex_NeckToThumb,
        tex_NeckToThumbLeft,
        tex_Shoulder,
        tex_ShoulderInner,
        tex_ShoulderInnerLeft,
        tex_ShoulderLeft,
        tex_ShoulderOuter,
        tex_ShoulderOuterLeft,
        tex_ThighToElbow,
        tex_ThighToElbowLeft
    ]);

    return (
        <group position={pos}>
            <group>
                <primitive object={gltf.scene} />
            </group>
            <group>
                <primitive object={leftScene} />
            </group>
            <group>
                <primitive object={baseScene}/>
            </group>
            {editableTexture && modelRef.current && (
                <EraserTool
                    editableTexture={editableTexture}
                    modelMesh={modelRef.current}
                    isErasing={isErasing}
                />
            )}
        </group>
    );
};

export default Final;