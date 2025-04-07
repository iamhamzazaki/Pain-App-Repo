import { useNavigate } from "react-router";
import Button from "./Button";

const Navbar = () => {
    const navigate = useNavigate();
    return (
        <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold border-red-600 border-4 rounded-xl py-1 px-2 cursor-pointer" onClick={() => {navigate("/")}}>Pain Highlighter</h2>
            <Button onClick={() => navigate("/load")} text="Load Model"/>
        </nav>
    );
};

export default Navbar;