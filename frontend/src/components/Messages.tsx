import { useState } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';

const Messages = () => {
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<any[]>([
    { id: 'start', sender: 'admin', text: 'Hello! I am the lead nutritionist here at Nutrilas. How can I help you today?', time: '09:00 AM' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'client', text: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChat(prev => [...prev, userMsg]);
    setMsg('');
    
    // Simulate nutritionist reply
    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        "That sounds like a great meal! Just be mindful of the portion size.",
        "I've noted that in your profile. We'll adjust your macro targets accordingly.",
        "Excellent choice. Are you following the recipe from our dashboard?",
        "Remember to stay hydrated throughout the day!",
        "I'll review your logs and give you a detailed breakdown by tomorrow."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setChat(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'admin', 
        text: randomResponse, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '80vh' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '500', letterSpacing: '-0.03em' }}>Direct Messages</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Chat securely with the Nutrilas Admin.</p>
      </header>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: chat.length === 0 ? 'center' : 'flex-start' }}>
          {chat.length > 0 ? (
            chat.map(m => (
              <div key={m.id} style={{ display: 'flex', flexDirection: m.sender === 'client' ? 'row-reverse' : 'row', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: m.sender === 'client' ? 'var(--gradient-primary)' : 'var(--gradient-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <User size={16} />
                </div>
                <div style={{ 
                  maxWidth: '70%', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '1rem', 
                  backgroundColor: m.sender === 'client' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: m.sender === 'client' ? 'white' : 'var(--text-primary)',
                  borderBottomRightRadius: m.sender === 'client' ? '0' : '1rem',
                  borderBottomLeftRadius: m.sender === 'client' ? '1rem' : '0',
                }}>
                  <p>{m.text}</p>
                  <span style={{ fontSize: '0.7rem', color: m.sender === 'client' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', display: 'block', marginTop: '0.25rem', textAlign: m.sender === 'client' ? 'right' : 'left' }}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', margin: '0 auto', opacity: 0.5 }} />
              <p style={{ fontSize: '0.9rem' }}>Chat history will appear here.</p>
            </div>
          )}
          {isTyping && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: '3rem' }}>
              Admin is typing...
            </div>
          )}
        </div>
        
        <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}>
          <input 
            type="text" 
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type your message..."
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '2rem', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
