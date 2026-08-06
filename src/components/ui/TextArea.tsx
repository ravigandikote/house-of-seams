import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, error, ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="label-caps block text-warm-gray">{label}</label>}
      <textarea
        className={`mt-1.5 block w-full rounded-sm bg-ivory px-3 py-2.5 text-body border ${
          error ? 'border-red-400' : 'border-[#E4D8D0]'
        }`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-body-sm text-red-500">{error}</p>}
    </div>
  );
};

export { TextArea };
export default TextArea;
