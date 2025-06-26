import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AuthProvider } from '@/components/auth-provider';
import type { AuthUser } from '@/lib/supabase';

export default async function AuthServerWrapper({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  let mappedUser: AuthUser | null = null;
  if (user) {
    mappedUser = {
      id: user.id,
      email: user.email || '',
      email_confirmed_at: user.email_confirmed_at || undefined,
      created_at: user.created_at,
    };
  }
  return <AuthProvider serverUser={mappedUser}>{children}</AuthProvider>;
} 