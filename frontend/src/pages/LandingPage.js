import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ArrowRight, BarChart3, CheckCircle2, Lightbulb, Loader2, LogOut, Menu, Play, Sparkles, Target, Users, X } from 'lucide-react';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Force dark theme on landing page, restore user theme on unmount
  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'dark';
    root.classList.remove('light', 'dark');
    root.classList.add('dark');
    return () => {
      root.classList.remove('light', 'dark');
      root.classList.add(savedTheme);
    };
  }, []);

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
    <div className="min-h-screen bg-black text-white" data-testid="landing-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .landing-font { font-family: 'Poppins', 'Plus Jakarta Sans', sans-serif; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fade-in-up-delay-1 { animation: fadeInUp 0.6s ease-out 0.1s forwards; opacity: 0; }
        .animate-fade-in-up-delay-2 { animation: fadeInUp 0.6s ease-out 0.2s forwards; opacity: 0; }
        .animate-fade-in-up-delay-3 { animation: fadeInUp 0.6s ease-out 0.3s forwards; opacity: 0; }
        .animate-fade-in-up-delay-4 { animation: fadeInUp 0.6s ease-out 0.4s forwards; opacity: 0; }
      `}</style>

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-white" />
              <span className="text-xl font-semibold landing-font">StartupOps</span>
            </div>

            <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <a href="#cta" className="text-sm text-white/60 hover:text-white transition-colors">About</a>
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
              <button onClick={() => navigate('/pricing')} className="text-sm text-white/60 hover:text-white transition-colors" data-testid="nav-pricing-btn">Pricing</button>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors px-4 py-2" data-testid="nav-dashboard-btn">
                    Dashboard <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={handleLogout} className="inline-flex items-center gap-1.5 text-sm bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-md font-medium transition-colors" data-testid="nav-logout-btn">
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/auth')} className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2" data-testid="nav-login-btn">
                    Sign in
                  </button>
                  <button onClick={() => navigate('/auth')} className="text-sm bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-md font-medium transition-colors" data-testid="nav-signup-btn">
                    Get Started
                  </button>
                </>
              )}
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800/50" style={{ animation: 'slideDown 0.3s ease-out' }}>
            <div className="px-6 py-4 flex flex-col gap-4">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <button onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }} className="text-sm text-white/60 hover:text-white transition-colors py-2 text-left">Pricing</button>
              <a href="#cta" className="text-sm text-white/60 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>About</a>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-800/50">
                <button onClick={toggleTheme} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors py-2">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  Toggle theme
                </button>
                {user ? (
                  <>
                    <button onClick={() => navigate('/dashboard')} className="text-sm text-white/60 hover:text-white py-2 text-left">Dashboard</button>
                    <button onClick={handleLogout} className="text-sm bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-md font-medium">Logout</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate('/auth')} className="text-sm text-white/60 hover:text-white py-2 text-left">Sign in</button>
                    <button onClick={() => navigate('/auth')} className="text-sm bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-md font-medium">Get Started</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-start px-6 pt-28 md:pt-32">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-gradient-radial from-purple-500/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <aside className="mb-8 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-700 bg-gray-800/50 backdrop-blur-sm animate-fade-in-up">
          <Sparkles className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-400 text-center whitespace-nowrap">
            Built for early-stage founders
          </span>
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-all active:scale-95 whitespace-nowrap"
          >
            Get started
            <ArrowRight size={12} />
          </button>
        </aside>

        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-semibold text-center max-w-6xl px-4 leading-tight mb-0 animate-fade-in-up-delay-1 landing-font"
          style={{
            background: 'linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.6))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.04em',
          }}
          data-testid="hero-heading"
        >
          Your startup's<br />
          <span className="text-6xl md:text-7xl lg:text-8xl">Operational Command Center</span>
        </h1>

        {/* Dashboard preview with scroll animation */}
        <div className="-mt-8 md:-mt-16">
        <ContainerScroll
          titleComponent={null}
        >
          {/* Dashboard mockup inside scroll animation */}
          <div className="h-full w-full bg-[#0a0a0a] overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800/80 bg-[#111]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <div className="ml-2 flex-1 bg-gray-800/60 rounded px-3 py-1 text-xs text-gray-500 max-w-xs">startupops.app/dashboard</div>
            </div>

            {/* Dashboard content */}
            <div className="flex h-[calc(100%-2.5rem)]">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-48 border-r border-gray-800/60 bg-[#0c0c0c] p-3 gap-1 shrink-0">
                <div className="flex items-center gap-1.5 px-2 py-1.5 mb-2">
                  <Sparkles className="h-4 w-4 text-white/80" />
                  <span className="text-xs font-semibold text-white/90">StartupOps</span>
                </div>
                <div className="bg-gray-800/50 rounded-md px-2 py-1 mb-2 text-xs text-gray-500">My Startup ▾</div>
                {[
                  { label: 'Overview', active: true },
                  { label: 'Tasks' },
                  { label: 'Milestones' },
                  { label: 'Feedback' },
                  { label: 'Finance' },
                  { label: 'Analytics' },
                  { label: 'AI Insights' },
                  { label: 'Pitch Generator' },
                  { label: 'Team' },
                  { label: 'Settings' },
                ].map((item) => (
                  <div key={item.label} className={`text-xs px-2 py-1.5 rounded-md ${item.active ? 'bg-gray-800/80 text-white' : 'text-gray-500'}`}>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 md:p-5 overflow-hidden">
                {/* Header */}
                <div className="mb-4">
                  <div className="text-sm md:text-base font-semibold text-white mb-1">Hungry Cheetah</div>
                  <div className="flex gap-1.5">
                    <span className="text-xs px-1.5 py-0.5 rounded border border-gray-700 text-gray-400">SaaS</span>
                    <span className="text-xs px-1.5 py-0.5 rounded border border-gray-700 text-gray-400">MVP stage</span>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                  {[
                    { label: 'Total Tasks', value: '24', color: 'text-blue-400' },
                    { label: 'Completed', value: '18', color: 'text-green-400' },
                    { label: 'Completion', value: '75%', color: 'text-purple-400' },
                    { label: 'Milestones', value: '6', color: 'text-violet-400' },
                    { label: 'Feedback', value: '12', color: 'text-yellow-400' },
                    { label: 'Team Size', value: '4', color: 'text-cyan-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-900/80 border border-gray-800/60 rounded-lg p-2">
                      <div className={`text-base md:text-lg font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-gray-500 truncate">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Two columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Recent Tasks */}
                  <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg p-3">
                    <div className="text-xs font-semibold text-white/80 mb-2">📋 Recent Tasks</div>
                    <div className="space-y-1.5">
                      {[
                        { title: 'Setup CI/CD pipeline', status: 'done', priority: 'high' },
                        { title: 'Design landing page', status: 'in_progress', priority: 'urgent' },
                        { title: 'User authentication flow', status: 'done', priority: 'high' },
                        { title: 'API rate limiting', status: 'review', priority: 'medium' },
                        { title: 'Database optimization', status: 'todo', priority: 'low' },
                      ].map((task) => (
                        <div key={task.title} className="flex items-center justify-between p-1.5 rounded bg-gray-800/30">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-white/80 truncate">{task.title}</div>
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              task.status === 'done' ? 'bg-green-500/10 text-green-400' :
                              task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                              task.status === 'review' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-gray-700/50 text-gray-400'
                            }`}>{task.status.replace('_', ' ')}</span>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded ml-1.5 ${
                            task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            task.priority === 'high' ? 'bg-white/10 text-white' :
                            task.priority === 'medium' ? 'bg-gray-700 text-gray-300' :
                            'border border-gray-700 text-gray-500'
                          }`}>{task.priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestone Progress */}
                  <div className="bg-gray-900/50 border border-gray-800/60 rounded-lg p-3">
                    <div className="text-xs font-semibold text-white/80 mb-2">🎯 Milestone Progress</div>
                    <div className="space-y-2.5">
                      {[
                        { title: 'MVP Launch', progress: 85, done: 17, total: 20 },
                        { title: 'User Testing', progress: 60, done: 6, total: 10 },
                        { title: 'Investor Deck', progress: 40, done: 4, total: 10 },
                        { title: 'Marketing Setup', progress: 20, done: 2, total: 10 },
                      ].map((m) => (
                        <div key={m.title}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white/80 truncate">{m.title}</span>
                            <span className="text-xs text-gray-500">{m.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${m.progress}%` }} />
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">{m.done}/{m.total} tasks done</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContainerScroll>
        </div>

        <p className="text-sm md:text-base text-gray-400 text-center max-w-2xl px-6 mb-8 animate-fade-in-up-delay-2 -mt-4 md:-mt-8">
          Manage execution, validate ideas, collaborate with your team, and gain actionable insights — all in one unified workspace designed for how startups actually work.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 mb-8 animate-fade-in-up-delay-3">
          <button
            onClick={() => navigate('/auth')}
            className="h-12 px-8 text-base font-medium rounded-lg bg-gradient-to-b from-white via-white/95 to-white/60 text-black hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
            data-testid="hero-cta-btn"
          >
            Start Building Free
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="h-12 px-8 text-base font-medium rounded-lg border border-gray-700 bg-gray-800/50 text-white hover:bg-gray-700/50 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
            data-testid="hero-demo-btn"
          >
            {demoLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
            ) : (
              <><Play className="h-4 w-4" /> Try Demo</>
            )}
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-10 md:py-14 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3 block">Core Modules</span>
            <h2
              className="text-3xl md:text-4xl font-semibold tracking-tight landing-font mb-4"
              style={{
                background: 'linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.7))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Everything you need to execute
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              From idea validation to investor readiness — StartupOps covers the entire execution journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-6 rounded-xl border border-gray-800/60 bg-gray-900/30 hover:bg-gray-800/40 hover:border-gray-700/80 transition-all duration-300 hover:-translate-y-1"
                data-testid={`feature-card-${i}`}
              >
                <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-gray-700 transition-colors">
                  <f.icon className="h-5 w-5 text-white/80" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative p-12 md:p-16 rounded-2xl border border-gray-800/60 bg-gray-900/30 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            <div className="relative">
              <h2
                className="text-3xl md:text-4xl font-bold landing-font mb-4"
                style={{
                  background: 'linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.7))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Ready to scale your startup?
              </h2>
              <p className="text-gray-400 text-base md:text-lg mb-8 max-w-xl mx-auto">
                Join founders who are building smarter with StartupOps. Free to start, scales with you.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="h-12 px-8 text-base font-medium rounded-lg bg-gradient-to-b from-white via-white/95 to-white/60 text-black hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2"
                data-testid="cta-signup-btn"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-white/60" />
            <span className="font-semibold text-white/80">StartupOps</span>
          </div>
          <p>Team Hungry Cheetah</p>
        </div>
      </footer>
    </div>
  );
}
