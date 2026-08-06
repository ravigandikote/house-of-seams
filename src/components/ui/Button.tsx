import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'tertiary';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  className = '',
  variant = 'primary',
  disabled = false,
}) => {
  if (variant === 'tertiary') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`link-gold label-caps bg-transparent pb-1 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {children}
      </button>
    );
  }

  const baseStyles =
    'inline-flex items-center justify-center px-7 py-3 label-caps rounded-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles = {
    primary: 'bg-deep-rose text-white hover:bg-deep-rose-dark shadow-soft hover:shadow-lift',
    secondary: 'border border-charcoal/60 text-charcoal bg-transparent hover:border-deep-rose hover:text-deep-rose',
    // legacy alias, styled as the charcoal-outline secondary
    outline: 'border border-charcoal/60 text-charcoal bg-transparent hover:border-deep-rose hover:text-deep-rose',
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
