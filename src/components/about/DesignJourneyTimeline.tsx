import React from 'react';

const DesignJourneyTimeline = () => {
    const steps = [
        {
            title: "Consultation",
            description: "Begin your journey with a personalized consultation to discuss your vision and preferences."
        },
        {
            title: "Design & Concept",
            description: "Our designers create a unique concept tailored to your style, ensuring every detail reflects your personality."
        },
        {
            title: "Measurements & Pattern Making",
            description: "Precise measurements are taken to create a custom pattern that fits you perfectly."
        },
        {
            title: "Craft & Construction",
            description: "Our skilled artisans bring your design to life with meticulous craftsmanship and attention to detail."
        },
        {
            title: "Fittings & Refinement",
            description: "Multiple fittings ensure that every aspect of your garment is refined to perfection."
        },
        {
            title: "Final Styling & Delivery",
            description: "Your custom piece is styled and delivered, ready to make a statement."
        }
    ];

    return (
        <section className="py-16 bg-cream">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="font-heading text-3xl font-bold text-center text-charcoal mb-12">Our Design Journey</h2>
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-dusty-rose/30"></div>

                    {steps.map((step, index) => (
                        <div key={index} className={`relative flex items-start mb-10 last:mb-0 animate-slide-in-left animation-delay-${index * 100}`}>
                            {/* Circle */}
                            <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-dusty-rose text-white flex items-center justify-center font-heading font-bold text-lg">
                                {index + 1}
                            </div>
                            {/* Content */}
                            <div className="ml-6 pt-1">
                                <h3 className="font-heading text-xl font-semibold text-charcoal mb-1">{step.title}</h3>
                                <p className="text-warm-gray">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DesignJourneyTimeline;
