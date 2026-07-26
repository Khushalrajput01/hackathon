import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const API_URL = 'http://localhost:3001/api';

const ChatInterface = ({ subject, sessionId, onSessionCreated }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch history when session changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) {
        setMessages([]);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/chat/history/${sessionId}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };
    fetchHistory();
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const questionText = input.trim();
    setInput('');
    
    // Add user message to UI instantly
    const userMsg = { role: 'user', content: questionText, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      let activeSessionId = sessionId;

      // Create a session first if it doesn't exist
      if (!activeSessionId) {
        const sessionRes = await axios.post(`${API_URL}/chat/session`, {
          subject_id: subject.id,
          title: questionText.substring(0, 50) + (questionText.length > 50 ? '...' : '')
        });
        activeSessionId = sessionRes.data.session.id;
        onSessionCreated(activeSessionId);
      }

      // Format history for context (last 3 messages)
      const chatHistory = messages.slice(-3).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Send to backend
      const response = await axios.post(`${API_URL}/chat/message`, {
        session_id: activeSessionId,
        question: questionText,
        subject_id: subject.id,
        subject_name: subject.name,
        chat_history: chatHistory
      });

      // Add AI response to UI
      const aiMsg = { 
        role: 'assistant', 
        content: response.data.answer, 
        sources: response.data.sources,
        created_at: new Date().toISOString() 
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check if the AI service is running.',
        error: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Message List */}
      <div style={styles.messageList}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '48px', marginBottom: '16px' }}>{subject.icon}</span>
            <h3>Ask anything about {subject.name}!</h3>
            <p>I'll answer using your uploaded study materials.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))
        )}
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={styles.inputArea} className="glass-panel">
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            className="glass-input"
            style={styles.input}
            placeholder={`Ask a doubt about ${subject.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="submit" 
            className="btn-icon"
            style={{ 
              ...styles.sendBtn, 
              background: input.trim() ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
              borderColor: input.trim() ? 'var(--accent)' : 'var(--glass-border)',
              color: input.trim() ? '#fff' : 'var(--text-secondary)'
            }}
            disabled={!input.trim() || isTyping}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
  inputArea: {
    padding: '20px 24px',
    borderTop: '1px solid var(--glass-border)',
    borderBottom: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderRadius: 0,
    background: 'rgba(15, 23, 42, 0.8)',
  },
  form: {
    display: 'flex',
    gap: '12px',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  input: {
    flex: 1,
    padding: '16px 20px',
    fontSize: '1rem',
  },
  sendBtn: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
  }
};

export default ChatInterface;
