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
import { Plus, GripVertical, Calendar, Trash2, Edit2, Lock } from 'lucide-react';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

const columns = [
  { key: 'todo', label: 'To Do', color: 'border-muted-foreground/30' },
  { key: 'in_progress', label: 'In Progress', color: 'border-blue-500/50' },
  { key: 'review', label: 'Review', color: 'border-yellow-500/50' },
  { key: 'done', label: 'Done', color: 'border-green-500/50' },
];

const priorityColors = { low: 'outline', medium: 'secondary', high: 'default', urgent: 'destructive' };

export default function TasksPage() {
  const { currentStartup, getAuthHeaders, permissions, user, userRole } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', assigned_to: '', milestone_id: '', due_date: '', status: 'todo' });

  const canManageContent = permissions.canManageContent;

  const fetchData = useCallback(async () => {
    if (!currentStartup) return;
    const headers = getAuthHeaders();
    try {
      const [t, m, mem] = await Promise.all([
        axios.get(`${API}/startups/${currentStartup.id}/tasks`, { headers }),
        axios.get(`${API}/startups/${currentStartup.id}/milestones`, { headers }),
        axios.get(`${API}/startups/${currentStartup.id}/members`, { headers }),
      ]);
      // Handle new response format with user_role
      const tasksData = t.data.tasks || t.data;
      const milestonesData = m.data.milestones || m.data;
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setMilestones(Array.isArray(milestonesData) ? milestonesData : []);
      setMembers(mem.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [currentStartup, getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = (status = 'todo') => {
    if (!canManageContent) {
      toast.error('Only founders and managers can create tasks');
      return;
    }
    setEditTask(null);
    setForm({ title: '', description: '', priority: 'medium', assigned_to: '', milestone_id: '', due_date: '', status });
    setDialogOpen(true);
  };

  const openEdit = (task) => {
    if (!canManageContent) {
      toast.error('Only founders and managers can edit tasks');
      return;
    }
    setEditTask(task);
    setForm({ title: task.title, description: task.description || '', priority: task.priority, assigned_to: task.assigned_to || '', milestone_id: task.milestone_id || '', due_date: task.due_date || '', status: task.status });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    const headers = getAuthHeaders();
    try {
      if (editTask) {
        await axios.put(`${API}/tasks/${editTask.id}`, form, { headers });
        toast.success('Task updated');
      } else {
        await axios.post(`${API}/startups/${currentStartup.id}/tasks`, form, { headers });
        toast.success('Task created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async (taskId) => {
    if (!canManageContent) {
      toast.error('Only founders and managers can delete tasks');
      return;
    }
    const headers = getAuthHeaders();
    try {
      await axios.delete(`${API}/tasks/${taskId}`, { headers });
      toast.success('Task deleted');
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to delete'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const headers = getAuthHeaders();
    const task = tasks.find(t => t.id === taskId);
    
    // Members can only change status of tasks assigned to them
    if (!canManageContent && task?.assigned_to !== user?.id) {
      toast.error('You can only update tasks assigned to you');
      return;
    }
    
    try {
      // Use the new PATCH endpoint for status-only updates
      await axios.patch(`${API}/tasks/${taskId}/status`, { status: newStatus }, { headers });
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to update status'); }
  };

  // Check if user can modify a specific task
  const canModifyTask = (task) => {
    if (canManageContent) return true;
    return task.assigned_to === user?.id;
  };

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select a startup first</div>;
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  
  // Investors should not see tasks page
  if (userRole === 'investor') {
    return (
      <div className="text-center py-20">
        <ClipboardList className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Task management is not available for investors.</p>
      </div>
    );
  }

  const getMemberName = (id) => members.find(m => m.user_id === id)?.full_name || 'Unassigned';

  return (
    <div className="space-y-6 fade-in" data-testid="tasks-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {tasks.length} tasks total
            {!canManageContent && <span className="ml-2 text-yellow-500">(View only - you can update status of assigned tasks)</span>}
          </p>
        </div>
        {canManageContent && (
          <Button onClick={() => openCreate()} className="rounded-full" data-testid="create-task-btn">
            <Plus className="mr-1 h-4 w-4" /> New Task
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className={`kanban-column border-t-2 ${col.color}`} data-testid={`kanban-col-${col.key}`}>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {colTasks.map(task => {
                  const isAssignedToMe = task.assigned_to === user?.id;
                  const canModify = canModifyTask(task);
                  return (
                    <Card 
                      key={task.id} 
                      className={`bg-card backdrop-blur border-border transition-all group ${
                        canModify ? 'hover:border-primary/30 cursor-pointer' : 'opacity-75'
                      } ${isAssignedToMe ? 'ring-1 ring-primary/30' : ''}`}
                      data-testid={`task-card-${task.id}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium flex-1">{task.title}</p>
                          {canManageContent && (
                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(task)} data-testid={`edit-task-${task.id}`}><Edit2 className="h-3 w-3" /></Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(task.id)} data-testid={`delete-task-${task.id}`}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          )}
                          {!canManageContent && !isAssignedToMe && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant={priorityColors[task.priority]} className="text-[10px]">{task.priority}</Badge>
                          {task.assigned_to && (
                            <span className={`text-[10px] ${isAssignedToMe ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                              {isAssignedToMe ? '(You)' : getMemberName(task.assigned_to)}
                            </span>
                          )}
                          {task.due_date && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{task.due_date.split('T')[0]}</span>}
                        </div>
                        {/* Quick status change - only show if user can modify */}
                        {canModify && (
                          <div className="flex gap-1 mt-2">
                            {columns.filter(c => c.key !== task.status).map(c => (
                              <button key={c.key} onClick={() => handleStatusChange(task.id, c.key)} className="text-[9px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors" data-testid={`move-task-${task.id}-to-${c.key}`}>
                                {c.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {canManageContent && (
                <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground hover:text-primary" onClick={() => openCreate(col.key)} data-testid={`add-task-${col.key}`}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Dialog - Only for managers/founders */}
      {canManageContent && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md" data-testid="task-dialog">
            <DialogHeader>
              <DialogTitle>{editTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Title *</Label>
                <Input className="mt-1" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title" data-testid="task-title-input" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-1" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional description" data-testid="task-desc-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                    <SelectTrigger className="mt-1" data-testid="task-priority-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                    <SelectTrigger className="mt-1" data-testid="task-status-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {columns.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Assignee</Label>
                  <Select value={form.assigned_to} onValueChange={v => setForm({...form, assigned_to: v})}>
                    <SelectTrigger className="mt-1" data-testid="task-assignee-select"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {members.map(m => <SelectItem key={m.user_id} value={m.user_id}>{m.full_name || m.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Milestone</Label>
                  <Select value={form.milestone_id} onValueChange={v => setForm({...form, milestone_id: v})}>
                    <SelectTrigger className="mt-1" data-testid="task-milestone-select"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {milestones.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" className="mt-1" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} data-testid="task-due-date-input" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="task-cancel-btn">Cancel</Button>
              <Button onClick={handleSave} data-testid="task-save-btn">{editTask ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
