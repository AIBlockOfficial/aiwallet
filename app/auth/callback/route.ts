export const dynamic = "force-dynamic";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('--- /auth/callback route hit ---');
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookies) {
            for (const cookie of cookies) {
              cookieStore.set(cookie);
            }
          }
        }
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(new URL('/login?error=oauth', request.url))
    }

    // Collect all cookies and return as JSON for debugging
    const allCookies = cookieStore.getAll();
    console.log('All cookies before redirect:', allCookies);
    return NextResponse.json({ cookies: allCookies });
    // Uncomment below to restore redirect after debugging:
    // const response = NextResponse.redirect(new URL('/', request.url));
    // for (const cookie of allCookies) {
    //   response.cookies.set(cookie.name, cookie.value, cookie);
    // }
    // return response;
  }

  // Always redirect to the main app after successful authentication
  return NextResponse.redirect(new URL('/', request.url))
} 