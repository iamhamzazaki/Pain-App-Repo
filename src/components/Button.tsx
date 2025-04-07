const Button = ({onClick, text, disabled} : {onClick: () => void, text: string, disabled?: boolean}) => {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 cursor-pointer disabled:cursor-default text-white px-4 py-2 rounded-md transition-colors"
        >
            {text}
        </button>
    );
};

export default Button;