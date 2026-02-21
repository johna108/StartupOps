import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Sparkles, Mail, Lock, User, ArrowLeft, Play, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [tab, setTab] = useState('login');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        toast.success('Welcome to StartupOps!');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.target);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get('email'),
      password: form.get('password'),
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully');
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.target);
    const email = form.get('email');
    const password = form.get('password');
    const fullName = form.get('name');
    try {
      // Create user via backend (auto-confirms email)
      await axios.post(`${API}/auth/signup`, { email, password, full_name: fullName });
      // Sign in immediately
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Welcome to StartupOps.');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create account');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${siteUrl}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      // Setup demo data
      console.log('Setting up demo at:', `${API}/demo/setup`);
      const setupResponse = await axios.post(`${API}/demo/setup`);
      console.log('Demo setup response:', setupResponse.data);
      
      // Sign in with demo credentials
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@velora.io',
        password: 'DemoUser2026!',
      });
      if (error) {
        toast.error('Demo login failed: ' + error.message);
      } else {
        toast.success('Welcome to the demo! Explore pre-populated data.');
      }
    } catch (e) {
      console.error('Demo setup error:', e);
      const errorMessage = e.response?.data?.detail || e.message || 'Unknown error';
      toast.error('Failed to set up demo: ' + errorMessage);
    }
    setDemoLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative" data-testid="auth-page">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
      <div className="w-full max-w-md relative">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/')} data-testid="auth-back-btn">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="glass-card border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold font-['Plus_Jakarta_Sans']">StartupOps</span>
            </div>
            <CardDescription>Manage your startup execution journey</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Demo Mode Button */}
            <Button 
              className="w-full mb-4 h-12 rounded-xl bg-gradient-to-r from-primary to-orange-600 text-primary-foreground font-semibold hover:opacity-90 transition-opacity" 
              onClick={handleDemoLogin} 
              disabled={demoLoading}
              data-testid="demo-login-btn"
            >
              {demoLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up demo...</> : <><Play className="mr-2 h-4 w-4" /> Try Demo (Pre-populated Data)</>}
            </Button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or sign in</span></div>
            </div>

            <Button variant="outline" className="w-full mb-4 h-11 rounded-xl" onClick={handleGoogleLogin} disabled={loading} data-testid="google-login-btn">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or continue with email</span></div>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" data-testid="login-tab">Log In</TabsTrigger>
                <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-email" name="email" type="email" placeholder="you@startup.com" className="pl-9 h-11 rounded-xl" required data-testid="login-email-input" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-password" name="password" type="password" placeholder="Enter password" className="pl-9 h-11 rounded-xl" required data-testid="login-password-input" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading} data-testid="login-submit-btn">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-name" name="name" placeholder="John Doe" className="pl-9 h-11 rounded-xl" required data-testid="signup-name-input" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" name="email" type="email" placeholder="you@startup.com" className="pl-9 h-11 rounded-xl" required data-testid="signup-email-input" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-password" name="password" type="password" placeholder="Min 6 characters" className="pl-9 h-11 rounded-xl" minLength={6} required data-testid="signup-password-input" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading} data-testid="signup-submit-btn">
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
