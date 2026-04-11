import React from 'react';

interface CardProps {
    title: string;
    description: string;
    imageUrl: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, imageUrl, onClick }) => {
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer" onClick={onClick}>
            <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    );
};

export default Card;