import { useUploadStore } from '@/store/uploadStore';
import { filesApi } from '@/services/files.service';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useFileUploader() {
  const { addUpload, updateProgress, updateStatus, togglePanel } = useUploadStore();
  const queryClient = useQueryClient();

  const handleUpload = async (files: File[], folderId: string | null = null) => {
    if (files.length === 0) return;
    togglePanel(true);

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the 10MB limit.`);
        continue;
      }

      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      addUpload(uploadId, file);

      try {
        updateStatus(uploadId, 'uploading');

        // 1. Calculate SHA-256 Hash locally (Zero-Bandwidth check)
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 2. Check for duplicate on the backend
        const duplicateRes = await filesApi.checkDuplicate({
          contentHash,
          name: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          folderId,
        });

        if (duplicateRes.data.isDuplicate) {
          // Virtual Upload Successful!
          updateProgress(uploadId, 100);
          updateStatus(uploadId, 'success');
          toast.success(`Virtual Upload: "${file.name}" instantly deduplicated!`);
        } else {
          // 3. Normal upload if not a duplicate
          await filesApi.uploadFile(file, folderId, (percent) => {
            updateProgress(uploadId, percent);
          });
          updateStatus(uploadId, 'success');
        }

        // Invalidate TanStack query cache to force UI refresh
        queryClient.invalidateQueries({ queryKey: ['files', folderId] });
        queryClient.invalidateQueries({ queryKey: ['me'] });

      } catch (err: any) {
        console.error('File upload failed:', err);
        updateStatus(uploadId, 'error', err?.response?.data?.message || err.message || 'Upload failed');
      }
    }
  };

  return { uploadFiles: handleUpload };
}

