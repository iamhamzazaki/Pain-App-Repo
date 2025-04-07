export const Image = ({ src, overlaySrc, overlaySrc2, opacity, opacity2, double, alt  }: { src: string; overlaySrc: string; overlaySrc2?: string; opacity: number; opacity2: number; double: boolean; alt: string }) => {

    if (double) {
        return (
            <div className="relative w-full flex justify-center items-center mb-6">
                {/* Base Image */}
                <img src={src} alt={alt} className="max-h-96 object-contain" />

                {/* Overlay Image with adjustable opacity */}
                <img
                    src={overlaySrc}
                    alt={`${alt} overlay`}
                    className="absolute top-0 left-0 w-full h-full object-contain mix-blend-normal"
                    style={{ opacity: opacity/100 }}
                />
                <img
                    src={overlaySrc2}
                    alt={`${alt} overlay`}
                    className="absolute top-0 left-0 w-full h-full object-contain mix-blend-normal"
                    style={{ opacity: opacity2/100 }}
                />
            </div>
        );
    }

    return (
        <div className="relative w-full flex justify-center items-center mb-6">
            {/* Base Image */}
            <img src={src} alt={alt} className="max-h-96 object-contain" />

            {/* Overlay Image with adjustable opacity */}
            <img
                src={overlaySrc}
                alt={`${alt} overlay`}
                className="absolute top-0 left-0 w-full h-full object-contain"
                style={{ opacity: opacity/100 }}
            />
        </div>
    );
};

export default Image;