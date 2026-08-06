import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange }) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="label-caps text-warm-gray">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${checked ? 'bg-deep-rose' : 'bg-[#E4D8D0]'
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-ivory shadow transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  );
};

export { ToggleSwitch };
export default ToggleSwitch;
