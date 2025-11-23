import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import AudioRecorder from './AudioRecorder';
import api from '../services/api';
import './ManualNotificationModal.css';

const ManualNotificationModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [audioSource, setAudioSource] = useState(null);
    const [recordedFile, setRecordedFile] = useState(null);
    const [selectedFileId, setSelectedFileId] = useState('');
    const [audioFiles, setAudioFiles] = useState([]);
    const [zones, setZones] = useState([]);
    const [isRecorderOpen, setIsRecorderOpen] = useState(false);

    const [formData, setFormData] = useState({
        message: '',
        scheduled_time: '',
        zone_id: '',
        is_recurring: false,
        recurrence_pattern: '',
        recurrence_end_date: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchAudioFiles();
            fetchZones();
        }
    }, [isOpen]);

    const fetchAudioFiles = async () => {
        try {
            const response = await api.get('/audio/');
            setAudioFiles(response.data);
        } catch (error) {
            console.error('Error fetching audio files:', error);
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

    const handleRecordingComplete = (file) => {
        setRecordedFile(file);
        setAudioSource('recorded');
        setStep(2);
    };

    const handleSelectExisting = () => {
        if (!selectedFileId) {
            alert('Выберите аудиофайл');
            return;
        }
        setAudioSource('existing');
        setStep(2);
    };

    const handleSubmit = async () => {
        try {
            let audioFileId = selectedFileId;

            if (audioSource === 'recorded' && recordedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', recordedFile);

                const uploadResponse = await api.post('/audio/upload', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                audioFileId = uploadResponse.data.id;
            }

            const notificationData = {
                ...formData,
                audio_file_id: parseInt(audioFileId),
                zone_id: parseInt(formData.zone_id),
                scheduled_time: new Date(formData.scheduled_time).toISOString(),
                recurrence_end_date: formData.recurrence_end_date ?
                    new Date(formData.recurrence_end_date).toISOString() : null
            };

            await api.post('/notifications/', notificationData);
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error creating notification:', error);
            alert('Ошибка при создании уведомления');
        }
    };

    const handleClose = () => {
        setStep(1);
        setAudioSource(null);
        setRecordedFile(null);
        setSelectedFileId('');
        setFormData({
            message: '',
            scheduled_time: '',
            zone_id: '',
            is_recurring: false,
            recurrence_pattern: '',
            recurrence_end_date: ''
        });
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} title="📢 Создать уведомление">
                <div className="manual-notification-modal">
                    {step === 1 && (
                        <div className="step-audio-select">
                            <h3>Шаг 1: Выберите аудио</h3>

                            <div className="audio-options">
                                <div className="audio-option-card">
                                    <h4>🎤 Записать новое</h4>
                                    <p>Запишите голосовое сообщение прямо в браузере</p>
                                    <Button onClick={() => setIsRecorderOpen(true)} variant="primary">
                                        Начать запись
                                    </Button>
                                </div>

                                <div className="divider">или</div>

                                <div className="audio-option-card">
                                    <h4>📁 Выбрать существующий</h4>
                                    <p>Используйте ранее загруженный файл</p>
                                    <select
                                        value={selectedFileId}
                                        onChange={(e) => setSelectedFileId(e.target.value)}
                                        className="audio-select"
                                    >
                                        <option value="">Выберите файл...</option>
                                        {audioFiles.map(file => (
                                            <option key={file.id} value={file.id}>
                                                {file.filename}
                                            </option>
                                        ))}
                                    </select>
                                    <Button onClick={handleSelectExisting} variant="primary" disabled={!selectedFileId}>
                                        Продолжить
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-notification-details">
                            <h3>Шаг 2: Настройка уведомления</h3>

                            <div className="form-group">
                                <label>Зона вещания *</label>
                                <select
                                    value={formData.zone_id}
                                    onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                                    required
                                >
                                    <option value="">Выберите зону...</option>
                                    {zones.map(zone => (
                                        <option key={zone.id} value={zone.id}>
                                            {zone.name} - {zone.location}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Время трансляции *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduled_time}
                                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Сообщение (опционально)</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Текстовое описание уведомления..."
                                    rows="3"
                                />
                            </div>

                            <div className="recurring-section">
                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_recurring}
                                            onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                                        />
                                        <span>Периодическое уведомление</span>
                                    </label>
                                </div>

                                {formData.is_recurring && (
                                    <>
                                        <div className="form-group">
                                            <label>Частота повторения</label>
                                            <select
                                                value={formData.recurrence_pattern}
                                                onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                                            >
                                                <option value="">Выберите...</option>
                                                <option value="daily">Ежедневно</option>
                                                <option value="weekly">Еженедельно</option>
                                                <option value="monthly">Ежемесячно</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Дата окончания (опционально)</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.recurrence_end_date}
                                                onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="modal-actions">
                                <Button onClick={() => setStep(1)} variant="secondary">
                                    ← Назад
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    variant="primary"
                                    disabled={!formData.zone_id || !formData.scheduled_time}
                                >
                                    Создать уведомление
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            <AudioRecorder
                isOpen={isRecorderOpen}
                onClose={() => setIsRecorderOpen(false)}
                onRecordingComplete={handleRecordingComplete}
            />
        </>
    );
};

export default ManualNotificationModal;
