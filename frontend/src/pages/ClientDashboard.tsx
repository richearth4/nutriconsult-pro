import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Target, Activity, Calendar, Utensils, MessageSquare, LogOut, Heart, CreditCard, Camera } from 'lucide-react';
import AIChatbot from './Client/AIChatbot';
import Wearables from '../components/Wearables';
import Gamification from '../components/Gamification';
import MealPlanView from '../components/MealPlanView';
import Appointments from '../components/Appointments';
import Messages from '../components/Messages';
import Profile from '../components/Profile';
import NaijaRecipes from '../components/NaijaRecipes';
import Subscription from './Client/Subscription';
import MealScanner from '../components/MealScanner';
import offlineStore from '../utils/offlineStore';
import NotificationManager from '../components/NotificationManager';
import TermsModal from '../components/TermsModal';
import Logo from '../components/Logo';
import { useOfflineSync } from '../hooks/useOfflineSync';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [totalCalories, setTotalCalories] = useState(0);

  // Background offline synchronization hook
  const { syncing } = useOfflineSync(() => {
    console.log('🔄 Offline synchronization complete. Refreshing dashboard meals.');
    fetchTodayMeals();
  });

  useEffect(() => {
    const parsed = offlineStore.getProfile();
    if (!parsed) {
      navigate('/login');
      return;
    }
    setUser(parsed);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'overview' && user) {
      fetchTodayMeals();
    }
  }, [activeTab, user]);

  const fetchTodayMeals = async () => {
    setLoadingMeals(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');
      console.log('📡 FETCHING MEALS FROM:', `${API_URL}/ai/today-meals`);
      const response = await axios.get(`${API_URL}/ai/today-meals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('📦 MEAL DATA RECEIVED:', response.data);
      
      if (response.data.success) {
        setTodayMeals(response.data.meals);
        // Calculate total calories (robust parsing)
        const total = response.data.meals.reduce((sum: number, meal: any) => {
          const calStr = meal.calories ? String(meal.calories).split('-')[0].replace(/[^0-9]/g, '') : '0';
          return sum + (parseInt(calStr) || 0);
        }, 0);
        setTotalCalories(total);
      }
    } catch (err) {
      console.error('❌ FETCH FAILED:', err);
    } finally {
      setLoadingMeals(false);
    }
  };

  const handleLogout = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Failed to notify backend logout:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (!user) return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ border: '4px solid var(--border-light)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const daysSinceJoining = user?.created_at ? Math.max(1, Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))) : 1;

  return (
    <div className="app-container" style={{ flexDirection: 'row', display: 'flex', height: '100vh' }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: '200px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-light)', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Logo size={28} horizontal={true} />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <NavItem icon={<Activity size={16} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<Camera size={16} />} label="Snap & Log" active={activeTab === 'vision'} onClick={() => setActiveTab('vision')} />
          <NavItem icon={<Utensils size={16} />} label="Meal Plan" active={activeTab === 'meal-plan'} onClick={() => setActiveTab('meal-plan')} />
          <NavItem icon={<Heart size={16} />} label="Recipes" active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} />
          <NavItem icon={<Target size={16} />} label="Goals" active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} />
          <NavItem icon={<CreditCard size={16} />} label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
          <NavItem icon={<Calendar size={16} />} label="Appts" active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
          <NavItem icon={<MessageSquare size={16} />} label="Chat" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>{user?.name?.split(' ')[0] || 'User'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.subscriptionTier?.toUpperCase() || 'FREE'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0', width: '100%', textAlign: 'left', fontSize: '0.8rem' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
        {activeTab === 'overview' && (
          <>
            {!isOnline && (
              <div style={{ marginBottom: '1.5rem' }}>
                <Badge variant="warning" style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '0.35rem', justifyContent: 'flex-start', textTransform: 'none', fontSize: '0.85rem' }}>
                  ⚠️ Offline Mode: Your data is being saved locally.
                </Badge>
              </div>
            )}
            {syncing && (
              <div style={{ marginBottom: '1.5rem' }}>
                <Badge variant="info" style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '0.35rem', justifyContent: 'flex-start', textTransform: 'none', fontSize: '0.85rem' }}>
                  <span className="spin-icon">⏳</span> Syncing local logs with server...
                </Badge>
              </div>
            )}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.04em' }}>
                  Hello, {user?.name?.split(' ')[0] || 'Client'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Day {daysSinceJoining} of your journey.</p>
              </div>
              <Button onClick={() => setActiveTab('vision')} variant="primary" size="sm">
                Snap Meal
              </Button>
            </header>



            <NotificationManager />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <StatCard title="Sodium" value="0mg" trend="< 2k" color="var(--accent-warning)" />
              <StatCard title="Calories" value={totalCalories} trend="of 2k" color="var(--accent-success)" />
              <StatCard title="Weight" value={user?.weight ? `${user.weight}kg` : '---'} trend="Target: 70kg" color="var(--accent-primary)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <Card 
                  hoverable={false}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Utensils size={20} color="var(--accent-primary)" /> Today's Preview
                    </div>
                  }
                  headerAction={
                    <Button 
                      onClick={fetchTodayMeals} 
                      disabled={loadingMeals}
                      variant="secondary"
                      size="sm"
                    >
                      <Activity size={12} className={loadingMeals ? 'spin-icon' : ''} /> {loadingMeals ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {loadingMeals ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading logs...</div>
                    ) : todayMeals.length > 0 ? (
                      todayMeals.map((meal, idx) => (
                        <div key={meal.id || idx} style={{ 
                          padding: '1rem', 
                          backgroundColor: 'var(--bg-primary)', 
                          borderRadius: '0.5rem', 
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>{meal.dish}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div style={{ fontWeight: '700', color: 'var(--accent-success)' }}>{meal.calories}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem', border: '1px dashed var(--border-light)' }}>
                        No meals logged today. <br/> Use "Snap & Log" to start tracking!
                      </div>
                    )}
                  </div>
                </Card>
               <AIChatbot />
            </div>
          </>
        )}
        
        {activeTab === 'vision' && <MealScanner />}
        {activeTab === 'meal-plan' && <MealPlanView />}
        {activeTab === 'recipes' && <NaijaRecipes />}
        {activeTab === 'billing' && <Subscription />}
        {activeTab === 'appointments' && <Appointments />}
        {activeTab === 'messages' && <Messages />}
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'integrations' && <Wearables />}
        {activeTab === 'goals' && <Gamification />}
      </main>
      <TermsModal onAccept={() => console.log('Terms accepted')} />
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: any) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', borderRadius: '0.35rem',
    color: active ? 'white' : 'var(--text-secondary)',
    backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
    border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: '0.15s',
    fontSize: '0.85rem'
  }}>
    {icon} <span>{label}</span>
  </button>
);

const StatCard = ({ title, value, trend, color }: any) => (
  <div className="glass-panel" style={{ borderLeft: `3px solid ${color}`, padding: '0.75rem' }}>
    <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{title}</h3>
    <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>{value}</div>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{trend}</div>
  </div>
);

export default ClientDashboard;
