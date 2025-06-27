// import { NextRequest, NextResponse } from "next/server";
// import { createServerClient, type CookieOptions } from "@supabase/ssr";

// export async function middleware(request: NextRequest) {
//   console.log('--- SSR Middleware running ---', request.nextUrl.pathname);
//   console.log('SSR Middleware cookies:', request.cookies.getAll());
//   let response = NextResponse.next({
//     request: {
//       headers: request.headers,
//     },
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return request.cookies.get(name)?.value;
//         },
//         set(name: string, value: string, options: CookieOptions) {
//           request.cookies.set({ name, value, ...options });
//           response.cookies.set({ name, value, ...options });
//         },
//         remove(name: string, options: CookieOptions) {
//           request.cookies.set({ name, value: "", ...options });
//           response.cookies.set({ name, value: "", ...options });
//         },
//       },
//     }
//   );

//   // This will refresh the session if needed and set cookies on the response
//   await supabase.auth.getUser();

//   return response;
// }

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}; 