const ProgressBar = ({currentImage, imageCount, percentage} : {currentImage: number, imageCount: number, percentage: number}) => {
    return (
        <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress: {currentImage}/{imageCount} regions rated</span>
                <span>{Math.round(percentage)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-red-600 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}>
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;