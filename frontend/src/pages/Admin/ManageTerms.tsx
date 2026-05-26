import { useState, useEffect } from 'react';
import { termsApi } from '../../api/terms';
import { Save, History, CheckCircle, AlertCircle } from 'lucide-react';

const ManageTerms = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentTerms, setCurrentTerms] = useState<any>(null);

  useEffect(() => {
    fetchLatestTerms();
  }, []);

  const fetchLatestTerms = async () => {
    try {
      const data = await termsApi.getLatest();
      if (data.success && data.terms) {
        setCurrentTerms(data.terms);
        setContent(data.terms.content);
      }
    } catch (err) {
      console.error('Failed to fetch terms:', err);
    }
  };

  const handleUpdate = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await termsApi.update(content);
      if (data.success) {
        setMessage({ type: 'success', text: 'Terms and Conditions updated successfully! Existing users will see the update on their next visit.' });
        setCurrentTerms(data.terms);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update terms. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Manage Terms & Conditions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Update the legal agreement for all users of Nutrilas.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleUpdate} 
            disabled={isLoading || !content} 
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={18} /> {isLoading ? 'Saving...' : 'Save & Update Version'}
          </button>
        </div>
      </div>

      {message.text && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
          color: message.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>Agreement Content</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ 
              width: '100%', 
              minHeight: '500px', 
              padding: '1.25rem', 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border-light)', 
              borderRadius: '0.5rem', 
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              fontSize: '1rem',
              outline: 'none',
              resize: 'vertical'
            }}
            placeholder="Enter terms and conditions here..."
          />
        </div>

        <div>
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} /> Current Version
            </h3>
            {currentTerms ? (
              <div style={{ fontSize: '0.9rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Version:</span> 
                  <span style={{ marginLeft: '0.5rem', fontWeight: '600' }}>v{currentTerms.version}</span>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Last Updated:</span> 
                  <span style={{ marginLeft: '0.5rem' }}>{new Date(currentTerms.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '1rem' }}>
                  Updating this content will force all existing users to re-accept the terms upon their next login.
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No version history found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTerms;
