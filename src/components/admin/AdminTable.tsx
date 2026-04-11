'use client';

import React from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, item: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  isLoading?: boolean;
}

function AdminTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  isLoading,
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        No items found. Click the button above to add one.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 font-medium text-gray-600">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              {columns.map((col) => {
                const value = (item as Record<string, unknown>)[col.key];
                return (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render ? col.render(value, item) : String(value ?? '')}
                  </td>
                );
              })}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="text-dusty-rose hover:text-dusty-rose-dark font-medium text-sm"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTable;
