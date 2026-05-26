import { useState } from 'react';
import { CreditCard, Check, ShieldCheck, X } from 'lucide-react';

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [showMockPaystack, setShowMockPaystack] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Wellness',
      price: 'Free',
      description: 'Perfect for starting your healthy journey.',
      features: ['Basic Meal Tracker', 'Limited AI Chat', 'Community Recipes', 'Wearable Sync'],
      color: 'var(--text-secondary)'
    },
    {
      id: 'premium',
      name: 'Naija Premium',
      price: '₦15,000',
      period: '/month',
      description: 'Advanced features for dedicated results.',
      features: ['Personalized Naija Meal Plans', 'Unlimited AI Assistant', 'Monthly Consultations', 'Advanced Health Insights', 'Sodium/Oil Tracking'],
      color: 'var(--accent-primary)',
      recommended: true
    },
    {
      id: 'pro',
      name: 'Elite Nutritionist',
      price: '₦45,000',
      period: '/quarter',
      description: 'The ultimate 1-on-1 coaching experience.',
      features: ['All Premium Features', 'Weekly Video Consults', '24/7 Priority Support', 'Custom Lab Work Analysis', 'Family Meal Planning'],
      color: 'var(--accent-secondary)'
    }
  ];

  const handleSubscribe = (plan: any) => {
    if (plan.id === 'basic') return;
    setSelectedPlan(plan);
    setLoading(true);
    // Simulate API call to initialize payment
    setTimeout(() => {
      setLoading(false);
      setShowMockPaystack(true);
    }, 1000);
  };

  const handlePaymentSuccess = () => {
    setShowMockPaystack(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '500', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>Upgrade Your Health</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Invest in a healthier you with our specialized Nigerian plans.</p>
      </header>

      {isSuccess && (
        <div style={{ backgroundColor: 'var(--accent-success)', color: 'white', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', animation: 'slide-down 0.3s' }}>
          <ShieldCheck size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Payment Successful! Your account has been upgraded to <strong>{selectedPlan?.name}</strong>.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className="glass-panel" 
            style={{ 
              position: 'relative', 
              padding: '2.5rem', 
              border: plan.recommended ? `2px solid ${plan.color}` : '1px solid var(--border-light)',
              transform: plan.recommended ? 'scale(1.05)' : 'scale(1)',
              zIndex: plan.recommended ? 1 : 0
            }}
          >
            {plan.recommended && (
              <span style={{ position: 'absolute', top: '-12px', right: '2rem', backgroundColor: plan.color, color: 'white', padding: '0.25rem 1rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '600' }}>
                MOST POPULAR
              </span>
            )}
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: plan.color, marginBottom: '0.5rem' }}>{plan.name}</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '600', letterSpacing: '-0.02em' }}>{plan.price}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{plan.period}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', minHeight: '3rem' }}>{plan.description}</p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {plan.features.map((feature, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                  <Check size={16} color={plan.color} /> {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleSubscribe(plan)}
              disabled={loading || plan.id === 'basic'}
              className="btn-primary" 
              style={{ 
                width: '100%', 
                backgroundColor: plan.id === 'basic' ? 'transparent' : plan.color,
                border: plan.id === 'basic' ? `1px solid var(--border-light)` : 'none',
                color: plan.id === 'basic' ? 'var(--text-secondary)' : 'white'
              }}
            >
              {loading && selectedPlan?.id === plan.id ? 'Connecting...' : plan.id === 'basic' ? 'Current Plan' : 'Upgrade Now'}
            </button>
          </div>
        ))}
      </div>

      {/* Mock Paystack Modal */}
      {showMockPaystack && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', width: '400px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#09a5db', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>P</div>
                <span style={{ fontWeight: '700', color: '#333' }}>Paystack <span style={{ fontWeight: '400', fontSize: '0.8rem', color: '#888' }}>Checkout</span></span>
              </div>
              <X size={20} color="#888" style={{ cursor: 'pointer' }} onClick={() => setShowMockPaystack(false)} />
            </div>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.25rem' }}>PAYING TO</div>
                <div style={{ fontWeight: '600', color: '#333' }}>Nutrilas Limited</div>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>{selectedPlan?.price}</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>{selectedPlan?.name} Subscription</div>
              </div>
              
              <div style={{ backgroundColor: '#f1f8ff', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed #09a5db', marginBottom: '2rem', fontSize: '0.85rem', color: '#09a5db' }}>
                <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                This is a secure <strong>Test Mode</strong> transaction.
              </div>

              <button 
                onClick={handlePaymentSuccess}
                style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#3bb75e', color: 'white', border: 'none', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                Pay {selectedPlan?.price}
              </button>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.75rem' }}>
                <CreditCard size={14} /> Secured by Paystack
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
