import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div style={styles.container}>
      <div style={styles.avatar}>
        <Bot size={20} color="#34d399" />
      </div>
      
      <div style={styles.bubble} className="glass-panel">
        <div style={styles.dots}>
          <div style={{...styles.dot, animationDelay: '0ms'}}></div>
          <div style={{...styles.dot, animationDelay: '150ms'}}></div>
          <div style={{...styles.dot, animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    flexShrink: 0,
  },
  bubble: {
    padding: '16px 20px',
    borderRadius: '16px',
    borderBottomLeftRadius: 0,
    display: 'flex',
    alignItems: 'center',
    height: '44px',
  },
  dots: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  dot: {
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--text-secondary)',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out both',
  }
};

// Add bounce keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}

export default TypingIndicator;
