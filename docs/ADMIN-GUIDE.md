# House of Seams — Admin Guide

**Welcome, Kavya!** This guide is your go-to handbook for managing everything on the House of Seams website. You can add products, update collections, write blog posts, manage gallery images, and much more — all without touching any code.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [The Dashboard](#2-the-dashboard)
3. [Navigating the Admin Panel](#3-navigating-the-admin-panel)
4. [Managing Products](#4-managing-products)
5. [Managing Categories](#5-managing-categories)
6. [Managing Gallery](#6-managing-gallery)
7. [Managing Blog Posts](#7-managing-blog-posts)
8. [Managing Testimonials](#8-managing-testimonials)
9. [Managing FAQs](#9-managing-faqs)
10. [Managing Pricing](#10-managing-pricing)
11. [Media Library](#11-media-library)
12. [Viewing Bookings](#12-viewing-bookings)
13. [Image Upload Tips](#13-image-upload-tips)
14. [Quick Reference](#14-quick-reference)

---

## 1. Getting Started

### How to Access the Admin Panel

Open your web browser and go to:

```
https://your-website-url.com/admin
```

(During development, this is `http://localhost:3001/admin`)

You'll see the **Admin Dashboard** — the central hub for managing your entire website.

### What You'll See

The admin panel has three main areas:

- **Top Bar** — Shows "House of Seams Admin" and a "View Site" link to see the live website
- **Left Sidebar** — Navigation menu to switch between different sections
- **Main Area** — Where the content for the selected section appears

On mobile devices, the sidebar is hidden. Tap the **menu icon** (three horizontal lines) at the top-left to open it.

---

## 2. The Dashboard

The dashboard is the first page you see when entering the admin panel. It shows:

### Stat Cards
Five cards showing the total count of:
- **Products** — How many products are listed
- **Categories** — How many categories exist
- **Gallery** — How many gallery images are uploaded
- **Blog Posts** — How many blog articles are published
- **Testimonials** — How many client reviews are saved

Click any card to jump directly to that section.

### Quick Actions
Four shortcut buttons at the bottom:
- **Add New Product** — Jump straight to creating a product
- **Add New Category** — Create a new category
- **Add Blog Post** — Write a new blog article
- **Manage Gallery** — Go to the media library

---

## 3. Navigating the Admin Panel

The **left sidebar** has 10 sections:

| Section | What It Does |
|---------|-------------|
| **Dashboard** | Overview with stats and quick shortcuts |
| **Products** | Add, edit, or remove products from the store |
| **Categories** | Manage product categories (Custom Blouses, Bridal Wear, etc.) |
| **Gallery** | Manage the image gallery shown on the website |
| **Blog** | Write and manage blog articles |
| **Testimonials** | Add or edit client reviews and ratings |
| **FAQs** | Manage frequently asked questions |
| **Pricing** | Update service pricing information |
| **Media** | Upload and manage images (your image library) |
| **Bookings** | View customer appointment bookings |

The section you're currently viewing is highlighted in **pink** in the sidebar.

---

## 4. Managing Products

Products are the items displayed on your Products page and available for purchase.

### Viewing Products
When you open the Products section, you'll see a table with all your products showing:
- A small image thumbnail
- Product name
- Category
- Price (in INR)
- Whether it's featured (shown on the homepage) — **Yes** or **No**

### Adding a New Product

1. Click the **"Add Product"** button (top-right corner)
2. A form will appear. Fill in:
   - **Name** — The product name (e.g., "Silk Bridal Blouse")
   - **Description** — A detailed description of the product
   - **Price** — The price in numbers only (e.g., `1500` for Rs. 1,500)
   - **Category** — Select from the dropdown (Custom Blouses, Bridal Wear, Luxury Embroidered Pieces, Contemporary Everyday Wear, Jewellery, Alterations, Designer Blouses, Occasion Wear)
   - **Featured Product** — Toggle ON if you want this product to appear on the homepage. Toggle OFF if it should only appear on the Products page
   - **Product Image** — Click the upload area to select an image from your computer
3. Click **"Save"** to create the product

### Editing a Product

1. Find the product in the table
2. Click **"Edit"** on the right side of that row
3. The form will open with the current details pre-filled
4. Make your changes
5. Click **"Save"**

### Deleting a Product

1. Click **"Delete"** on the product row
2. A confirmation message will appear asking "Are you sure?"
3. Click **"Delete"** to confirm, or **"Cancel"** to keep it

---

## 5. Managing Categories

Categories organize your products into groups (like Custom Blouses, Bridal Wear, etc.) and appear on the Collections page.

### Adding a New Category

1. Click **"Add Category"**
2. Fill in:
   - **Name** — The category name (e.g., "Festive Collection")
   - **Description** — A short description of this category
   - **Category Image** — Upload a representative image
3. Click **"Save"**

### Editing / Deleting

Same as products — click **"Edit"** to update or **"Delete"** to remove.

---

## 6. Managing Gallery

The Gallery section displays images in a beautiful grid layout on the website. Unlike the table view used in other sections, gallery images show as visual cards.

### What You'll See

A grid of images, each showing:
- The image itself
- A small category tag in the corner (e.g., "Bridal", "Custom", "Luxury")
- Hover over an image to see the description and Edit/Delete buttons

### Adding a Gallery Image

1. Click **"Add Image"**
2. Fill in:
   - **Image** — Upload the image
   - **Alt Text** — A short description of what the image shows (e.g., "Bridal silk blouse with gold embroidery"). This helps with search engines and accessibility
   - **Category** — Select one: Bridal, Luxury, Custom, Jewellery, Everyday, or Occasion
3. Click **"Save"**

### Editing / Deleting

Hover over any image card to see the Edit and Delete buttons.

---

## 7. Managing Blog Posts

Blog posts are articles that appear on the Blog page and help with SEO (search engine visibility).

### Adding a New Blog Post

1. Click **"Add Blog Post"**
2. Fill in:
   - **Title** — The article title (e.g., "5 Bridal Blouse Trends for 2024")
   - **Slug** — This is the web address for the article. It's auto-generated from the title (e.g., "5-bridal-blouse-trends-for-2024"). You can edit it, but use only lowercase letters, numbers, and hyphens
   - **Author** — Defaults to "House of Seams". Change if someone else is writing
   - **Excerpt** — A 1-2 sentence summary that appears in the blog listing
   - **Content** — The full article text. Write as much as you like!
   - **Tags** — Keywords separated by commas (e.g., "bridal, trends, blouses, 2024"). These help organize and find articles
   - **Blog Image** — Upload a cover image for the article
   - **Published Date** — Defaults to today. Set a past date if you're back-dating
3. Click **"Save"**

### What's a "Slug"?

A slug is the part of the web address that identifies your blog post. For example:
- Title: "The Art of Custom Blouse Design"
- Slug: `the-art-of-custom-blouse-design`
- Full URL: `yourwebsite.com/blog/the-art-of-custom-blouse-design`

The slug is auto-generated, so you usually don't need to change it.

---

## 8. Managing Testimonials

Testimonials are client reviews that appear on the Testimonials page, building trust with new visitors.

### Adding a Testimonial

1. Click **"Add Testimonial"**
2. Fill in:
   - **Name** — The client's name (e.g., "Priya Sharma")
   - **Quote** — Their review text
   - **Role** — Their description (e.g., "Bride, Mumbai" or "Fashion Enthusiast, Delhi")
   - **Rating** — Select 1 to 5 (5 is the best)
   - **Date** — When the review was given
3. Click **"Save"**

### How Ratings Appear

Ratings show as stars in the table:
- 5 = Five stars
- 4 = Four stars
- And so on

---

## 9. Managing FAQs

FAQs (Frequently Asked Questions) appear on the FAQs page and help customers find answers quickly.

### Adding a FAQ

1. Click **"Add FAQ"**
2. Fill in:
   - **Question** — The question (e.g., "How long does a custom blouse take?")
   - **Answer** — The detailed answer
3. Click **"Create"**

### Editing / Deleting

Click **"Edit"** to update or **"Delete"** to remove.

---

## 10. Managing Pricing

The Pricing section displays your service rates on the website.

### Adding a Pricing Entry

1. Click **"Add Pricing"**
2. Fill in:
   - **Service Name** — The service (e.g., "Bridal Couture")
   - **Price Range** — The pricing range as text (e.g., "$800 - $2000" or "Rs. 5,000 - Rs. 15,000")
   - **Description** — A brief description of what's included
3. Click **"Create"**

---

## 11. Media Library

The Media Library is your central image storage. Upload images here and use them across products, blog posts, gallery, and categories.

### Uploading an Image

1. Click the **"Upload Image"** button at the top
2. Select an image from your computer
3. The image will appear in the grid once uploaded

### Copying an Image URL

If you need to use an uploaded image somewhere else:
1. Find the image in the grid
2. Click **"Copy URL"**
3. The image's web address is now copied to your clipboard (the button briefly shows "Copied!")

### Deleting an Image

1. Click **"Delete"** on the image card
2. The image will be permanently removed

### Important Notes

- Uploaded images are saved in the website's image folder
- Deleting an image from the Media Library removes the file permanently
- If a product or blog post is using that image, it will show as a broken image

---

## 12. Viewing Bookings

The Bookings section shows customer appointment requests. This is a **view-only** section — you can see bookings but cannot edit or delete them from here.

### What You'll See

A table with:
- **Name** — The customer's name
- **Email** — Their email address
- **Date** — Appointment date
- **Time** — Appointment time
- **Service** — What they booked
- **Status** — A colored badge:
  - **Yellow** = Pending (waiting for confirmation)
  - **Green** = Confirmed
  - **Red** = Cancelled

Bookings are created by customers on the public website when they fill in the appointment form.

---

## 13. Image Upload Tips

For the best results when uploading images:

### Accepted Formats
- **JPG / JPEG** — Best for photographs
- **PNG** — Best for images with text or transparency
- **WebP** — Modern format, smaller file size
- **GIF** — For animated images

### Size Limits
- Maximum file size: **5 MB** per image
- If your image is too large, use a free tool like [TinyPNG](https://tinypng.com) to compress it

### Recommended Dimensions
| Where | Recommended Size |
|-------|-----------------|
| Product images | 800 x 800 pixels (square) |
| Category images | 800 x 600 pixels |
| Blog cover images | 1200 x 600 pixels |
| Gallery images | 800 x 800 pixels (square) |

### Tips
- Use well-lit, high-quality photos
- Square images work best for products and gallery
- Landscape (wider than tall) images work best for blog posts and categories
- Keep file names simple — the system will rename them automatically

---

## 14. Quick Reference

### What Can I Do in Each Section?

| Section | Add New | Edit Existing | Delete | View Only |
|---------|---------|---------------|--------|-----------|
| Products | Yes | Yes | Yes | — |
| Categories | Yes | Yes | Yes | — |
| Gallery | Yes | Yes | Yes | — |
| Blog | Yes | Yes | Yes | — |
| Testimonials | Yes | Yes | Yes | — |
| FAQs | Yes | Yes | Yes | — |
| Pricing | Yes | Yes | Yes | — |
| Media Library | Yes (Upload) | No | Yes | — |
| Bookings | — | — | — | Yes |

### The Basic Workflow

For most sections, the process is the same:

1. **Go to the section** using the sidebar
2. **View existing items** in the table or grid
3. **Add new items** using the button in the top-right corner
4. **Edit items** by clicking "Edit" on any row
5. **Delete items** by clicking "Delete" (you'll always be asked to confirm)
6. **Upload images** when creating or editing items that need pictures

### Notifications

When you save, update, or delete something:
- A **green message** appears at the bottom-right = Success!
- A **red message** appears = Something went wrong. Try again or check your internet connection.

Messages disappear automatically after 3 seconds.

---

## Need Help?

If something isn't working as expected:
1. **Refresh the page** — this solves most temporary issues
2. **Check your internet connection** — the admin panel needs internet to save changes
3. **Contact your developer** — for any issues beyond the admin panel

---

*This guide was created for House of Seams. Last updated: April 2026.*
