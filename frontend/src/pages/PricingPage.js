import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pricing } from '@/components/ui/pricing';
import { toast } from 'sonner';
import { Check, ArrowLeft, Sparkles, Zap } from 'lucide-react';
import axios from 'axios';

const API = `${(process.env.REACT_APP_BACKEND_URL || '').trim().replace(/\/+$/, '')}/api`;

const modernPlans = [
  {
    name: 'STARTER',
    price: '0',
    yearlyPrice: '0',
    period: 'per month',
    features: [
      '1 Startup Workspace',
      'Up to 5 team members',
      'Task & Milestone tracking',
      'Basic Analytics',
      'Feedback collection',
      'Email support',
    ],
    description: 'Perfect for getting started',
    buttonText: 'Get Started Free',
    href: '/onboarding',
    isPopular: false,
  },
  {
    name: 'PROFESSIONAL',
    price: '499',
    yearlyPrice: '399',
    period: 'per month',
    features: [
      'Everything in Starter',
      'Unlimited team members',
      'AI-powered Insights',
      'Investor Pitch Generator',
      'Advanced Analytics',
      'Priority support',
      'Team collaboration tools',
      'API access',
    ],
    description: 'Ideal for growing teams',
    buttonText: 'Start Pro Trial',
    href: '/sign-up',
    isPopular: true,
  },
  {
    name: 'ENTERPRISE',
    price: '1499',
    yearlyPrice: '1199',
    period: 'per month',
    features: [
      'Everything in Professional',
      'Multiple Startups',
      'Custom analytics dashboards',
      'Investor management portal',
      'Dedicated account manager',
      'White-label options',
      'SLA guarantee',
      'Custom integrations',
    ],
    description: 'For scaling startups',
    buttonText: 'Contact Sales',
    href: '/contact',
    isPopular: false,
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user, currentStartup, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.add('dark');
    return () => {
      if (savedTheme !== 'dark') {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);

  const handleSelectPlan = async (plan) => {
    if (!user) { 
      navigate('/auth'); 
      return; 
    }
    if (!currentStartup) { 
      toast.error('Create a startup first'); 
      return; 
    }
    
    setLoading(true);
    try {
      const planName = plan.name.toLowerCase();
      await axios.post(
        `${API}/startups/${currentStartup.id}/subscription`, 
        { plan: planName }, 
        { headers: getAuthHeaders() }
      );
      toast.success(`Subscribed to ${plan.name} plan!`);
      navigate('/dashboard');
    } catch (e) { 
      toast.error(e.response?.data?.detail || 'Error subscribing to plan'); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="pricing-page">
      <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-['Plus_Jakarta_Sans']">StartupOps</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate(-1)} data-testid="pricing-back-btn"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-10 container mx-auto px-4 md:px-6">
        <Pricing 
          plans={modernPlans}
          title="Simple, transparent pricing"
          description="Choose the plan that fits your startup's stage. Scale as you grow."
          onSelectPlan={handleSelectPlan}
          isLoading={loading}
          billingPeriod={billingPeriod}
          onTogglePeriod={setBillingPeriod}
        />
        <p className="text-center text-xs text-muted-foreground mt-6">
          No real transactions required. This is a demonstration of payment integration flow.
        </p>
      </div>
    </div>
  );
}
