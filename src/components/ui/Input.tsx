import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="label-caps block text-warm-gray">{label}</label>}
      <input
        className={`mt-1.5 block w-full rounded-sm bg-ivory px-3 py-2.5 text-body border ${
          error ? 'border-red-400' : 'border-[#E4D8D0]'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-body-sm text-red-500">{error}</p>}
    </div>
  );
};

export { Input };
export default Input;
