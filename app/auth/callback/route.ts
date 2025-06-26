import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    // Collect all cookies and set them on the response
    const allCookies = cookieStore.getAll();
    console.log('All cookies before redirect:', allCookies);
    const response = NextResponse.redirect(new URL('/', request.url));
    for (const cookie of allCookies) {
      response.cookies.set(cookie.name, cookie.value, cookie);
    }
    return response;
  }

  // Always redirect to the main app after successful authentication
  return NextResponse.redirect(new URL('/', request.url))
} 