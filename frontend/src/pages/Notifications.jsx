import React, { useState, useEffect } from 'react';
import { FaPlus, FaBell } from 'react-icons/fa';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [zones, setZones] = useState([]);
    const [audioFiles, setAudioFiles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        message: '',
        scheduled_time: '',
        zone_id: '',
        audio_file_id: ''
    });

    useEffect(() => {
        fetchNotifications();
        fetchZones();
        fetchAudioFiles();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications/');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchZones = async () => {
        try {
            const response = await api.get('/zones/');
            setZones(response.data);
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    const fetchAudioFiles = async () => {
        try {
            const response = await api.get('/audio/');
            setAudioFiles(response.data);
        } catch (error) {
            console.error('Error fetching audio files:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/notifications/', formData);
            fetchNotifications();
            handleCloseModal();
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            message: '',
            scheduled_time: '',
            zone_id: '',
            audio_file_id: ''
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Уведомления</h1>
                <Button onClick={() => setIsModalOpen(true)}><FaPlus /> Запланировать уведомление</Button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {notifications.map((notification) => (
                    <Card key={notification.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-success)'
                            }}>
                                <FaBell />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{notification.message || 'Аудио уведомление'}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    Запланировано на: {new Date(notification.scheduled_time).toLocaleString('ru-RU')}
                                </p>
                            </div>
                        </div>
                        <div style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: notification.status === 'sent' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: notification.status === 'sent' ? 'var(--color-success)' : 'var(--color-danger)'
                        }}>
                            {notification.status === 'sent' ? 'ОТПРАВЛЕНО' : notification.status === 'pending' ? 'ОЖИДАЕТ' : 'ОШИБКА'}
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Запланировать уведомление"
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Сообщение (Опционально)</label>
                        <input
                            type="text"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Время отправки</label>
                        <input
                            type="datetime-local"
                            value={formData.scheduled_time}
                            onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                            required
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Зона вещания</label>
                        <select
                            value={formData.zone_id}
                            onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                            required
                            style={{ width: '100%' }}
                        >
                            <option value="">Выберите зону</option>
                            {zones.map(zone => (
                                <option key={zone.id} value={zone.id}>{zone.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Аудио файл</label>
                        <select
                            value={formData.audio_file_id}
                            onChange={(e) => setFormData({ ...formData, audio_file_id: e.target.value })}
                            required
                            style={{ width: '100%' }}
                        >
                            <option value="">Выберите аудио файл</option>
                            {audioFiles.map(file => (
                                <option key={file.id} value={file.id}>{file.filename}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>Отмена</Button>
                        <Button type="submit">Запланировать</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Notifications;
