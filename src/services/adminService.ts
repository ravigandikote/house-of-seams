import { createClient } from '../lib/supabase/client';

const supabase = createClient();
import { Product } from '../types/product';
import { Category } from '../types/category';
import { Pricing } from '../types/pricing';
import { Booking } from '../types/booking';

export const adminService = {
  // Fetch all products
  fetchProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw new Error(error.message);
    return data as Product[];
  },

  // Add a new product
  addProduct: async (product: Product): Promise<Product> => {
    const { data, error } = await supabase.from('products').insert([product]);
    if (error) throw new Error(error.message);
    return data[0] as Product;
  },

  // Update an existing product
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const { data, error } = await supabase.from('products').update(product).eq('id', id);
    if (error) throw new Error(error.message);
    return data[0] as Product;
  },

  // Delete a product
  deleteProduct: async (id: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Fetch all categories
  fetchCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw new Error(error.message);
    return data as Category[];
  },

  // Add a new category
  addCategory: async (category: Category): Promise<Category> => {
    const { data, error } = await supabase.from('categories').insert([category]);
    if (error) throw new Error(error.message);
    return data[0] as Category;
  },

  // Update an existing category
  updateCategory: async (id: string, category: Partial<Category>): Promise<Category> => {
    const { data, error } = await supabase.from('categories').update(category).eq('id', id);
    if (error) throw new Error(error.message);
    return data[0] as Category;
  },

  // Delete a category
  deleteCategory: async (id: string): Promise<void> => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // Fetch pricing information
  fetchPricing: async (): Promise<Pricing[]> => {
    const { data, error } = await supabase.from('pricing').select('*');
    if (error) throw new Error(error.message);
    return data as Pricing[];
  },

  // Update pricing information
  updatePricing: async (pricing: Pricing): Promise<Pricing> => {
    const { data, error } = await supabase.from('pricing').update(pricing).eq('id', pricing.id);
    if (error) throw new Error(error.message);
    return data[0] as Pricing;
  },

  // Fetch all bookings
  fetchBookings: async (): Promise<Booking[]> => {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) throw new Error(error.message);
    return data as Booking[];
  },

  // Delete a booking
  deleteBooking: async (id: string): Promise<void> => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// Alias exports for consumers that import standalone functions
export const getBookings = adminService.fetchBookings;
export const fetchPricingData = adminService.fetchPricing;