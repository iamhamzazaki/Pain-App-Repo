import { ChangeEventHandler } from "react";

const Slider = ({value, onChange} : {value: number, onChange: ChangeEventHandler<HTMLInputElement>}) => {
    return (
        <div>
            <input
                id="slider" type="range" min="0" max="100"
                value={value}
                onChange={onChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>100</span>
            </div>
        </div>
    );
};

export default Slider;