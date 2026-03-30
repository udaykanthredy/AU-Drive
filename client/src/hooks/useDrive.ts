import { useQuery } from '@tanstack/react-query';
import { filesApi } from '@/services/files.service';
import { foldersApi } from '@/services/folders.service';
import type { File as FileModel, Folder } from '@/types';

export function useDrive(folderId?: string | null) {
  const {
    data: filesData,
    isLoading: isFilesLoading,
    error: filesError,
    refetch: refetchFiles
  } = useQuery({
    queryKey: ['files', folderId],
    queryFn: () => filesApi.getFiles({ folderId }).then((res) => res.data.data),
  });

  const {
    data: foldersData,
    isLoading: isFoldersLoading,
    error: foldersError,
    refetch: refetchFolders
  } = useQuery({
    queryKey: ['folders', folderId],
    queryFn: () => foldersApi.getFolders(folderId === null ? undefined : folderId).then((res) => res.data.data),
  });

  return {
    files: (filesData as FileModel[]) || [],
    folders: (foldersData as Folder[]) || [],
    isLoading: isFilesLoading || isFoldersLoading,
    error: filesError || foldersError,
    refetchAll: () => {
      refetchFiles();
      refetchFolders();
    }
  };
}
