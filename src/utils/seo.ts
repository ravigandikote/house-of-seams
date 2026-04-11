// This file contains SEO utility functions for the House of Seams website. 

export const generateMetaTags = (title, description, keywords) => {
    return {
        title: title,
        description: description,
        keywords: keywords.join(', '),
        viewport: 'width=device-width, initial-scale=1',
    };
};

export const generateOpenGraphTags = (title, description, image, url) => {
    return {
        'og:title': title,
        'og:description': description,
        'og:image': image,
        'og:url': url,
        'og:type': 'website',
    };
};

export const generateTwitterCardTags = (title, description, image) => {
    return {
        'twitter:card': 'summary_large_image',
        'twitter:title': title,
        'twitter:description': description,
        'twitter:image': image,
    };
};