import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, MessageSquare, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const Sidebar = ({ subjectId, currentSessionId, onSelectSession }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/sessions/${subjectId}`);
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [subjectId]);

  const handleNewChat = () => {
    onSelectSession(null); // Null triggers a new session on first message
  };

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat history?')) return;
    
    try {
      await axios.delete(`${API_URL}/chat/session/${sessionId}`);
      if (currentSessionId === sessionId) {
        onSelectSession(null);
      }
      fetchSessions();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="glass-panel" style={styles.sidebar}>
      <button className="btn-primary" style={styles.newChatBtn} onClick={handleNewChat}>
        <PlusCircle size={18} />
        New Doubt
      </button>

      <div style={styles.sessionList}>
        <h4 style={styles.listTitle}>Recent History</h4>
        
        {loading ? (
          <p style={styles.emptyText}>Loading...</p>
        ) : sessions.length === 0 ? (
          <p style={styles.emptyText}>No previous doubts asked.</p>
        ) : (
          sessions.map(session => (
            <div 
              key={session.id}
              style={{
                ...styles.sessionItem,
                background: currentSessionId === session.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderColor: currentSessionId === session.id ? 'var(--accent)' : 'transparent'
              }}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
              <span style={styles.sessionTitle} title={session.title}>{session.title}</span>
              
              <button 
                style={styles.deleteBtn} 
                onClick={(e) => handleDelete(e, session.id)}
                className="delete-icon"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '280px',
    borderRight: '1px solid var(--glass-border)',
    borderTop: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 16px',
    gap: '24px',
  },
  newChatBtn: {
    width: '100%',
  },
  sessionList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    paddingLeft: '8px',
  },
  sessionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.2s',
  },
  sessionTitle: {
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    cursor: 'pointer',
    opacity: 0.5,
    padding: '4px',
    display: 'flex',
  },
  emptyText: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    padding: '0 8px',
  }
};

export default Sidebar;
