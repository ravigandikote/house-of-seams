export interface Booking {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    service: string;
    notes?: string;
    status: 'pending' | 'confirmed' | 'canceled';
}