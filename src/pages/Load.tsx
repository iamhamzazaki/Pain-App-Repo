import React, { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DirectionalLight, Object3D, Object3DJSON, ObjectLoader, Vector3 } from "three";
import Overview from "../components/Overview";

export default function Load() {
    const [model, setModel] = useState<Object3D | null>(null);
    const [values, setValues] = useState<Record<string, number> | null>(null);
    const lightRef = useRef<DirectionalLight>(null);
    const initialCameraPos = new Vector3(-3, 2, -7);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target?.result) {
                    const loader = new ObjectLoader();
                    const json = JSON.parse(e.target.result as string) as Object3DJSON & {state: Record<string, number>};
                    setValues(json.state);
                    loader.parse(json, (obj: Object3D) => setModel(obj));
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center">
            <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="p-2 my-4 border border-gray-300 rounded"
            />
            <div className="flex flex-col lg:flex-row gap-x-8 gap-y-8 items-center justify-center">
                <div className="border-2 border-red-200 rounded h-[80vh] w-[80vw] lg:w-[40vw]">
                    <Canvas camera={{ position: initialCameraPos }}>
                        <ambientLight intensity={0.2} />
                        <directionalLight ref={lightRef} color="white" position={initialCameraPos} intensity={4}/>
                        <Suspense fallback={null}>
                            {model &&
                                <primitive object={model} />
                            }
                        </Suspense>
                        <OrbitControls onChange={(e: any) => {
                            if (!e) return;
                            const camera = e.target.object;
                            if (lightRef.current) {
                                // Light follows camera movement
                                lightRef.current.position.set(0, 1, 0);
                                lightRef.current.position.add(camera.position);
                            }
                        }}/>
                    </Canvas>
                </div>
                <div className="flex flex-col w-[80vw] lg:w-[25vw] h-[80vh] gap-y-2 border-2 border-blue-50 rounded mt-4 px-4 overflow-y-auto">
                    {values && <Overview state={values} />}
                </div>
            </div>
        </div>
    );
}
