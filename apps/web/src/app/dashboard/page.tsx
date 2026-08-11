'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/today');
  }, [router]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Redirecting to today's tasks...</div>
    </div>
  );
}
