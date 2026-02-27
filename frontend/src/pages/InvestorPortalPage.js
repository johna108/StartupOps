import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Users, Building2, TrendingUp, TrendingDown, Target, CheckCircle2,
  Wallet, Calendar, PiggyBank, UserPlus, Copy, Mail, HandCoins,
  BarChart3, Clock, Trash2
} from 'lucide-react';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function InvestorPortalPage() {
  const { currentStartup, getAuthHeaders, permissions, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [investorData, setInvestorData] = useState(null);
  const [investors, setInvestors] = useState({ investors: [], pending_invites: [] });
  const [investments, setInvestments] = useState([]);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const isFounder = permissions.canManageStartup;
  const isInvestor = userRole === 'investor';

  const fetchData = useCallback(async () => {
    if (!currentStartup) return;
    const headers = getAuthHeaders();
    try {
      const [viewRes, investorsRes, investmentsRes] = await Promise.all([
        axios.get(`${API}/startups/${currentStartup.id}/investor-view`, { headers }),
        isFounder ? axios.get(`${API}/startups/${currentStartup.id}/investors`, { headers }) : Promise.resolve({ data: { investors: [], pending_invites: [] } }),
        isFounder ? axios.get(`${API}/startups/${currentStartup.id}/finance/investments`, { headers }) : Promise.resolve({ data: [] }),
      ]);
      setInvestorData(viewRes.data);
      setInvestors(investorsRes.data);
      setInvestments(investmentsRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load data');
    }
    setLoading(false);
  }, [currentStartup, getAuthHeaders, isFounder]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInviteInvestor = async (e) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.name) {
      toast.error('Email and name are required');
      return;
    }
    try {
      const res = await axios.post(`${API}/startups/${currentStartup.id}/investors/invite`, inviteForm, { headers: getAuthHeaders() });
      toast.success(`Investor invited! Share code: ${res.data.invite_code}`);
      setInviteForm({ email: '', name: '' });
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to invite investor');
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Invite code copied!');
  };

  const removeInvestor = async (userId) => {
    try {
      await axios.delete(`${API}/startups/${currentStartup.id}/investors/${userId}`, { headers: getAuthHeaders() });
      toast.success('Investor removed');
      fetchData();
    } catch (e) {
      toast.error('Failed to remove investor');
    }
  };

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select a startup first</div>;
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const data = investorData;
  const milestonesProgress = data?.metrics?.milestones_total > 0 
    ? Math.round((data.metrics.milestones_completed / data.metrics.milestones_total) * 100) 
    : 0;
  const tasksProgress = data?.metrics?.tasks_total > 0 
    ? Math.round((data.metrics.tasks_completed / data.metrics.tasks_total) * 100) 
    : 0;

  return (
    <div className="space-y-6 fade-in" data-testid="investor-portal">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">
            {isInvestor ? 'Investor Dashboard' : 'Investor Portal'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isInvestor ? 'View your investment performance' : 'Manage investors and view company metrics'}
          </p>
        </div>
        {isFounder && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl"><UserPlus className="h-4 w-4 mr-2" /> Invite Investor</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Investor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInviteInvestor} className="space-y-4">
                <div>
                  <Label>Investor Name *</Label>
                  <Input value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} placeholder="e.g., John Smith" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="investor@email.com" />
                </div>
                <p className="text-xs text-muted-foreground">An invite code will be generated. Share it with the investor to join.</p>
                <Button type="submit" className="w-full">Send Invite</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Company Overview */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{data?.startup?.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline">{data?.startup?.industry}</Badge>
                <Badge variant="secondary">{data?.startup?.stage}</Badge>
                {data?.startup?.website && (
                  <a href={data.startup.website.startsWith('http') ? data.startup.website : `https://${data.startup.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline ml-2">
                    {data.startup.website}
                  </a>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{data?.startup?.description || 'No description available'}</p>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(data?.metrics?.total_income || 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(data?.metrics?.total_expenses || 0)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className={`text-2xl font-bold ${(data?.metrics?.current_balance || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(data?.metrics?.current_balance || 0)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Burn</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(data?.metrics?.monthly_burn || 0)}</p>
              </div>
              <Clock className="h-8 w-8 text-red-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Runway & Team */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Runway</p>
                <p className="text-3xl font-bold">{Math.round(data?.metrics?.runway || 0)} <span className="text-lg font-normal text-muted-foreground">months</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="text-3xl font-bold">{data?.metrics?.team_size || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <PiggyBank className="h-7 w-7 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Raised</p>
                <p className="text-3xl font-bold">{formatCurrency(data?.metrics?.total_raised || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Milestones Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{data?.metrics?.milestones_completed || 0} of {data?.metrics?.milestones_total || 0} completed</span>
                <span className="font-medium">{milestonesProgress}%</span>
              </div>
              <Progress value={milestonesProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> Tasks Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{data?.metrics?.tasks_completed || 0} of {data?.metrics?.tasks_total || 0} completed</span>
                <span className="font-medium">{tasksProgress}%</span>
              </div>
              <Progress value={tasksProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Expenses Chart (Simple) */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Expense Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Expenses</span>
              <span className="text-lg font-bold text-red-500">{formatCurrency(data?.metrics?.total_expenses || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Monthly</span>
              <span className="text-lg font-bold text-red-400">{formatCurrency(data?.metrics?.monthly_burn || 0)}</span>
            </div>
            {data?.metrics?.total_expenses > 0 && (
              <div className="pt-2">
                <div className="bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-red-500/70 rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
            {(!data?.metrics?.total_expenses || data.metrics.total_expenses === 0) && (
              <p className="text-muted-foreground text-center py-4">No expense data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Investment Rounds */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-blue-500" /> Investment Rounds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(investments || []).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <HandCoins className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{inv.investor_name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{inv.investment_type}</Badge>
                      {inv.equity_percentage > 0 && <Badge variant="secondary" className="text-xs">{inv.equity_percentage}%</Badge>}
                      <span className="text-xs text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-blue-500">{formatCurrency(inv.amount)}</span>
              </div>
            ))}
            {(investments || []).length === 0 && (
              <p className="text-muted-foreground text-center py-4">No investment rounds recorded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Investors Management (Only for Founders) */}
      {isFounder && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Investor Access
            </CardTitle>
            <CardDescription>Manage who can view your company's investor dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Active Investors */}
              {investors.investors?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Active Investors</h4>
                  {investors.investors.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">{inv.full_name || 'Unnamed Investor'}</p>
                          <p className="text-xs text-muted-foreground">{inv.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive" onClick={() => removeInvestor(inv.user_id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending Invites */}
              {investors.pending_invites?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Pending Invites</h4>
                  {investors.pending_invites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-medium">{inv.name}</p>
                          <p className="text-xs text-muted-foreground">{inv.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">{inv.invite_code}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => copyInviteCode(inv.invite_code)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {investors.investors?.length === 0 && investors.pending_invites?.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No investors yet. Invite investors to give them access to your company metrics.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
