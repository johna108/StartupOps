import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ClipboardList, Target, MessageSquare, Users, TrendingUp, Heart, Rocket } from 'lucide-react';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '')}/api`;

export default function DashboardOverview() {
  const { currentStartup, getAuthHeaders, userRole } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [investorStats, setInvestorStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentStartup) return;
    const headers = getAuthHeaders();
    setLoading(true);
    
    if (userRole === 'investor') {
      // For investors, show portfolio stats instead of startup metrics
      Promise.all([
        axios.get(`${API}/investor/matches`, { headers }),
        axios.get(`${API}/investor/browse`, { headers }),
      ]).then(([matchesRes, browseRes]) => {
        const matches = matchesRes.data || [];
        const total = browseRes.data || [];
        setInvestorStats({
          matches: matches.length,
          total_available: total.length,
        });
      }).catch(console.error).finally(() => setLoading(false));
    } else {
      // Standard startup dashboard for founders/members
      Promise.all([
        axios.get(`${API}/startups/${currentStartup.id}/analytics`, { headers }),
        axios.get(`${API}/startups/${currentStartup.id}/tasks`, { headers }),
        axios.get(`${API}/startups/${currentStartup.id}/milestones`, { headers }),
      ]).then(([analyticsRes, tasksRes, milestonesRes]) => {
        setAnalytics(analyticsRes.data);
        setTasks(tasksRes.data);
        setMilestones(milestonesRes.data);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [currentStartup, getAuthHeaders, userRole]);

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select or create a startup to get started</div>;
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  // Investor dashboard
  if (userRole === 'investor') {
    return (
      <div className="space-y-8 fade-in" data-testid="dashboard-overview-investor">
        <div>
          <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">{currentStartup.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Your Investment Portfolio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Heart className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold">{investorStats?.matches || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Startups Matched</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{investorStats?.total_available || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Startups to Explore</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Head to <Badge variant="outline">Discover Startups</Badge> to browse and swipe through investment opportunities.
            </p>
            <p className="text-sm text-muted-foreground">
              Check <Badge variant="outline">Matches</Badge> to see your connections and contact founder details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Standard startup dashboard for founders/members

  const statCards = [
    { title: 'Total Tasks', value: analytics?.total_tasks || 0, icon: ClipboardList, color: 'text-blue-500' },
    { title: 'Completed', value: analytics?.completed_tasks || 0, icon: CheckCircle2, color: 'text-green-500' },
    { title: 'Completion Rate', value: `${analytics?.completion_rate || 0}%`, icon: TrendingUp, color: 'text-primary' },
    { title: 'Milestones', value: analytics?.total_milestones || 0, icon: Target, color: 'text-purple-500' },
    { title: 'Feedback', value: analytics?.total_feedback || 0, icon: MessageSquare, color: 'text-yellow-500' },
    { title: 'Team Size', value: analytics?.team_size || 0, icon: Users, color: 'text-cyan-500' },
  ];

  const recentTasks = tasks.slice(-5).reverse();
  const statusColors = { todo: 'bg-muted text-muted-foreground', in_progress: 'bg-blue-500/10 text-blue-500', review: 'bg-yellow-500/10 text-yellow-500', done: 'bg-green-500/10 text-green-500' };
  const priorityColors = { low: 'outline', medium: 'secondary', high: 'default', urgent: 'destructive' };

  return (
    <div className="space-y-8 fade-in" data-testid="dashboard-overview">
      <div>
        <h1 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight">{currentStartup.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          {currentStartup.industry && <Badge variant="outline">{currentStartup.industry}</Badge>}
          <Badge variant="outline">{currentStartup.stage} stage</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="stat-card" data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tasks yet. Create your first task!</p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30" data-testid={`recent-task-${task.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status] || ''}`}>{task.status?.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <Badge variant={priorityColors[task.priority] || 'secondary'} className="text-xs ml-2">{task.priority}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Milestones Progress */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Milestone Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No milestones yet. Set your first milestone!</p>
            ) : (
              <div className="space-y-4">
                {milestones.slice(0, 5).map(m => (
                  <div key={m.id} data-testid={`milestone-progress-${m.id}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <span className="text-xs text-muted-foreground">{m.progress || 0}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${m.progress || 0}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{m.tasks_done || 0}/{m.task_count || 0} tasks done</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
