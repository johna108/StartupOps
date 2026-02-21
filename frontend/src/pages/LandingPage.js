import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ArrowRight, BarChart3, CheckCircle2, Lightbulb, Loader2, LogOut, Moon, Play, Sparkles, Sun, Target, Users } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await axios.post(`${API}/demo/setup`);
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@velora.io',
        password: 'DemoUser2026!',
      });
      if (error) {
        toast.error('Demo login failed: ' + error.message);
      } else {
        toast.success('Welcome to the demo!');
        navigate('/dashboard');
      }
    } catch (e) {
      toast.error('Demo setup failed. Please try again.');
    }
    setDemoLoading(false);
  };

  const features = [
    { icon: Target, title: 'Task & Milestone Tracking', desc: 'Kanban boards, milestones, and clear execution flow to keep your team aligned.' },
    { icon: Users, title: 'Team Collaboration', desc: 'Role-based access for founders and team members with real-time workspace.' },
    { icon: Lightbulb, title: 'Feedback & Validation', desc: 'Collect structured feedback, validate ideas with metrics and qualitative inputs.' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Progress indicators, completion trends, and meaningful data representation.' },
    { icon: Sparkles, title: 'AI-Powered Insights', desc: 'Smart suggestions for tasks, milestones, and growth strategies using Gemini AI.' },
    { icon: CheckCircle2, title: 'Investor Pitch Generator', desc: 'Auto-generate compelling pitch outlines using your startup data and traction.' },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-['Plus_Jakarta_Sans']">StartupOps</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="theme-toggle-landing">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/pricing')} data-testid="nav-pricing-btn">Pricing</Button>
            {user ? (
              <>
                <Button onClick={() => navigate('/dashboard')} className="rounded-full" data-testid="nav-dashboard-btn">Dashboard <ArrowRight className="ml-1 h-4 w-4" /></Button>
                <Button variant="outline" onClick={handleLogout} className="rounded-full" data-testid="nav-logout-btn"><LogOut className="mr-1 h-4 w-4" /> Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')} data-testid="nav-login-btn">Log in</Button>
                <Button onClick={() => navigate('/auth')} className="rounded-full" data-testid="nav-signup-btn">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 fade-in">
              <Sparkles className="h-3.5 w-3.5" /> Built for early-stage founders
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-['Plus_Jakarta_Sans'] mb-6 fade-in stagger-1" data-testid="hero-heading">
              Your startup's<br />
              <span className="text-primary">operational command center</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl fade-in stagger-2">
              Manage execution, validate ideas, collaborate with your team, and gain actionable insights — all in one unified workspace designed for how startups actually work.
            </p>
            <div className="flex flex-wrap gap-4 fade-in stagger-3">
              <Button size="lg" className="rounded-full text-base px-8 h-12" onClick={() => navigate('/auth')} data-testid="hero-cta-btn">
                Start Building Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-base px-8 h-12" onClick={handleDemoLogin} disabled={demoLoading} data-testid="hero-demo-btn">
                {demoLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...</> : <><Play className="mr-2 h-5 w-5" /> Try Demo</>}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-primary uppercase tracking-wider font-semibold mb-3">Core Modules</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight font-['Plus_Jakarta_Sans'] mb-4">Everything you need to execute</h2>
            <p className="text-muted-foreground text-lg">From idea validation to investor readiness — StartupOps covers the entire execution journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1" data-testid={`feature-card-${i}`}>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="glass-card p-12 md:p-16 text-center max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold font-['Plus_Jakarta_Sans'] mb-4">Ready to scale your startup?</h2>
              <p className="text-muted-foreground text-lg mb-8">Join founders who are building smarter with StartupOps. Free to start, scales with you.</p>
              <Button size="lg" className="rounded-full text-base px-8 h-12" onClick={() => navigate('/auth')} data-testid="cta-signup-btn">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold">StartupOps</span>
          </div>
          <p>Team Hungry Cheetah</p>
        </div>
      </footer>
    </div>
  );
}
