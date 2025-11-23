import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import './AudioRecorder.css';

const AudioRecorder = ({ isOpen, onClose, onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Не удалось получить доступ к микрофону. Проверьте разрешения.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleUseRecording = () => {
        if (audioBlob) {
            const file = new File([audioBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
            onRecordingComplete(file);
            handleClose();
        }
    };

    const handleClose = () => {
        if (isRecording) {
            stopRecording();
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        onClose();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="🎙️ Запись аудио">
            <div className="audio-recorder">
                {!isRecording && !audioBlob && (
                    <div className="recorder-start">
                        <p>Нажмите кнопку для начала записи голосового сообщения</p>
                        <Button onClick={startRecording} variant="primary" className="record-btn">
                            🎤 Начать запись
                        </Button>
                    </div>
                )}

                {isRecording && (
                    <div className="recording-active">
                        <div className="pulse-container">
                            <div className="pulse-dot"></div>
                        </div>
                        <div className="recording-time">{formatTime(recordingTime)}</div>
                        <p>Запись идет...</p>
                        <Button onClick={stopRecording} variant="danger">
                            ⏹ Остановить запись
                        </Button>
                    </div>
                )}

                {audioBlob && !isRecording && (
                    <div className="audio-preview">
                        <h3>Предпросмотр записи</h3>
                        <audio src={audioUrl} controls className="audio-player" />
                        <div className="preview-actions">
                            <Button onClick={() => {
                                setAudioBlob(null);
                                setAudioUrl(null);
                                setRecordingTime(0);
                            }} variant="secondary">
                                🔄 Перезаписать
                            </Button>
                            <Button onClick={handleUseRecording} variant="primary">
                                ✓ Использовать запись
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AudioRecorder;
