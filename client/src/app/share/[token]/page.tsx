'use client';

import { useQuery } from '@tanstack/react-query';
import { sharesApi } from '@/services/shares.service';
import { Download, Globe, FileText, Image as ImageIcon, File, Loader2 } from 'lucide-react';
import { formatBytes } from '@/components/drive/FileCard';
import { notFound } from 'next/navigation';

export default function SharedFilePage({ params }: { params: { token: string } }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['share', params.token],
    queryFn: () => sharesApi.getShare(params.token),
    retry: false, // Don't retry since 404s/410s mean it's invalid
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-brand-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading securely shared file...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-200 mb-2">Link Invalid or Expired</h1>
          <p className="text-gray-500 mb-6">
            The shared link you are trying to access has either expired, been revoked by the owner, or never existed.
          </p>
          <a href="/" className="inline-block bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-6 rounded-lg transition-colors">
            Go to AU-Drive
          </a>
        </div>
      </div>
    );
  }

  const fileWrapper = data.file;

  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-brand-400" />;
    if (mimeType === 'application/pdf') return <FileText className="w-8 h-8 text-brand-400" />;
    return <File className="w-8 h-8 text-brand-400" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Navbar */}
      <nav className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-brand-500" />
          <span className="font-bold text-gray-200">Shared via AU-Drive</span>
        </div>
        <a 
          href={fileWrapper.presignedUrl}
          download={fileWrapper.originalName}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
      </nav>

      {/* Content Body */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* File Metabar */}
        <div className="bg-gray-900/50 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div className="bg-gray-800 p-3 rounded-lg flex-shrink-0">
            {getIcon(fileWrapper.mimeType)}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-lg font-bold text-gray-200 truncate">{fileWrapper.originalName}</h2>
            <p className="text-sm text-gray-500">{formatBytes(fileWrapper.size)} • {fileWrapper.mimeType}</p>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-950 flex items-center justify-center p-6 overflow-hidden">
          {fileWrapper.mimeType.startsWith('image/') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={fileWrapper.presignedUrl} 
              alt={fileWrapper.originalName}
              className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
            />
          ) : fileWrapper.mimeType === 'application/pdf' ? (
            <iframe 
              src={fileWrapper.presignedUrl}
              title={fileWrapper.originalName}
              className="w-full h-full max-w-5xl rounded-xl border border-gray-800 shadow-xl bg-white"
            />
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <File className="w-12 h-12 text-gray-600" />
              </div>
              <p className="text-gray-400 mb-6">No preview available for this file type.</p>
              <a 
                href={fileWrapper.presignedUrl}
                download={fileWrapper.originalName}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-gray-700 shadow-md"
              >
                <Download className="w-5 h-5" />
                Download File
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
