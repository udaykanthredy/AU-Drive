'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharesApi, Share } from '@/services/shares.service';
import { Share2, Loader2, Folder as FolderIcon, FileText, Link, Trash2, ExternalLink } from 'lucide-react';
import { getFileIcon } from '@/components/drive/FileCard';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useState } from 'react';

type EnrichedShare = Share & { resourceName: string };

export default function SharedWithMePage() {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-shares'],
    queryFn: () => sharesApi.listMyShares(),
  });

  const shares: EnrichedShare[] = (data as EnrichedShare[]) ?? [];

  const { mutate: revokeShare } = useMutation({
    mutationFn: (shareId: string) => sharesApi.revokeShare(shareId),
    onSuccess: () => {
      toast.success('Share link revoked');
      queryClient.invalidateQueries({ queryKey: ['my-shares'] });
    },
    onError: () => toast.error('Failed to revoke share'),
  });

  const handleCopyLink = (token: string, shareId: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Link copied!');
  };

  const handleRevoke = (share: EnrichedShare) => {
    if (confirm(`Revoke the share link for "${share.resourceName}"? Anyone with the link will lose access.`)) {
      revokeShare(share._id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-brand-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Loading shared links...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Share2 className="w-6 h-6 text-brand-400" />
        <h1 className="text-xl font-bold text-gray-200">Shared by me</h1>
        {shares.length > 0 && (
          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">
            {shares.length} active link{shares.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {shares.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
          <Share2 className="w-14 h-14 text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium">No shared links yet</p>
          <p className="text-sm text-gray-600 mt-1">Share files or folders from My Drive to see them here</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800">
          {/* Table header */}
          <div className="grid grid-cols-[minmax(200px,1fr)_90px_160px_130px] items-center text-xs font-semibold text-gray-500 px-4 py-3">
            <div>Name</div>
            <div>Type</div>
            <div>Created</div>
            <div className="text-right">Actions</div>
          </div>

          {shares.map((share) => (
            <div
              key={share._id}
              className="grid grid-cols-[minmax(200px,1fr)_90px_160px_130px] items-center px-4 py-3 hover:bg-gray-800/50 transition-colors group"
            >
              {/* Name + icon */}
              <div className="flex items-center gap-3 truncate pr-4">
                {share.resourceType === 'folder' ? (
                  <FolderIcon className="w-5 h-5 flex-shrink-0 text-brand-400" />
                ) : (
                  <FileText className="w-5 h-5 flex-shrink-0 text-brand-400" />
                )}
                <span className="text-sm text-gray-200 truncate">{share.resourceName}</span>
              </div>

              {/* Type badge */}
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  share.resourceType === 'folder'
                    ? 'text-brand-400 bg-brand-500/10 border-brand-500/20'
                    : 'text-gray-400 bg-gray-800 border-gray-700'
                }`}>
                  {share.resourceType}
                </span>
              </div>

              {/* Created date + expiry */}
              <div className="text-sm text-gray-500 space-y-0.5">
                <div>{format(new Date(share.createdAt), 'MMM d, yyyy')}</div>
                {share.expiresAt ? (
                  <div className="text-xs text-amber-500/80">
                    Expires {format(new Date(share.expiresAt), 'MMM d')}
                  </div>
                ) : (
                  <div className="text-xs text-gray-600">No expiry</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1.5">
                {/* Open link */}
                <a
                  href={`/share/${share.linkToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open share link"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Copy link */}
                <button
                  onClick={() => handleCopyLink(share.linkToken, share._id)}
                  title="Copy link"
                  className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                    copiedId === share._id
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Link className="w-4 h-4" />
                </button>

                {/* Revoke */}
                <button
                  onClick={() => handleRevoke(share)}
                  title="Revoke share"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
