import { useUploadStore } from '@/store/uploadStore';
import { filesApi } from '@/services/files.service';
import { useQueryClient } from '@tanstack/react-query';

export function useFileUploader() {
  const { addUpload, updateProgress, updateStatus, togglePanel } = useUploadStore();
  const queryClient = useQueryClient();

  const handleUpload = async (files: File[], folderId: string | null = null) => {
    if (files.length === 0) return;
    togglePanel(true);

    for (const file of files) {
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      addUpload(uploadId, file);

      try {
        updateStatus(uploadId, 'uploading');

        // Proxied upload: Browser → Express → R2 (no CORS issues)
        await filesApi.uploadFile(file, folderId, (percent) => {
          updateProgress(uploadId, percent);
        });

        updateStatus(uploadId, 'success');

        // Invalidate TanStack query cache to force UI refresh
        queryClient.invalidateQueries({ queryKey: ['files', folderId] });

      } catch (err: any) {
        console.error('File upload failed:', err);
        updateStatus(uploadId, 'error', err?.response?.data?.message || err.message || 'Upload failed');
      }
    }
  };

  return { uploadFiles: handleUpload };
}

