import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/auth-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ODOS — AI-Powered Learning Roadmaps',
  description:
    'Create personalized, adaptive learning roadmaps powered by AI. Track progress, manage schedules, and reach your learning goals efficiently.',
  keywords: [
    'learning',
    'roadmap',
    'AI',
    'education',
    'adaptive learning',
    'skill development',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
