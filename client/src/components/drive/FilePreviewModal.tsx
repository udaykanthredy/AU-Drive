'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, ExternalLink, Loader2, FileText, Image as ImageIcon, Download, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { filesApi } from '@/services/files.service';
import { aiApi } from '@/services/ai.service';
import { useUIStore } from '@/store/uiStore';
import { getFileIcon, formatBytes } from './FileCard';

export function FilePreviewModal() {
  const { previewFileId, setPreviewFile } = useUIStore();

  const { data: fileWrapper, isLoading, error } = useQuery({
    queryKey: ['file', previewFileId],
    queryFn: () => previewFileId ? filesApi.getFile(previewFileId).then(res => res.data.data) : null,
    enabled: !!previewFileId,
  });

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['summary', previewFileId],
    queryFn: () => previewFileId ? aiApi.getFileSummary(previewFileId).then(res => res.data.data) : null,
    enabled: !!previewFileId,
  });

  if (!previewFileId) return null;

  const handleClose = () => setPreviewFile(null);

  return (
    <Dialog.Root open={!!previewFileId} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in flex items-center justify-center p-4">
          <Dialog.Content className="relative bg-gray-900 border border-gray-800 rounded-xl shadow-2xl flex flex-col max-w-5xl w-full h-full max-h-[90vh] overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950/50 flex-shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                {fileWrapper ? getFileIcon(fileWrapper.mimeType, "w-5 h-5 text-brand-400 flex-shrink-0") : null}
                <div>
                  <Dialog.Title className="text-sm font-semibold text-gray-200 truncate">
                    {fileWrapper?.name || 'Loading...'}
                  </Dialog.Title>
                  <p className="text-xs text-gray-500">
                    {fileWrapper ? formatBytes(fileWrapper.size) : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {fileWrapper?.presignedUrl && (
                  <a
                    href={fileWrapper.presignedUrl}
                    download={fileWrapper.name}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Download File"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                )}
                <Dialog.Close asChild>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Main Preview Area */}
              <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-950 p-4">
                {isLoading && (
                  <div className="flex flex-col items-center text-brand-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm font-medium">Fetching file...</span>
                  </div>
                )}

                {error && (
                  <div className="text-center text-red-400 max-w-md">
                    <p className="font-semibold mb-1">Failed to load preview</p>
                    <p className="text-sm opacity-80">{(error as any)?.message || 'Ensure your Cloudflare R2 credentials are valid in .env'}</p>
                  </div>
                )}

                {fileWrapper?.presignedUrl && (
                  <div className="w-full h-full flex items-center justify-center">
                    {fileWrapper.mimeType.startsWith('image/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fileWrapper.presignedUrl}
                        alt={fileWrapper.name}
                        className="max-w-full max-h-full object-contain rounded-md"
                      />
                    ) : fileWrapper.mimeType === 'application/pdf' ? (
                      <iframe
                        src={fileWrapper.presignedUrl}
                        className="w-full h-full rounded-md border-0 bg-white"
                        title={fileWrapper.name}
                      />
                    ) : (
                      // Fallback for non-previewable files
                      <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-900 border border-gray-800 rounded-xl shadow-lg max-w-sm">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          {getFileIcon(fileWrapper.mimeType, "w-8 h-8 text-brand-500")}
                        </div>
                        <h3 className="text-lg font-medium text-gray-200 mb-2 truncate w-full">
                          {fileWrapper.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">
                          No preview available for this file type.
                        </p>
                        <a
                          href={fileWrapper.presignedUrl}
                          download={fileWrapper.name}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download File
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AI Summary Sidebar */}
              <div className="w-80 bg-gray-900 border-l border-gray-800 p-6 flex flex-col overflow-y-auto hidden md:flex shrink-0">
                <div className="flex items-center gap-2 mb-4 text-brand-400">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider">AI Summary</h3>
                </div>
                
                {isSummaryLoading ? (
                  <div className="flex flex-col items-center justify-center h-32 space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                    <span className="text-xs text-gray-400">Analyzing document...</span>
                  </div>
                ) : summaryData?.summary ? (
                  <div className="space-y-6">
                    <div className="text-sm text-gray-300 leading-relaxed bg-gray-950 p-4 rounded-xl border border-gray-800 shadow-inner">
                      {summaryData.summary}
                    </div>
                    
                    {summaryData.tags && summaryData.tags.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Topic Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {summaryData.tags.map((tag: string, i: number) => (
                            <span 
                              key={i}
                              className="px-2.5 py-1 text-xs font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : summaryData?.processingStatus === 'failed' ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center text-red-400">
                    <X className="w-8 h-8 mb-2 opacity-80 text-red-500" />
                    <p className="text-xs font-semibold">Summary generation failed.</p>
                    <p className="text-xs mt-1 opacity-80">Invalid API key or file unreadable.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500">
                    <FileText className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">No summary available yet.</p>
                    <p className="text-xs mt-1">Processing in background...</p>
                  </div>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
