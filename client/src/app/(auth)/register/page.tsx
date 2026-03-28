// TODO Phase 1: Build registration form with validation

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
        <p className="text-gray-400 mb-8">Start your AI-powered drive for free</p>

        {/* TODO Phase 1:
          - Name, Email, Password, Confirm Password fields
          - POST /auth/register → auto-login → redirect to /dashboard
          - Show validation errors inline
          - Link to /login
        */}
        <div className="rounded-lg border border-dashed border-gray-700 p-4 text-center text-gray-500 text-sm">
          Register form — implement in Phase 1
        </div>
      </div>
    </main>
  );
}
