import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Settings, User, Building, CreditCard } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SettingsPage() {
  const { currentStartup, getAuthHeaders, profile, refreshStartups, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [startupForm, setStartupForm] = useState({
    name: currentStartup?.name || '',
    description: currentStartup?.description || '',
    industry: currentStartup?.industry || '',
    stage: currentStartup?.stage || 'idea',
    website: currentStartup?.website || '',
  });
  const [profileForm, setProfileForm] = useState({ full_name: profile?.full_name || '' });

  const handleStartupSave = async () => {
    if (!currentStartup) return;
    setLoading(true);
    try {
      await axios.put(`${API}/startups/${currentStartup.id}`, startupForm, { headers: getAuthHeaders() });
      await refreshStartups();
      toast.success('Startup updated');
    } catch (e) { toast.error(e.response?.data?.detail || 'Error'); }
    setLoading(false);
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/auth/profile`, profileForm, { headers: getAuthHeaders() });
      toast.success('Profile updated');
    } catch (e) { toast.error('Error updating profile'); }
    setLoading(false);
  };

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select a startup first</div>;

  return (
    <div className="space-y-6 fade-in max-w-2xl" data-testid="settings-page">
      <div>
        <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and startup settings</p>
      </div>

      {/* Profile Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input className="mt-1 h-11 rounded-xl" value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} data-testid="settings-name-input" />
          </div>
          <div>
            <Label>Email</Label>
            <Input className="mt-1 h-11 rounded-xl" value={profile?.email || ''} disabled data-testid="settings-email-input" />
          </div>
          <Button onClick={handleProfileSave} disabled={loading} className="rounded-xl" data-testid="save-profile-btn">Save Profile</Button>
        </CardContent>
      </Card>

      {/* Startup Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> Startup Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input className="mt-1 h-11 rounded-xl" value={startupForm.name} onChange={e => setStartupForm({...startupForm, name: e.target.value})} data-testid="settings-startup-name" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="mt-1 rounded-xl" rows={3} value={startupForm.description} onChange={e => setStartupForm({...startupForm, description: e.target.value})} data-testid="settings-startup-desc" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Industry</Label>
              <Select value={startupForm.industry} onValueChange={v => setStartupForm({...startupForm, industry: v})}>
                <SelectTrigger className="mt-1 h-11 rounded-xl" data-testid="settings-industry-select"><SelectValue placeholder="Select" /></SelectTrigger>
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
              <Select value={startupForm.stage} onValueChange={v => setStartupForm({...startupForm, stage: v})}>
                <SelectTrigger className="mt-1 h-11 rounded-xl" data-testid="settings-stage-select"><SelectValue /></SelectTrigger>
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
            <Label>Website</Label>
            <Input className="mt-1 h-11 rounded-xl" value={startupForm.website} onChange={e => setStartupForm({...startupForm, website: e.target.value})} data-testid="settings-website-input" />
          </div>
          <Button onClick={handleStartupSave} disabled={loading} className="rounded-xl" data-testid="save-startup-btn">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Subscription Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
            <div>
              <p className="font-medium capitalize">{currentStartup.subscription_plan || 'Free'} Plan</p>
              <p className="text-sm text-muted-foreground">
                {currentStartup.subscription_plan === 'free' ? '5 team members, basic features' :
                 currentStartup.subscription_plan === 'pro' ? 'Unlimited members, AI insights, pitch generator' :
                 'Advanced analytics, multiple startups, priority support'}
              </p>
            </div>
            <Badge variant="default" className="capitalize">{currentStartup.subscription_plan || 'free'}</Badge>
          </div>
          <Button variant="outline" className="mt-4 rounded-xl" onClick={() => window.location.href = '/pricing'} data-testid="upgrade-plan-btn">
            Manage Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
