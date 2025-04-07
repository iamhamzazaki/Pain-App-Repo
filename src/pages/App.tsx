import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Button from "../components/Button";
import Image from "../components/Image";
import Slider from "../components/Slider";
import ProgressBar from "../components/ProgressBar";

const App = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as {side: "right" | "left" | "both"};

    const right_images = [
        "/images/pain_region_1",
        "/images/pain_region_2",
        "/images/pain_region_3",
        "/images/pain_region_4",
        "/images/pain_region_5",
        "/images/pain_region_6",
        "/images/pain_region_7",
        "/images/pain_region_8",
        "/images/pain_region_9",
        "/images/pain_region_10",
        "/images/pain_region_11",
    ];

    const left_images = [
        "/images/left_pain_region_1",
        "/images/left_pain_region_2",
        "/images/left_pain_region_3",
        "/images/left_pain_region_4",
        "/images/left_pain_region_5",
        "/images/left_pain_region_6",
        "/images/left_pain_region_7",
        "/images/left_pain_region_8",
        "/images/left_pain_region_9",
        "/images/left_pain_region_10",
        "/images/left_pain_region_11",
    ];

    // Images that have two regions
    const doubleRegionImageIndices = [
        1,
        3,
        4,
        12,
        14,
        15,
    ];

    const images = state.side === "right" ? right_images : state.side === "left" ? left_images : right_images.concat(left_images);

    // State for current image index and slider values
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [sliderValues, setSliderValues] = useState(Array(11).fill(0));
    const [leftSliderValues, setLeftSliderValues] = useState(Array(11).fill(0));
    // Images with two regions are split into inner (in main state) and outer values
    // Same size as main state to simplify indexing
    const [outerRegionSliderValues, setOuterRegionSliderValues] = useState(Array(11).fill(0));
    const [leftOuterRegionSliderValues, setLeftOuterRegionSliderValues] = useState(Array(11).fill(0));

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

    // Handle previous image button click
    const handlePrevious = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    // Handle next image button click
    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    // Handle slider value change
    const handleSliderChange = (e: any) => {
        const value = parseInt(e.target.value);
        const newSliderValues = [...sliderValues];
        newSliderValues[currentImageIndex] = value;
        setSliderValues(newSliderValues);
    };

    const handleOuterSliderChange = (e: any) => {
        const value = parseInt(e.target.value);
        const newSliderValues = [...outerRegionSliderValues];
        newSliderValues[currentImageIndex] = value;
        setOuterRegionSliderValues(newSliderValues);
    };

    // Handle slider value change
    const handleLeftSliderChange = (e: any) => {
        const value = parseInt(e.target.value);
        const newLeftSliderValues = [...leftSliderValues];
        const index = state.side == "left" ? currentImageIndex : currentImageIndex-11;
        newLeftSliderValues[index] = value;
        setLeftSliderValues(newLeftSliderValues);
    };

    const handleLeftOuterSliderChange = (e: any) => {
        const value = parseInt(e.target.value);
        const newLeftSliderValues = [...leftOuterRegionSliderValues];
        const index = state.side == "left" ? currentImageIndex : currentImageIndex-11;
        newLeftSliderValues[index] = value;
        setLeftOuterRegionSliderValues(newLeftSliderValues);
    };

    const handleNavigation = () => {
        navigate("/viewer", {
            state: {
                "Neck": sliderValues[0],
                "NeckInner": sliderValues[1],
                "NeckOuter": outerRegionSliderValues[1],
                "Shoulder": sliderValues[2],
                "ShoulderInner": sliderValues[3],
                "ShoulderOuter": outerRegionSliderValues[3],
                "HeadInner": sliderValues[4],
                "HeadOuter": outerRegionSliderValues[4],
                "NeckSlice": sliderValues[5],
                "NeckToElbow": sliderValues[6],
                "NeckToThumb": sliderValues[7],
                "NeckToMiddleFinger": sliderValues[8],
                "BackAndPinky": sliderValues[9],
                "ThighToElbow": sliderValues[10],
                "left_Neck": leftSliderValues[0],
                "left_NeckInner": leftSliderValues[1],
                "left_NeckOuter": leftOuterRegionSliderValues[1],
                "left_Shoulder": leftSliderValues[2],
                "left_ShoulderInner": leftSliderValues[3],
                "left_ShoulderOuter": leftOuterRegionSliderValues[3],
                "left_HeadInner": leftSliderValues[4],
                "left_HeadOuter": leftOuterRegionSliderValues[4],
                "left_NeckSlice": leftSliderValues[5],
                "left_NeckToElbow": leftSliderValues[6],
                "left_NeckToThumb": leftSliderValues[7],
                "left_NeckToMiddleFinger": leftSliderValues[8],
                "left_BackAndPinky": leftSliderValues[9],
                "left_ThighToElbow": leftSliderValues[10]
            }
        });
    };

    return (
        <div className="min-h-screen bg-stone-50">

            {/* Main content */}
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Image display with side slider */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left side - Image and navigation */}
                        <div className="md:w-2/3">
                            <div className="mb-6">
                                <Image
                                    src={images[currentImageIndex] + "_clear.jpeg"}
                                    overlaySrc={doubleRegionImageIndices.includes(currentImageIndex) ? images[currentImageIndex] + "_inner.jpeg" : images[currentImageIndex]+".jpeg"}
                                    overlaySrc2={images[currentImageIndex] + "_outer.jpeg"}
                                    opacity={currentImageIndex < 11 ? state.side != "left" ? sliderValues[currentImageIndex] : leftSliderValues[currentImageIndex] : leftSliderValues[currentImageIndex-11]}
                                    opacity2={currentImageIndex < 11 ? state.side != "left" ? outerRegionSliderValues[currentImageIndex] : leftOuterRegionSliderValues[currentImageIndex] : leftOuterRegionSliderValues[currentImageIndex-11]}
                                    alt={`Image ${currentImageIndex + 1}`}
                                    double={doubleRegionImageIndices.includes(currentImageIndex)}/>
                            </div>

                            <div className="flex justify-between items-center">
                                <Button onClick={handlePrevious} text="Previous" disabled={currentImageIndex == 0} />
                                <span className="text-gray-700">Image {currentImageIndex + 1} of {images.length}</span>
                                <Button onClick={handleNext} text="Next" disabled={currentImageIndex+1 == images.length}/>
                            </div>
                        </div>

                        {/* Right side - Slider */}
                        <div className="md:w-1/3 flex flex-col justify-center bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg text-gray-800 mb-3">Pain Intensity</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Rate the pain level for this region from 0 (no pain) to 100 (extreme pain)
                            </p>
                            {doubleRegionImageIndices.includes(currentImageIndex) &&
                                <p className="font-bold">Inner region:</p>
                            }
                            <div className="mb-2 text-center font-bold text-xl text-red-600">
                                {currentImageIndex < 11 ? state.side != "left" ? sliderValues[currentImageIndex] : leftSliderValues[currentImageIndex] : leftSliderValues[currentImageIndex-11]}
                            </div>
                            <Slider
                                value={currentImageIndex < 11 ? state.side != "left" ? sliderValues[currentImageIndex] : leftSliderValues[currentImageIndex] : leftSliderValues[currentImageIndex-11]}
                                onChange={(currentImageIndex < 11 && state.side != "left") ? handleSliderChange : handleLeftSliderChange}
                            />
                            {doubleRegionImageIndices.includes(currentImageIndex) &&
                                <div>
                                    {doubleRegionImageIndices.includes(currentImageIndex) &&
                                    <p className="font-bold">Outer region:</p>
                                    }
                                    <div className="mb-2 text-center font-bold text-xl text-red-600">
                                        {currentImageIndex < 11 ? state.side != "left" ? outerRegionSliderValues[currentImageIndex] : leftOuterRegionSliderValues[currentImageIndex] : leftOuterRegionSliderValues[currentImageIndex-11]}
                                    </div>
                                    <Slider
                                        value={currentImageIndex < 11 ? state.side != "left" ? outerRegionSliderValues[currentImageIndex] : leftOuterRegionSliderValues[currentImageIndex] : leftOuterRegionSliderValues[currentImageIndex-11]}
                                        onChange={currentImageIndex < 11 && state.side != "left" ? handleOuterSliderChange : handleLeftOuterSliderChange}
                                    />
                                </div>
                            }
                        </div>
                    </div>

                    {/* Progress bar at bottom */}
                    <ProgressBar
                        currentImage={currentImageIndex+1}
                        imageCount={images.length}
                        percentage={((currentImageIndex+1) / images.length) * 100}
                    />

                    <div className="mt-6 flex justify-center">
                        {(currentImageIndex+1 == images.length) &&
                            <Button onClick={handleNavigation} text="Generate"/>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;