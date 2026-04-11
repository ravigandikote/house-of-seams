import React from 'react';

const SizeGuide = () => {
    return (
        <div className="size-guide">
            <h2 className="text-2xl font-semibold mb-4">Size Guide</h2>
            <p className="mb-4">
                Finding the perfect fit is essential for your custom pieces. Please refer to the size guide below to help you choose the right size.
            </p>
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2">Size</th>
                        <th className="border border-gray-300 p-2">Bust (inches)</th>
                        <th className="border border-gray-300 p-2">Waist (inches)</th>
                        <th className="border border-gray-300 p-2">Hip (inches)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-300 p-2">XS</td>
                        <td className="border border-gray-300 p-2">32-33</td>
                        <td className="border border-gray-300 p-2">24-25</td>
                        <td className="border border-gray-300 p-2">34-35</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-2">S</td>
                        <td className="border border-gray-300 p-2">34-35</td>
                        <td className="border border-gray-300 p-2">26-27</td>
                        <td className="border border-gray-300 p-2">36-37</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-2">M</td>
                        <td className="border border-gray-300 p-2">36-37</td>
                        <td className="border border-gray-300 p-2">28-29</td>
                        <td className="border border-gray-300 p-2">38-39</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-2">L</td>
                        <td className="border border-gray-300 p-2">38-39</td>
                        <td className="border border-gray-300 p-2">30-31</td>
                        <td className="border border-gray-300 p-2">40-41</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-2">XL</td>
                        <td className="border border-gray-300 p-2">40-41</td>
                        <td className="border border-gray-300 p-2">32-33</td>
                        <td className="border border-gray-300 p-2">42-43</td>
                    </tr>
                </tbody>
            </table>
            <p className="mt-4">
                If you have any questions about sizing or need assistance, please feel free to contact us.
            </p>
        </div>
    );
};

export default SizeGuide;