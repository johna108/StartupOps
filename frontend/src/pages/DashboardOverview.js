import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ClipboardList, Target, MessageSquare, Users, TrendingUp, Heart, Rocket } from 'lucide-react';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

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
          <h1 className="text-3xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif" }}>{currentStartup.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Your Investment Portfolio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-card border border-green-500/30 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">{investorStats?.matches || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Startups Matched</p>
          </div>

          <div className="rounded-xl bg-card border border-purple-500/30 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Rocket className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-foreground">{investorStats?.total_available || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">Startups to Explore</p>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Next Steps</h3>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Head to <span className="text-foreground/80 bg-muted px-2 py-0.5 rounded text-xs">Discover Startups</span> to browse and swipe through investment opportunities.
            </p>
            <p className="text-sm text-muted-foreground">
              Check <span className="text-foreground/80 bg-muted px-2 py-0.5 rounded text-xs">Matches</span> to see your connections and contact founder details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Standard startup dashboard for founders/members

  const statCards = [
    { title: 'Total Tasks', value: analytics?.total_tasks || 0, icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Completed', value: analytics?.completed_tasks || 0, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'Completion Rate', value: `${analytics?.completion_rate || 0}%`, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Milestones', value: analytics?.total_milestones || 0, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Feedback', value: analytics?.total_feedback || 0, icon: MessageSquare, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Team Size', value: analytics?.team_size || 0, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  const recentTasks = tasks.slice(-5).reverse();
  const statusColors = { todo: 'bg-muted text-muted-foreground', in_progress: 'bg-blue-500/15 text-blue-500', review: 'bg-yellow-500/15 text-yellow-500', done: 'bg-green-500/15 text-green-500' };
  const priorityColors = { low: 'outline', medium: 'secondary', high: 'default', urgent: 'destructive' };

  return (
    <div className="space-y-8 fade-in" data-testid="dashboard-overview">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif" }}>{currentStartup.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          {currentStartup.industry && <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">{currentStartup.industry}</span>}
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">{currentStartup.stage} stage</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="rounded-xl bg-card border border-border p-4 shadow-sm hover:bg-accent transition-colors" data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="rounded-xl bg-card border border-border shadow-sm">
          <div className="p-5 pb-3 border-b border-border">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-400" /> Recent Tasks
            </h3>
          </div>
          <div className="p-5">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tasks yet. Create your first task!</p>
            ) : (
              <div className="space-y-2.5">
                {recentTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border hover:bg-accent transition-colors" data-testid={`recent-task-${task.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground/90 truncate">{task.title}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status] || ''}`}>{task.status?.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <Badge variant={priorityColors[task.priority] || 'secondary'} className="text-xs ml-2">{task.priority}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Milestones Progress */}
        <div className="rounded-xl bg-card border border-border shadow-sm">
          <div className="p-5 pb-3 border-b border-border">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-400" /> Milestone Progress
            </h3>
          </div>
          <div className="p-5">
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No milestones yet. Set your first milestone!</p>
            ) : (
              <div className="space-y-4">
                {milestones.slice(0, 5).map(m => (
                  <div key={m.id} data-testid={`milestone-progress-${m.id}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium text-foreground/90 truncate">{m.title}</p>
                      <span className="text-xs text-muted-foreground">{m.progress || 0}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${m.progress || 0}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{m.tasks_done || 0}/{m.task_count || 0} tasks done</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
