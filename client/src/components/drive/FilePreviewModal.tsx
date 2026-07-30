'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, ExternalLink, Loader2, FileText, Image as ImageIcon, Download, Sparkles } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/services/files.service';
import { aiApi } from '@/services/ai.service';
import { useUIStore } from '@/store/uiStore';
import { getFileIcon, formatBytes } from './FileCard';
import toast from 'react-hot-toast';

export function FilePreviewModal() {
  const { previewFileId, setPreviewFile } = useUIStore();
  const queryClient = useQueryClient();

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

  const handleToggleStar = async () => {
    if (!fileWrapper) return;
    try {
      await filesApi.updateFile(fileWrapper._id, { isStarred: !fileWrapper.isStarred });
      toast.success(fileWrapper.isStarred ? 'Removed from starred' : 'Starred file');
      queryClient.invalidateQueries({ queryKey: ['file', previewFileId] });
      queryClient.invalidateQueries({ queryKey: ['files', fileWrapper.folderId] });
    } catch {
      toast.error('Failed to update star status');
    }
  };

  return (
    <Dialog.Root open={!!previewFileId} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in flex items-center justify-center p-4">
          <Dialog.Content className="relative bg-white border-4 border-black shadow-neo flex flex-col max-w-5xl w-full h-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 rounded-none">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-neo-blue flex-shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                {fileWrapper ? getFileIcon(fileWrapper.mimeType, "w-6 h-6 text-black flex-shrink-0") : null}
                <div>
                  <Dialog.Title className="text-lg font-bold text-black truncate uppercase tracking-widest">
                    {fileWrapper?.name || 'Loading...'}
                  </Dialog.Title>
                  <p className="text-sm text-black font-bold">
                    {fileWrapper ? formatBytes(fileWrapper.size) : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {fileWrapper && (
                  <button
                    onClick={handleToggleStar}
                    className={`p-2 text-black hover:bg-white border-2 border-transparent hover:border-black transition-colors ${fileWrapper.isStarred ? 'text-yellow-500' : ''}`}
                    title={fileWrapper.isStarred ? "Unstar" : "Star"}
                  >
                    <Star className={`w-5 h-5 stroke-[3] ${fileWrapper.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </button>
                )}
                {fileWrapper?.presignedUrl && (
                  <a
                    href={fileWrapper.presignedUrl}
                    download={fileWrapper.name}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-black hover:bg-white border-2 border-transparent hover:border-black transition-colors"
                    title="Download File"
                  >
                    <Download className="w-5 h-5 stroke-[3]" />
                  </a>
                )}
                <Dialog.Close asChild>
                  <button className="p-2 text-black hover:bg-white border-2 border-transparent hover:border-black transition-colors">
                    <X className="w-5 h-5 stroke-[3]" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Main Preview Area */}
              <div className="flex-1 overflow-auto flex items-center justify-center bg-neo-bg p-4">
                {isLoading && (
                  <div className="flex flex-col items-center text-black">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm font-bold">Fetching file...</span>
                  </div>
                )}

                {error && (
                  <div className="text-center text-black border-4 border-black bg-red-500 p-4 shadow-neo max-w-md">
                    <p className="font-bold mb-1 uppercase">Failed to load preview</p>
                    <p className="text-sm font-bold">{(error as any)?.message || 'Ensure your Cloudflare R2 credentials are valid in .env'}</p>
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
                        className="w-full h-full border-4 border-black shadow-neo bg-white"
                        title={fileWrapper.name}
                      />
                    ) : (
                      // Fallback for non-previewable files
                      <div className="flex flex-col items-center justify-center text-center p-8 bg-white border-4 border-black shadow-neo max-w-sm">
                        <div className="w-16 h-16 bg-neo-yellow border-2 border-black rounded-full flex items-center justify-center mb-4 shadow-neo-sm">
                          {getFileIcon(fileWrapper.mimeType, "w-8 h-8 text-black")}
                        </div>
                        <h3 className="text-lg font-bold text-black mb-2 truncate w-full">
                          {fileWrapper.name}
                        </h3>
                        <p className="text-sm text-black font-bold mb-6">
                          No preview available for this file type.
                        </p>
                        <a
                          href={fileWrapper.presignedUrl}
                          download={fileWrapper.name}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-black border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none px-5 py-2.5 font-bold transition-all"
                        >
                          <Download className="w-5 h-5 stroke-[3]" />
                          Download File
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AI Summary Sidebar */}
              <div className="w-80 bg-white border-l-4 border-black p-6 flex flex-col overflow-y-auto hidden md:flex shrink-0">
                <div className="flex items-center gap-2 mb-4 text-black">
                  <Sparkles className="w-6 h-6 text-brand-500" />
                  <h3 className="font-bold text-lg uppercase tracking-widest">AI Summary</h3>
                </div>
                
                {isSummaryLoading ? (
                  <div className="flex flex-col items-center justify-center h-32 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                    <span className="text-sm font-bold text-black uppercase">Analyzing document...</span>
                  </div>
                ) : summaryData?.summary ? (
                  <div className="space-y-6">
                    <div className="text-sm text-black font-bold leading-relaxed bg-neo-yellow p-4 border-4 border-black shadow-neo">
                      {summaryData.summary}
                    </div>
                    
                    {summaryData.tags && summaryData.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-3 underline decoration-4 decoration-neo-pink underline-offset-4">Topic Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {summaryData.tags.map((tag: string, i: number) => (
                            <span 
                              key={i}
                              className="px-3 py-1.5 text-sm font-bold bg-neo-pink text-black border-2 border-black shadow-neo-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : summaryData?.processingStatus === 'failed' ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center text-black font-bold">
                    <X className="w-10 h-10 mb-2 stroke-[3]" />
                    <p className="text-sm uppercase bg-red-500 px-2 py-1 border-2 border-black">Summary failed.</p>
                    <p className="text-xs mt-2">Invalid API key or file unreadable.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center text-black font-bold">
                    <FileText className="w-10 h-10 mb-2 stroke-[2]" />
                    <p className="text-sm uppercase">No summary yet.</p>
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
