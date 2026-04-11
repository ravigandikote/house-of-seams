import React from 'react';

const WhatsAppButton = () => {
    const handleClick = () => {
        window.open('https://wa.me/your-phone-number', '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition duration-300"
            aria-label="Chat with us on WhatsApp"
        >
            <img src="/whatsapp-icon.svg" alt="WhatsApp" className="w-6 h-6" />
        </button>
    );
};

export { WhatsAppButton };
export default WhatsAppButton;