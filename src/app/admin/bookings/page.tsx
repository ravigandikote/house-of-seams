'use client';

import React from 'react';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { Booking } from '@/types/booking';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTable from '@/components/admin/AdminTable';

const AdminBookingsPage = () => {
    const { items: bookings, isLoading } = useAdminCrud<Booking>('bookings');

    const columns = [
        { key: 'customerName', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Time' },
        { key: 'service', label: 'Service' },
        {
            key: 'status', label: 'Status', render: (v: unknown) => {
                const status = String(v ?? '');
                const colors: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    confirmed: 'bg-green-100 text-green-800',
                    canceled: 'bg-red-100 text-red-800',
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                        {status}
                    </span>
                );
            }
        },
    ];

    return (
        <div>
            <AdminPageHeader title="Bookings" subtitle="View customer appointment bookings" />

            <AdminTable
                columns={columns}
                data={bookings}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AdminBookingsPage;
