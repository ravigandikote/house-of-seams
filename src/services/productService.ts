import { createClient } from '../lib/supabase/client';

const supabase = createClient();
import { Product } from '../types/product';

export const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data as Product[];
};

export const getProductById = async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as Product;
};

export const createProduct = async (product: Product): Promise<Product> => {
    const { data, error } = await supabase
        .from('products')
        .insert([product]);

    if (error) {
        throw new Error(error.message);
    }

    return data[0] as Product;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
    const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    return data[0] as Product;
};

export const deleteProduct = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
};

// Alias export for consumers that import fetchProducts
export const fetchProducts = getProducts;

// Fetch all collections
export const fetchCollections = async () => {
    const { data, error } = await supabase
        .from('collections')
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};