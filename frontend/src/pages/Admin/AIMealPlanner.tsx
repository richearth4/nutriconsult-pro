import { useState } from 'react';
import axios from 'axios';
import { Sparkles, Utensils, Save, AlertCircle } from 'lucide-react';

const AIMealPlanner = () => {
  const [profile, setProfile] = useState('');
  const [focus, setFocus] = useState('weight loss');
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const generatePlan = async () => {
    if (!profile) {
      setError('Please provide a client profile description');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/ai/generate-meal-plan`,
        { clientProfile: profile, focus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setMealPlan(response.data.mealPlan);
      } else {
        setError('Failed to generate meal plan');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while generating the plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* Generator Form */}
      <div className="glass-panel" style={{ alignSelf: 'start' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-secondary)' }}>
          <Sparkles size={24} /> AI Meal Plan Generator
        </h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Client Profile Context</label>
          <textarea 
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            placeholder="e.g. 35yo female, allergic to shellfish, dislikes broccoli. Works night shifts, needs quick prep meals."
            style={{
              width: '100%', minHeight: '120px', padding: '1rem',
              backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)',
              borderRadius: '0.5rem', color: 'var(--text-primary)', resize: 'vertical', outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Primary Focus</label>
          <select 
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem',
              backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)',
              borderRadius: '0.5rem', color: 'var(--text-primary)', outline: 'none'
            }}
          >
            <option value="weight loss (local diet)">Weight Loss (Portion Controlled Local Foods)</option>
            <option value="muscle gain (high protein)">Muscle Gain (High Protein: Beans, Fish, Eggs)</option>
            <option value="hypertension friendly (low sodium)">Hypertension Friendly (Low Sodium/Maggi, Less Oil)</option>
            <option value="diabetic friendly (low gi)">Diabetic Friendly (Low Glycemic Index, e.g., Unripe Plantain)</option>
            <option value="swallow free">Swallow-Free Diet (Light Meals)</option>
          </select>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <button 
          onClick={generatePlan} 
          disabled={loading}
          className="btn-primary" 
          style={{ width: '100%', background: 'var(--gradient-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          {loading ? 'Generating...' : <><Sparkles size={18} /> Generate Plan</>}
        </button>
      </div>

      {/* Generated Result */}
      <div className="glass-panel" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils size={24} color="var(--accent-primary)" /> Generated Plan
          </h2>
          {mealPlan && (
            <button onClick={handleSave} className="btn-primary" style={{ padding: '0.5rem 1rem', background: saved ? 'var(--bg-tertiary)' : 'var(--gradient-success)', color: saved ? 'var(--accent-success)' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> {saved ? 'Saved Successfully!' : 'Save to Client'}
            </button>
          )}
        </div>

        {!mealPlan && !loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
            Provide context and click generate to see the AI magic.
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--accent-primary)', padding: '3rem 0', animation: 'pulse 2s infinite' }}>
            Analyzing profile and generating a 7-day plan...
          </div>
        )}

        {mealPlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.keys(mealPlan).map((day) => (
              <div key={day} style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid var(--border-light)' }}>
                <h3 style={{ textTransform: 'capitalize', color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>{day}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Breakfast:</span>
                    <span>{mealPlan[day].b}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Lunch:</span>
                    <span>{mealPlan[day].l}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Dinner:</span>
                    <span>{mealPlan[day].d}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMealPlanner;
