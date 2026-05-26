import { useState } from 'react';
import { Utensils, CheckCircle, Calendar } from 'lucide-react';

const MealPlanView = () => {
  // In production, this would fetch from GET /api/mealplans/my-plan
  const [currentPlan] = useState<any[]>([]);

  // Simulation of empty state for new users
  const hasPlan = currentPlan.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.03em' }}>My Meal Plan</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your current active nutrition plan, updated by the Nutrilas Admin.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {hasPlan ? (
          currentPlan.map((dayPlan, i) => (
            <div key={i} className="glass-panel" style={{ borderTop: '4px solid var(--accent-primary)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {dayPlan.day}
                <button style={{ background: 'none', border: 'none', color: 'var(--accent-success)', cursor: 'pointer' }} title="Mark as completed">
                  <CheckCircle size={20} />
                </button>
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Breakfast</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                    <Utensils size={16} color="var(--accent-primary)" /> {dayPlan.meals.breakfast}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lunch</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                    <Utensils size={16} color="var(--accent-primary)" /> {dayPlan.meals.lunch}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dinner</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                    <Utensils size={16} color="var(--accent-primary)" /> {dayPlan.meals.dinner}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
            <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Meal Plan Assigned Yet</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Your personalized nutrition plan will appear here once the Admin reviews your intake data. 
              In the meantime, check out the <strong>Recipes</strong> tab!
            </p>
            <button className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Complete Intake Form</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanView;
