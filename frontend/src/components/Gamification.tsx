import { Award, Flame, Trophy, Star, Shield, Zap } from 'lucide-react';

const Gamification = () => {
  const badges = [
    { id: '1', title: 'First Steps', desc: 'Logged first meal plan.', icon: <Star size={24} />, color: '#fbbf24', earned: false },
    { id: '2', title: 'Hydration Hero', desc: 'Met water goal for 7 days.', icon: <Zap size={24} />, color: '#3b82f6', earned: false },
    { id: '3', title: 'Consistency King', desc: 'Maintained a 14-day streak.', icon: <Flame size={24} />, color: '#ef4444', earned: false },
    { id: '4', title: 'Macro Master', desc: 'Hit all macros perfectly.', icon: <Shield size={24} />, color: '#10b981', earned: false },
    { id: '5', title: 'Iron Will', desc: '30-day workout streak.', icon: <Trophy size={24} />, color: '#8b5cf6', earned: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '500', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.03em' }}>
          <Award size={24} color="var(--accent-warning)" /> Achievements & Badges
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your progress and unlock rewards as you reach your health goals!</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {badges.map(badge => (
          <div 
            key={badge.id} 
            className="glass-panel" 
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              opacity: badge.earned ? 1 : 0.5,
              filter: badge.earned ? 'none' : 'grayscale(100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {badge.earned && (
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '40px', height: '40px', background: 'var(--gradient-warning)', transform: 'rotate(45deg)' }} />
            )}
            
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%', 
              backgroundColor: badge.earned ? `${badge.color}20` : 'var(--bg-tertiary)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: badge.color, marginBottom: '1rem',
              boxShadow: badge.earned ? `0 0 15px ${badge.color}40` : 'none'
            }}>
              {badge.icon}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>{badge.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{badge.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gamification;
