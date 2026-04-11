import React from 'react';

const BookingConfirmation = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Booking Confirmation</h1>
            <p className="text-lg text-gray-600 mb-2">Thank you for your booking!</p>
            <p className="text-lg text-gray-600 mb-4">Your appointment has been successfully scheduled.</p>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Appointment Details</h2>
                <p className="text-gray-700">Date: <strong>[Date]</strong></p>
                <p className="text-gray-700">Time: <strong>[Time]</strong></p>
                <p className="text-gray-700">Service: <strong>[Service]</strong></p>
            </div>
            <button className="mt-6 px-4 py-2 bg-dusty-rose text-white rounded hover:bg-dusty-rose-dark">
                Go to Home
            </button>
        </div>
    );
};

export default BookingConfirmation;