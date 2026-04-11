"use client";

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { toCamelCase, toSnakeCase } from '@/lib/caseTransform';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Address } from '@/types/account';

const emptyAddress: Omit<Address, 'id' | 'userId'> = {
    label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false,
};

export default function AddressesPage() {
    const { user } = useAuthContext();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Address | null>(null);
    const [form, setForm] = useState(emptyAddress);
    const [showForm, setShowForm] = useState(false);

    const supabase = createClient();

    const fetchAddresses = async () => {
        if (!user) return;
        const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
        setAddresses(toCamelCase(data || []) as Address[]);
        setLoading(false);
    };

    useEffect(() => { fetchAddresses(); }, [user]);

    const openNew = () => { setEditing(null); setForm(emptyAddress); setShowForm(true); };
    const openEdit = (addr: Address) => { setEditing(addr); setForm(addr); setShowForm(true); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        const payload = toSnakeCase({ ...form, userId: user.id }) as Record<string, unknown>;
        delete payload.id;

        if (editing) {
            await supabase.from('addresses').update(payload).eq('id', editing.id);
        } else {
            await supabase.from('addresses').insert(payload);
        }
        setShowForm(false);
        fetchAddresses();
    };

    const handleDelete = async (id: string) => {
        await supabase.from('addresses').delete().eq('id', id);
        fetchAddresses();
    };

    if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Saved Addresses</h2>
                <Button onClick={openNew}>Add Address</Button>
            </div>

            {showForm && (
                <form onSubmit={handleSave} className="bg-white rounded-lg border p-4 mb-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                        <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                    </div>
                    <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                    <Input label="Address Line 1" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} required />
                    <Input label="Address Line 2" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
                    <div className="grid grid-cols-3 gap-3">
                        <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                        <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
                        <Input label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required />
                    </div>
                    <div className="flex gap-3">
                        <Button type="submit">{editing ? 'Update' : 'Save'}</Button>
                        <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                </form>
            )}

            {addresses.length === 0 && !showForm ? (
                <p className="text-center py-12 text-warm-gray">No saved addresses. Add one to speed up checkout.</p>
            ) : (
                <div className="space-y-3">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="bg-white rounded-lg border p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{addr.fullName} <span className="text-xs text-warm-gray ml-2">{addr.label}</span></p>
                                    <p className="text-sm text-warm-gray mt-1">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                                    <p className="text-sm text-warm-gray">{addr.city}, {addr.state} - {addr.pincode}</p>
                                    <p className="text-sm text-warm-gray">{addr.phone}</p>
                                    {addr.isDefault && <span className="inline-block mt-1 text-xs bg-dusty-rose/10 text-dusty-rose px-2 py-0.5 rounded-full">Default</span>}
                                </div>
                                <div className="flex gap-2 text-sm">
                                    <button onClick={() => openEdit(addr)} className="text-dusty-rose hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(addr.id)} className="text-red-500 hover:underline">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
