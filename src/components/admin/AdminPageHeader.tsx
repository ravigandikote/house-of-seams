import React from 'react';
import Button from '../ui/Button';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, subtitle, actionLabel, onAction }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default AdminPageHeader;
