export interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    image?: string;
    imageUrl?: string;
    images?: string[];
    stock?: number;
    createdAt?: Date;
    updatedAt?: Date;
    isFeatured?: boolean;
    isCustomizable?: boolean;
}