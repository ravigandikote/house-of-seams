import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, error, ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        className={`mt-1 block w-full border rounded-md shadow-sm focus:ring focus:ring-opacity-50 px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'
          }`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export { TextArea };
export default TextArea;
