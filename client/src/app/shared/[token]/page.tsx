export default function SharedPage({ params }: { params: { token: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-gray-900 border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-2">Shared File</h1>
        {/* TODO Phase 1:
          - Fetch share details: GET /shares/:token
          - Display file metadata (name, size, type)
          - Show file preview (PDF/image/video)
          - Download button (presigned URL)
          - Show "Viewer" / "Editor" permission badge
          - Handle expired/revoked links
        */}
        <div className="rounded-lg border border-dashed border-gray-700 p-8 text-center text-gray-500 text-sm">
          Shared file view — implement in Phase 1 (token: {params.token})
        </div>
      </div>
    </main>
  );
}
