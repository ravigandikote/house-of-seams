'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { showToast } from '@/components/admin/Toast';
import { fetchMedia, deleteMedia, uploadImage } from '@/services/adminApiService';

interface MediaFile {
    filename: string;
    url: string;
}

const AdminMediaPage = () => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteFile, setDeleteFile] = useState<MediaFile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const loadFiles = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchMedia();
            setFiles(data);
        } catch {
            showToast('Failed to load media', 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            await uploadImage(file);
            showToast('Image uploaded successfully');
            await loadFiles();
        } catch {
            showToast('Upload failed', 'error');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async () => {
        if (!deleteFile) return;
        setIsDeleting(true);
        try {
            await deleteMedia(deleteFile.filename);
            showToast('File deleted successfully');
            setDeleteFile(null);
            await loadFiles();
        } catch {
            showToast('Failed to delete file', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    return (
        <div>
            <AdminPageHeader title="Media Library" subtitle="Upload and manage images" />

            <div className="mb-6">
                <label className={`inline-flex items-center gap-2 px-4 py-2 rounded bg-dusty-rose text-white hover:bg-dusty-rose-dark transition cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
                <span className="text-sm text-gray-500 ml-3">JPG, PNG, WebP, GIF (max 5MB)</span>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                    Loading...
                </div>
            ) : files.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                    No images uploaded yet. Click &quot;Upload Image&quot; to add your first image.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {files.map((file) => (
                        <div key={file.filename} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
                            <div className="aspect-square relative">
                                <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-2">
                                <p className="text-xs text-gray-500 truncate mb-2" title={file.filename}>{file.filename}</p>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => copyUrl(file.url)}
                                        className="flex-1 text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                                    >
                                        {copiedUrl === file.url ? 'Copied!' : 'Copy URL'}
                                    </button>
                                    <button
                                        onClick={() => setDeleteFile(file)}
                                        className="text-xs px-2 py-1 rounded border border-red-300 text-red-500 hover:bg-red-50 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DeleteConfirmDialog
                isOpen={!!deleteFile}
                onClose={() => setDeleteFile(null)}
                onConfirm={handleDelete}
                itemName={deleteFile?.filename || ''}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AdminMediaPage;
