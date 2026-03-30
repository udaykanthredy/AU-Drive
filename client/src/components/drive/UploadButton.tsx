'use client';

import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { filesApi } from '@/services/files.service';
import { useAuthStore } from '@/store/authStore';

export function UploadButton({ folderId, onUploadComplete }: { folderId?: string | null; onUploadComplete?: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((s) => s.user);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setError('File size exceeds 100MB limit');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Get Presigned URL
      const { data } = await filesApi.getUploadUrl({
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
      });

      if (!data.success) throw new Error(data.message || 'Failed to get upload URL');

      const { presignedUrl, r2Key } = data.data;

      // 2. Upload to R2 directly
      const r2Response = await filesApi.uploadToR2(presignedUrl, file);
      
      if (!r2Response.ok) {
        throw new Error('Failed to upload file to Cloudflare R2');
      }

      // 3. Save metadata
      await filesApi.saveMetadata({
        r2Key,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        folderId,
      });

      // Done! Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (err: any) {
      console.error('Upload Error', err);
      setError(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
          uploading 
            ? 'bg-brand-600/50 text-brand-200 cursor-not-allowed' 
            : 'bg-brand-600 hover:bg-brand-700 text-white'
        }`}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
        {uploading ? 'Uploading...' : 'Upload File'}
      </label>
      
      {error && (
        <div className="absolute top-full mt-2 right-0 w-64 p-3 bg-red-900 border border-red-700 rounded-lg shadow-lg z-10 flex gap-2 text-sm text-red-100">
          <XCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
}
