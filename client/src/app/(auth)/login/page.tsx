// TODO Phase 1: Build login form with validation and API integration

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-gray-400 mb-8">Sign in to your AU Drive account</p>

        {/* TODO Phase 1:
          - Email + Password form fields
          - useAuthStore().setUser() on success
          - Redirect to /dashboard on login
          - Show error toast on failure
          - "Forgot password?" link
          - Link to /register
        */}
        <div className="rounded-lg border border-dashed border-gray-700 p-4 text-center text-gray-500 text-sm">
          Login form — implement in Phase 1
        </div>
      </div>
    </main>
  );
}
