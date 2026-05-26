import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Activity, LogOut, MessageSquare, Video, Database, FileText } from 'lucide-react';
import AIMealPlanner from './Admin/AIMealPlanner';
import Telehealth from '../components/Telehealth';
import UserManagement from './Admin/UserManagement';
import AdminAppointments from './Admin/AdminAppointments';
import Messages from '../components/Messages';
import FoodDatabase from './Admin/FoodDatabase';
import ManageTerms from './Admin/ManageTerms';

import Logo from '../components/Logo';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'admin') {
      navigate('/client');
      return;
    }
    setUser(parsed);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="app-container" style={{ flexDirection: 'row' }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '200px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-light)',
        padding: '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <Logo size={28} horizontal={true} />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <NavItem icon={<Users size={16} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<Activity size={16} />} label="AI Planner" active={activeTab === 'ai-planner'} onClick={() => setActiveTab('ai-planner')} />
          <NavItem icon={<Database size={16} />} label="Food DB" active={activeTab === 'food-db'} onClick={() => setActiveTab('food-db')} />
          <NavItem icon={<Video size={16} />} label="Consults" active={activeTab === 'telehealth'} onClick={() => setActiveTab('telehealth')} />
          <NavItem icon={<Calendar size={16} />} label="Appts" active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} />
          <NavItem icon={<MessageSquare size={16} />} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
          <NavItem icon={<FileText size={16} />} label="Legal" active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} />
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'white' }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>{user.name.split(' ')[0]}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead Nutritionist</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-danger)', 
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0', width: '100%', textAlign: 'left', fontSize: '0.8rem'
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ flex: 1, padding: '1.25rem' }}>
        {activeTab === 'overview' && (
          <>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.03em' }}>Overview</h1>
              <button onClick={() => setActiveTab('settings')} className="btn-primary">
                + New Client
              </button>
            </header>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <StatCard title="Total Clients" value="128" trend="+12%" trendUp={true} />
              <StatCard title="Active Appts" value="14" trend="Today" />
              <StatCard title="AI Plans" value="45" trend="+5" trendUp={true} />
              <StatCard title="Revenue" value="$4.2k" trend="+8%" trendUp={true} />
            </div>

            {/* Recent Activity */}
            <div className="glass-panel">
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent Client Activity</h2>
              <div style={{ color: 'var(--text-secondary)' }}>
                <p>Activity feed implementation coming soon...</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'ai-planner' && <AIMealPlanner />}
        
        {activeTab === 'telehealth' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.03em' }}>Virtual Consultation</h1>
            <Telehealth peerName="Test Client" onEndCall={() => setActiveTab('overview')} />
          </div>
        )}
        
        {activeTab === 'food-db' && <FoodDatabase />}
        {activeTab === 'appointments' && <AdminAppointments />}
        {activeTab === 'messages' && <Messages />}
        {activeTab === 'legal' && <ManageTerms />}
        {activeTab === 'settings' && <UserManagement />}
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.35rem',
    color: active ? 'white' : 'var(--text-secondary)',
    backgroundColor: active ? 'var(--accent-primary)' : 'transparent',
    transition: 'all var(--transition-fast)',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontSize: '0.85rem'
  }}>
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ title, value, trend, trendUp }: { title: string, value: string, trend: string, trendUp?: boolean }) => (
  <div className="glass-panel" style={{ borderLeft: `3px solid var(--accent-primary)`, padding: '0.75rem' }}>
    <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '400' }}>{title}</h3>
    <div style={{ fontSize: '1.25rem', fontWeight: '500' }}>{value}</div>
    <div style={{ fontSize: '0.7rem', color: trendUp ? 'var(--accent-success)' : 'var(--text-muted)' }}>
      {trend}
    </div>
  </div>
);

export default AdminDashboard;
