import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <div className="animate-fade-in text-center max-w-3xl mx-auto">
        {/* Logo / Brand */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold tracking-tight gradient-text mb-4">
            ODOS
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            AI-powered adaptive learning roadmaps that evolve with you.
            <br />
            Define your goal. Follow your path. Master any skill.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-8 py-3.5 text-sm font-semibold text-card-foreground transition-all duration-200 hover:bg-secondary hover:border-muted-foreground/30"
          >
            Sign In
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
          {[
            {
              title: 'AI-Generated Roadmaps',
              desc: 'Personalized learning paths tailored to your skill level and goals.',
            },
            {
              title: 'Adaptive Scheduling',
              desc: 'Calendars that adjust when life happens. Carry-forward, reschedule, stay on track.',
            },
            {
              title: 'AI Tutor',
              desc: 'Get explanations, quizzes, and guidance from your personal AI learning companion.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-xl p-6 text-left transition-all duration-300 hover:shadow-glow"
            >
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
