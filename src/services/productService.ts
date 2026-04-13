import { createClient } from '../lib/supabase/client';
import { Product } from '../types/product';

const supabase = createClient();

export const getProducts = async (): Promise<Product[]> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw new Error(error.message);
    return data as Product[];
};

export const getProductById = async (id: string): Promise<Product | null> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data as Product;
};

export const createProduct = async (product: Product): Promise<Product> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('products').insert([product]);
    if (error) throw new Error(error.message);
    return data[0] as Product;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('products').update(product).eq('id', id);
    if (error) throw new Error(error.message);
    return data[0] as Product;
};

export const deleteProduct = async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

export const fetchProducts = getProducts;

export const fetchCollections = async () => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('collections').select('*');
    if (error) throw new Error(error.message);
    return data;
};
