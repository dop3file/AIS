import React, { useState, useEffect } from 'react';
import { FaUpload, FaPlay, FaTrash, FaMusic } from 'react-icons/fa';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

const AudioLibrary = () => {
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await api.get('/audio/');
            setFiles(response.data);
        } catch (error) {
            console.error('Error fetching audio files:', error);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            await api.post('/audio/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            fetchFiles();
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот файл?')) {
            try {
                await api.delete(`/audio/${id}`);
                fetchFiles();
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Аудио библиотека</h1>
                <div>
                    <input
                        type="file"
                        id="audio-upload"
                        accept="audio/*"
                        style={{ display: 'none' }}
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                    <label htmlFor="audio-upload">
                        <Button as="span" style={{ pointerEvents: isUploading ? 'none' : 'auto', opacity: isUploading ? 0.7 : 1 }}>
                            <FaUpload /> {isUploading ? 'Загрузка...' : 'Загрузить аудио'}
                        </Button>
                    </label>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {files.map((file) => (
                    <Card key={file.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '48px', height: '48px',
                                borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-primary)'
                            }}>
                                <FaMusic />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <h3 style={{ fontSize: '1.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {file.filename}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    {file.content_type}
                                </p>
                            </div>
                        </div>

                        <audio controls src={file.url} style={{ width: '100%', marginBottom: '1rem' }} />

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="ghost" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(file.id)}>
                                <FaTrash />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AudioLibrary;
