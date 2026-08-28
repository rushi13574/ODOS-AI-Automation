import { NextResponse } from 'next/server';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function clearAuthCookies(response: NextResponse, cookieStore: Awaited<ReturnType<typeof cookies>>) {
    // Supabase stores sessions in one or more `sb-*-auth-token` cookies. If a
    // refresh token was rotated or otherwise invalidated, remove every chunk so
    // the browser cannot keep restoring the broken session after this redirect.
    cookieStore.getAll()
        .filter(({ name }) => name.startsWith('sb-') && name.includes('-auth-token'))
        .forEach(({ name }) => {
            response.cookies.set(name, '', { path: '/', maxAge: 0 });
        });
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
        const response = NextResponse.redirect(
            new URL('/login?error=missing_confirmation_code', requestUrl.origin),
        );
        clearAuthCookies(response, await cookies());
        return response;
    }

    const cookieStore = await cookies();
    
    // Create the response object first so we can attach cookies directly to it
    const response = NextResponse.redirect(new URL('/home', requestUrl.origin));

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },

                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        // Route handlers must write cookies to the response that is
                        // returned to the browser. That is what lets the browser
                        // client restore this newly verified session on /home.
                        response.cookies.set(name, value, options);
                    });
                },
            },
        },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error('Email confirmation error:', error);
        const errorResponse = NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin),
        );
        clearAuthCookies(errorResponse, cookieStore);
        return errorResponse;
    }

    return response;
}
