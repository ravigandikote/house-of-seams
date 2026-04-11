import React from 'react';
import Link from 'next/link';

const Hero: React.FC = () => {
    return (
        <div className="relative h-[70vh] min-h-[500px] text-white">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/hero.jpg)' }}>
                <div className="flex flex-col items-center justify-center h-full bg-gradient-to-t from-black/70 via-black/40 to-black/20 px-4">
                    <h1 className="font-heading text-5xl md:text-6xl font-bold text-center animate-fade-in-up">
                        Welcome to House of Seams
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-center text-white/90 animate-fade-in-up animation-delay-200">
                        A Contemporary Expression of Lifestyle and Jewellery
                    </p>
                    <Link
                        href="/collections"
                        className="mt-8 inline-block bg-dusty-rose text-white px-8 py-3 rounded-full hover:bg-dusty-rose-dark transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-400"
                    >
                        Explore Collections
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
