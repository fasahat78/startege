import Link from "next/link";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { redirect } from "next/navigation";
import Logo from "@/components/layout/Logo";
import { ArrowRight, CheckCircle2, BookOpen, Trophy, Zap, Shield, TrendingUp, Users, Award, Target } from "lucide-react";

// Mark as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Check if user is authenticated with Firebase
  const user = await getCurrentUser();

  // If authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center group flex-shrink-0">
              <Logo width={120} height={40} className="h-10" priority />
              <div className="flex flex-col justify-center ml-1">
                <span className="text-lg font-bold text-foreground leading-tight">
                  STARTEGE
                </span>
                <span className="text-xs font-medium text-muted-foreground leading-tight">
                  Master AI Governance
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/signin-firebase"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup-firebase"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(13,148,136,0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20 mb-8">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">AIGP Certification Prep Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Master AI Governance
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary mt-2">
                Like Never Before
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
              The most comprehensive platform for learning AI Governance and preparing for the AIGP certification
            </p>
            <p className="text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto">
              Interactive learning, gamified progress tracking, and expert guidance—all in one place
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/auth/signup-firebase"
                className="group px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Start Learning Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 bg-card text-foreground rounded-xl font-semibold text-lg hover:bg-muted transition-all border-2 border-border shadow-sm flex items-center gap-2"
              >
                View Pricing
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-status-success" />
                <span>360+ Concept Cards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-status-success" />
                <span>40 Mastery Exams</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-status-success" />
                <span>AI-Powered Tutor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">360+</div>
              <div className="text-sm text-muted-foreground">AI Governance Concepts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">40</div>
              <div className="text-sm text-muted-foreground">Mastery Exams</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">100%</div>
              <div className="text-sm text-muted-foreground">AIGP Aligned</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">AI Tutor Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Everything You Need to Master AI Governance
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive learning platform designed for professionals serious about AI governance excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-card rounded-2xl border border-border hover:border-accent/50 transition-all hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Interactive Concept Cards</h3>
              <p className="text-muted-foreground leading-relaxed">
                Explore 360+ AI Governance concepts organized by domain and difficulty. Each card includes definitions, examples, and real-world scenarios.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-card rounded-2xl border border-border hover:border-accent/50 transition-all hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">40 Mastery Exams</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive mastery exams including boss levels that test your understanding across multiple concepts and categories.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-card rounded-2xl border border-border hover:border-accent/50 transition-all hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">AI-Powered Tutor</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get personalized guidance from Startegizer, your AI Governance expert assistant powered by advanced AI.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-card rounded-2xl border border-border hover:border-accent/50 transition-all hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Real-Time Market Scan</h3>
              <p className="text-muted-foreground leading-relaxed">
                Stay ahead with daily regulatory intelligence and AI governance updates from verified sources worldwide.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 bg-card rounded-2xl border border-border hover:border-accent/50 transition-all hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Gamified Learning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Earn points, unlock badges, maintain streaks, and track your progress as you master AI Governance concepts.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 bg-card rounded-2xl border border-border hover:border-accent/50 transition-all hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">AIGP Exam Prep</h3>
              <p className="text-muted-foreground leading-relaxed">
                Full-length practice exams aligned with the AIGP certification blueprint. Prepare with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start your AI Governance journey in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Sign Up Free</h3>
              <p className="text-muted-foreground">
                Create your account and get instant access to 360+ concept cards and 10 free mastery exams
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Learn & Practice</h3>
              <p className="text-muted-foreground">
                Explore concepts, take exams, track your progress, and unlock achievements as you learn
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Master & Certify</h3>
              <p className="text-muted-foreground">
                Upgrade to Premium for full exam prep, AI tutor access, and advanced features to ace your AIGP exam
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-accent via-accent to-primary rounded-3xl p-12 sm:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
                Ready to Master AI Governance?
              </h2>
              <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals preparing for the AIGP certification. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signup-firebase"
                  className="group px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 bg-primary/20 backdrop-blur-sm text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/30 transition-all border-2 border-primary-foreground/30"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo width={120} height={32} className="h-8 mb-4" />
              <p className="text-sm text-muted-foreground">
                Master AI Governance through interactive learning and comprehensive exam preparation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/concepts" className="hover:text-foreground transition">Concept Cards</Link></li>
                <li><Link href="/challenges" className="hover:text-foreground transition">Mastery Exams</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground transition">Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition">Premium Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/legal/disclosure" className="hover:text-foreground transition">Disclosure</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-foreground transition">Privacy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-foreground transition">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 Startege. All rights reserved.</p>
            <p className="mt-2 text-xs">
              Startege is an independent educational platform.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
