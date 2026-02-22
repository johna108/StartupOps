import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, ArrowLeft, Moon, Sparkles, Sun, Zap } from 'lucide-react';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

const plans = [
  {
    name: 'Free', price: '₹0', period: '/month', desc: 'Perfect for getting started',
    features: ['1 Startup Workspace', 'Up to 5 team members', 'Task & Milestone tracking', 'Basic Analytics', 'Feedback collection'],
    cta: 'Current Plan', variant: 'outline',
  },
  {
    name: 'Pro', price: '₹499', period: '/month', desc: 'For growing teams', popular: true,
    features: ['Everything in Free', 'Unlimited team members', 'AI-powered Insights', 'Investor Pitch Generator', 'Advanced Analytics', 'Priority support'],
    cta: 'Upgrade to Pro', variant: 'default',
  },
  {
    name: 'Scale', price: '₹1,499', period: '/month', desc: 'For scaling startups',
    features: ['Everything in Pro', 'Multiple Startups', 'Custom analytics dashboards', 'API access', 'Dedicated account manager', 'White-label options'],
    cta: 'Upgrade to Scale', variant: 'outline',
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user, currentStartup, getAuthHeaders } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan) => {
    if (!user) { navigate('/auth'); return; }
    if (!currentStartup) { toast.error('Create a startup first'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/startups/${currentStartup.id}/subscription`, { plan: plan.toLowerCase() }, { headers: getAuthHeaders() });
      toast.success(`Subscribed to ${plan} plan! (Mock payment)`);
    } catch (e) { toast.error(e.response?.data?.detail || 'Error'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="pricing-page">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-['Plus_Jakarta_Sans']">StartupOps</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="pricing-theme-toggle">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)} data-testid="pricing-back-btn"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">Mock Payment Integration</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-muted-foreground">Choose the plan that fits your startup's stage. Scale as you grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <Card key={i} className={`glass-card relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.popular ? 'border-primary/50 shadow-lg shadow-primary/10' : ''}`} data-testid={`plan-card-${plan.name.toLowerCase()}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground shadow-lg"><Zap className="h-3 w-3 mr-1" />Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.desc}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={plan.variant} className="w-full rounded-xl h-11" onClick={() => handleSubscribe(plan.name)} disabled={loading} data-testid={`subscribe-${plan.name.toLowerCase()}-btn`}>
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          No real transactions required. This is a demonstration of payment integration flow.
        </p>
      </div>
    </div>
  );
}
