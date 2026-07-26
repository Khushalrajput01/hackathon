import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const SubjectSelector = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${API_URL}/subjects`);
        setSubjects(response.data.subjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleSelect = (subject) => {
    navigate(`/chat/${subject.id}`, { state: { subject } });
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '300px' }}>
        <div className="gradient-text" style={{ fontSize: '1.5rem', animation: 'pulse 2s infinite' }}>
          Loading Subjects...
        </div>
      </div>
    );
  }

  return (
    <div className="subject-grid" style={styles.grid}>
      {subjects.map((subject, index) => (
        <div 
          key={subject.id} 
          className="glass-card animate-fade-in"
          style={{ ...styles.card, animationDelay: `${index * 0.1}s` }}
          onClick={() => handleSelect(subject)}
        >
          <div style={styles.iconWrapper} className={`bg-gradient-to-br ${subject.color}`}>
            <span style={styles.icon}>{subject.icon}</span>
          </div>
          <h3 style={styles.name}>{subject.name}</h3>
          <p style={styles.description}>{subject.description}</p>
        </div>
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    padding: '20px 0',
  },
  card: {
    padding: '24px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
  },
  iconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)', // Fallback if no Tailwind
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  icon: {
    fontSize: '32px',
  },
  name: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    marginTop: '8px',
  },
  description: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  }
};

export default SubjectSelector;
