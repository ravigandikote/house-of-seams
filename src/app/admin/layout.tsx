'use client';

import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopBar from '../../components/admin/AdminTopBar';
import ToastContainer from '../../components/admin/Toast';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminTopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex">
                <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-57px)] overflow-auto">
                    {children}
                </main>
            </div>
            <ToastContainer />
        </div>
    );
};

export default AdminLayout;
