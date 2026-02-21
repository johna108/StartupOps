import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Users, Building2, TrendingUp, Target, CheckCircle2,
  Wallet, PiggyBank, Heart, X, RotateCcw, Mail,
  Globe, Sparkles, ArrowRight, ChevronDown, ChevronUp,
  Eye, Trash2, ExternalLink, Briefcase, Rocket,
  UserCheck
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

const stageColors = {
  idea: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  mvp: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'pre-seed': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  seed: 'bg-green-500/20 text-green-400 border-green-500/30',
  'series-a': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'series-b': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  growth: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const industryIcons = {
  technology: '\u{1F4BB}', fintech: '\u{1F4B0}', healthtech: '\u{1F3E5}', edtech: '\u{1F4DA}',
  ecommerce: '\u{1F6D2}', saas: '\u2601\uFE0F', ai: '\u{1F916}', blockchain: '\u26D3\uFE0F',
  default: '\u{1F680}',
};

// ==================== SWIPE CARD COMPONENT ====================
function SwipeCard({ startup, onSwipe, isTop }) {
  const cardRef = useRef(null);
  const [dragState, setDragState] = useState({ x: 0, y: 0, dragging: false, startX: 0, startY: 0 });
  const [showDetails, setShowDetails] = useState(false);
  const [swipeIndicator, setSwipeIndicator] = useState(null); // 'left' | 'right' | null

  const handlePointerDown = (e) => {
    if (!isTop) return;
    if (e.target.closest('button') || e.target.closest('a')) return;
    setDragState({ x: 0, y: 0, dragging: true, startX: e.clientX, startY: e.clientY });
    if (cardRef.current) cardRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragState.dragging) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    setDragState(prev => ({ ...prev, x: dx, y: dy }));

    if (dx > 80) setSwipeIndicator('right');
    else if (dx < -80) setSwipeIndicator('left');
    else setSwipeIndicator(null);
  };

  const handlePointerUp = () => {
    if (!dragState.dragging) return;
    const threshold = 120;

    if (dragState.x > threshold) {
      animateOff('right');
    } else if (dragState.x < -threshold) {
      animateOff('left');
    } else {
      setDragState({ x: 0, y: 0, dragging: false, startX: 0, startY: 0 });
      setSwipeIndicator(null);
    }
  };

  const animateOff = (direction) => {
    const offX = direction === 'right' ? 600 : -600;
    setDragState(prev => ({ ...prev, x: offX, y: prev.y, dragging: false }));
    setSwipeIndicator(direction);
    setTimeout(() => {
      onSwipe(direction === 'right' ? 'interested' : 'passed');
      setDragState({ x: 0, y: 0, dragging: false, startX: 0, startY: 0 });
      setSwipeIndicator(null);
    }, 300);
  };

  const rotation = dragState.x * 0.05;
  const opacity = Math.max(1 - Math.abs(dragState.x) / 500, 0.3);

  const icon = industryIcons[startup.industry?.toLowerCase()] || industryIcons.default;
  const stageClass = stageColors[startup.stage?.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 select-none ${isTop ? 'z-10 cursor-grab' : 'z-0'} ${dragState.dragging ? 'cursor-grabbing' : ''}`}
      style={{
        transform: isTop
          ? `translateX(${dragState.x}px) translateY(${dragState.y * 0.3}px) rotate(${rotation}deg)`
          : 'scale(0.95) translateY(10px)',
        opacity: isTop ? opacity : 0.7,
        transition: dragState.dragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Swipe Indicators */}
      {isTop && swipeIndicator === 'right' && (
        <div className="absolute top-6 left-6 z-20 rotate-[-15deg] border-4 border-green-500 rounded-xl px-4 py-2 bg-green-500/10 backdrop-blur-sm">
          <span className="text-2xl font-bold text-green-500 tracking-wider">INTERESTED</span>
        </div>
      )}
      {isTop && swipeIndicator === 'left' && (
        <div className="absolute top-6 right-6 z-20 rotate-[15deg] border-4 border-red-500 rounded-xl px-4 py-2 bg-red-500/10 backdrop-blur-sm">
          <span className="text-2xl font-bold text-red-500 tracking-wider">PASS</span>
        </div>
      )}

      <Card className="h-full glass-card border-primary/10 overflow-hidden flex flex-col">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg border border-border/30">
                {icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">{startup.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {startup.industry && <Badge variant="outline" className="text-xs">{startup.industry}</Badge>}
                  {startup.stage && <Badge className={`text-xs border ${stageClass}`}>{startup.stage}</Badge>}
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {startup.description || 'An innovative startup looking for investment.'}
          </p>
        </div>

        {/* Quick Stats */}
        <CardContent className="flex-1 overflow-y-auto pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-green-500/5 border border-green-500/10 p-3 text-center">
              <PiggyBank className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Total Raised</p>
              <p className="text-lg font-bold text-green-500">{formatCurrency(startup.total_raised || 0)}</p>
            </div>
            <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-3 text-center">
              <Wallet className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className={`text-lg font-bold ${(startup.balance || 0) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                {formatCurrency(startup.balance || 0)}
              </p>
            </div>
            <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-3 text-center">
              <Users className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Team Size</p>
              <p className="text-lg font-bold text-purple-500">{startup.team_size || 0}</p>
            </div>
            <div className="rounded-xl bg-orange-500/5 border border-orange-500/10 p-3 text-center">
              <Target className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Milestones</p>
              <p className="text-lg font-bold text-orange-500">
                {startup.milestones_completed || 0}/{startup.milestones_total || 0}
              </p>
            </div>
          </div>

          {/* Expandable Details */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/30"
          >
            <Eye className="h-4 w-4" />
            {showDetails ? 'Hide Details' : 'Show More Details'}
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDetails && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="rounded-xl bg-muted/20 border border-border/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Founded by</span>
                  <span className="text-sm text-muted-foreground">{startup.founder_name}</span>
                </div>
                {startup.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <a href={startup.website.startsWith('http') ? startup.website : `https://${startup.website}`}
                       target="_blank" rel="noopener noreferrer"
                       className="text-sm text-blue-400 hover:underline flex items-center gap-1"
                       onClick={(e) => e.stopPropagation()}>
                      {startup.website} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Revenue</span>
                  <span className="text-sm text-green-500">{formatCurrency(startup.total_income || 0)}</span>
                </div>
              </div>

              {startup.milestones_total > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Milestone Progress</span>
                    <span className="font-medium">
                      {Math.round((startup.milestones_completed / startup.milestones_total) * 100)}%
                    </span>
                  </div>
                  <Progress value={(startup.milestones_completed / startup.milestones_total) * 100} className="h-2" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== MATCH CARD COMPONENT ====================
function MatchCard({ match, onRemove }) {
  const icon = industryIcons[match.industry?.toLowerCase()] || industryIcons.default;
  const stageClass = stageColors[match.stage?.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <Card className="glass-card border-green-500/10 hover:border-green-500/30 transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-background/80 flex items-center justify-center text-2xl border border-border/30 shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{match.name}</h3>
              {match.stage && <Badge className={`text-xs border shrink-0 ${stageClass}`}>{match.stage}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{match.description || 'No description'}</p>

            {/* Contact Details - visible for matched startups */}
            <div className="mt-3 space-y-2 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <p className="text-xs font-semibold text-green-500 flex items-center gap-1">
                <UserCheck className="h-3 w-3" /> Contact Details
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{match.founder_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <a href={`mailto:${match.founder_email}`} className="text-blue-400 hover:underline">{match.founder_email}</a>
              </div>
              {match.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <a href={match.website.startsWith('http') ? match.website : `https://${match.website}`}
                     target="_blank" rel="noopener noreferrer"
                     className="text-blue-400 hover:underline flex items-center gap-1">
                    {match.website} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {match.industry && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{match.industry}</span>}
              <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-green-500" /> Swiped {new Date(match.swiped_at).toLocaleDateString()}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive shrink-0" onClick={() => onRemove(match.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== MAIN COMPONENT ====================
export default function InvestorFeedPage() {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');

  // Investor browse state
  const [browsableStartups, setBrowsableStartups] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);

  // ---- Fetch Data ----
  const fetchBrowseData = useCallback(async () => {
    const headers = getAuthHeaders();
    try {
      const [browseRes, matchesRes] = await Promise.all([
        axios.get(`${API}/investor/browse`, { headers }),
        axios.get(`${API}/investor/matches`, { headers }),
      ]);
      setBrowsableStartups(browseRes.data || []);
      setMatches(matchesRes.data || []);
      setCurrentIndex(0);
    } catch (e) {
      console.error('Browse fetch error:', e);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchBrowseData();
      setLoading(false);
    };
    loadAll();
  }, [fetchBrowseData]);

  // ---- Swipe Handlers ----
  const handleSwipe = async (action) => {
    const startup = browsableStartups[currentIndex];
    if (!startup) return;

    try {
      await axios.post(`${API}/investor/swipe/${startup.id}`, { action }, { headers: getAuthHeaders() });

      if (action === 'interested') {
        toast.success(`You're interested in ${startup.name}! Check your matches.`, {
          icon: <Heart className="h-4 w-4 text-green-500" />,
        });
        setMatches(prev => [{
          ...startup,
          swiped_at: new Date().toISOString(),
        }, ...prev]);
      } else {
        toast(`Passed on ${startup.name}`, {
          icon: <X className="h-4 w-4 text-muted-foreground" />,
        });
      }

      setCurrentIndex(prev => prev + 1);
    } catch (e) {
      toast.error('Failed to record swipe');
    }
  };

  const handleRemoveMatch = async (startupId) => {
    try {
      await axios.delete(`${API}/investor/matches/${startupId}`, { headers: getAuthHeaders() });
      setMatches(prev => prev.filter(m => m.id !== startupId));
      toast.success('Match removed');
    } catch (e) {
      toast.error('Failed to remove match');
    }
  };

  const handleUndoSwipe = async () => {
    if (currentIndex === 0) return;
    setCurrentIndex(prev => prev - 1);
    toast('Undo! Showing previous startup', { icon: <RotateCcw className="h-4 w-4" /> });
  };

  // ---- Render ----
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentCard = browsableStartups[currentIndex];
  const nextCard = browsableStartups[currentIndex + 1];
  const cardsRemaining = browsableStartups.length - currentIndex;

  return (
    <div className="space-y-6 fade-in" data-testid="investor-feed">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Discover Startups
          </h1>
          <p className="text-sm text-muted-foreground">
            Swipe right to connect, left to pass
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Heart className="h-3.5 w-3.5 mr-1 text-green-500" /> {matches.length} Matches
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Rocket className="h-3.5 w-3.5 mr-1 text-primary" /> {cardsRemaining} Left
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="browse" className="flex items-center gap-1.5">
            <Rocket className="h-4 w-4" /> Browse
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" /> Matches
            {matches.length > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {matches.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ==================== BROWSE TAB ==================== */}
        <TabsContent value="browse" className="mt-6">
          {cardsRemaining > 0 ? (
            <div className="max-w-lg mx-auto">
              {/* Card Stack */}
              <div className="relative w-full" style={{ height: '520px' }}>
                {nextCard && (
                  <SwipeCard
                    key={nextCard.id}
                    startup={nextCard}
                    onSwipe={() => {}}
                    isTop={false}
                  />
                )}
                {currentCard && (
                  <SwipeCard
                    key={currentCard.id}
                    startup={currentCard}
                    onSwipe={handleSwipe}
                    isTop={true}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-muted-foreground/20 hover:border-muted-foreground/50 hover:bg-muted/30"
                  onClick={handleUndoSwipe}
                  disabled={currentIndex === 0}
                >
                  <RotateCcw className="h-5 w-5 text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-16 w-16 rounded-full border-red-500/30 hover:border-red-500 hover:bg-red-500/10 transition-all"
                  onClick={() => handleSwipe('passed')}
                >
                  <X className="h-7 w-7 text-red-500" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-16 w-16 rounded-full border-green-500/30 hover:border-green-500 hover:bg-green-500/10 transition-all"
                  onClick={() => handleSwipe('interested')}
                >
                  <Heart className="h-7 w-7 text-green-500" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10"
                  onClick={() => {
                    toast.info('Drag the card or tap "Show More Details" on the card');
                  }}
                >
                  <Eye className="h-5 w-5 text-blue-500" />
                </Button>
              </div>

              {/* Progress indicator */}
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {currentIndex + 1} of {browsableStartups.length} startups
                </p>
                <Progress
                  value={((currentIndex + 1) / browsableStartups.length) * 100}
                  className="h-1 mt-2 max-w-xs mx-auto"
                />
              </div>
            </div>
          ) : (
            <Card className="glass-card max-w-lg mx-auto">
              <CardContent className="py-16 text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">You've seen all startups!</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {matches.length > 0
                    ? `You have ${matches.length} match${matches.length === 1 ? '' : 'es'}. Check the Matches tab to see contact details.`
                    : 'No startups available right now. Check back later for new opportunities!'}
                </p>
                {matches.length > 0 && (
                  <Button onClick={() => setActiveTab('matches')} className="rounded-xl">
                    <Heart className="h-4 w-4 mr-2" /> View Matches
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== MATCHES TAB ==================== */}
        <TabsContent value="matches" className="mt-6">
          {matches.length > 0 ? (
            <div className="space-y-3 max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground mb-4">
                Startups you've shown interest in. Contact details are available below.
              </p>
              {matches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onRemove={handleRemoveMatch}
                />
              ))}
            </div>
          ) : (
            <Card className="glass-card max-w-lg mx-auto">
              <CardContent className="py-16 text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                  <Heart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No matches yet</h3>
                <p className="text-muted-foreground">Swipe right on startups you're interested in to see their contact details here.</p>
                <Button onClick={() => setActiveTab('browse')} variant="outline" className="rounded-xl">
                  <ArrowRight className="h-4 w-4 mr-2" /> Start Browsing
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
