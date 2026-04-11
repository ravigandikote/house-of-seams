'use client';

import React, { useRef, useState } from 'react';
import { uploadImage } from '@/services/adminApiService';

interface ImageUploaderProps {
  currentImage?: string;
  onUpload: (imageUrl: string) => void;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImage, onUpload, label = 'Image' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      onUpload(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {currentImage && (
        <div className="mb-2">
          <img
            src={currentImage}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-dusty-rose hover:bg-dusty-rose/5 transition-colors"
      >
        {isUploading ? (
          <p className="text-gray-500 text-sm">Uploading...</p>
        ) : (
          <>
            <p className="text-gray-500 text-sm">Click to upload an image</p>
            <p className="text-gray-400 text-xs mt-1">JPG, PNG, WebP, GIF (max 5MB)</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ImageUploader;
