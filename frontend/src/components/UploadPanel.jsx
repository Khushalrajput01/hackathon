import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const UploadPanel = ({ subject }) => {
  const [documents, setDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success' | 'error', msg: string }

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/subjects/${subject.id}/documents`);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, [subject.id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      setUploadStatus({ type: 'error', msg: 'Only PDF files are allowed.' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject_id', subject.id);
    formData.append('subject_name', subject.name);

    try {
      await axios.post(`${API_URL}/upload/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadStatus({ type: 'success', msg: `${file.name} uploaded and processed successfully!` });
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({ 
        type: 'error', 
        msg: error.response?.data?.error || 'Failed to process PDF. Check if backend services are running.' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2>Study Materials for {subject.name}</h2>
        <p style={styles.subtitle}>Upload past papers, notes, or textbook chapters (PDF only). The AI will use these to answer your doubts.</p>
      </div>

      {/* Upload Area */}
      <div 
        style={{
          ...styles.dropzone,
          borderColor: isDragging ? 'var(--accent)' : 'var(--glass-border)',
          background: isDragging ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.2)'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="file-upload" 
          accept=".pdf" 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          disabled={uploading}
        />
        
        {uploading ? (
          <div style={styles.uploadingState}>
            <div className="spinner" style={styles.spinner}></div>
            <p>Processing PDF and generating embeddings...</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This may take a minute for large files.</p>
          </div>
        ) : (
          <label htmlFor="file-upload" style={styles.uploadLabel}>
            <UploadCloud size={48} color={isDragging ? 'var(--accent)' : 'var(--text-secondary)'} />
            <h3 style={{ marginTop: '16px' }}>Drag & drop your PDF here</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>or click to browse files</p>
            <span className="btn-primary">Select PDF File</span>
          </label>
        )}
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div style={{
          ...styles.statusMsg,
          background: uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderColor: uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          color: uploadStatus.type === 'success' ? '#34d399' : '#f87171'
        }}>
          {uploadStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{uploadStatus.msg}</span>
          <button style={styles.closeBtn} onClick={() => setUploadStatus(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Document List */}
      <div style={styles.docListSection}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Uploaded Documents ({documents.length})</h3>
        
        {documents.length === 0 ? (
          <div style={styles.emptyList}>
            <p>No study materials uploaded yet.</p>
          </div>
        ) : (
          <div style={styles.docGrid}>
            {documents.map(doc => (
              <div key={doc.id} style={styles.docCard} className="glass-panel">
                <FileText size={24} color="#f87171" />
                <div style={styles.docInfo}>
                  <h4 style={styles.docName} title={doc.original_name}>{doc.original_name}</h4>
                  <p style={styles.docMeta}>
                    {new Date(doc.uploaded_at).toLocaleDateString()} • {doc.chunk_count} chunks indexed
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: '32px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    marginTop: '8px',
  },
  dropzone: {
    border: '2px dashed',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    marginBottom: '32px',
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  uploadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    color: 'var(--text-primary)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.1)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  statusMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '32px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    marginLeft: 'auto',
    display: 'flex',
  },
  docListSection: {
    flex: 1,
  },
  docGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  docCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    borderRadius: '12px',
  },
  docInfo: {
    overflow: 'hidden',
  },
  docName: {
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '4px',
  },
  docMeta: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  emptyList: {
    padding: '32px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '12px',
    border: '1px dashed var(--glass-border)',
  }
};

// Add spinner keyframes globally if not present
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default UploadPanel;
