import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { BarChart3, Target, MessageSquare, CheckCircle2, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const COLORS = ['hsl(24.6, 95%, 53.1%)', 'hsl(173, 58%, 39%)', 'hsl(197, 37%, 24%)', 'hsl(43, 74%, 66%)'];

export default function AnalyticsPage() {
  const { currentStartup, getAuthHeaders, userRole } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!currentStartup) return;
    try {
      const res = await axios.get(`${API}/startups/${currentStartup.id}/analytics`, { headers: getAuthHeaders() });
      setAnalytics(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [currentStartup, getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Investors should not see analytics page
  if (userRole === 'investor') {
    return (
      <div className="text-center py-20">
        <BarChart3 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Analytics are not available for investors.</p>
      </div>
    );
  }

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select a startup first</div>;
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const taskData = analytics?.task_stats ? Object.entries(analytics.task_stats).map(([name, value]) => ({ name: name.replace('_', ' '), value })) : [];
  const priorityData = analytics?.priority_stats ? Object.entries(analytics.priority_stats).map(([name, value]) => ({ name, value })) : [];
  const milestoneData = analytics?.milestone_stats ? Object.entries(analytics.milestone_stats).map(([name, value]) => ({ name: name.replace('_', ' '), value })) : [];
  const feedbackData = analytics?.feedback_by_category ? Object.entries(analytics.feedback_by_category).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-6 fade-in" data-testid="analytics-page">
      <div>
        <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your startup's progress and performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="stat-card" data-testid="stat-tasks"><CardContent className="p-4">
          <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{analytics?.completed_tasks || 0}/{analytics?.total_tasks || 0}</p>
          <p className="text-xs text-muted-foreground">Tasks Done</p>
        </CardContent></Card>
        <Card className="stat-card" data-testid="stat-rate"><CardContent className="p-4">
          <TrendingUp className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{analytics?.completion_rate || 0}%</p>
          <p className="text-xs text-muted-foreground">Completion</p>
        </CardContent></Card>
        <Card className="stat-card" data-testid="stat-milestones"><CardContent className="p-4">
          <Target className="h-5 w-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{analytics?.milestone_stats?.completed || 0}/{analytics?.total_milestones || 0}</p>
          <p className="text-xs text-muted-foreground">Milestones</p>
        </CardContent></Card>
        <Card className="stat-card" data-testid="stat-feedback"><CardContent className="p-4">
          <MessageSquare className="h-5 w-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{analytics?.total_feedback || 0}</p>
          <p className="text-xs text-muted-foreground">Feedback</p>
        </CardContent></Card>
        <Card className="stat-card" data-testid="stat-rating"><CardContent className="p-4">
          <BarChart3 className="h-5 w-5 text-cyan-500 mb-2" />
          <p className="text-2xl font-bold">{analytics?.avg_rating || 0}/5</p>
          <p className="text-xs text-muted-foreground">Avg Rating</p>
        </CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Task Status Distribution</CardTitle></CardHeader>
          <CardContent>
            {taskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={taskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-12">No task data available</p>}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Priority Distribution</CardTitle></CardHeader>
          <CardContent>
            {priorityData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={priorityData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {priorityData.filter(d => d.value > 0).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-12">No priority data available</p>}
          </CardContent>
        </Card>

        {/* Milestone Status */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Milestone Progress</CardTitle></CardHeader>
          <CardContent>
            {milestoneData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={milestoneData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={80} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="value" fill="hsl(173, 58%, 39%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-12">No milestone data available</p>}
          </CardContent>
        </Card>

        {/* Feedback by Category */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Feedback by Category</CardTitle></CardHeader>
          <CardContent>
            {feedbackData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={feedbackData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {feedbackData.filter(d => d.value > 0).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground py-12">No feedback data available</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
