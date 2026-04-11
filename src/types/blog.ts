export interface Blog {
    id: string;
    title: string;
    slug: string;
    content: string;
    author: string;
    publishedDate: string;
    tags: string[];
    excerpt: string;
    imageUrl?: string;
}