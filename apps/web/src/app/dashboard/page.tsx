'use client';

import { useAuth } from '@/lib/auth/auth-provider';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to{' '}
          <span className="gradient-text">ODOS</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Logged in as: <span className="font-semibold text-foreground">{user?.email}</span>
        </p>
      </div>

      <div className="glass rounded-2xl p-8 text-center space-y-4 max-w-xl">
        <div className="text-4xl">🚀</div>
        <h2 className="text-lg font-bold text-foreground">Project Foundation Initialized</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The monorepo project foundation is complete. Apps, services, shared packages, and Docker Compose configurations are successfully set up.
        </p>
      </div>
    </div>
  );
}
