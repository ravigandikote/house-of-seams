import React from 'react';
import BrandStory from '../../components/about/BrandStory';
import Philosophy from '../../components/about/Philosophy';
import DesignJourneyTimeline from '../../components/about/DesignJourneyTimeline';

const AboutPage = () => {
    return (
        <div>
            <div className="max-w-5xl mx-auto px-4 py-12">
                <h1 className="font-heading text-4xl font-bold text-center text-charcoal mb-2">About House of Seams</h1>
                <p className="text-center text-warm-gray mb-12">Where tradition meets contemporary elegance</p>
            </div>
            <BrandStory />
            <Philosophy />
            <DesignJourneyTimeline />
        </div>
    );
};

export default AboutPage;
