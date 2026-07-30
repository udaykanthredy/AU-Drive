'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useDrive } from '@/hooks/useDrive';
import { FileCard } from '@/components/drive/FileCard';
import { FolderCard } from '@/components/drive/FolderCard';
import { FileListTable } from '@/components/drive/FileListTable';
import { BreadcrumbNav } from '@/components/drive/BreadcrumbNav';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useFileUploader } from '@/hooks/useFileUploader';
import { UploadProgressPanel } from '@/components/drive/UploadProgressPanel';
import { FilePreviewModal } from '@/components/drive/FilePreviewModal';
import { ShareModal } from '@/components/drive/ShareModal';
import type { Folder, File as FileModel } from '@/types';
import { motion } from 'framer-motion';

// TODO: Fetch real breadcrumb path array from backend based on current folderId
function useMockBreadcrumbs(folderId?: string | null) {
  if (!folderId) return [];
  // For Phase 1 we just pretend we are 1 level deep if a folderId exists
  return [{ _id: folderId, name: 'Current Folder' }];
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get('folder');
  const router = useRouter();
  
  const { viewMode, setPreviewFile } = useUIStore();
  const { files, folders, isLoading, error } = useDrive(folderId);
  const breadcrumbs = useMockBreadcrumbs(folderId);
  const { uploadFiles } = useFileUploader();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      uploadFiles(acceptedFiles, folderId);
    },
    noClick: true, // Prevent clicking anywhere from opening file dialog
    noKeyboard: true,
  });

  // Handlers
  const handleFolderClick = (folder: Folder) => {
    router.push(`/dashboard?folder=${folder._id}`);
  };

  const handleFileDoubleClick = (file: FileModel) => {
    setPreviewFile(file._id);
  };

  // Render Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-black">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-black font-bold uppercase tracking-widest">Loading your files...</p>
      </div>
    );
  }

  // Render Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-500 border-4 border-black shadow-neo rounded-none p-6 max-w-md text-center">
          <h3 className="text-black font-bold mb-2 uppercase">Something went wrong</h3>
          <p className="text-black font-bold">{(error as any).message || 'Failed to load drive contents'}</p>
        </div>
      </div>
    );
  }

  const isEmpty = files.length === 0 && folders.length === 0;

  return (
    <div 
      {...getRootProps()}
      className={`h-full flex flex-col relative transition-colors duration-200 ${
        isDragActive ? 'bg-neo-blue border-4 border-black rounded-none border-dashed scale-[0.99]' : ''
      }`}
    >
      <input {...getInputProps()} />
      
      {/* Header Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <BreadcrumbNav paths={breadcrumbs} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] border-4 border-dashed border-black mx-2 bg-neo-yellow/30">
            <UploadCloud className="w-16 h-16 text-black mb-4" />
            <h3 className="text-xl font-bold text-black mb-1 uppercase">Drop files here</h3>
            <p className="text-black font-bold text-sm">or use the "New" button to upload documents.</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="space-y-8">
                {/* Folders Section */}
                {folders.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-black mb-4 tracking-wider underline decoration-4 underline-offset-4 decoration-neo-pink uppercase">FOLDERS</h2>
                    <motion.div 
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.05 }
                        }
                      }}
                    >
                      {folders.map(folder => (
                        <FolderCard key={`folder-${folder._id}`} folder={folder} onClick={handleFolderClick} />
                      ))}
                    </motion.div>
                  </div>
                )}

                {/* Files Section */}
                {files.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-black mb-4 tracking-wider underline decoration-4 underline-offset-4 decoration-neo-blue uppercase mt-6">FILES</h2>
                    <motion.div 
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.05 }
                        }
                      }}
                    >
                      {files.map(file => (
                        <FileCard key={`file-${file._id}`} file={file} onDoubleClicked={handleFileDoubleClick} />
                      ))}
                    </motion.div>
                  </div>
                )}
              </div>
            ) : (
              // List View Render
              <FileListTable 
                files={files} 
                folders={folders} 
                onFolderClick={handleFolderClick}
                onFileDoubleClick={handleFileDoubleClick}
              />
            )}
          </>
        )}
      </div>
      
      <UploadProgressPanel />
      <FilePreviewModal />
      <ShareModal />
    </div>
  );
}
