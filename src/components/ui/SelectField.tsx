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
      {label && <label className="label-caps block text-warm-gray">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className={`mt-1.5 block w-full rounded-sm bg-ivory px-3 py-2.5 text-body border ${
          error ? 'border-red-400' : 'border-[#E4D8D0]'
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-body-sm text-red-500">{error}</p>}
    </div>
  );
};

export { SelectField };
export default SelectField;
