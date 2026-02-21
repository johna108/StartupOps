import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, MessageSquare, Star, Filter } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const categories = ['product', 'market', 'technical', 'business'];

export default function FeedbackPage() {
  const { currentStartup, getAuthHeaders, profile, userRole } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', content: '', category: 'product', rating: 3, source: 'internal' });

  const fetchData = useCallback(async () => {
    if (!currentStartup) return;
    try {
      const res = await axios.get(`${API}/startups/${currentStartup.id}/feedback`, { headers: getAuthHeaders() });
      setFeedbacks(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [currentStartup, getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Investors should not see feedback page
  if (userRole === 'investor') {
    return (
      <div className="text-center py-20">
        <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Feedback management is not available for investors.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    try {
      await axios.post(`${API}/startups/${currentStartup.id}/feedback`, form, { headers: getAuthHeaders() });
      toast.success('Feedback submitted');
      setDialogOpen(false);
      setForm({ title: '', content: '', category: 'product', rating: 3, source: 'internal' });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || 'Error'); }
  };

  const filtered = filter === 'all' ? feedbacks : feedbacks.filter(f => f.category === filter);
  const avgRating = feedbacks.length ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1) : '0.0';
  const categoryColors = { product: 'bg-blue-500/10 text-blue-500', market: 'bg-green-500/10 text-green-500', technical: 'bg-purple-500/10 text-purple-500', business: 'bg-yellow-500/10 text-yellow-500' };

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select a startup first</div>;
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 fade-in" data-testid="feedback-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Feedback & Validation</h1>
          <p className="text-sm text-muted-foreground">{feedbacks.length} entries | Avg Rating: {avgRating}/5</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="rounded-full" data-testid="add-feedback-btn">
          <Plus className="mr-1 h-4 w-4" /> Add Feedback
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map(cat => {
          const count = feedbacks.filter(f => f.category === cat).length;
          return (
            <Card key={cat} className="stat-card cursor-pointer hover:border-primary/30" onClick={() => setFilter(filter === cat ? 'all' : cat)} data-testid={`filter-${cat}`}>
              <CardContent className="p-4">
                <p className="text-sm font-medium capitalize">{cat}</p>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => setFilter('all')} data-testid="filter-all">All</Button>
        {categories.map(cat => (
          <Button key={cat} variant={filter === cat ? 'default' : 'outline'} size="sm" className="rounded-full capitalize" onClick={() => setFilter(cat)} data-testid={`filter-btn-${cat}`}>{cat}</Button>
        ))}
      </div>

      {/* Feedback List */}
      {filtered.length === 0 ? (
        <Card className="glass-card"><CardContent className="py-12 text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>No feedback yet. Start collecting insights!</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => (
            <Card key={f.id} className="glass-card hover:border-primary/20 transition-all" data-testid={`feedback-card-${f.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{f.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${categoryColors[f.category] || ''}`}>{f.category}</span>
                      <Badge variant="outline" className="text-xs">{f.source}</Badge>
                    </div>
                    {f.content && <p className="text-sm text-muted-foreground">{f.content}</p>}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${s <= f.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{new Date(f.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Feedback Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="feedback-dialog">
          <DialogHeader><DialogTitle>Add Feedback</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Feedback summary" data-testid="feedback-title-input" /></div>
            <div><Label>Details</Label><Textarea className="mt-1" rows={3} value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Detailed feedback" data-testid="feedback-content-input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger className="mt-1" data-testid="feedback-category-select"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source</Label>
                <Select value={form.source} onValueChange={v => setForm({...form, source: v})}>
                  <SelectTrigger className="mt-1" data-testid="feedback-source-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setForm({...form, rating: s})} className="p-1" data-testid={`rating-${s}`}>
                    <Star className={`h-6 w-6 transition-colors ${s <= form.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} data-testid="feedback-submit-btn">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
