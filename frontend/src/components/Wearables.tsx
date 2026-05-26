import { useState } from 'react';
import { Activity, Watch, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';

const Wearables = () => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>(['apple-health']);

  const handleConnect = (provider: string) => {
    if (connected.includes(provider)) {
      setConnected(connected.filter(p => p !== provider));
      return;
    }
    
    setSyncing(provider);
    
    // Simulate API connection flow
    setTimeout(() => {
      setSyncing(null);
      setConnected([...connected, provider]);
    }, 2000);
  };

  const providers = [
    { id: 'apple-health', name: 'Apple Health', icon: <Smartphone size={24} />, color: '#ff2d55', desc: 'Sync steps, workouts, and vitals from your iPhone or Apple Watch.' },
    { id: 'google-fit', name: 'Google Fit', icon: <Activity size={24} />, color: '#4285f4', desc: 'Connect your Android device to sync activity and health metrics.' },
    { id: 'fitbit', name: 'Fitbit', icon: <Watch size={24} />, color: '#00B0B9', desc: 'Sync sleep data, heart rate, and daily activity from your Fitbit device.' },
    { id: 'garmin', name: 'Garmin Connect', icon: <Watch size={24} />, color: '#000000', desc: 'Import detailed workout analytics and continuous health monitoring.' }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Device Integrations</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Connect your fitness trackers to automatically sync your health data.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {providers.map(provider => {
          const isConnected = connected.includes(provider.id);
          const isSyncing = syncing === provider.id;

          return (
            <div key={provider.id} className="glass-panel" style={{ 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              border: isConnected ? '1px solid var(--accent-success)' : '1px solid var(--border-light)'
            }}>
              {isConnected && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--accent-success)' }}>
                  <CheckCircle2 size={20} />
                </div>
              )}
              
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: provider.color }}>
                {provider.icon}
              </div>
              
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600' }}>{provider.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                {provider.desc}
              </p>
              
              <button 
                onClick={() => handleConnect(provider.id)}
                disabled={isSyncing}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem',
                  border: isConnected ? '1px solid var(--border-light)' : 'none',
                  backgroundColor: isConnected ? 'transparent' : 'var(--accent-primary)',
                  color: 'white',
                  cursor: isSyncing ? 'wait' : 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isSyncing ? (
                  <>
                    <Activity size={18} style={{ animation: 'pulse 1s infinite' }} />
                    Connecting...
                  </>
                ) : isConnected ? (
                  'Disconnect'
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-panel" style={{ marginTop: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <AlertCircle size={24} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--accent-primary)' }}>Data Privacy & Security</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your health data is end-to-end encrypted and HIPAA compliant. We only sync data that you explicitly authorize, and it is strictly used to improve your AI meal plans and provide the Nutrilas Admin with accurate activity contexts. You can revoke access at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wearables;
