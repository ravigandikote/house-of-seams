import React from 'react';

interface CardProps {
    title: string;
    description: string;
    imageUrl: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, imageUrl, onClick }) => {
    return (
        <div
            className="bg-white shadow-soft card-lift rounded-sm overflow-hidden cursor-pointer border border-champagne-gold/15"
            onClick={onClick}
        >
            <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
            <div className="p-6">
                <h2 className="font-heading text-title text-ink">{title}</h2>
                <p className="text-body-sm text-warm-gray mt-2">{description}</p>
            </div>
        </div>
    );
};

export default Card;
