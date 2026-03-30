import { useUploadStore } from '@/store/uploadStore';
import { filesApi } from '@/services/files.service';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useFileUploader() {
  const { addUpload, updateProgress, updateStatus, togglePanel } = useUploadStore();
  const queryClient = useQueryClient();

  const handleUpload = async (files: File[], folderId: string | null = null) => {
    if (files.length === 0) return;
    togglePanel(true);

    for (const file of files) {
      // 1. Generate unique internal ID for progress tracking
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      addUpload(uploadId, file);

      try {
        updateStatus(uploadId, 'uploading');

        // 2. Get Presigned URL from backend
        const presignedRes = await filesApi.getUploadUrl({
          originalName: file.name,
          mimeType: file.type || 'application/octet-stream',
        });
        
        const { uploadUrl, r2Key } = presignedRes.data.data;

        // 3. Upload directly to Cloudflare R2 with progress tracking
        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              updateProgress(uploadId, percentCompleted);
            }
          },
        });

        // 4. Save metadata to backend DB
        updateStatus(uploadId, 'saving_metadata');
        await filesApi.saveMetadata({
          r2Key,
          name: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          folderId,
        });

        updateStatus(uploadId, 'success');
        
        // 5. Invalidate TanStack query cache to force UI refresh
        queryClient.invalidateQueries({ queryKey: ['files', folderId] });

      } catch (err: any) {
        console.error('File upload failed:', err);
        updateStatus(uploadId, 'error', err?.response?.data?.message || err.message || 'Upload failed');
      }
    }
  };

  return { uploadFiles: handleUpload };
}
