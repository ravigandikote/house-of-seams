import React from 'react';
import Link from 'next/link';
import BlousePreview from '../customizer/BlousePreview';
import { CornerFlourish, GoldDivider } from '../ui/decor';
import { BlouseDesignAttributes } from '../../types/blouseDesign';
import { TYPICAL_MEASUREMENTS } from '../../types/measurements';

// Editorial hero: an atelier statement with live design sketches instead
// of a stock-photo banner. The sketches are the same renderer customers
// meet in the customizer — the site opens on its own craft.

const heroSketchA: BlouseDesignAttributes = {
    neckStyle: 'sweetheart',
    backStyle: 'deep-round',
    sleeveStyle: 'cap',
    closure: 'zip',
    embellishment: 'embroidery',
    baseColor: '#B87A88',
};

const heroSketchB: BlouseDesignAttributes = {
    neckStyle: 'high',
    backStyle: 'keyhole',
    sleeveStyle: 'elbow',
    closure: 'button',
    embellishment: 'zari',
    baseColor: '#8FA88D',
};

const Hero: React.FC = () => {
    return (
        <section className="relative texture-dots bg-ivory overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 py-16 md:py-24 grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
                {/* Statement */}
                <div className="md:col-span-3 text-center md:text-left">
                    <p className="label-caps text-champagne-gold-dark mb-4 animate-fade-in-up">
                        Modern Indian Couture Atelier
                    </p>
                    <h1 className="font-heading text-display-xl text-ink animate-fade-in-up animation-delay-100">
                        Couture, cut to
                        <span className="italic text-deep-rose"> your </span>
                        measure.
                    </h1>
                    <p className="font-accent italic text-lede text-warm-gray mt-5 max-w-lg mx-auto md:mx-0 animate-fade-in-up animation-delay-200">
                        Custom blouses, bridal couture, and curated jewellery — designed with you,
                        sketched before your eyes, and stitched to the last quarter-inch.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-5 mt-9 justify-center md:justify-start animate-fade-in-up animation-delay-300">
                        <Link
                            href="/customize"
                            className="label-caps inline-flex items-center justify-center bg-deep-rose text-white px-8 py-3.5 rounded-sm shadow-soft hover:bg-deep-rose-dark hover:shadow-lift transition-all duration-300"
                        >
                            Design Your Blouse
                        </Link>
                        <Link href="/collections" className="link-gold text-body-sm">
                            Explore Collections
                        </Link>
                    </div>
                </div>

                {/* Sketch collage */}
                <div className="md:col-span-2 relative flex justify-center animate-fade-in animation-delay-400" aria-hidden="true">
                    <div className="relative paper-card border border-champagne-gold/40 rounded-sm p-5 w-52 sm:w-60 rotate-[-3deg] shadow-soft">
                        <CornerFlourish position="tl" />
                        <BlousePreview design={heroSketchA} measurements={TYPICAL_MEASUREMENTS} view="front" showCaption={false} />
                        <p className="font-accent italic text-body-sm text-warm-gray text-center mt-1">the sweetheart</p>
                    </div>
                    <div className="absolute top-10 -right-2 sm:right-2 paper-card border border-champagne-gold/40 rounded-sm p-5 w-44 sm:w-52 rotate-[4deg] shadow-lift hidden sm:block">
                        <CornerFlourish position="br" />
                        <BlousePreview design={heroSketchB} measurements={TYPICAL_MEASUREMENTS} view="front" showCaption={false} />
                        <p className="font-accent italic text-body-sm text-warm-gray text-center mt-1">the zari high-neck</p>
                    </div>
                </div>
            </div>
            <GoldDivider className="pb-10 max-w-md mx-auto" />
        </section>
    );
};

export default Hero;
