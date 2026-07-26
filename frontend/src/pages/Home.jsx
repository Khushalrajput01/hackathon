import React from 'react';
import SubjectSelector from '../components/SubjectSelector';
import { BookOpen } from 'lucide-react';

const Home = () => {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <header style={styles.header} className="animate-fade-in">
        <div style={styles.logoWrapper}>
          <BookOpen size={40} color="var(--accent)" />
        </div>
        <h1 style={styles.title}>
          AI <span className="gradient-text">Doubt Solver</span>
        </h1>
        <p style={styles.subtitle}>
          Select a subject, upload your study materials, and get instant answers powered by RAG.
        </p>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <h2 style={styles.sectionTitle}>What do you want to study today?</h2>
        <SubjectSelector />
      </main>
      
      {/* Footer */}
      <footer style={styles.footer}>
        <p>Hackathon Project - React + Node + FastAPI + ChromaDB</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
    marginTop: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoWrapper: {
    background: 'rgba(59, 130, 246, 0.1)',
    padding: '20px',
    borderRadius: '24px',
    marginBottom: '24px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },
  title: {
    fontSize: '4rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'var(--text-secondary)',
    maxWidth: '600px',
    lineHeight: '1.6',
  },
  main: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '24px',
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    padding: '40px 0 20px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    borderTop: '1px solid var(--glass-border)',
    marginTop: '60px',
  }
};

export default Home;
