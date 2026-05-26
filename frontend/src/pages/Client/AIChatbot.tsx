import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send } from 'lucide-react';

const AIChatbot = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'system', content: 'Hello! I am NutriAI, your personal nutrition assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');
      
      const history = messages
        .filter(m => m.role !== 'system' || m.content.startsWith('Hello!'))
        .map(m => ({ role: m.role === 'system' ? 'assistant' : m.role, content: m.content }));

      const response = await axios.post(
        `${API_URL}/ai/chat`,
        { message: userMessage, history },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'system', content: 'Error: Failed to connect to NutriAI.' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'system', content: 'Error: Failed to connect to NutriAI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '600px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '1rem', border: '1px solid var(--border-light)' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={24} color="white" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>NutriAI Assistant</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-success)', borderRadius: '50%', display: 'inline-block' }}></span> Online
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                maxWidth: '85%', 
                padding: '1rem', 
                borderRadius: '1rem', 
                backgroundColor: isUser ? 'var(--accent-primary)' : isSystem ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-primary)',
                color: isUser ? 'white' : isSystem ? 'var(--accent-danger)' : 'var(--text-primary)',
                borderBottomRightRadius: isUser ? '0.25rem' : '1rem',
                borderBottomLeftRadius: !isUser ? '0.25rem' : '1rem',
                boxShadow: isUser ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
                lineHeight: '1.5'
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
             <div style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: 'var(--bg-tertiary)', borderBottomLeftRadius: '0.25rem', display: 'flex', gap: '0.5rem' }}>
               <div className="typing-dot" style={{ animationDelay: '0s' }}>.</div>
               <div className="typing-dot" style={{ animationDelay: '0.2s' }}>.</div>
               <div className="typing-dot" style={{ animationDelay: '0.4s' }}>.</div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your diet, recipes, or nutrition..."
            style={{ 
              flex: 1, padding: '0.75rem 1rem', borderRadius: '2rem', 
              backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)',
              color: 'var(--text-primary)', outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            style={{
              width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)',
              border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
              opacity: (!input.trim() || loading) ? 0.6 : 1
            }}
          >
            <Send size={20} style={{ marginLeft: '2px' }} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;
