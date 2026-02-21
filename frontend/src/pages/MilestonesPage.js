import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Target, Calendar, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MilestonesPage() {
  const { currentStartup, getAuthHeaders, userRole } = useAuth();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', target_date: '' });

  const fetchData = useCallback(async () => {
    if (!currentStartup) return;
    try {
      const res = await axios.get(`${API}/startups/${currentStartup.id}/milestones`, { headers: getAuthHeaders() });
      setMilestones(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [currentStartup, getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Investors should not see milestones page
  if (userRole === 'investor') {
    return (
      <div className="text-center py-20">
        <Target className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Milestone tracking is not available for investors.</p>
      </div>
    );
  }

  const openCreate = () => { setEditItem(null); setForm({ title: '', description: '', target_date: '' }); setDialogOpen(true); };
  const openEdit = (m) => { setEditItem(m); setForm({ title: m.title, description: m.description || '', target_date: m.target_date || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    try {
      if (editItem) {
        await axios.put(`${API}/milestones/${editItem.id}`, form, { headers: getAuthHeaders() });
        toast.success('Milestone updated');
      } else {
        await axios.post(`${API}/startups/${currentStartup.id}/milestones`, form, { headers: getAuthHeaders() });
        toast.success('Milestone created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/milestones/${id}`, { headers: getAuthHeaders() });
      toast.success('Milestone deleted');
      fetchData();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${API}/milestones/${id}`, { status }, { headers: getAuthHeaders() });
      fetchData();
    } catch (e) { toast.error('Failed to update'); }
  };

  const statusColors = { pending: 'secondary', in_progress: 'default', completed: 'outline' };

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select a startup first</div>;
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 fade-in" data-testid="milestones-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Milestones</h1>
          <p className="text-sm text-muted-foreground">{milestones.length} milestones</p>
        </div>
        <Button onClick={openCreate} className="rounded-full" data-testid="create-milestone-btn">
          <Plus className="mr-1 h-4 w-4" /> New Milestone
        </Button>
      </div>

      {milestones.length === 0 ? (
        <Card className="glass-card"><CardContent className="py-12 text-center text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>No milestones yet. Create your first milestone to track progress!</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map(m => (
            <Card key={m.id} className="glass-card hover:border-primary/20 transition-all group" data-testid={`milestone-card-${m.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{m.title}</h3>
                      <Badge variant={statusColors[m.status]} className="text-xs">{m.status?.replace('_', ' ')}</Badge>
                    </div>
                    {m.description && <p className="text-sm text-muted-foreground mb-3">{m.description}</p>}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)} data-testid={`edit-milestone-${m.id}`}><Edit2 className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(m.id)} data-testid={`delete-milestone-${m.id}`}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{m.tasks_done || 0}/{m.task_count || 0} tasks</span>
                    <span className="font-medium">{m.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${m.progress || 0}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {m.target_date && <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{m.target_date.split('T')[0]}</span>}
                  <div className="flex gap-1">
                    {['pending', 'in_progress', 'completed'].filter(s => s !== m.status).map(s => (
                      <button key={s} onClick={() => handleStatusChange(m.id, s)} className="text-[10px] px-2 py-0.5 rounded bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors" data-testid={`milestone-status-${m.id}-${s}`}>
                        {s === 'completed' ? 'Complete' : s === 'in_progress' ? 'Start' : 'Reset'}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="milestone-dialog">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Milestone' : 'Create Milestone'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. MVP Launch" data-testid="milestone-title-input" /></div>
            <div><Label>Description</Label><Textarea className="mt-1" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} data-testid="milestone-desc-input" /></div>
            <div><Label>Target Date</Label><Input type="date" className="mt-1" value={form.target_date} onChange={e => setForm({...form, target_date: e.target.value})} data-testid="milestone-date-input" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} data-testid="milestone-save-btn">{editItem ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
