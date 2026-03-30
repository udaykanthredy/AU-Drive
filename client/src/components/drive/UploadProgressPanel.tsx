'use client';

import { useUploadStore } from '@/store/uploadStore';
import { X, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { formatBytes } from '@/components/drive/FileCard';

export function UploadProgressPanel() {
  const { uploads, isPanelOpen, togglePanel, removeUpload } = useUploadStore();
  const [isMinimized, setIsMinimized] = useState(false);

  const uploadList = Object.values(uploads);
  if (uploadList.length === 0) return null;

  const uploadingCount = uploadList.filter(u => u.status === 'uploading' || u.status === 'saving_metadata').length;
  const completedCount = uploadList.filter(u => u.status === 'success').length;
  const totalCount = uploadList.length;

  const headerText = uploadingCount > 0 
    ? `Uploading ${uploadingCount} item${uploadingCount > 1 ? 's' : ''}` 
    : `${completedCount} upload${completedCount > 1 ? 's' : ''} complete`;

  if (!isPanelOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col transition-all duration-300 transform translate-y-0">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-gray-800 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <span className="text-sm font-semibold text-white">{headerText}</span>
        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-white transition-colors">
            {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <button 
            className="text-gray-400 hover:text-white transition-colors ml-1"
            onClick={(e) => { e.stopPropagation(); togglePanel(false); }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Upload Items List */}
      {!isMinimized && (
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {uploadList.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 group">
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                {/* Icon based on status */}
                <div className="flex-shrink-0">
                  {item.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : item.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <div className="relative w-5 h-5">
                      <svg className="w-full h-full text-gray-700" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <circle 
                          className="opacity-75 text-brand-500 origin-center -rotate-90 transition-all duration-300" 
                          cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"
                          strokeDasharray="62.8"
                          strokeDashoffset={62.8 - (62.8 * item.progress) / 100}
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* File details */}
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm text-gray-200 truncate font-medium">{item.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.status === 'error' ? (
                      <span className="text-red-400 truncate block">{item.error || 'Failed'}</span>
                    ) : item.status === 'saving_metadata' ? (
                      <span className="flex items-center gap-1 text-brand-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> Finalizing...
                      </span>
                    ) : item.status === 'success' ? (
                      <span>{formatBytes(item.file.size)}</span>
                    ) : (
                      <span>{Math.round(item.progress)}%</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action (Cancel/Dismiss) */}
              {(item.status === 'success' || item.status === 'error') && (
                <button 
                  onClick={() => removeUpload(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-gray-300 transition-all rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
