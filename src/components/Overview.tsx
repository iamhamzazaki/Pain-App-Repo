const Overview = ({ state } : {state: Record<string, number>}) => {
    return (
        <div>
            <h3 className="text-lg font-medium p-2">Overview</h3>
            <ul className="space-y-2 bg-gray-100 rounded p-4">
                <li className="flex justify-between">
                    <span>Region 1:</span>
                    <span>
                        L:
                        <strong>{state["left_Neck"]}</strong>
                        /
                        R:
                        <strong>{state["Neck"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 2 (Inner):</span>
                    <span>
                        L:
                        <strong>{state["left_NeckInner"]}</strong>
                        /
                        R:
                        <strong>{state["NeckInner"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 2 (Outer):</span>
                    <span>
                        L:
                        <strong>{state["left_NeckOuter"]}</strong>
                        /
                        R:
                        <strong>{state["NeckOuter"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 3:</span>
                    <span>
                        L:
                        <strong>{state["left_Shoulder"]}</strong>
                        /
                        R:
                        <strong>{state["Shoulder"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 4 (Inner):</span>
                    <span>
                        L:
                        <strong>{state["left_ShoulderInner"]}</strong>
                        /
                        R:
                        <strong>{state["ShoulderInner"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 4 (Outer):</span>
                    <span>
                        L:
                        <strong>{state["left_ShoulderOuter"]}</strong>
                        /
                        R:
                        <strong>{state["ShoulderOuter"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 5 (Inner):</span>
                    <span>
                        L:
                        <strong>{state["left_HeadInner"]}</strong>
                        /
                        R:
                        <strong>{state["HeadInner"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 5 (Outer):</span>
                    <span>
                        L:
                        <strong>{state["left_HeadOuter"]}</strong>
                        /
                        R:
                        <strong>{state["HeadOuter"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 6:</span>
                    <span>
                        L:
                        <strong>{state["left_NeckSlice"]}</strong>
                        /
                        R:
                        <strong>{state["NeckSlice"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 7:</span>
                    <span>
                        L:
                        <strong>{state["left_NeckToElbow"]}</strong>
                        /
                        R:
                        <strong>{state["NeckToElbow"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 8:</span>
                    <span>
                        L:
                        <strong>{state["left_NeckToThumb"]}</strong>
                        /
                        R:
                        <strong>{state["NeckToThumb"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 9:</span>
                    <span>
                        L:
                        <strong>{state["left_NeckToMiddleFinger"]}</strong>
                        /
                        R:
                        <strong>{state["NeckToMiddleFinger"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 10:</span>
                    <span>
                        L:
                        <strong>{state["left_BackAndPinky"]}</strong>
                        /
                        R:
                        <strong>{state["BackAndPinky"]}</strong>
                    </span>
                </li>
                <li className="flex justify-between">
                    <span>Region 11:</span>
                    <span>
                        L:
                        <strong>{state["left_ThighToElbow"]}</strong>
                        /
                        R:
                        <strong>{state["ThighToElbow"]}</strong>
                    </span>
                </li>
            </ul>
        </div>
    );
};

export default Overview;