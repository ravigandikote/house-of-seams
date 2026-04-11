'use client';

import React from 'react';
import Button from '../ui/Button';

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const AdminFormModal: React.FC<AdminFormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-heading text-xl font-bold text-charcoal">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-dusty-rose text-white hover:bg-dusty-rose-dark transition duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminFormModal;
