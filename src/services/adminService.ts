import { createClient } from '../lib/supabase/client';
import { Product } from '../types/product';
import { Category } from '../types/category';
import { Pricing } from '../types/pricing';
import { Booking } from '../types/booking';

const supabase = createClient();

export const adminService = {
  fetchProducts: async (): Promise<Product[]> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw new Error(error.message);
    return data as Product[];
  },

  addProduct: async (product: Product): Promise<Product> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('products').insert([product]);
    if (error) throw new Error(error.message);
    return data[0] as Product;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('products').update(product).eq('id', id);
    if (error) throw new Error(error.message);
    return data[0] as Product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  fetchCategories: async (): Promise<Category[]> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw new Error(error.message);
    return data as Category[];
  },

  addCategory: async (category: Category): Promise<Category> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('categories').insert([category]);
    if (error) throw new Error(error.message);
    return data[0] as Category;
  },

  updateCategory: async (id: string, category: Partial<Category>): Promise<Category> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('categories').update(category).eq('id', id);
    if (error) throw new Error(error.message);
    return data[0] as Category;
  },

  deleteCategory: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  fetchPricing: async (): Promise<Pricing[]> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('pricing').select('*');
    if (error) throw new Error(error.message);
    return data as Pricing[];
  },

  updatePricing: async (pricing: Pricing): Promise<Pricing> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('pricing').update(pricing).eq('id', pricing.id);
    if (error) throw new Error(error.message);
    return data[0] as Pricing;
  },

  fetchBookings: async (): Promise<Booking[]> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) throw new Error(error.message);
    return data as Booking[];
  },

  deleteBooking: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

export const getBookings = adminService.fetchBookings;
export const fetchPricingData = adminService.fetchPricing;
