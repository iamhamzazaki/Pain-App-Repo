import { useLocation, useNavigate } from "react-router";
import Button from "../components/Button";
import MainCanvas from "./MainCanvas";
import { useRef, useState } from "react";
import { Group, Object3DEventMap, Object3DJSON } from "three";
import Overview from "../components/Overview";

const Viewer = () => {
    const [isErasing, setIsErasing] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as Record<string, number>;
    const sceneRef = useRef<Group<Object3DEventMap> | null>(null);

    const exportGLTF = () => {
        if (!sceneRef.current) return;
        const json = sceneRef.current.toJSON() as Object3DJSON & {state: Record<string, number>};
        json["state"] = state;
        const jsonString = JSON.stringify(json); // Pretty-print JSON

        // Create a Blob and download the file
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "scene.json"; // File name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (!state) {
        return (
            <div className="min-h-screen bg-stone-50">
                <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
                    <p className="text-gray-600 mb-8">
                        Please complete the pain assessment first to view your results.
                    </p>
                    <Button onClick={() => navigate("/")} text="Go to Assessment" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-x-8 gap-y-8 items-center justify-center">
            {/* Left side: Canvas */}
            <div className="flex flex-col gap-y-4 items-center">
                {!isErasing ?
                    <div>
                        <Button onClick={() => setIsErasing(true)} text="Erase" />
                    </div>
                    :
                    <div className="flex gap-x-2">
                        <Button onClick={() => setIsErasing(false)} text="Done" />
                        {/* <Button onClick={() => {}} text="Reset" /> */}
                    </div>
                }
                <div className="border-2 border-red-200 rounded h-[80vh] w-[80vw] lg:w-[40vw]">
                    <MainCanvas canvasRef={sceneRef} sliderValues={state} isErasing={isErasing} />
                </div>
                <Button onClick={() => navigate("/")} text="Back to assessment" />
            </div>

            {/* Right side: Text List */}
            <div className="flex flex-col w-[80vw] lg:w-[25vw] h-[80vh] gap-y-2 border-2 border-blue-50 rounded mt-4 px-4 overflow-y-auto">
                <Overview state={state} />
                <Button text="Export Model" onClick={exportGLTF} />
            </div>
        </div>
    );
};

export default Viewer;