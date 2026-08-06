import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { GoldDivider } from '@/components/ui/decor';
import { toCamelCase } from '@/lib/caseTransform';
import CustomizerFlow from '../../components/customizer/CustomizerFlow';
import { FALLBACK_DESIGNS, FALLBACK_BRACKETS } from '../../components/customizer/fallbackData';
import { BlouseDesign } from '@/types/blouseDesign';
import { MeasurementDefault } from '@/types/measurements';

const CustomizePage = async () => {
    const supabase = createClient();
    let designs: BlouseDesign[] = FALLBACK_DESIGNS;
    let brackets: MeasurementDefault[] = FALLBACK_BRACKETS;

    if (supabase) {
        const [designRes, bracketRes] = await Promise.all([
            supabase
                .from('blouse_designs')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true }),
            supabase.from('measurement_defaults').select('*').order('age_min', { ascending: true }),
        ]);
        designs = toCamelCase(designRes.data || []) as BlouseDesign[];
        brackets = toCamelCase(bracketRes.data || []) as MeasurementDefault[];
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <p className="label-caps text-champagne-gold-dark text-center mb-3">The Atelier</p>
            <h1 className="font-heading text-display-lg text-center mb-3 text-ink">Design Your Blouse</h1>
            <p className="font-accent italic text-lede text-center text-warm-gray mb-5 max-w-xl mx-auto">Pick a design, adjust your measurements, and preview your custom blouse</p>
            <GoldDivider className="mb-10" />
            <CustomizerFlow designs={designs} brackets={brackets} />
        </div>
    );
};

export default CustomizePage;
