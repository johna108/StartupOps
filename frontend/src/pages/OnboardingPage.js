import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, ArrowLeft, Building2, Users, KeyRound, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { session, refreshStartups, getAuthHeaders, startups: existingStartups } = useAuth();
  const [step, setStep] = useState('role'); // 'role' | 'select' | 'create' | 'join'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', industry: '', stage: 'idea', website: '' });
  const [inviteCode, setInviteCode] = useState('');
  const [selectedStartupId, setSelectedStartupId] = useState(null);

  const handleSelectStartup = async (startupId) => {
    setSelectedStartupId(startupId);
    const startup = existingStartups.find(s => s.id === startupId);
    if (startup) {
      try {
        // Refresh startups and navigate to dashboard
        await refreshStartups();
        toast.success(`Welcome back to ${startup.name}!`);
        navigate('/dashboard');
      } catch (err) {
        toast.error('Failed to load startup');
      }
    }
  };

  const handleCreateStartup = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Startup name is required'); return; }
    
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      toast.error('Session expired. Please sign in again.');
      navigate('/auth');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/startups`, form, { headers });
      console.log('✅ Startup created:', response.data);
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for DB sync
      await refreshStartups();
      
      toast.success('Workspace created! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Error creating startup:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || 'Failed to create workspace';
      if (errorMsg.includes('token') || errorMsg.includes('expired') || errorMsg.includes('authenticated')) {
        toast.error('Session expired. Please sign in again.');
        navigate('/auth');
      } else {
        toast.error(errorMsg);
      }
    }
    setLoading(false);
  };

  const handleJoinStartup = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) { toast.error('Please enter an invite code'); return; }
    
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      toast.error('Session expired. Please sign in again.');
      navigate('/auth');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/startups/join`, { invite_code: inviteCode.trim() }, { headers });
      await refreshStartups();
      toast.success('Joined workspace successfully!');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid invite code';
      if (errorMsg.includes('token') || errorMsg.includes('expired') || errorMsg.includes('authenticated')) {
        toast.error('Session expired. Please sign in again.');
        navigate('/auth');
      } else {
        toast.error(errorMsg);
      }
    }
    setLoading(false);
  };

  const handleInvestorSetup = async () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      toast.error('Session expired. Please sign in again.');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Create a special "My Portfolio" startup context for the investor
      const response = await axios.post(`${API}/startups`, {
        name: 'My Investment Portfolio',
        description: 'Personal investment portfolio',
        industry: 'Investment',
        stage: 'active',
        initial_role: 'investor' // Use the new role parameter
      }, { headers });

      console.log('✅ Investor profile created:', response.data);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshStartups();
      
      toast.success('Investor profile ready! Happy hunting.');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Error creating investor profile:', err);
      toast.error('Failed to setup investor profile');
    }
    setLoading(false);
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative" data-testid="onboarding-page">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="w-full max-w-lg relative">
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-['Plus_Jakarta_Sans']">Welcome to StartupOps</CardTitle>
              <CardDescription>How would you like to get started?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {existingStartups && existingStartups.length > 0 && (
                <button
                  onClick={() => setStep('select')}
                  className="w-full p-5 rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  data-testid="onboarding-select-btn"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-green-500/10 text-green-600 group-hover:bg-green-500/20 transition-colors">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Select Existing Workspace</p>
                      <p className="text-sm text-muted-foreground mt-1">Continue with one of your {existingStartups.length} workspace{existingStartups.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </button>
              )}

              <button
                onClick={() => setStep('create')}
                className="w-full p-5 rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                data-testid="onboarding-founder-btn"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">I'm a Founder</p>
                    <p className="text-sm text-muted-foreground mt-1">Create a new workspace for your startup and invite your team</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('join')}
                className="w-full p-5 rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                data-testid="onboarding-employee-btn"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">I'm a Team Member</p>
                    <p className="text-sm text-muted-foreground mt-1">Join an existing workspace using an invite code from your employer</p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleInvestorSetup}
                disabled={loading}
                className="w-full p-5 rounded-xl border border-border/50 bg-card/50 hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left group disabled:opacity-50"
                data-testid="onboarding-investor-btn"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-green-500/10 text-green-600 group-hover:bg-green-500/20 transition-colors">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">I'm an Investor</p>
                    <p className="text-sm text-muted-foreground mt-1">Discover startups and manage your portfolio</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative" data-testid="onboarding-select-page">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="w-full max-w-lg relative">
          <Button variant="ghost" className="mb-6" onClick={() => setStep('role')} data-testid="onboarding-back-btn">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="h-7 w-7 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-['Plus_Jakarta_Sans']">Select Your Workspace</CardTitle>
              <CardDescription>Choose a workspace to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {existingStartups && existingStartups.length > 0 ? (
                  <>
                    {existingStartups.map(startup => (
                      <button
                        key={startup.id}
                        onClick={() => handleSelectStartup(startup.id)}
                        disabled={loading || selectedStartupId === startup.id}
                        className="w-full p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid={`onboarding-startup-option-${startup.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{startup.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {startup.industry && `${startup.industry} • `}
                              <span className="capitalize">{startup.stage || 'idea'} stage</span>
                              {startup.user_role && ` • ${startup.user_role}`}
                            </p>
                          </div>
                          {selectedStartupId === startup.id && (
                            <div className="text-primary">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No workspaces found. Create or join one to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative" data-testid="onboarding-join-page">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="w-full max-w-md relative">
          <Button variant="ghost" className="mb-6" onClick={() => setStep('role')} data-testid="onboarding-back-btn">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <KeyRound className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-['Plus_Jakarta_Sans']">Join a Workspace</CardTitle>
              <CardDescription>Enter the invite code provided by your employer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinStartup} className="space-y-5">
                <div>
                  <Label>Invite Code</Label>
                  <Input
                    className="mt-1.5 h-12 rounded-xl text-center text-lg tracking-widest uppercase"
                    placeholder="e.g. A1B2C3D4"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={12}
                    required
                    data-testid="onboarding-invite-input"
                  />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading} data-testid="onboarding-join-btn">
                  {loading ? 'Joining...' : 'Join Workspace'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // step === 'create'
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative" data-testid="onboarding-create-page">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="w-full max-w-lg relative">
        <Button variant="ghost" className="mb-6" onClick={() => setStep('role')} data-testid="onboarding-back-btn">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-['Plus_Jakarta_Sans']">Create your Workspace</CardTitle>
            <CardDescription>Set up your startup workspace to start tracking execution</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStartup} className="space-y-5">
              <div>
                <Label>Startup Name *</Label>
                <Input className="mt-1.5 h-11 rounded-xl" placeholder="e.g. Acme Inc" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required data-testid="onboarding-name-input" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-1.5 rounded-xl" placeholder="What does your startup do?" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} data-testid="onboarding-desc-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Industry</Label>
                  <Select value={form.industry} onValueChange={v => setForm({...form, industry: v})}>
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl" data-testid="onboarding-industry-select">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="healthtech">HealthTech</SelectItem>
                      <SelectItem value="edtech">EdTech</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="ai_ml">AI / ML</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stage</Label>
                  <Select value={form.stage} onValueChange={v => setForm({...form, stage: v})}>
                    <SelectTrigger className="mt-1.5 h-11 rounded-xl" data-testid="onboarding-stage-select">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="mvp">MVP</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="scale">Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Website (optional)</Label>
                <Input className="mt-1.5 h-11 rounded-xl" placeholder="https://yoursite.com" value={form.website} onChange={e => setForm({...form, website: e.target.value})} data-testid="onboarding-website-input" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading} data-testid="onboarding-submit-btn">
                {loading ? 'Creating...' : 'Launch Workspace'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
