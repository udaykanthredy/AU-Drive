export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Drive</h1>
        <p className="text-gray-400 mt-1">Your files and folders</p>
      </div>

      {/* TODO Phase 1:
        - Fetch folders + files for root (GET /folders/root)
        - Show FileGrid / FileList toggle
        - Drag-and-drop upload zone
        - "New Folder" button
        - File context menu (rename, move, delete, share, star)
      */}
      <div className="rounded-xl border border-dashed border-gray-700 p-16 text-center">
        <p className="text-gray-500">Drive UI — implement in Phase 1</p>
        <p className="text-gray-600 text-sm mt-2">Upload, organize, and share your files</p>
      </div>
    </div>
  );
}
