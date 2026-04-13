"use client";

import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { GalleryItem } from '../types/gallery';
import galleryJson from '@/data/gallery.json';

const supabase = createClient();

export const useGallery = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        if (!supabase) {
          setImages(galleryJson as GalleryItem[]);
          return;
        }
        const { data, error: fetchError } = await supabase
          .from('gallery')
          .select('*');
        if (fetchError) throw new Error(fetchError.message);
        setImages(data as GalleryItem[]);
      } catch (err: any) {
        setError(err.message);
        setImages(galleryJson as GalleryItem[]);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return { images, loading, error };
};
