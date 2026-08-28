'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-provider';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setConfirmationRequired(false);
    setLoading(true);

    try {
      const { error: authError, session } = await signUp(
        email,
        password,
        displayName,
      );

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      /*
       * When Supabase email confirmation is enabled,
       * signup succeeds but there is no active session yet.
       *
       * In that case, do NOT send the user to the dashboard.
       * Show the email confirmation state instead.
       */
      if (!session) {
        setConfirmationRequired(true);
        setLoading(false);
        return;
      }

      /*
       * A session means the user is already authenticated.
       *
       * The backend user-sync endpoint is intentionally not
       * called here because /users/sync has not been implemented.
       */
      setLoading(false);
      router.push('/home');
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during signup.');
      setLoading(false);
    }
  };

  /*
   * Email confirmation screen
   */
  if (confirmationRequired) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="animate-fade-in w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-4xl font-bold gradient-text mb-2">
                ODOS
              </h1>
            </Link>

            <p className="text-muted-foreground">
              Verify your email to continue
            </p>
          </div>

          <div className="glass rounded-2xl p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl">
              ✓
            </div>

            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Check your email
            </h2>

            <p className="text-sm leading-6 text-muted-foreground mb-2">
              Your ODOS account has been created successfully.
            </p>

            <p className="text-sm leading-6 text-muted-foreground mb-6">
              We sent a confirmation link to:
            </p>

            <p className="font-medium text-foreground break-all mb-6">
              {email}
            </p>

            <p className="text-sm leading-6 text-muted-foreground mb-6">
              Please open that email and click the confirmation link.
              After confirming your email, you can sign in to ODOS.
            </p>

            <Link
              href="/login"
              className="block w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="animate-fade-in w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold gradient-text mb-2">
              ODOS
            </h1>
          </Link>

          <p className="text-muted-foreground">
            Create your account
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Display Name
              </label>

              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
                maxLength={50}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}