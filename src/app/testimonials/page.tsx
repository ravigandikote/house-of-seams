import React from 'react';
import { GoldDivider } from '../../components/ui/decor';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/caseTransform';
import TestimonialCard from '../../components/testimonials/TestimonialCard';
import testimonialsJson from '@/data/testimonials.json';

const TestimonialsPage = async () => {
    const supabase = createClient();
    let testimonials: any[] = [];

    if (supabase) {
        const { data } = await supabase.from('testimonials').select('*').order('date', { ascending: false });
        testimonials = toCamelCase(data || []) as any[];
    } else {
        testimonials = testimonialsJson as any[];
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <p className="label-caps text-champagne-gold-dark text-center mb-3">Kind Words</p>
            <h1 className="font-heading text-display-lg text-center mb-3 text-ink">What Our Clients Say</h1>
            <p className="font-accent italic text-lede text-center text-warm-gray mb-5 max-w-xl mx-auto">Real stories from real people</p>
            <GoldDivider className="mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial: any, index: number) => (
                    <div key={testimonial.id} className={`animate-fade-in-up animation-delay-${index * 100}`}>
                        <TestimonialCard testimonial={testimonial} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestimonialsPage;
