export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  products: string[]; // Array of product IDs associated with this category
}