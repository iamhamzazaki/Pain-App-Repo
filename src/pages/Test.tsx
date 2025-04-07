import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Main component
const App: React.FC = () => {
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <Canvas camera={{ position: [0, 1.5, 2], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <ModelWithPainter modelPath="/models/model_new_new.glb" />
                <OrbitControls makeDefault enableZoom enableRotate={false}/>
            </Canvas>
        </div>
    );
};

interface ModelWithPainterProps {
  modelPath: string;
}

interface MousePosition {
  x: number;
  y: number;
  needsUpdate: boolean;
}

// Model with texture painting functionality
const ModelWithPainter: React.FC<ModelWithPainterProps> = ({ modelPath }) => {
    const { scene } = useGLTF(modelPath);
    const meshRef = useRef<THREE.Mesh | null>(null);
    const [painting, setPainting] = useState<boolean>(false);
    const [textureSize] = useState<number>(1024); // Texture resolution
    const [brushColor] = useState<THREE.Color>(new THREE.Color("red")); // Fixed brush color
    const [brushRadius] = useState<number>(10); // Fixed brush radius in pixels
    const textureRef = useRef<THREE.CanvasTexture | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const mousePosition = useRef<MousePosition>({ x: 0, y: 0, needsUpdate: false });
    const lastPaintPosition = useRef<{ x: number, y: number } | null>(null);

    const { raycaster, camera, gl } = useThree();

    // Performance optimization: Pre-calculate ray direction
    const rayHelper = useMemo(() => new THREE.Vector2(), []);

    // Initialize texture canvas and apply to model
    useEffect(() => {
    // Find the first mesh with UV coordinates
        let targetMesh: THREE.Mesh | null = null;

        scene.traverse((object) => {
            if (object instanceof THREE.Mesh &&
          object.geometry &&
          object.geometry.attributes.uv) {
                targetMesh = object;
            }
        });

        if (!targetMesh) {
            console.error("No mesh with UV coordinates found");
            return;
        }

        // Clone the mesh to avoid modifying the original
        const clonedMesh = (targetMesh as THREE.Mesh).clone() as THREE.Mesh;
        meshRef.current = clonedMesh;

        // Create a canvas for the new texture - using OffscreenCanvas for better performance if available
        const canvas = document.createElement("canvas");
        canvas.width = textureSize;
        canvas.height = textureSize;
        canvasRef.current = canvas;

        // Get and store the context reference to avoid creating it each frame
        const ctx = canvas.getContext("2d", { alpha: true });
        contextRef.current = ctx;

        if (ctx) {
            // Create a base texture with a light gray color
            ctx.fillStyle = "#f5f5f5";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add a subtle grid pattern to help visualize the UV space
            ctx.strokeStyle = "#e0e0e0";
            ctx.lineWidth = 1;

            // Draw grid lines more efficiently - just draw major grid lines
            const gridSize = 128; // Larger grid for better performance
            for (let i = 0; i <= canvas.width; i += gridSize) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
        }

        // Create a new texture from the canvas with optimized settings
        const newTexture = new THREE.CanvasTexture(canvas);

        // Optimize texture settings
        newTexture.minFilter = THREE.LinearFilter; // Avoid mipmapping
        newTexture.generateMipmaps = false;        // Disable mipmap generation
        newTexture.wrapS = THREE.ClampToEdgeWrapping;
        newTexture.wrapT = THREE.ClampToEdgeWrapping;

        textureRef.current = newTexture;

        // Create a new material with our texture
        let newMaterial: THREE.MeshStandardMaterial;

        if ((targetMesh as THREE.Mesh).material instanceof THREE.MeshStandardMaterial) {
            // Clone the existing material to keep its properties
            newMaterial = ((targetMesh as THREE.Mesh).material as THREE.MeshStandardMaterial).clone();
        } else {
            // Create a new standard material
            newMaterial = new THREE.MeshStandardMaterial({
                roughness: 0.7,
                metalness: 0.0
            });
        }

        // Apply our new texture
        newMaterial.map = newTexture;

        // Apply the material to the mesh
        clonedMesh.material = newMaterial;

        return () => {
            // Clean up resources
            if (textureRef.current) textureRef.current.dispose();
            newMaterial.dispose();
        };
    }, [scene, textureSize]);

    // Handle mouse events for painting
    useEffect(() => {
        const handleMouseDown = () => {
            setPainting(true);
            lastPaintPosition.current = null; // Reset on new paint stroke
        };

        const handleMouseUp = () => {
            setPainting(false);
            lastPaintPosition.current = null;
        };

        gl.domElement.addEventListener("mousedown", handleMouseDown);
        gl.domElement.addEventListener("mouseup", handleMouseUp);
        gl.domElement.addEventListener("mouseleave", handleMouseUp);

        return () => {
            gl.domElement.removeEventListener("mousedown", handleMouseDown);
            gl.domElement.removeEventListener("mouseup", handleMouseUp);
            gl.domElement.removeEventListener("mouseleave", handleMouseUp);
        };
    }, [gl]);

    // Track mouse position with throttling
    useEffect(() => {
        // let frameId: number;
        // let lastTime = 0;
        // const throttleInterval = 16; // ~60fps

        const updateMousePosition = (e: MouseEvent) => {
            mousePosition.current = {
                x: e.clientX,
                y: e.clientY,
                needsUpdate: true
            };
        };

        window.addEventListener("mousemove", updateMousePosition);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            // cancelAnimationFrame(frameId);
        };
    }, []);

    // Draw line between points for smooth painting
    const drawLine = (
        ctx: CanvasRenderingContext2D,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        radius: number,
        color: THREE.Color
    ) => {
    // Calculate distance and angle between points
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only interpolate if points are far enough apart
        if (distance < 2) {
            return;
        }

        // Number of steps based on distance (more points for longer lines)
        const steps = Math.max(Math.floor(distance / (radius * 0.5)), 2);

        // Draw circles along the line for smooth stroke
        const colorString = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
        ctx.fillStyle = colorString;

        for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            const x = x1 + dx * t;
            const y = y1 + dy * t;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    // Painting logic - optimized frameloop
    useFrame(() => {
        if (!painting || !meshRef.current || !canvasRef.current || !contextRef.current) return;

        // Skip this frame if no mouse movement
        if (!mousePosition.current.needsUpdate) return;

        // Get canvas dimensions for normalized coordinates
        const canvas = gl.domElement;
        const rect = canvas.getBoundingClientRect();

        // Calculate normalized device coordinates (-1 to +1)
        rayHelper.set(
            ((mousePosition.current.x - rect.left) / rect.width) * 2 - 1,
            -((mousePosition.current.y - rect.top) / rect.height) * 2 + 1
        );

        // Cast a ray from the camera to the mesh
        raycaster.setFromCamera(rayHelper, camera);

        const intersects = raycaster.intersectObject(meshRef.current, true);

        // Reset update flag
        mousePosition.current.needsUpdate = false;

        if (intersects.length > 0) {
            const intersection = intersects[0];
            if (intersection.uv) {
                const uv = intersection.uv;
                const canvasX = Math.floor(uv.x * textureSize);
                const canvasY = Math.floor((1 - uv.y) * textureSize);

                // For first point in a stroke, just draw a circle
                if (!lastPaintPosition.current) {
                    contextRef.current.beginPath();
                    contextRef.current.arc(canvasX, canvasY, brushRadius, 0, Math.PI * 2);
                    contextRef.current.fillStyle = `rgb(${brushColor.r * 255}, ${brushColor.g * 255}, ${brushColor.b * 255})`;
                    contextRef.current.fill();
                } else {
                    // Draw a line between the last point and current point for smooth strokes
                    drawLine(
                        contextRef.current,
                        lastPaintPosition.current.x,
                        lastPaintPosition.current.y,
                        canvasX,
                        canvasY,
                        brushRadius,
                        brushColor
                    );
                }

                // Save current position
                lastPaintPosition.current = { x: canvasX, y: canvasY };

                // Update the texture - but limit the frequency of updates
                if (textureRef.current) {
                    textureRef.current.needsUpdate = true;
                }
            }
        }
    });

    return meshRef.current ? <primitive object={meshRef.current} /> : null;
};

export default App;