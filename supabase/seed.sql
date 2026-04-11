-- House of Seams: Seed Data
-- Run this in Supabase SQL Editor after the migration

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO products (name, slug, description, category, price, image, image_url, is_featured) VALUES
('Custom Blouse Design', 'custom-blouse-design', 'A personalized blouse designed to fit your unique style and measurements, crafted with exquisite attention to detail.', 'Custom Blouses', 150, '/images/products/custom-blouse.jpg', '/images/products/custom-blouse.jpg', true),
('Bridal Couture', 'bridal-couture', 'Elegant bridal wear that combines tradition with modern aesthetics, tailored to make your special day unforgettable.', 'Bridal Wear', 1200, '/images/products/bridal-couture.jpg', '/images/products/bridal-couture.jpg', true),
('Luxury Embroidered Saree', 'luxury-embroidered-saree', 'A stunning saree adorned with intricate embroidery, perfect for special occasions and celebrations.', 'Luxury Embroidered Pieces', 800, '/images/products/luxury-saree.jpg', '/images/products/luxury-saree.jpg', true),
('Contemporary Everyday Wear', 'contemporary-everyday-wear', 'Chic and comfortable everyday wear that blends style with functionality, perfect for modern lifestyles.', 'Contemporary Everyday Wear', 100, '/images/products/everyday-wear.jpg', '/images/products/everyday-wear.jpg', false),
('Statement Jewellery', 'statement-jewellery', 'Curated jewellery pieces that make a statement, adding a touch of elegance to any outfit.', 'Jewellery', 250, '/images/products/statement-jewellery.jpg', '/images/products/statement-jewellery.jpg', false),
('Bridal Lehenga', 'bridal-lehenga', 'A beautifully crafted lehenga that embodies grace and elegance, designed for brides who want to stand out.', 'Bridal Wear', 1500, '/images/products/bridal-lehenga.jpg', '/images/products/bridal-lehenga.jpg', false),
('Alterations & Refinements', 'alterations-refinements', 'Expert alterations and refinements to ensure your garments fit perfectly and look stunning.', 'Alterations', 50, '/images/products/alterations.jpg', '/images/products/alterations.jpg', false),
('Designer Blouse', 'designer-blouse', 'Ready-to-wear designer blouses that combine style and comfort, perfect for any occasion.', 'Designer Blouses', 200, '/images/products/designer-blouse.jpg', '/images/products/designer-blouse.jpg', false);

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, description, image, image_url) VALUES
('Custom Blouses', 'Tailored to perfection, our custom blouses are designed to reflect your unique style and personality.', '/images/categories/custom-blouses.jpg', '/images/categories/custom-blouses.jpg'),
('Bridal Blouses', 'Exquisite bridal blouses that complement your wedding attire, crafted with intricate details and luxurious fabrics.', '/images/categories/bridal-blouses.jpg', '/images/categories/bridal-blouses.jpg'),
('Bridal Wear', 'Elegant lehengas and sarees styled to perfection for your special day, ensuring you look stunning.', '/images/categories/bridal-wear.jpg', '/images/categories/bridal-wear.jpg'),
('Occasion Wear', 'Chic and stylish outfits for every occasion, designed to make you stand out.', '/images/categories/occasion-wear.jpg', '/images/categories/occasion-wear.jpg'),
('Contemporary Everyday Wear', 'Comfortable yet stylish everyday wear that blends modern aesthetics with traditional craftsmanship.', '/images/categories/everyday-wear.jpg', '/images/categories/everyday-wear.jpg'),
('Luxury Embroidered Pieces', 'Opulent embroidered garments that showcase the artistry of our skilled artisans.', '/images/categories/luxury-embroidered.jpg', '/images/categories/luxury-embroidered.jpg'),
('Jewellery', 'Curated statement jewellery pieces that add the perfect finishing touch to your outfit.', '/images/categories/jewellery.jpg', '/images/categories/jewellery.jpg'),
('Alterations & Refinements', 'Expert alterations to ensure your garments fit perfectly, enhancing your overall look.', '/images/categories/alterations.jpg', '/images/categories/alterations.jpg');

-- ============================================================
-- GALLERY
-- ============================================================
INSERT INTO gallery (url, alt, category) VALUES
('/images/ig-1.jpg', 'Bridal elegance redefined', 'Bridal'),
('/images/ig-2.jpg', 'Luxury embroidered saree collection', 'Luxury'),
('/images/ig-3.jpg', 'Custom blouse craftsmanship', 'Custom'),
('/images/ig-4.jpg', 'Statement jewellery pieces', 'Jewellery'),
('/images/ig-5.jpg', 'Bridal couture details', 'Bridal'),
('/images/ig-6.jpg', 'Everyday elegance', 'Everyday'),
('/images/ig-7.jpg', 'Designer blouse collection', 'Custom'),
('/images/ig-8.jpg', 'Occasion wear inspirations', 'Occasion'),
('/images/products/custom-blouse.jpg', 'Custom blouse design', 'Custom'),
('/images/products/bridal-couture.jpg', 'Bridal couture', 'Bridal'),
('/images/products/luxury-saree.jpg', 'Luxury embroidered saree', 'Luxury'),
('/images/products/designer-blouse.jpg', 'Designer blouse', 'Custom');

-- ============================================================
-- BLOG POSTS
-- ============================================================
INSERT INTO blog_posts (title, slug, content, author, published_date, tags, excerpt, image_url) VALUES
('The Art of Custom Blouse Design', 'the-art-of-custom-blouse-design',
'Custom blouse design is more than just stitching fabric together — it is an art form that requires understanding the wearer''s personality, body type, and the occasion. At House of Seams, every custom blouse begins with a detailed consultation where we discuss your vision, preferred fabrics, and design elements.

Our designers then create sketches and mood boards to bring your ideas to life. We source the finest fabrics and materials, ensuring every piece meets our exacting standards of quality.

The construction process involves precise measurements, expert pattern-making, and meticulous stitching. Each blouse goes through multiple quality checks before the final fitting, where we make any necessary adjustments to ensure a perfect fit.

Whether you''re looking for a simple everyday blouse or an elaborate bridal piece, our custom design service ensures you get exactly what you envision.',
'House of Seams', '2024-01-15', ARRAY['custom', 'blouses', 'design', 'fashion'],
'Discover the craftsmanship behind our custom blouse designs and learn about our meticulous design process.',
'/images/products/custom-blouse.jpg');

-- ============================================================
-- TESTIMONIALS
-- ============================================================
INSERT INTO testimonials (name, quote, role, rating, date) VALUES
('Aisha Khan', 'House of Seams transformed my bridal outfit into a masterpiece. The attention to detail and craftsmanship is unparalleled!', 'Bride, Mumbai', 5, '2023-09-15'),
('Priya Sharma', 'I love my custom blouse! The fit is perfect, and the fabric is so luxurious. Highly recommend their services!', 'Fashion Enthusiast, Delhi', 5, '2023-08-22'),
('Meera Patel', 'The experience was wonderful from start to finish. The team listened to my ideas and brought them to life beautifully.', 'Entrepreneur, Bangalore', 5, '2023-07-30'),
('Sofia Ali', 'I had a fantastic experience with House of Seams. Their bridal couture is simply stunning, and I felt like a queen on my wedding day!', 'Bride, Hyderabad', 5, '2023-06-10'),
('Nisha Verma', 'The alterations I needed were done perfectly. I couldn''t be happier with the results!', 'Client, Pune', 4, '2023-05-05');

-- ============================================================
-- FAQS
-- ============================================================
INSERT INTO faqs (question, answer, sort_order) VALUES
('What is the process for custom blouse design?', 'Our custom blouse design process involves a consultation to understand your preferences, followed by design and concept development, measurements and pattern making, crafting and construction, fittings and refinement, and finally, styling and delivery.', 1),
('How long does it take to create a custom piece?', 'The timeline for creating a custom piece varies based on complexity, but typically ranges from 4 to 6 weeks from the initial consultation to final delivery.', 2),
('Do you offer alterations for existing garments?', 'Yes, we provide alterations and refinements for existing garments to ensure a perfect fit and enhance your style.', 3),
('What materials do you use for your products?', 'We use high-quality fabrics and materials sourced from trusted suppliers to ensure durability and elegance in every piece.', 4),
('Can I schedule a consultation for custom designs?', 'Absolutely! You can schedule a consultation through our appointment booking page, and we will guide you through the design journey.', 5),
('What payment methods do you accept?', 'We accept various payment methods, including credit/debit cards, UPI, and other secure online payment options.', 6),
('Do you ship internationally?', 'Yes, we offer international shipping. Please check our shipping policy for more details.', 7),
('How can I contact you for further inquiries?', 'You can reach us through our contact page or via WhatsApp for immediate assistance.', 8);

-- ============================================================
-- PRICING
-- ============================================================
INSERT INTO pricing (service, price_range, description) VALUES
('Custom Blouse Design', '$150 - $300', 'Tailored to your specifications, our custom blouses are designed to fit perfectly and reflect your unique style.'),
('Bridal Couture', '$800 - $2000', 'Exquisite bridal wear crafted with the finest materials, ensuring you look stunning on your special day.'),
('Occasion Wear', '$200 - $600', 'Elegant outfits for any occasion, designed to make you stand out while providing comfort and style.'),
('Contemporary Everyday Wear', '$100 - $300', 'Chic and modern pieces that blend comfort with style for your everyday wardrobe.'),
('Luxury Embroidered Pieces', '$300 - $700', 'Intricately embroidered garments that showcase craftsmanship and attention to detail.'),
('Jewellery (Curated / Statement)', '$50 - $500', 'A selection of curated and statement jewellery pieces to complement your outfits.'),
('Alterations & Refinements', '$30 - $150', 'Professional alterations to ensure your garments fit perfectly and meet your expectations.');
