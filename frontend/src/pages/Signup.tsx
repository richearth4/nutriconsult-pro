import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { termsApi } from '../api/terms';

import Logo from '../components/Logo';

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'prefer-not-to-say',
    currentWeight: '',
    goalWeight: '',
    dietaryPreferences: 'none',
    healthConditions: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [latestTerms, setLatestTerms] = useState<any>(null);

  React.useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await termsApi.getLatest();
        if (data.success) {
          setLatestTerms(data.terms);
        }
      } catch (err) {
        console.error('Failed to fetch terms:', err);
      }
    };
    fetchTerms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all account fields.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    setError('');
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      
      const payload = {
        ...formData,
        termsAccepted,
        termsId: latestTerms?.id
      };

      const response = await axios.post(`${API_URL}/auth/register`, payload);

      if (response.data.success) {
        const { user } = response.data;
        localStorage.setItem('token', user.token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/client');
      }
    } catch (err: any) {
      console.warn('API failed, falling back to mock auth registration');
      // Fallback for mocked auth
      const mockUser = { 
        name: formData.name, 
        email: formData.email,
        role: 'client', 
        token: 'mock-token',
        profile: {
          age: formData.age,
          weight: formData.currentWeight,
          goal: formData.goalWeight,
          diet: formData.dietaryPreferences
        }
      };
      
      localStorage.setItem('token', mockUser.token);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      navigate('/client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <Logo size={60} />
          <h1 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: '500', marginTop: '1.5rem', marginBottom: '0.25rem', letterSpacing: '-0.04em' }}>Join Nutrilas</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{step === 1 ? 'Create your account to get started' : 'Tell us about your health goals'}</p>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: 'var(--accent-primary)' }}></div>
          <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: step === 2 ? 'var(--accent-primary)' : 'var(--bg-tertiary)', transition: 'background-color 0.3s' }}></div>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={step === 2 ? handleSignup : (e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {step === 1 ? (
            // Step 1: Account Details
            <div style={{ animation: 'fade-in 0.3s' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" required style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Confirm Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required style={inputStyle} />
                </div>
              </div>
              <button type="button" onClick={handleNextStep} className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Continue to Health Profile <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            // Step 2: Health Profile
            <div style={{ animation: 'fade-in 0.3s' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 35" required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Current Weight (kg)</label>
                  <input type="number" name="currentWeight" value={formData.currentWeight} onChange={handleChange} placeholder="e.g. 75" required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Goal Weight (kg)</label>
                  <input type="number" name="goalWeight" value={formData.goalWeight} onChange={handleChange} placeholder="e.g. 68" required style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dietary Preferences</label>
                <select name="dietaryPreferences" value={formData.dietaryPreferences} onChange={handleChange} style={inputStyle}>
                  <option value="none">No Restrictions</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                  <option value="gluten-free">Gluten-Free</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pre-existing Health Conditions (Select all that apply)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    <input type="checkbox" onChange={(e) => {
                      const conditions = formData.healthConditions.split(',').filter(Boolean);
                      if (e.target.checked) conditions.push('Hypertension/High BP');
                      else {
                        const index = conditions.indexOf('Hypertension/High BP');
                        if (index > -1) conditions.splice(index, 1);
                      }
                      setFormData({...formData, healthConditions: conditions.join(', ')});
                    }} /> Hypertension / High BP
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    <input type="checkbox" onChange={(e) => {
                      const conditions = formData.healthConditions.split(',').filter(Boolean);
                      if (e.target.checked) conditions.push('Diabetes');
                      else {
                        const index = conditions.indexOf('Diabetes');
                        if (index > -1) conditions.splice(index, 1);
                      }
                      setFormData({...formData, healthConditions: conditions.join(', ')});
                    }} /> Diabetes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    <input type="checkbox" onChange={(e) => {
                      const conditions = formData.healthConditions.split(',').filter(Boolean);
                      if (e.target.checked) conditions.push('High Cholesterol');
                      else {
                        const index = conditions.indexOf('High Cholesterol');
                        if (index > -1) conditions.splice(index, 1);
                      }
                      setFormData({...formData, healthConditions: conditions.join(', ')});
                    }} /> High Cholesterol
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    <input type="checkbox" onChange={(e) => {
                      const conditions = formData.healthConditions.split(',').filter(Boolean);
                      if (e.target.checked) conditions.push('Ulcer');
                      else {
                        const index = conditions.indexOf('Ulcer');
                        if (index > -1) conditions.splice(index, 1);
                      }
                      setFormData({...formData, healthConditions: conditions.join(', ')});
                    }} /> Stomach Ulcer
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem', transition: 'background-color 0.2s' }}>
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>Terms & Conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>Privacy Policy</a>.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={18} />
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !termsAccepted} 
                  className="btn-primary" 
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem',
                    opacity: !termsAccepted ? 0.6 : 1,
                    cursor: !termsAccepted ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Creating Account...' : <><CheckCircle size={18} /> Complete Registration</>}
                </button>
              </div>
            </div>
          )}
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--border-light)',
  borderRadius: '0.5rem',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color var(--transition-fast)'
};

export default Signup;
