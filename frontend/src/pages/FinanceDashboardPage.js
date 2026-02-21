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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  IndianRupee, TrendingUp, TrendingDown, PiggyBank, Plus, Trash2, 
  ArrowUpRight, ArrowDownRight, Wallet, Receipt, HandCoins, Calendar
} from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const incomeCategories = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'investment', label: 'Investment' },
  { value: 'grant', label: 'Grant' },
  { value: 'other', label: 'Other' },
];

const expenseCategories = [
  { value: 'salary', label: 'Salary & Wages' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operations' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'legal', label: 'Legal & Compliance' },
  { value: 'other', label: 'Other' },
];

const investmentTypes = [
  { value: 'pre-seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'angel', label: 'Angel' },
  { value: 'series-a', label: 'Series A' },
  { value: 'series-b', label: 'Series B' },
  { value: 'other', label: 'Other' },
];

export default function FinanceDashboardPage() {
  const { currentStartup, getAuthHeaders, permissions, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [incomeForm, setIncomeForm] = useState({ title: '', amount: '', category: 'revenue', date: '', notes: '' });
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'operations', date: '', notes: '' });
  const [investmentForm, setInvestmentForm] = useState({ investor_name: '', amount: '', equity_percentage: '', investment_type: 'seed', date: '', notes: '' });
  const [dialogOpen, setDialogOpen] = useState({ income: false, expense: false, investment: false });

  const canManage = permissions.canManageContent;

  const fetchData = useCallback(async () => {
    if (!currentStartup) return;
    const headers = getAuthHeaders();
    try {
      const [summaryRes, incomeRes, expensesRes, investmentsRes] = await Promise.all([
        axios.get(`${API}/startups/${currentStartup.id}/finance/summary`, { headers }),
        axios.get(`${API}/startups/${currentStartup.id}/finance/income`, { headers }),
        axios.get(`${API}/startups/${currentStartup.id}/finance/expenses`, { headers }),
        axios.get(`${API}/startups/${currentStartup.id}/finance/investments`, { headers }),
      ]);
      setSummary(summaryRes.data);
      setIncome(incomeRes.data);
      setExpenses(expensesRes.data);
      setInvestments(investmentsRes.data);
    } catch (e) {
      console.error('Finance data error:', e);
      const errorMsg = e.response?.data?.detail || e.message || 'Unknown error';
      toast.error(`Failed to load financial data: ${errorMsg}`);
    }
    setLoading(false);
  }, [currentStartup, getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Investors should not see finance page
  if (userRole === 'investor') {
    return (
      <div className="text-center py-20">
        <Wallet className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Financial management is not available for investors.</p>
      </div>
    );
  }

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!incomeForm.title || !incomeForm.amount) {
      toast.error('Title and amount are required');
      return;
    }
    try {
      await axios.post(`${API}/startups/${currentStartup.id}/finance/income`, {
        ...incomeForm,
        amount: parseFloat(incomeForm.amount),
      }, { headers: getAuthHeaders() });
      toast.success('Income added');
      setIncomeForm({ title: '', amount: '', category: 'revenue', date: '', notes: '' });
      setDialogOpen({ ...dialogOpen, income: false });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add income');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) {
      toast.error('Title and amount are required');
      return;
    }
    try {
      await axios.post(`${API}/startups/${currentStartup.id}/finance/expenses`, {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
      }, { headers: getAuthHeaders() });
      toast.success('Expense added');
      setExpenseForm({ title: '', amount: '', category: 'operations', date: '', notes: '' });
      setDialogOpen({ ...dialogOpen, expense: false });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add expense');
    }
  };

  const handleAddInvestment = async (e) => {
    e.preventDefault();
    if (!investmentForm.investor_name || !investmentForm.amount) {
      toast.error('Investor name and amount are required');
      return;
    }
    try {
      await axios.post(`${API}/startups/${currentStartup.id}/finance/investments`, {
        ...investmentForm,
        amount: parseFloat(investmentForm.amount),
        equity_percentage: parseFloat(investmentForm.equity_percentage) || 0,
      }, { headers: getAuthHeaders() });
      toast.success('Investment added');
      setInvestmentForm({ investor_name: '', amount: '', equity_percentage: '', investment_type: 'seed', date: '', notes: '' });
      setDialogOpen({ ...dialogOpen, investment: false });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add investment');
    }
  };

  const handleDelete = async (type, id) => {
    try {
      await axios.delete(`${API}/startups/${currentStartup.id}/finance/${type}/${id}`, { headers: getAuthHeaders() });
      toast.success('Deleted successfully');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select a startup first</div>;
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 fade-in" data-testid="finance-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Finance Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track income, expenses, and investments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(summary?.total_income || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(summary?.total_expenses || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investments</p>
                <p className="text-2xl font-bold text-blue-500">{formatCurrency(summary?.total_investments || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <HandCoins className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className={`text-2xl font-bold ${(summary?.net_balance || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(summary?.net_balance || 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Runway and Equity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Runway</p>
                <p className="text-3xl font-bold">{summary?.runway_months || 0} <span className="text-lg font-normal text-muted-foreground">months</span></p>
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
                <p className="text-sm text-muted-foreground">Total Equity Given</p>
                <p className="text-3xl font-bold">{summary?.total_equity_given || 0}<span className="text-lg font-normal text-muted-foreground">%</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed view */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Income by Category */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-500" /> Income by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(summary?.income_by_category || {}).map(([cat, amount]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{cat}</span>
                      <span className="font-medium text-green-500">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  {Object.keys(summary?.income_by_category || {}).length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">No income recorded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Expenses by Category */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-red-500" /> Expenses by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(summary?.expenses_by_category || {}).map(([cat, amount]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{cat}</span>
                      <span className="font-medium text-red-500">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  {Object.keys(summary?.expenses_by_category || {}).length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">No expenses recorded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Income Records</h3>
            {canManage && (
              <Dialog open={dialogOpen.income} onOpenChange={(v) => setDialogOpen({ ...dialogOpen, income: v })}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Add Income</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Income</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddIncome} className="space-y-4">
                    <div>
                      <Label>Title *</Label>
                      <Input value={incomeForm.title} onChange={(e) => setIncomeForm({ ...incomeForm, title: e.target.value })} placeholder="e.g., Product Sales" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Amount (₹) *</Label>
                        <Input type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })} placeholder="0" />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select value={incomeForm.category} onValueChange={(v) => setIncomeForm({ ...incomeForm, category: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {incomeCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea value={incomeForm.notes} onChange={(e) => setIncomeForm({ ...incomeForm, notes: e.target.value })} placeholder="Optional notes..." />
                    </div>
                    <Button type="submit" className="w-full">Add Income</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {income.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.date} • {item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-500">{formatCurrency(item.amount)}</span>
                      {canManage && (
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDelete('income', item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {income.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No income recorded yet. Add your first income entry!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Expense Records</h3>
            {canManage && (
              <Dialog open={dialogOpen.expense} onOpenChange={(v) => setDialogOpen({ ...dialogOpen, expense: v })}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Add Expense</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddExpense} className="space-y-4">
                    <div>
                      <Label>Title *</Label>
                      <Input value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} placeholder="e.g., AWS Hosting" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Amount (₹) *</Label>
                        <Input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="0" />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select value={expenseForm.category} onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {expenseCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} placeholder="Optional notes..." />
                    </div>
                    <Button type="submit" className="w-full">Add Expense</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {expenses.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <ArrowDownRight className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.date} • {item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-red-500">-{formatCurrency(item.amount)}</span>
                      {canManage && (
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDelete('expenses', item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No expenses recorded yet. Add your first expense entry!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investments Tab */}
        <TabsContent value="investments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Investment Records</h3>
            {permissions.canManageStartup && (
              <Dialog open={dialogOpen.investment} onOpenChange={(v) => setDialogOpen({ ...dialogOpen, investment: v })}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Add Investment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Investment</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddInvestment} className="space-y-4">
                    <div>
                      <Label>Investor Name *</Label>
                      <Input value={investmentForm.investor_name} onChange={(e) => setInvestmentForm({ ...investmentForm, investor_name: e.target.value })} placeholder="e.g., Sequoia Capital" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Amount (₹) *</Label>
                        <Input type="number" value={investmentForm.amount} onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })} placeholder="0" />
                      </div>
                      <div>
                        <Label>Equity %</Label>
                        <Input type="number" step="0.1" value={investmentForm.equity_percentage} onChange={(e) => setInvestmentForm({ ...investmentForm, equity_percentage: e.target.value })} placeholder="0" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Investment Type</Label>
                        <Select value={investmentForm.investment_type} onValueChange={(v) => setInvestmentForm({ ...investmentForm, investment_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {investmentTypes.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Date</Label>
                        <Input type="date" value={investmentForm.date} onChange={(e) => setInvestmentForm({ ...investmentForm, date: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea value={investmentForm.notes} onChange={(e) => setInvestmentForm({ ...investmentForm, notes: e.target.value })} placeholder="Optional notes..." />
                    </div>
                    <Button type="submit" className="w-full">Add Investment</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {investments.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <HandCoins className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{item.investor_name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                          <Badge variant="outline" className="text-xs">{item.investment_type}</Badge>
                          {item.equity_percentage > 0 && (
                            <Badge variant="secondary" className="text-xs">{item.equity_percentage}% equity</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-blue-500">{formatCurrency(item.amount)}</span>
                      {permissions.canManageStartup && (
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDelete('investments', item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {investments.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No investments recorded yet. Add your first investment!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
