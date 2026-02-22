import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { HandCoins, Plus, Trash2, TrendingUp, Briefcase } from 'lucide-react';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const investmentTypes = [
  { value: 'pre-seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'angel', label: 'Angel' },
  { value: 'series-a', label: 'Series A' },
  { value: 'series-b', label: 'Series B' },
  { value: 'series-c', label: 'Series C' },
  { value: 'other', label: 'Other' },
];

export default function MyInvestmentsPage() {
  const { currentStartup, getAuthHeaders, permissions, userRole } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [investorName, setInvestorName] = useState('');
  const [amount, setAmount] = useState('');
  const [equity, setEquity] = useState('');
  const [investmentType, setInvestmentType] = useState('seed');
  const [notes, setNotes] = useState('');
  const [investmentDate, setInvestmentDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchInvestments = useCallback(async () => {
    if (!currentStartup) return;
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(`${API}/startups/${currentStartup.id}/finance/investments`, { headers });
      setInvestments(res.data || []);
    } catch (e) {
      console.error('Failed to fetch investments:', e);
      toast.error('Failed to load investments');
    }
    setLoading(false);
  }, [currentStartup, getAuthHeaders]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  // Check if user is an investor - after all hooks
  if (userRole !== 'investor') {
    return (
      <div className="space-y-6 fade-in p-6">
        <Card className="glass-card border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">My Investments is only available for investors.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const addInvestment = async () => {
    if (!investorName.trim() || !amount || amount <= 0) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const headers = getAuthHeaders();
      await axios.post(
        `${API}/startups/${currentStartup.id}/finance/investments`,
        {
          investor_name: investorName,
          amount: parseFloat(amount),
          equity_percentage: equity ? parseFloat(equity) : null,
          investment_type: investmentType,
          date: investmentDate,
          notes,
        },
        { headers }
      );
      toast.success('Investment added successfully');
      setInvestorName('');
      setAmount('');
      setEquity('');
      setNotes('');
      setInvestmentType('seed');
      setInvestmentDate(new Date().toISOString().split('T')[0]);
      fetchInvestments();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add investment');
    }
  };

  const deleteInvestment = async (id) => {
    if (!confirm('Delete this investment record?')) return;
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API}/startups/${currentStartup.id}/finance/investments/${id}`, { headers });
      toast.success('Investment deleted');
      fetchInvestments();
    } catch (e) {
      toast.error('Failed to delete investment');
    }
  };

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select a startup first</div>;
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const avgEquity = investments.length > 0 ? (investments.reduce((sum, inv) => sum + (inv.equity_percentage || 0), 0) / investments.length) : 0;

  return (
    <div className="space-y-6 fade-in" data-testid="my-investments-page">
      <div>
        <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">My Investments</h1>
        <p className="text-sm text-muted-foreground">Track your investments in {currentStartup.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-['Plus_Jakarta_Sans']">{formatCurrency(totalInvested)}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Investments Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-['Plus_Jakarta_Sans']">{investments.length}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HandCoins className="h-4 w-4 text-primary" />
              Avg Equity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-['Plus_Jakarta_Sans']">{avgEquity.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Investment */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Add Investment Record</CardTitle>
          <CardDescription>Record your investment in this startup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="investor-name" className="text-xs font-medium">Investor Name</Label>
              <Input
                id="investor-name"
                placeholder="Your name or fund name"
                value={investorName}
                onChange={(e) => setInvestorName(e.target.value)}
                className="rounded-lg mt-1"
              />
            </div>
            <div>
              <Label htmlFor="investment-amount" className="text-xs font-medium">Amount (INR)</Label>
              <Input
                id="investment-amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg mt-1"
              />
            </div>
            <div>
              <Label htmlFor="equity" className="text-xs font-medium">Equity %</Label>
              <Input
                id="equity"
                type="number"
                placeholder="0"
                step="0.01"
                value={equity}
                onChange={(e) => setEquity(e.target.value)}
                className="rounded-lg mt-1"
              />
            </div>
            <div>
              <Label htmlFor="investment-type" className="text-xs font-medium">Investment Type</Label>
              <Select value={investmentType} onValueChange={setInvestmentType}>
                <SelectTrigger id="investment-type" className="rounded-lg mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {investmentTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="investment-date" className="text-xs font-medium">Date</Label>
              <Input
                id="investment-date"
                type="date"
                value={investmentDate}
                onChange={(e) => setInvestmentDate(e.target.value)}
                className="rounded-lg mt-1"
              />
            </div>
            <div />
            <div className="md:col-span-2">
              <Label htmlFor="notes" className="text-xs font-medium">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-lg mt-1 h-20"
              />
            </div>
          </div>
          <Button onClick={addInvestment} className="w-full mt-4 rounded-lg" data-testid="add-investment-btn">
            <Plus className="h-4 w-4 mr-2" /> Add Investment
          </Button>
        </CardContent>
      </Card>

      {/* Investments List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><HandCoins className="h-5 w-5 text-primary" /> Investment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No investment records yet</p>
          ) : (
            <div className="space-y-3">
              {investments.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{inv.investor_name}</p>
                      <Badge variant="outline" className="text-xs capitalize">{inv.investment_type}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatCurrency(inv.amount)}</span>
                      {inv.equity_percentage && <span>{inv.equity_percentage}% equity</span>}
                      <span>{new Date(inv.date).toLocaleDateString()}</span>
                    </div>
                    {inv.notes && <p className="text-xs text-muted-foreground mt-1">{inv.notes}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-destructive h-8 w-8"
                    onClick={() => deleteInvestment(inv.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
