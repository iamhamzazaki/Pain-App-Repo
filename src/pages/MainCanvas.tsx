import { Canvas } from "@react-three/fiber";
import { DirectionalLight, Vector3 } from "three";
import { Html, OrbitControls, useProgress } from "@react-three/drei";
import { Suspense, useRef } from "react";
// import Model from "./Model";
import Final from "./Final";

const MainCanvas = ({ canvasRef, sliderValues, isErasing } : { canvasRef: any, sliderValues: Record<string, number>, isErasing: boolean }) => {
    const lightRef = useRef<DirectionalLight>(null);

    const initialCameraPos = new Vector3(-3,2,-7);

    return (
        <Canvas camera={{ position: initialCameraPos}}>
            {/* Lighting */}
            <ambientLight intensity={0.2} />
            <directionalLight ref={lightRef} color="white" position={initialCameraPos} intensity={4}/>

            {/* Camera */}
            <OrbitControls enabled={!isErasing} onChange={(e) => {
                if (!e) return;
                const camera = e.target.object;

                if (lightRef.current) {
                    // Light follows camera movement
                    lightRef.current.position.set(0, 1, 0);
                    lightRef.current.position.add(camera.position);
                }
            }}/>

            {/* Model */}
            <group ref={canvasRef}>
                <Suspense fallback={<Loader />}>
                    <Final sliderValues={sliderValues} isErasing={isErasing} />
                    {/* <Model sliderValues={sliderValues} isErasing={isErasing} /> */}
                </Suspense>
            </group>
        </Canvas>
    );
};

function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div>
                Loading {Math.round(progress)}%
            </div>
        </Html>
    );
}

export default MainCanvas;