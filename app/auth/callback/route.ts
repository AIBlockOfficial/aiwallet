export const dynamic = "force-dynamic";
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('[Callback] Raw request URL:', request.url);
  console.log('[Callback] Request headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));
  console.log('--- /auth/callback route hit ---');
  console.log('[Callback] Full request URL:', request.url);
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  console.log('[Callback] Query params:', { code, next });

  if (code) {
    const cookieStore = cookies();
    const response = NextResponse.redirect(new URL(next, request.url));
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );
    try {
      console.log('[Callback] Exchanging code for session:', code);
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      console.log('[Callback] exchangeCodeForSession result:', error);
      const allCookies = response.cookies.getAll();
      console.log('[Callback] Cookies set on response:', allCookies);
      if (!error) {
        // Debug: return cookies as JSON instead of redirecting
        return new Response(JSON.stringify({
          cookies: allCookies
        }), {
          headers: { 'content-type': 'application/json' }
        });
      }
    } catch (e) {
      console.error('[Callback] Exception in exchangeCodeForSession:', e);
      return new Response('Internal Server Error', { status: 500 });
    }
    return NextResponse.redirect(new URL('/login?error=oauth', request.url));
  }
  console.log('[Callback] No code param, redirecting to /');
  return NextResponse.redirect(new URL('/', request.url));
}