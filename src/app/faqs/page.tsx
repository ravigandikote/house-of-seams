import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/caseTransform';
import faqsJson from '@/data/faqs.json';

const FAQsPage = async () => {
    const supabase = createClient();
    let faqs: any[] = [];

    if (supabase) {
        const { data } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true });
        faqs = toCamelCase(data || []) as any[];
    } else {
        faqs = faqsJson as any[];
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="font-heading text-4xl font-bold text-center mb-2 text-charcoal">Frequently Asked Questions</h1>
            <p className="text-center text-warm-gray mb-10">Everything you need to know</p>
            <div className="max-w-3xl mx-auto space-y-6">
                {faqs.map((faq: any, index: number) => (
                    <div key={faq.id || index} className="border-b border-gray-200 pb-6 animate-fade-in-up">
                        <h2 className="font-heading text-xl font-semibold text-charcoal mb-2">{faq.question}</h2>
                        <p className="text-warm-gray leading-relaxed">{faq.answer}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQsPage;
