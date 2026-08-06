'use client';

import React from 'react';

// The customizer journey stepper: numbered steps with Playfair names and
// a gold connector on desktop; a compact pill strip on mobile.

interface AtelierStepperProps {
    steps: readonly string[];
    current: number;
    className?: string;
}

const AtelierStepper: React.FC<AtelierStepperProps> = ({ steps, current, className = '' }) => {
    return (
        <div className={className}>
            {/* Desktop */}
            <ol className="hidden sm:flex items-start justify-center mb-12">
                {steps.map((label, i) => {
                    const done = i < current;
                    const active = i === current;
                    return (
                        <li key={label} className="flex items-start">
                            <div className="flex flex-col items-center w-36">
                                <span
                                    className={`flex items-center justify-center w-9 h-9 rounded-full text-body-sm font-medium transition-colors duration-300 ${
                                        done
                                            ? 'bg-champagne-gold-dark text-white'
                                            : active
                                                ? 'bg-deep-rose text-white shadow-soft'
                                                : 'bg-ivory border border-champagne-gold/40 text-warm-gray'
                                    }`}
                                >
                                    {done ? '✓' : i + 1}
                                </span>
                                <span
                                    className={`font-heading text-body mt-2.5 text-center ${
                                        active ? 'text-ink' : 'text-warm-gray'
                                    }`}
                                >
                                    {label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className={`h-px w-10 md:w-20 mt-[18px] -mx-6 ${
                                        i < current ? 'bg-champagne-gold' : 'bg-champagne-gold/30'
                                    }`}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>

            {/* Mobile: compact pills */}
            <ol className="sm:hidden flex flex-wrap justify-center gap-2 mb-8">
                {steps.map((label, i) => {
                    const done = i < current;
                    const active = i === current;
                    return (
                        <li
                            key={label}
                            className={`px-3 py-1.5 rounded-full text-caption font-medium ${
                                active
                                    ? 'bg-deep-rose text-white'
                                    : done
                                        ? 'bg-champagne-gold/20 text-champagne-gold-dark'
                                        : 'bg-ivory border border-champagne-gold/30 text-warm-gray'
                            }`}
                        >
                            {i + 1} · {label}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default AtelierStepper;
