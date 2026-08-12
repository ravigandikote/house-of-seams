import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/caseTransform';
import CustomizerFlow from '../../components/customizer/CustomizerFlow';
import { FALLBACK_DESIGNS, FALLBACK_BRACKETS, FALLBACK_LEHENGA_DESIGNS } from '../../components/customizer/fallbackData';
import { BlouseDesign } from '@/types/blouseDesign';
import { GarmentDesign } from '@/types/garmentDesign';
import { MeasurementDefault } from '@/types/measurements';
import { getPatternListings } from '@/lib/patterns';
import { serverRegion } from '@/lib/regionServer';

const CustomizePage = async ({ searchParams }: { searchParams?: { category?: string } }) => {
    const supabase = createClient();
    let designs: BlouseDesign[] = FALLBACK_DESIGNS;
    let brackets: MeasurementDefault[] = FALLBACK_BRACKETS;
    let garmentDesigns: GarmentDesign[] = FALLBACK_LEHENGA_DESIGNS;
    const patterns = await getPatternListings(serverRegion());

    if (supabase) {
        const [designRes, bracketRes, garmentRes] = await Promise.all([
            supabase
                .from('blouse_designs')
                .select('*')
                .eq('is_active', true)
                // Signature cuts lead the gallery; sort_order still orders
                // within each group. Matches blouse_designs_signature_order_idx.
                .order('is_signature', { ascending: false })
                .order('sort_order', { ascending: true }),
            supabase.from('measurement_defaults').select('*').order('age_min', { ascending: true }),
            supabase
                .from('garment_designs')
                .select('*')
                .eq('is_active', true)
                .order('category', { ascending: true })
                .order('sort_order', { ascending: true }),
        ]);
        designs = toCamelCase(designRes.data || []) as BlouseDesign[];
        brackets = toCamelCase(bracketRes.data || []) as MeasurementDefault[];
        garmentDesigns = toCamelCase(garmentRes.data || []) as GarmentDesign[];
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            {/* The editorial header lives inside CustomizerFlow so its title
                follows the selected category (Blouse → Kurti → Suit…). */}
            <CustomizerFlow
                designs={designs}
                brackets={brackets}
                garmentDesigns={garmentDesigns}
                patterns={patterns}
                initialCategory={searchParams?.category}
            />
        </div>
    );
};

export default CustomizePage;
