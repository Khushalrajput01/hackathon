import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, BookOpen } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Handle sources parsing (from stringified JSON if from DB)
  let sources = [];
  try {
    if (typeof message.sources === 'string') {
      sources = JSON.parse(message.sources);
    } else if (Array.isArray(message.sources)) {
      sources = message.sources;
    }
  } catch (e) {
    console.error('Failed to parse sources', e);
  }

  return (
    <div style={{
      ...styles.container,
      flexDirection: isUser ? 'row-reverse' : 'row'
    }}>
      {/* Avatar */}
      <div style={{
        ...styles.avatar,
        background: isUser ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
        borderColor: isUser ? 'rgba(59, 130, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)',
      }}>
        {isUser ? <User size={20} color="#60a5fa" /> : <Bot size={20} color="#34d399" />}
      </div>

      {/* Message Content */}
      <div style={styles.contentWrapper}>
        <div style={{
          ...styles.bubble,
          background: isUser ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
          border: isUser ? 'none' : '1px solid var(--glass-border)',
          borderBottomRightRadius: isUser ? 0 : '16px',
          borderBottomLeftRadius: isUser ? '16px' : 0,
        }} className="animate-fade-in">
          
          <div className="markdown-body" style={styles.markdown}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {message.error && (
            <p style={{color: 'var(--danger)', fontSize: '0.9rem', marginTop: '8px'}}>
              Error generating response.
            </p>
          )}

        </div>

        {/* Sources section (only for AI messages) */}
        {!isUser && sources && sources.length > 0 && (
          <div style={styles.sourcesContainer} className="animate-fade-in">
            <div style={styles.sourcesHeader}>
              <BookOpen size={12} />
              <span>Sources used:</span>
            </div>
            <div style={styles.sourceChips}>
              {sources.map((src, i) => (
                <div key={i} style={styles.sourceChip} title={`Relevance: ${(src.relevance*100).toFixed(1)}%`}>
                  {src.source}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '16px',
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid',
    flexShrink: 0,
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  bubble: {
    padding: '16px 20px',
    borderRadius: '16px',
    color: 'var(--text-primary)',
    lineHeight: '1.6',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  markdown: {
    fontSize: '1rem',
    wordBreak: 'break-word',
  },
  sourcesContainer: {
    marginTop: '4px',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  sourcesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  sourceChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  sourceChip: {
    fontSize: '0.8rem',
    padding: '4px 8px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '4px',
    color: '#93c5fd',
    border: '1px solid rgba(147, 197, 253, 0.2)',
  }
};

export default MessageBubble;
