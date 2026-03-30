'use client';

import { X, ExternalLink, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { filesApi } from '@/services/files.service';

interface FileViewerProps {
  fileId: string;
  onClose: () => void;
}

export function FileViewer({ fileId, onClose }: FileViewerProps) {
  const [fileDetails, setFileDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchPresignedUrl = async () => {
      try {
        setLoading(true);
        const { data } = await filesApi.getFile(fileId);
        if (data.success && active) {
          setFileDetails(data.data);
        } else if (active) {
          setError('Failed to fetch file details');
        }
      } catch (err) {
        if (active) setError('An error occurred getting the file URL');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPresignedUrl();
    
    return () => { active = false; };
  }, [fileId]);

  if (!fileId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl h-full max-h-[90vh] bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex flex-col items-center">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10 w-full shrink-0">
          <div className="text-white font-medium truncate max-w-[70%]">
            {fileDetails?.name || 'Loading...'}
          </div>
          <div className="flex gap-2 isolate">
            {fileDetails && (
              <a 
                href={fileDetails.presignedUrl} 
                target="_blank" 
                rel="noreferrer"
                download={fileDetails.name}
                className="p-2 text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full h-full flex items-center justify-center p-8 mt-12 overflow-hidden">
          {loading && <div className="text-gray-400 animate-pulse">Loading preview...</div>}
          
          {error && <div className="text-red-400">{error}</div>}
          
          {!loading && !error && fileDetails && (
            <div className="w-full h-full flex flex-col items-center justify-center pointer-events-auto">
              {fileDetails.mimeType?.startsWith('image/') ? (
                <img 
                  src={fileDetails.presignedUrl} 
                  alt={fileDetails.name} 
                  className="max-w-full max-h-full object-contain"
                />
              ) : fileDetails.mimeType === 'application/pdf' ? (
                <iframe 
                  src={fileDetails.presignedUrl} 
                  className="w-full h-full rounded bg-white"
                  title={fileDetails.name}
                />
              ) : fileDetails.mimeType?.startsWith('video/') ? (
                <video 
                  src={fileDetails.presignedUrl} 
                  controls 
                  className="max-w-full max-h-full"
                />
              ) : fileDetails.mimeType?.startsWith('text/') ? (
                <iframe 
                  src={fileDetails.presignedUrl} 
                  className="w-full h-full bg-white rounded p-4 text-black font-mono overflow-auto"
                />
              ) : (
                <div className="text-center text-gray-400 space-y-4">
                  <div className="text-5xl mx-auto mb-2 opacity-50">📄</div>
                  <p>No preview available for this file type.</p>
                  <a 
                    href={fileDetails.presignedUrl}
                    download={fileDetails.name}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download File
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
