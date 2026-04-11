import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  className = '',
  variant = 'primary',
  disabled = false,
}) => {
  const baseStyles = 'px-4 py-2 rounded focus:outline-none transition duration-200';
  const variantStyles = {
    primary: 'bg-dusty-rose text-white hover:bg-dusty-rose-dark',
    secondary: 'bg-sage-green text-white hover:bg-sage-green-dark',
    outline: 'border border-dusty-rose text-dusty-rose hover:bg-dusty-rose-light',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export { Button };
export default Button;