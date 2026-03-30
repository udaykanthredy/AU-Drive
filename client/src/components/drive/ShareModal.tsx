'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Check, Globe, Link2, Loader2, Clock } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { filesApi } from '@/services/files.service';
import { sharesApi } from '@/services/shares.service';
import { useUIStore } from '@/store/uiStore';
import { getFileIcon } from './FileCard';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function ShareModal() {
  const { shareFileId, setShareFile } = useUIStore();
  const [copied, setCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(7);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const { data: fileWrapper, isLoading: previewLoading } = useQuery({
    queryKey: ['file', shareFileId],
    queryFn: () => shareFileId ? filesApi.getFile(shareFileId).then(res => res.data.data) : null,
    enabled: !!shareFileId,
  });

  const { mutate: generateLink, isPending } = useMutation({
    mutationFn: () => sharesApi.createShare(shareFileId!, 'file', expiresInDays),
    onSuccess: (data) => {
      // Create the absolute URL for the frontend
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      setShareLink(`${origin}/share/${data.linkToken}`);
      toast.success('Share link generated');
    },
    onError: () => {
      toast.error('Failed to generate link');
    }
  });

  if (!shareFileId) return null;

  const handleClose = () => {
    setShareFile(null);
    setShareLink(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <Dialog.Root open={!!shareFileId} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-md z-50 p-6 animate-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-500" />
              Share File
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
              {previewLoading || !fileWrapper ? (
                <div className="flex items-center gap-3 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" /> Fetching details...
                </div>
              ) : (
                <>
                  {getFileIcon(fileWrapper.mimeType, "w-8 h-8 flex-shrink-0 text-brand-400")}
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-200 truncate">{fileWrapper.originalName}</p>
                    <p className="text-xs text-gray-500">Viewers can read and download</p>
                  </div>
                </>
              )}
            </div>

            {/* Config before generate */}
            {!shareLink && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Link Expiration
                  </label>
                  <select
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={expiresInDays === null ? 'never' : expiresInDays.toString()}
                    onChange={(e) => setExpiresInDays(e.target.value === 'never' ? null : parseInt(e.target.value))}
                  >
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="never">Never Expire</option>
                  </select>
                </div>

                <button
                  disabled={isPending || previewLoading}
                  onClick={() => generateLink()}
                  className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  Generate Link
                </button>
              </div>
            )}

            {/* Generated Link Display */}
            {shareLink && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm font-medium text-green-400">Link generated successfully!</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-300 truncate select-all">
                    {shareLink}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 bg-gray-800 hover:bg-gray-700 text-gray-200 p-2.5 rounded-lg transition-colors border border-gray-700"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center">
                  Anyone with this link will be able to view and download this file.{' '}
                  {expiresInDays ? `Link expires in ${expiresInDays} days.` : ''}
                </p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
