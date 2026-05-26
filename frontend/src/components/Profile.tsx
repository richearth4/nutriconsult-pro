import { useState } from 'react';
import { User, Shield, Bell } from 'lucide-react';

const Profile = () => {
  const [saved, setSaved] = useState(false);
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.03em' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal details and account settings.</p>
      </header>

      <form onSubmit={handleSave} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Personal Details */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
            <User size={20} color="var(--accent-primary)" /> Personal Details
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
              <input type="text" defaultValue={user?.name || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Date of Birth</label>
              <input type="date" defaultValue={user?.dob || '1995-01-01'} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
              <input type="email" defaultValue={user?.email || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }} disabled />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>Email cannot be changed directly. Contact support.</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
            <Bell size={20} color="var(--accent-primary)" /> Preferences
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Email notifications for upcoming appointments</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>SMS notifications for daily meal reminders</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} /> Request Data Deletion
          </button>
          <button type="submit" className="btn-primary">
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
