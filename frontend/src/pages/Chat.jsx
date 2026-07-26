import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import UploadPanel from '../components/UploadPanel';
import { ArrowLeft } from 'lucide-react';

const Chat = () => {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get subject from location state, otherwise we'd normally fetch it
  const [subject, setSubject] = useState(location.state?.subject || { id: subjectId, name: 'Loading...' });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div style={styles.container}>
      {/* Top Navbar */}
      <nav style={styles.navbar} className="glass-panel">
        <div style={styles.navLeft}>
          <button style={styles.backBtn} onClick={() => navigate('/')} className="btn-icon">
            <ArrowLeft size={20} />
          </button>
          <div style={styles.subjectInfo}>
            <span style={{ fontSize: '24px' }}>{subject.icon}</span>
            <h2 style={styles.subjectName}>{subject.name} Doubt Solver</h2>
          </div>
        </div>
        
        <div style={styles.navRight}>
          <button 
            className="btn-primary" 
            onClick={() => setShowUpload(!showUpload)}
            style={{ background: showUpload ? 'var(--glass-bg)' : 'var(--accent)' }}
          >
            {showUpload ? 'Close Files' : 'Upload Materials'}
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div style={styles.mainContent}>
        {/* Sidebar */}
        <Sidebar 
          subjectId={subjectId} 
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
        />

        {/* Center Chat Area */}
        <div style={styles.chatArea}>
          {showUpload ? (
            <UploadPanel subject={subject} />
          ) : (
            <ChatInterface 
              subject={subject} 
              sessionId={currentSessionId}
              onSessionCreated={setCurrentSessionId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  navbar: {
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 10,
    borderBottom: '1px solid var(--glass-border)',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderRadius: 0,
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backBtn: {
    display: 'flex',
  },
  subjectInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  subjectName: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(0,0,0,0.2)',
  }
};

export default Chat;
