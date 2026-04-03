'use client';

import { useQuery } from '@tanstack/react-query';
import { sharesApi, SharedFolderFile } from '@/services/shares.service';
import { Download, Globe, FileText, Image as ImageIcon, File, Folder as FolderIcon, Loader2 } from 'lucide-react';
import { formatBytes } from '@/components/drive/FileCard';
import { getFileIcon } from '@/components/drive/FileCard';

export default function SharedFilePage({ params }: { params: { token: string } }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['share', params.token],
    queryFn: () => sharesApi.getShare(params.token),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-brand-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading shared content...</p>
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

  // ── Folder Share View ───────────────────────────────────────────────────────
  if ('folder' in data && data.folder) {
    const { folder, subfolders, files, share } = data;
    const totalItems = subfolders.length + files.length;

    return (
      <div className="min-h-screen flex flex-col bg-gray-950">
        {/* Navbar */}
        <nav className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-brand-500" />
            <span className="font-bold text-gray-200">Shared via AU-Drive</span>
          </div>
          <span className="text-xs text-gray-500 hidden sm:inline">View-only access</span>
        </nav>

        {/* Folder Meta Bar */}
        <div className="bg-gray-900/50 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div className="bg-brand-500/10 p-3 rounded-lg flex-shrink-0">
            <FolderIcon className="w-7 h-7 text-brand-400" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-gray-200 truncate">{folder.name}</h1>
            <p className="text-sm text-gray-500">
              {totalItems === 0
                ? 'Empty folder'
                : `${totalItems} item${totalItems !== 1 ? 's' : ''}`}
              {share.expiresAt && (
                <span className="ml-2 text-amber-500/80">
                  · Expires {new Date(share.expiresAt).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
              <FolderIcon className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-500">This folder is empty.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">

              {/* Subfolders */}
              {subfolders.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold text-gray-400 tracking-wider mb-3 uppercase">Folders</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subfolders.map((sf) => (
                      <div
                        key={sf._id}
                        className="flex items-center gap-3 p-3.5 bg-gray-900 border border-gray-800 rounded-xl"
                        title="Sub-folder browsing not available in shared links"
                      >
                        <FolderIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-300 truncate">{sf.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Files */}
              {files.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold text-gray-400 tracking-wider mb-3 uppercase">Files</h2>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800">
                    {files.map((file: SharedFolderFile) => (
                      <div key={file._id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-800/60 transition-colors group">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.mimeType, 'w-5 h-5 text-brand-400')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate">{file.originalName}</p>
                          <p className="text-xs text-gray-500">{formatBytes(file.size)} · {file.mimeType}</p>
                        </div>
                        <a
                          href={file.presignedUrl}
                          download={file.originalName}
                          className="flex-shrink-0 flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 opacity-0 group-hover:opacity-100 transition-all bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-lg"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-3 text-center text-xs text-gray-600">
          Shared folder · View-only · Powered by AU-Drive
        </footer>
      </div>
    );
  }

  // ── File Share View (existing — untouched logic) ────────────────────────────
  const fileWrapper = (data as any).file;

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
