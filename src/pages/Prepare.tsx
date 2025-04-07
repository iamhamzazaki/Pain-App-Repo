import { useNavigate } from "react-router";
import Button from "../components/Button";

const Prepare = () => {
    const navigate = useNavigate();

    const handleNavigation = (side: "right" | "left" | "both") => {
        navigate("/assessment", {
            state: {
                side
            }
        });
    };

    return (
        <div className="h-[80vh] bg-stone-50 flex flex-col justify-center items-center gap-y-4">
            <p className="text-2xl font-bold mb-2">Welcome!</p>
            <p className="text-center">Please select the side of the body where you experience pain:</p>
            <div className="flex gap-x-12">
                <Button text="Left side" onClick={() => handleNavigation("left")}/>
                <Button text="Right side" onClick={() => handleNavigation("right")}/>
            </div>
            <div className="">
                <Button text="Both sides" onClick={() => handleNavigation("both")}/>
            </div>
        </div>
    );
};

export default Prepare;