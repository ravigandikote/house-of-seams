import React from 'react';
import { CartItemProps } from '../../types/cart';

const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
    return (
        <div className="flex justify-between items-center border-b py-4">
            <div className="flex items-center">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover mr-4" />
                <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-800 font-bold">${item.price.toFixed(2)}</p>
                </div>
            </div>
            <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700">
                Remove
            </button>
        </div>
    );
};

export default CartItem;