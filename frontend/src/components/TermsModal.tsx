import React, { useState, useEffect } from 'react';
import { termsApi } from '../api/terms';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface TermsModalProps {
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onAccept }) => {
  const [latestTerms, setLatestTerms] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    checkTermsStatus();
  }, []);

  const checkTermsStatus = async () => {
    try {
      const data = await termsApi.checkStatus();
      if (data.success && !data.accepted) {
        // Fetch the full content of the terms
        const termsData = await termsApi.getLatest();
        if (termsData.success) {
          setLatestTerms(termsData.terms);
          setIsVisible(true);
        }
      }
    } catch (err) {
      console.error('Failed to check terms status:', err);
    }
  };

  const handleAccept = async () => {
    if (!latestTerms) return;
    
    setIsAccepting(true);
    try {
      const data = await termsApi.accept(latestTerms.id);
      if (data.success) {
        setIsVisible(false);
        onAccept();
      }
    } catch (err) {
      console.error('Failed to accept terms:', err);
    } finally {
      setIsAccepting(false);
    }
  };

  if (!isVisible || !latestTerms) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{ 
        width: '100%', 
        maxWidth: '650px', 
        maxHeight: '90vh', 
        display: 'flex', 
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--accent-primary)'
      }}>
        <div style={{ 
          padding: '1.5rem 2rem', 
          background: 'var(--gradient-primary)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Shield size={32} />
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Updated Terms & Conditions</h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Version {latestTerms.version} • Released {new Date(latestTerms.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div style={{ 
          padding: '2rem', 
          overflowY: 'auto', 
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          lineHeight: '1.7',
          fontSize: '0.95rem',
          flex: 1
        }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <AlertCircle size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem' }}>
              We have updated our terms to better protect your data and health information. Please review and accept to continue using Nutrilas.
            </p>
          </div>
          
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {latestTerms.content}
          </div>
        </div>

        <div style={{ 
          padding: '1.5rem 2rem', 
          backgroundColor: 'var(--bg-primary)', 
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
            By clicking "Accept and Continue", you acknowledge that you have read and agree to these terms.
          </p>
          <button 
            onClick={handleAccept} 
            disabled={isAccepting}
            className="btn-primary"
            style={{ 
              padding: '0.75rem 2rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              minWidth: '200px',
              justifyContent: 'center'
            }}
          >
            {isAccepting ? 'Processing...' : <><CheckCircle size={18} /> Accept and Continue</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
