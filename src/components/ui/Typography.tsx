import React from 'react';

interface TypographyProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body1' | 'body2';
    className?: string;
    children: React.ReactNode;
}

const variantMap = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    body1: 'p',
    body2: 'p',
} as const;

const Typography: React.FC<TypographyProps> = ({ variant = 'body1', className = '', children }) => {
    const Tag = variantMap[variant] as keyof JSX.IntrinsicElements;
    return <Tag className={className}>{children}</Tag>;
};

export default Typography;
