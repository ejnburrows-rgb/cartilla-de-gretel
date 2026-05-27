// Middleware disabled for public Vite SPA deployment
// All routes are public; teacher/student features use optional Supabase authentication
// This middleware was removed to allow unrestricted public access to the reading app

export default async function middleware() {
  return undefined;
}

export const config = {
  matcher: [],
};
