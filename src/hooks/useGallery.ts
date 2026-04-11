"use client";

import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';

const supabase = createClient();
import { GalleryItem } from '../types/gallery';

export const useGallery = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('gallery')
          .select('*');
        if (fetchError) throw new Error(fetchError.message);
        setImages(data as GalleryItem[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return { images, loading, error };
};
