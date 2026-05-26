import { useState } from 'react';
import { Bell, BellOff, CheckCircle } from 'lucide-react';

const NotificationManager = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Notifications are not supported in this browser.');
      return;
    }
    
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Send a test notification
      new Notification('Nutrilas', {
        body: 'Great! Reminders are now enabled. We will nudge you to stay healthy!',
        icon: '/pwa-192x192.png'
      });
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
          {permission === 'granted' ? <Bell size={24} color="var(--accent-primary)" /> : <BellOff size={24} color="var(--text-muted)" />}
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Stay Consistent</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {permission === 'granted' ? 'Native reminders are enabled.' : 'Enable reminders to log your Nigerian meals on time.'}
          </p>
        </div>
      </div>
      
      {permission !== 'granted' ? (
        <button 
          onClick={requestPermission}
          className="btn-primary" 
          style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
        >
          Enable Reminders
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)', fontSize: '0.9rem', fontWeight: '600' }}>
          <CheckCircle size={18} /> Active
        </div>
      )}

      {showSuccess && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: 'var(--bg-primary)', padding: '1rem 2rem', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'slide-up 0.3s ease-out' }}>
          <CheckCircle size={20} color="var(--accent-success)" />
          Reminders enabled successfully!
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
