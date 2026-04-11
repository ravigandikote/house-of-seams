'use client';

import React from 'react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isDeleting?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="font-heading text-lg font-bold text-charcoal mb-2">Delete Confirmation</h3>
        <p className="text-gray-600 mb-1">
          Are you sure you want to delete <strong>{itemName}</strong>?
        </p>
        <p className="text-sm text-red-500 mb-6">This action cannot be undone.</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition duration-200 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
