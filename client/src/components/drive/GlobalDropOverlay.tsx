'use client';

import { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import { useFileUploader } from '@/hooks/useFileUploader';
import { useSearchParams } from 'next/navigation';

export function GlobalDropOverlay() {
  const [isDragging, setIsDragging] = useState(false);
  const { uploadFiles } = useFileUploader();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams?.get('folder');

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only show overlay if it contains files
      if (e.dataTransfer?.types.includes('Files')) {
        dragCounter++;
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        uploadFiles(Array.from(e.dataTransfer.files), currentFolderId);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [uploadFiles, currentFolderId]);

  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-brand-500/90 backdrop-blur-sm border-[12px] border-black flex flex-col items-center justify-center animate-in fade-in zoom-in-95 pointer-events-none">
      <div className="bg-white border-8 border-black p-12 shadow-neo flex flex-col items-center transform -rotate-2">
        <UploadCloud className="w-32 h-32 text-black mb-6 animate-bounce" strokeWidth={3} />
        <h1 className="text-5xl font-black text-black uppercase tracking-widest text-center">
          Drop Files to Upload
        </h1>
        <p className="text-xl font-bold text-gray-700 mt-4 uppercase">
          Releasing mouse will start upload instantly
        </p>
      </div>
    </div>
  );
}
