import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Lightbulb, Sparkles, Target, TrendingUp, Loader2, History, Trash2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const insightTypes = [
  { key: 'general', label: 'General Insights', icon: Lightbulb, desc: 'Get overall analysis and actionable recommendations' },
  { key: 'tasks', label: 'Task Suggestions', icon: Sparkles, desc: 'Get AI-suggested tasks based on your startup stage' },
  { key: 'milestones', label: 'Milestone Ideas', icon: Target, desc: 'Discover key milestones you should be tracking' },
  { key: 'growth', label: 'Growth Strategy', icon: TrendingUp, desc: 'Get growth strategies tailored to your startup' },
];

export default function AIInsightsPage() {
  const { currentStartup, getAuthHeaders, userRole } = useAuth();
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState({});
  const [activeTab, setActiveTab] = useState('general');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    if (currentStartup && showHistory) {
      loadHistory();
    }
  }, [showHistory, currentStartup]);

  // Investors should not see AI insights page
  if (userRole === 'investor') {
    return (
      <div className="text-center py-20">
        <Lightbulb className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">AI Insights are not available for investors.</p>
      </div>
    );
  }

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API}/ai/history/${currentStartup.id}?ai_type=insight`, { headers: getAuthHeaders() });
      setHistory(res.data.history || []);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    setLoadingHistory(false);
  };

  const generateInsight = async (type) => {
    if (!currentStartup) return;
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const res = await axios.post(`${API}/ai/insights`, {
        startup_id: currentStartup.id,
        prompt_type: type,
        custom_prompt: customPrompt,
      }, { headers: getAuthHeaders() });
      setInsights(prev => ({ ...prev, [type]: res.data.insights }));
      toast.success('Insights generated!');
      if (showHistory) {
        loadHistory();
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to generate insights');
    }
    setLoading(prev => ({ ...prev, [type]: false }));
  };

  const loadHistoryItem = async (historyId) => {
    try {
      const res = await axios.get(`${API}/ai/history/${currentStartup.id}/${historyId}`, { headers: getAuthHeaders() });
      setInsights(prev => ({ ...prev, [res.data.subtype]: res.data.content }));
      setActiveTab(res.data.subtype);
      toast.success('Loaded from history');
    } catch (e) {
      toast.error('Failed to load history item');
    }
  };

  const deleteHistoryItem = async (historyId) => {
    try {
      await axios.delete(`${API}/ai/history/${historyId}`, { headers: getAuthHeaders() });
      setHistory(prev => prev.filter(h => h.id !== historyId));
      toast.success('History deleted');
    } catch (e) {
      toast.error('Failed to delete history');
    }
  };

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select a startup first</div>;

  return (
    <div className="space-y-6 fade-in" data-testid="ai-insights-page">
      <div>
        <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">AI Insights</h1>
        <p className="text-sm text-muted-foreground">Get AI-powered suggestions and analysis for {currentStartup.name}</p>
      </div>

      {/* Custom Prompt Input */}
      <Card className="glass-card border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Enhance with Custom Context</CardTitle>
          <CardDescription>Add additional information to guide the AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="E.g., 'We're focusing on enterprise customers' or 'Recent funding round completed' - anything to help the AI understand your current situation better"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-20 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">Optional: This will be added to the analysis request</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              {insightTypes.map(t => (
                <TabsTrigger key={t.key} value={t.key} data-testid={`insight-tab-${t.key}`}>
                  <t.icon className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {insightTypes.map(t => (
              <TabsContent key={t.key} value={t.key}>
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2"><t.icon className="h-5 w-5 text-primary" />{t.label}</CardTitle>
                        <CardDescription className="mt-1">{t.desc}</CardDescription>
                      </div>
                      <Button onClick={() => generateInsight(t.key)} disabled={loading[t.key]} className="rounded-full" data-testid={`generate-${t.key}-btn`}>
                        {loading[t.key] ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Generating...</> : <><Lightbulb className="h-4 w-4 mr-1" /> Generate</>}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {insights[t.key] ? (
                      <div className="markdown-content prose prose-sm max-w-none" data-testid={`insight-content-${t.key}`}>
                        {insights[t.key].split('\n').map((line, i) => {
                          if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>;
                          if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
                          if (line.startsWith('# ')) return <h1 key={i}>{line.replace('# ', '')}</h1>;
                          if (line.startsWith('**') && line.endsWith('**')) return <p key={i}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
                          if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4">{line.replace(/^[-*]\s/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
                          if (line.match(/^\d+\./)) return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
                          if (line.trim() === '') return <br key={i} />;
                          return <p key={i}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <t.icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p>Click "Generate" to get AI-powered {t.label.toLowerCase()}</p>
                        <p className="text-xs mt-1">Powered by Google Gemini</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* History Panel */}
        <div>
          <Card className="glass-card sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="h-5 w-5" /> History
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="h-8"
                >
                  {showHistory ? '✕' : '↓'}
                </Button>
              </div>
            </CardHeader>
            {showHistory && (
              <CardContent className="space-y-2">
                {loadingHistory ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 mx-auto animate-spin mb-2" />
                    Loading...
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.map(item => (
                      <div key={item.id} className="p-3 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-primary capitalize">{item.subtype}</p>
                            <p className="text-xs text-muted-foreground truncate mt-1">{item.preview}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadHistoryItem(item.id)}
                              className="h-6 w-6 p-0"
                              title="Load"
                            >
                              ↻
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteHistoryItem(item.id)}
                              className="h-6 w-6 p-0 text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No history yet. Generate insights to see them here.
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
