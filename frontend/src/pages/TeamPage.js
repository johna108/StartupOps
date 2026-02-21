import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Users, Copy, RefreshCw, Trash2, Crown, UserPlus, Shield, User, Briefcase } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Role badge styling
const roleBadgeStyles = {
  founder: 'bg-primary/20 text-primary border-primary/30',
  manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  investor: 'bg-green-500/20 text-green-400 border-green-500/30',
  member: 'bg-muted text-muted-foreground border-border',
};

const roleIcons = {
  founder: Crown,
  manager: Shield,
  investor: Briefcase,
  member: User,
};

export default function TeamPage() {
  const { currentStartup, getAuthHeaders, permissions } = useAuth();
  const [members, setMembers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);

  const canManageTeam = permissions.canManageTeam;

  const fetchData = useCallback(async () => {
    if (!currentStartup) return;
    const headers = getAuthHeaders();
    try {
      const memRes = await axios.get(`${API}/startups/${currentStartup.id}/members`, { headers });
      setMembers(memRes.data);
      
      // Only fetch invite code if founder
      if (canManageTeam) {
        try {
          const codeRes = await axios.get(`${API}/startups/${currentStartup.id}/invite-code`, { headers });
          setInviteCode(codeRes.data.invite_code || '');
        } catch (e) {
          setInviteCode('');
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [currentStartup, getAuthHeaders, canManageTeam]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success('Invite code copied!');
  };

  const regenerateInvite = async () => {
    try {
      const res = await axios.post(`${API}/startups/${currentStartup.id}/regenerate-invite`, {}, { headers: getAuthHeaders() });
      setInviteCode(res.data.invite_code);
      toast.success('New invite code generated');
    } catch (e) { toast.error('Failed to regenerate'); }
  };

  const removeMember = async (userId) => {
    try {
      await axios.delete(`${API}/startups/${currentStartup.id}/members/${userId}`, { headers: getAuthHeaders() });
      toast.success('Member removed');
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to remove'); }
  };

  const updateMemberRole = async (userId, newRole) => {
    try {
      await axios.put(`${API}/startups/${currentStartup.id}/members/${userId}/role`, { role: newRole }, { headers: getAuthHeaders() });
      toast.success(`Role updated to ${newRole}`);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to update role'); }
  };

  if (!currentStartup) return <div className="text-center py-20 text-muted-foreground">Select a startup first</div>;
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 fade-in" data-testid="team-page">
      <div>
        <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Team</h1>
        <p className="text-sm text-muted-foreground">{members.length} members in {currentStartup.name}</p>
      </div>

      {/* Invite Section - Only for founders */}
      {canManageTeam && (
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Invite Members</CardTitle>
            <CardDescription>Share the invite code with your team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Input value={inviteCode} readOnly className="h-11 rounded-xl pr-20 font-mono text-lg tracking-wider" data-testid="invite-code-display" />
                <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-9" onClick={copyInvite} data-testid="copy-invite-btn">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={regenerateInvite} data-testid="regenerate-invite-btn">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Team members can join using this code on the join page</p>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map(m => {
              const initials = (m.full_name || m.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
              const RoleIcon = roleIcons[m.role] || User;
              return (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 group" data-testid={`member-${m.user_id}`}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{m.full_name || 'Unnamed'}</p>
                        <RoleIcon className={`h-4 w-4 ${m.role === 'founder' ? 'text-primary' : m.role === 'manager' ? 'text-blue-400' : 'text-muted-foreground'}`} />
                        <Badge variant="outline" className={`text-xs capitalize ${roleBadgeStyles[m.role] || roleBadgeStyles.member}`}>
                          {m.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  
                  {/* Role management - Only for founders, can't change own role or other founders */}
                  {canManageTeam && m.role !== 'founder' && (
                    <div className="flex items-center gap-2">
                      <Select value={m.role} onValueChange={(v) => updateMemberRole(m.user_id, v)}>
                        <SelectTrigger className="w-28 h-8 text-xs" data-testid={`role-select-${m.user_id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="investor">Investor</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 text-destructive h-8 w-8" 
                        onClick={() => removeMember(m.user_id)} 
                        data-testid={`remove-member-${m.user_id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Role Legend */}
          <div className="mt-6 pt-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground mb-2">Role Permissions:</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Crown className="h-3 w-3 text-primary" />
                <span><strong>Founder:</strong> Full access</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-blue-400" />
                <span><strong>Manager:</strong> Tasks, milestones, analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-3 w-3 text-green-400" />
                <span><strong>Investor:</strong> View financials & metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span><strong>Member:</strong> View & update assigned tasks</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
