// Checkpoint: erases but not persistent

import { useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box3, Vector3, Mesh, TextureLoader, Texture, Color, ShaderMaterial, DataTexture, RGBAFormat, FloatType, SphereGeometry, MeshBasicMaterial, WebGLRenderTarget, Scene, OrthographicCamera, Vector2, PlaneGeometry } from "three";
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
    uniform sampler2D uEraserMask;
    uniform sampler2D map_Empty;
    uniform sampler2D map_HeadInner;
    uniform float opacity_HeadInner;
    uniform sampler2D map_HeadOuter;
    uniform float opacity_HeadOuter;
    uniform sampler2D map_NeckToElbow;
    uniform float opacity_NeckToElbow;
    uniform sampler2D map_NeckSlice;
    uniform float opacity_NeckSlice;
    uniform sampler2D map_ShoulderInner;
    uniform float opacity_ShoulderInner;
    uniform sampler2D map_ShoulderOuter;
    uniform float opacity_ShoulderOuter;
    uniform sampler2D map_NeckInner;
    uniform float opacity_NeckInner;
    uniform sampler2D map_NeckOuter;
    uniform float opacity_NeckOuter;
    uniform sampler2D map_Shoulder;
    uniform float opacity_Shoulder;
    uniform sampler2D map_Neck;
    uniform float opacity_Neck;
    uniform sampler2D map_ThighToElbow;
    uniform float opacity_ThighToElbow;
    uniform sampler2D map_BackAndPinky;
    uniform float opacity_BackAndPinky;
    uniform sampler2D map_NeckToMiddleFinger;
    uniform float opacity_NeckToMiddleFinger;
    uniform sampler2D map_NeckToThumb;
    uniform float opacity_NeckToThumb;
    varying vec2 vUv;

    void main() {
        vec4 eraserMask = texture2D(uEraserMask, vUv);
        if (eraserMask.r > 0.5) // If the red channel (white) is present, discard
            discard;
        //vec4 tex_Empty = texture2D(map_Empty, vUv);
        //if (tex_Empty.g > 0.0)
        //    discard;

        vec4 tex_HeadInner = texture2D(map_HeadInner, vUv);
        float alpha_HeadInner = tex_HeadInner.g * opacity_HeadInner;

        vec4 tex_HeadOuter = texture2D(map_HeadOuter, vUv);
        float alpha_HeadOuter = tex_HeadOuter.g * opacity_HeadOuter;

        vec4 tex_NeckToElbow = texture2D(map_NeckToElbow, vUv);
        float alpha_NeckToElbow = tex_NeckToElbow.g * opacity_NeckToElbow;

        vec4 tex_NeckSlice = texture2D(map_NeckSlice, vUv);
        float alpha_NeckSlice = tex_NeckSlice.g * opacity_NeckSlice;

        vec4 tex_ShoulderInner = texture2D(map_ShoulderInner, vUv);
        float alpha_ShoulderInner = tex_ShoulderInner.g * opacity_ShoulderInner;

        vec4 tex_ShoulderOuter = texture2D(map_ShoulderOuter, vUv);
        float alpha_ShoulderOuter = tex_ShoulderOuter.g * opacity_ShoulderOuter;

        vec4 tex_NeckInner = texture2D(map_NeckInner, vUv);
        float alpha_NeckInner = tex_NeckInner.g * opacity_NeckInner;

        vec4 tex_NeckOuter = texture2D(map_NeckOuter, vUv);
        float alpha_NeckOuter = tex_NeckOuter.g * opacity_NeckOuter;
        
        vec4 tex_Shoulder = texture2D(map_Shoulder, vUv);
        float alpha_Shoulder = tex_Shoulder.g * opacity_Shoulder;

        vec4 tex_Neck = texture2D(map_Neck, vUv);
        float alpha_Neck = tex_Neck.g * opacity_Neck;

        vec4 tex_ThighToElbow = texture2D(map_ThighToElbow, vUv);
        float alpha_ThighToElbow = tex_ThighToElbow.g * opacity_ThighToElbow;

        vec4 tex_BackAndPinky = texture2D(map_BackAndPinky, vUv);
        float alpha_BackAndPinky = tex_BackAndPinky.g * opacity_BackAndPinky;

        vec4 tex_NeckToMiddleFinger = texture2D(map_NeckToMiddleFinger, vUv);
        float alpha_NeckToMiddleFinger = tex_NeckToMiddleFinger.g * opacity_NeckToMiddleFinger;

        vec4 tex_NeckToThumb = texture2D(map_NeckToThumb, vUv);
        float alpha_NeckToThumb = tex_NeckToThumb.g * opacity_NeckToThumb;


        vec3 color = uColor + uEmissive;
        gl_FragColor = vec4(color, alpha_HeadInner + alpha_HeadOuter + alpha_NeckToElbow + alpha_NeckSlice + alpha_ShoulderInner + alpha_ShoulderOuter + alpha_NeckInner + alpha_NeckOuter + alpha_Shoulder + alpha_Neck + alpha_ThighToElbow + alpha_BackAndPinky + alpha_NeckToMiddleFinger + alpha_NeckToThumb);
    }
`;

// Shader to draw a white circle
const eraserDrawVertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const eraserDrawFragmentShader = `
    varying vec2 vUv;
    uniform vec2 uCenter;
    uniform float uRadius;

    void main() {
        float dist = distance(vUv, uCenter);
        if (dist < uRadius) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White color for erasing
        } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); // Transparent black
        }
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
    eraserRenderTarget: WebGLRenderTarget | null; // Add render target prop
}

const EraserTool = ({ editableTexture, modelMesh, isErasing, eraserRenderTarget }: EraserToolProps) => {
    const { camera, gl, raycaster, pointer, scene } = useThree();
    const [isActive, setIsActive] = useState<boolean>(false);
    const eraserCursor = useRef<Mesh | null>(null);
    const eraserSize = useRef<number>(10); // Eraser size in pixels
    const eraserDrawMaterial = useRef<ShaderMaterial | null>(null); // Material for drawing
    const eraserDrawScene = useRef<Scene>(new Scene()); // Scene for drawing
    const eraserDrawCamera = useRef<OrthographicCamera>(new OrthographicCamera(-1, 1, 1, -1, 0, 1)); // Orthographic camera
    const eraserDrawQuad = useRef<Mesh | null>(null); // Quad to draw onto

    // Create a visible cursor for the eraser
    useEffect(() => {
        if (!scene) return;

        const geometry = new SphereGeometry(eraserSize.current/60, 16, 16);
        const material = new MeshBasicMaterial({
            color: 0xff0000,
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

    useEffect(() => {
        eraserDrawMaterial.current = new ShaderMaterial({
            vertexShader: eraserDrawVertexShader,
            fragmentShader: eraserDrawFragmentShader,
            uniforms: {
                uCenter: { value: new Vector2(0.5, 0.5) }, // Will be updated
                uRadius: { value: eraserSize.current / (editableTexture?.origWidth || 1) / 2 }, // Initial radius
            },
        });

        const geometry = new PlaneGeometry(2, 2);
        eraserDrawQuad.current = new Mesh(geometry, eraserDrawMaterial.current);
        eraserDrawScene.current.add(eraserDrawQuad.current);
    }, [editableTexture]);

    // Update cursor visibility based on isErasing prop
    useEffect(() => {
        if (eraserCursor.current) {
            eraserCursor.current.visible = isErasing;
        }
    }, [isErasing]);

    // --- Update texture in render loop ---
    // useFrame(() => {
    //     // If the flag is set, update the texture and reset the flag
    //     if (textureNeedsUpdate.current && editableTexture) {
    //         editableTexture.needsUpdate = true;
    //         textureNeedsUpdate.current = false;
    //     }
    // });

    // Update cursor position and handle erasing on pointer move
    useEffect(() => {
        if (!modelMesh || !editableTexture || !isErasing || !eraserRenderTarget || !eraserDrawMaterial.current) return;

        const updateCursorAndErase = () => {
            if (!eraserCursor.current || !modelMesh) return;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObject(modelMesh, true);

            if (intersects.length > 0) {
                eraserCursor.current.position.copy(intersects[0].point);
                eraserCursor.current.visible = true;

                if (isActive && intersects[0].uv) {
                    erase(intersects[0].uv.x, intersects[0].uv.y);
                }
            } else {
                if (eraserCursor.current) {
                    eraserCursor.current.visible = false;
                }
            }
        };

        const erase = (uvX: number, uvY: number) => {
            if (!eraserRenderTarget || !eraserDrawMaterial.current || !editableTexture || !gl) return;

            const width = editableTexture.origWidth;
            // const height = editableTexture.origHeight;
            const radiusUV = eraserSize.current / width / 2; // Radius in UV space

            eraserDrawMaterial.current.uniforms.uCenter.value.set(uvX, uvY); // Flip Y for UV
            eraserDrawMaterial.current.uniforms.uRadius.value = radiusUV;

            // Temporarily disable auto clear
            // const autoClearColor = gl.autoClearColor;
            gl.autoClearColor = false;

            // Render to the render target
            gl.setRenderTarget(eraserRenderTarget);
            gl.render(eraserDrawScene.current, eraserDrawCamera.current);

            // Restore auto clear
            // gl.autoClearColor = autoClearColor;
            gl.setRenderTarget(null); // Reset render target
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 0) {
                setIsActive(true);
                updateCursorAndErase();
            }
        };

        const handleMouseUp = () => {
            setIsActive(false);
        };

        const handleMouseMove = () => {
            if(isActive) {
                updateCursorAndErase();
            } else if (eraserCursor.current && isErasing) {
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
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                eraserSize.current = Math.max(5, Math.min(50, eraserSize.current - Math.sign(e.deltaY) * 5));
                if (eraserCursor.current) {
                    const scale = eraserSize.current / 15;
                    eraserCursor.current.scale.set(scale, scale, scale);
                }
                if (eraserDrawMaterial.current && editableTexture) {
                    eraserDrawMaterial.current.uniforms.uRadius.value = eraserSize.current / editableTexture.origWidth / 2;
                }
            }
        };

        gl.domElement.addEventListener("mousedown", handleMouseDown);
        gl.domElement.addEventListener("mouseup", handleMouseUp);
        gl.domElement.addEventListener("mousemove", handleMouseMove);
        gl.domElement.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            gl.domElement.removeEventListener("mousedown", handleMouseDown);
            gl.domElement.removeEventListener("mouseup", handleMouseUp);
            gl.domElement.removeEventListener("mousemove", handleMouseMove);
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
        isErasing,
        gl,
        eraserDrawMaterial,
        eraserRenderTarget
    ]);

    return null;
};

const Model = ({ sliderValues, isErasing } : { sliderValues: Record<string, number>, isErasing: boolean }) => {
    const [tex_HeadInner, setTex_HeadInner] = useState<Texture | null>(null);
    const [tex_HeadOuter, setTex_HeadOuter] = useState<Texture | null>(null);
    const [tex_NeckToElbow, setTex_NeckToElbow] = useState<Texture | null>(null);
    const [tex_NeckSlice, setTex_NeckSlice] = useState<Texture | null>(null);
    const [tex_ShoulderInner, setTex_ShoulderInner] = useState<Texture | null>(null);
    const [tex_ShoulderOuter, setTex_ShoulderOuter] = useState<Texture | null>(null);
    const [tex_NeckInner, setTex_NeckInner] = useState<Texture | null>(null);
    const [tex_NeckOuter, setTex_NeckOuter] = useState<Texture | null>(null);
    const [tex_Shoulder, setTex_Shoulder] = useState<Texture | null>(null);
    const [tex_Neck, setTex_Neck] = useState<Texture | null>(null);
    const [tex_ThighToElbow, setTex_ThighToElbow] = useState<Texture | null>(null);
    const [tex_BackAndPinky, setTex_BackAndPinky] = useState<Texture | null>(null);
    const [tex_NeckToMiddleFinger, setTex_NeckToMiddleFinger] = useState<Texture | null>(null);
    const [tex_NeckToThumb, setTex_NeckToThumb] = useState<Texture | null>(null);
    const [tex_Empty, setTex_Empty] = useState<Texture | null>(null);
    const [flippedScene, setFlippedScene] = useState<any>(null);
    const gltf = useLoader(GLTFLoader, "/models/model_tex.glb");
    const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
    const [editableTexture, setEditableTexture] = useState<EditableDataTexture | null>(null);
    const modelRef = useRef<Mesh | null>(null);
    const { gl } = useThree(); // Get the WebGLRenderer instance
    const eraserRenderTarget = useRef<any>(null); // Ref for the render target

    useEffect(() => {
        const texLoader = new TextureLoader();
        texLoader.load("/textures/Empty.png", t => {
            t.flipY = false;
            setTex_Empty(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/HeadInner.png", t => {
            t.flipY = false;
            setTex_HeadInner(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/HeadOuter.png", t => {
            t.flipY = false;
            setTex_HeadOuter(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/NeckToElbow.png", t => {
            t.flipY = false;
            setTex_NeckToElbow(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/NeckSlice.png", t => {
            t.flipY = false;
            setTex_NeckSlice(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/ShoulderInner.png", t => {
            t.flipY = false;
            setTex_ShoulderInner(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/ShoulderOuter.png", t => {
            t.flipY = false;
            setTex_ShoulderOuter(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/NeckInner.png", t => {
            t.flipY = false;
            setTex_NeckInner(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/NeckOuter.png", t => {
            t.flipY = false;
            setTex_NeckOuter(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Shoulder.png", t => {
            t.flipY = false;
            setTex_Shoulder(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/Neck.png", t => {
            t.flipY = false;
            setTex_Neck(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/ThighToElbow.png", t => {
            t.flipY = false;
            setTex_ThighToElbow(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/BackAndPinky.png", t => {
            t.flipY = false;
            setTex_BackAndPinky(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/NeckToMiddleFinger.png", t => {
            t.flipY = false;
            setTex_NeckToMiddleFinger(t);
        }, () => {}, e => console.log(e));
        texLoader.load("/textures/NeckToThumb.png", t => {
            t.flipY = false;
            setTex_NeckToThumb(t);
        }, () => {}, e => console.log(e));
    }, []);

    // Create editable texture once the original is loaded
    useEffect(() => {
        if (tex_Empty && tex_Empty.image) {
            const editableTex = createEditableTexture(tex_Empty);
            setEditableTexture(editableTex);

            // Create the render target
            eraserRenderTarget.current = new WebGLRenderTarget(
                editableTex.origWidth,
                editableTex.origHeight,
                {
                    format: RGBAFormat,
                    type: FloatType,
                    stencilBuffer: false,
                }
            );
        }
    }, [tex_Empty, gl]);

    const pos = useMemo(() => {
        const box = new Box3();
        box.expandByObject(gltf.scene);
        const pos = box.getCenter(new Vector3());
        return new Vector3(-pos.x, -pos.y-5, -pos.z);
    }, [gltf.scene]);

    useEffect(() => {
        if (!editableTexture || !eraserRenderTarget.current) return;

        gltf.scene.traverse(obj => {
            if (!(obj instanceof Mesh))
                return;

            if (obj.name === "FinalBaseMesh") {
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
                        uEraserMask: { value: eraserRenderTarget.current.texture },
                        map_Empty: { value: editableTexture },
                        map_HeadInner: { value: tex_HeadInner },
                        opacity_HeadInner: { value: sliderValues["HeadInner"]/100.0 },
                        map_HeadOuter: { value: tex_HeadOuter },
                        opacity_HeadOuter: { value: sliderValues["HeadOuter"]/100.0 },
                        map_NeckToElbow: { value: tex_NeckToElbow },
                        opacity_NeckToElbow: { value: sliderValues["NeckToElbow"]/100.0 },
                        map_NeckSlice: { value: tex_NeckSlice },
                        opacity_NeckSlice: { value: sliderValues["NeckSlice"]/100.0 },
                        map_ShoulderInner: { value: tex_ShoulderInner },
                        opacity_ShoulderInner: { value: sliderValues["ShoulderInner"]/100.0 },
                        map_ShoulderOuter: { value: tex_ShoulderOuter },
                        opacity_ShoulderOuter: { value: sliderValues["ShoulderOuter"]/100.0 },
                        map_NeckInner: { value: tex_NeckInner },
                        opacity_NeckInner: { value: sliderValues["NeckInner"]/100.0 },
                        map_NeckOuter: { value: tex_NeckOuter },
                        opacity_NeckOuter: { value: sliderValues["NeckOuter"]/100.0 },
                        map_Shoulder: { value: tex_Shoulder },
                        opacity_Shoulder: { value: sliderValues["Shoulder"]/100.0 },
                        map_Neck: { value: tex_Neck },
                        opacity_Neck: { value: sliderValues["Neck"]/100.0 },
                        map_ThighToElbow: { value: tex_ThighToElbow },
                        opacity_ThighToElbow: { value: sliderValues["ThighToElbow"]/100.0 },
                        map_BackAndPinky: { value: tex_BackAndPinky },
                        opacity_BackAndPinky: { value: sliderValues["BackAndPinky"]/100.0 },
                        map_NeckToMiddleFinger: { value: tex_NeckToMiddleFinger },
                        opacity_NeckToMiddleFinger: { value: sliderValues["NeckToMiddleFinger"]/100.0 },
                        map_NeckToThumb: { value: tex_NeckToThumb },
                        opacity_NeckToThumb: { value: sliderValues["NeckToThumb"]/100.0 },
                    },
                    transparent: true,
                    depthWrite: false,
                    depthTest: true,
                });
            }
        });
        setFlippedScene(() => {
            const c = gltf.scene.clone(true);
            const obj = c.children[0];
            if (obj instanceof Mesh) {
                obj.material = new ShaderMaterial({
                    polygonOffset: true,
                    polygonOffsetFactor: -12,
                    polygonOffsetUnits: -12,
                    vertexShader,
                    fragmentShader,
                    uniforms: {
                        uColor: { value: new Color("#ff3333") },
                        uEmissive: { value: new Color("#550000") },
                        map_HeadInner: { value: tex_HeadInner },
                        opacity_HeadInner: { value: sliderValues["left_HeadInner"]/100.0 },
                        map_HeadOuter: { value: tex_HeadOuter },
                        opacity_HeadOuter: { value: sliderValues["left_HeadOuter"]/100.0 },
                        map_NeckToElbow: { value: tex_NeckToElbow },
                        opacity_NeckToElbow: { value: sliderValues["left_NeckToElbow"]/100.0 },
                        map_NeckSlice: { value: tex_NeckSlice },
                        opacity_NeckSlice: { value: sliderValues["left_NeckSlice"]/100.0 },
                        map_ShoulderInner: { value: tex_ShoulderInner },
                        opacity_ShoulderInner: { value: sliderValues["left_ShoulderInner"]/100.0 },
                        map_ShoulderOuter: { value: tex_ShoulderOuter },
                        opacity_ShoulderOuter: { value: sliderValues["left_ShoulderOuter"]/100.0 },
                        map_NeckInner: { value: tex_NeckInner },
                        opacity_NeckInner: { value: sliderValues["left_NeckInner"]/100.0 },
                        map_NeckOuter: { value: tex_NeckOuter },
                        opacity_NeckOuter: { value: sliderValues["left_NeckOuter"]/100.0 },
                        map_Shoulder: { value: tex_Shoulder },
                        opacity_Shoulder: { value: sliderValues["left_Shoulder"]/100.0 },
                        map_Neck: { value: tex_Neck },
                        opacity_Neck: { value: sliderValues["left_Neck"]/100.0 },
                        map_ThighToElbow: { value: tex_ThighToElbow },
                        opacity_ThighToElbow: { value: sliderValues["left_ThighToElbow"]/100.0 },
                        map_BackAndPinky: { value: tex_BackAndPinky },
                        opacity_BackAndPinky: { value: sliderValues["left_BackAndPinky"]/100.0 },
                        map_NeckToMiddleFinger: { value: tex_NeckToMiddleFinger },
                        opacity_NeckToMiddleFinger: { value: sliderValues["left_NeckToMiddleFinger"]/100.0 },
                        map_NeckToThumb: { value: tex_NeckToThumb },
                        opacity_NeckToThumb: { value: sliderValues["left_NeckToThumb"]/100.0 },
                    },
                    transparent: true,
                    depthWrite: false,
                    depthTest: true,
                });
            }
            return c;
        });

    }, [
        editableTexture,
        gltf.scene,
        sliderValues,
        tex_BackAndPinky,
        tex_Empty,
        tex_HeadInner,
        tex_HeadOuter,
        tex_Neck,
        tex_NeckInner,
        tex_NeckOuter,
        tex_NeckSlice,
        tex_NeckToElbow,
        tex_NeckToMiddleFinger,
        tex_NeckToThumb,
        tex_Shoulder,
        tex_ShoulderInner,
        tex_ShoulderOuter,
        tex_ThighToElbow
    ]);

    return (
        <group position={pos}>
            <group>
                <primitive object={gltf.scene} />
            </group>
            <group>
                <primitive object={clonedScene}/>
            </group>
            <group scale={[-1,1,1]}>
                {flippedScene && <primitive object={flippedScene} />}
            </group>
            {editableTexture && modelRef.current && (
                <EraserTool
                    editableTexture={editableTexture}
                    modelMesh={modelRef.current}
                    isErasing={isErasing}
                    eraserRenderTarget={eraserRenderTarget.current}
                />
            )}
        </group>
    );
};

export default Model;