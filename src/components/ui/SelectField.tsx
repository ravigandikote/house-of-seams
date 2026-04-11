import React from 'react';

interface SelectFieldProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, error, options, value, onChange, placeholder }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full border rounded-md shadow-sm focus:ring focus:ring-opacity-50 px-3 py-2 bg-white ${error ? 'border-red-500' : 'border-gray-300'
          }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export { SelectField };
export default SelectField;
