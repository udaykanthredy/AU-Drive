'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { FilePreviewModal } from '@/components/drive/FilePreviewModal';
import { useUIStore } from '@/store/uiStore';
import { Share2, Loader2, Link, Trash2, ExternalLink } from 'lucide-react';
import { getFileIcon, formatBytes } from '@/components/drive/FileCard';
import toast from 'react-hot-toast';

interface ShareEntry {
  _id: string;
  resourceId: string;
  resourceType: 'file' | 'folder';
  permission: 'viewer' | 'editor';
  linkToken: string;
  expiresAt: string | null;
  createdAt: string;
  isRevoked: boolean;
  resource?: {
    _id: string;
    name: string;
    size: number;
    mimeType: string;
  } | null;
}

async function fetchMyShares(): Promise<ShareEntry[]> {
  const res = await apiClient.get('/shares');
  return res.data?.data ?? [];
}

export default function SharedPage() {
  const { setPreviewFile } = useUIStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['shares', 'mine'],
    queryFn: fetchMyShares,
  });

  const handleRevoke = async (shareId: string) => {
    try {
      await apiClient.delete(`/shares/${shareId}`);
      toast.success('Share link revoked');
      queryClient.invalidateQueries({ queryKey: ['shares', 'mine'] });
    } catch {
      toast.error('Failed to revoke share link');
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-400 text-sm">Failed to load shared files.</p>
      </div>
    );
  }

  const shares = (data ?? []).filter((s) => !s.isRevoked);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Share2 className="w-6 h-6 text-brand-400" />
        <h1 className="text-2xl font-bold text-white">Shared by me</h1>
        {shares.length > 0 && (
          <span className="text-sm text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            {shares.length} active link{shares.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {shares.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
          <Share2 className="w-14 h-14 text-gray-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-1">No shared files</h3>
          <p className="text-gray-500 text-sm">Files you share via link will appear here.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>File</span>
            <span>Permission</span>
            <span>Expires</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-gray-800/50">
            {shares.map((share) => {
              const resource = share.resource;
              const expiresText = share.expiresAt
                ? new Date(share.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Never';
              const isExpired = share.expiresAt ? new Date(share.expiresAt) < new Date() : false;

              return (
                <div
                  key={share._id}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 py-3 hover:bg-gray-800/40 transition-colors group"
                >
                  {/* File info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 text-gray-500 flex-shrink-0">
                      {resource ? getFileIcon(resource.mimeType, 'w-4 h-4') : <Share2 className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {resource?.name ?? 'Unknown file'}
                      </p>
                      {resource && (
                        <p className="text-xs text-gray-600">{formatBytes(resource.size)}</p>
                      )}
                    </div>
                  </div>

                  {/* Permission badge */}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                    share.permission === 'editor'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {share.permission === 'editor' ? 'Can edit' : 'Can view'}
                  </span>

                  {/* Expiry */}
                  <span className={`text-xs whitespace-nowrap ${isExpired ? 'text-red-400' : 'text-gray-500'}`}>
                    {isExpired ? 'Expired' : expiresText}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyLink(share.linkToken)}
                      title="Copy share link"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                    >
                      <Link className="w-4 h-4" />
                    </button>
                    <a
                      href={`/share/${share.linkToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open shared link"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleRevoke(share._id)}
                      title="Revoke link"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <FilePreviewModal />
    </div>
  );
}
