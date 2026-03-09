import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function DocumentWallet({ t, lang }) {
    const { token } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [editName, setEditName] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get(`${API}/documents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load documents", err);
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('displayName', document.getElementById('newDocName')?.value || file.name);

        setUploading(true);
        try {
            await axios.post(`${API}/documents/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            fetchDocuments();
            if (fileInputRef.current) fileInputRef.current.value = '';
            document.getElementById('newDocName').value = '';
        } catch (err) {
            alert('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await axios.delete(`${API}/documents/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDocuments();
        } catch (err) {
            alert("Failed to delete document");
        }
    };

    const startEdit = (doc) => {
        setEditingDoc(doc._id);
        setEditName(doc.name);
    };

    const handleSaveEdit = async (id) => {
        try {
            await axios.put(`${API}/documents/${id}`, { displayName: editName }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingDoc(null);
            fetchDocuments();
        } catch (err) {
            alert("Failed to update document");
        }
    };

    // To format bytes properly
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes'
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    const API_URL = API.replace('/api', '');

    return (
        <div className="document-wallet">
            <div className="wallet-header">
                <h3>🗂️ {lang === 'ta' ? 'ஆவண பணப்பையை' : 'Document Wallet'}</h3>
                <p>{lang === 'ta' ? 'உங்கள் ஆவணங்களை பாதுகாப்பாக சேமிக்கவும்.' : 'Store and manage your required documents for schemes safely.'}</p>
            </div>

            <div className="wallet-upload-section">
                <input type="text" id="newDocName" placeholder={lang === 'ta' ? "ஆவணத்தின் பெயர் (உதாரணம்: ஆதார் அட்டை)" : "Document Name (e.g. Aadhaar Card)"} className="wallet-input" />
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="wallet-upload-btn">
                    {uploading ? "Uploading..." : (lang === 'ta' ? "⬆️ பதிவேற்று" : "⬆️ Upload Document")}
                </button>
            </div>

            <div className="wallet-list">
                {loading ? <p>Loading documents...</p> :
                    documents.length === 0 ? (
                        <div className="wallet-empty">No documents found. Upload your first document!</div>
                    ) : (
                        documents.map(doc => (
                            <div key={doc._id} className="wallet-card">
                                {editingDoc === doc._id ? (
                                    <div className="wallet-edit-form">
                                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className="wallet-input" />
                                        <button onClick={() => handleSaveEdit(doc._id)} className="wallet-action-btn green">💾</button>
                                        <button onClick={() => setEditingDoc(null)} className="wallet-action-btn red">❌</button>
                                    </div>
                                ) : (
                                    <div className="wallet-doc-info">
                                        <div className="wallet-doc-name">
                                            <a href={`${API_URL}${doc.filePath}`} target="_blank" rel="noopener noreferrer">
                                                📄 {doc.name}
                                            </a>
                                            <span className="wallet-doc-size">({formatBytes(doc.size)})</span>
                                        </div>
                                        <div className="wallet-doc-actions">
                                            <button onClick={() => startEdit(doc)} title="Rename" className="wallet-action-btn">✏️</button>
                                            <button onClick={() => handleDelete(doc._id)} title="Delete" className="wallet-action-btn red">🗑️</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
            </div>
        </div>
    );
}
