import React from 'react';

const GoogleMap = () => {
    return (
        <div className="w-full h-96">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509194!2d144.9537353153163!3d-37.81627997975168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11f1e1%3A0x5045675218ceed30!2sHouse%20of%20Seams!5e0!3m2!1sen!2sin!4v1633031234567!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
            ></iframe>
        </div>
    );
};

export default GoogleMap;