import React from 'react';
import { Testimonial } from '../../types/testimonial';

interface TestimonialCardProps {
    testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-dusty-rose hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
            <div className="text-dusty-rose text-4xl font-heading leading-none mb-2">&ldquo;</div>
            <p className="text-warm-gray italic flex-grow">{testimonial.quote}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                            &#9733;
                        </span>
                    ))}
                </div>
                <h4 className="font-semibold text-charcoal">{testimonial.name}</h4>
                <p className="text-sm text-warm-gray">{testimonial.role}</p>
            </div>
        </div>
    );
};

export default TestimonialCard;
