import React from 'react';
import Link from 'next/link';
import { Category } from '../../types/category';

interface CategoryCardProps {
    category: Category;
}

// The categories table carries no destination column, so a card's landing
// page is derived from its name. First match wins — "Bridal Blouses" is a
// blouse before it is bridal. Anything unmatched goes to the product
// catalogue, which is always a real page.
const DESTINATIONS: { match: RegExp; href: string }[] = [
    { match: /blouse/i, href: '/customize?category=blouse' },
    { match: /bridal|lehenga|saree/i, href: '/customize?category=lehenga' },
    { match: /everyday|contemporary|kurti|kameez/i, href: '/customize?category=kurti' },
    { match: /alteration|refinement|fitting/i, href: '/booking' },
];

export function categoryHref(name: string): string {
    return DESTINATIONS.find((d) => d.match.test(name))?.href ?? '/products';
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
    return (
        <Link
            href={categoryHref(category.name)}
            className="group block bg-white shadow-md rounded-lg overflow-hidden transition-all duration-300 touch-manipulation active:shadow-xl [@media(hover:hover)]:hover:shadow-xl"
        >
            <div className="overflow-hidden">
                <img
                    src={category.imageUrl || (category as any).image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="p-4">
                <h3 className="font-heading text-lg font-semibold text-charcoal group-hover:text-dusty-rose transition-colors duration-200">{category.name}</h3>
                <p className="text-warm-gray text-sm mt-1">{category.description}</p>
            </div>
        </Link>
    );
};

export default CategoryCard;
