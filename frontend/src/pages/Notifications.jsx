import React, { useState, useEffect } from 'react';
import { FaPlus, FaBell, FaMicrophone, FaRedo } from 'react-icons/fa';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import ManualNotificationModal from '../components/ManualNotificationModal';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications/');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            sent: { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)', text: 'ОТПРАВЛЕНО' },
            pending: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', text: 'ОЖИДАЕТ' },
            failed: { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', text: 'ОШИБКА' }
        };
        const style = styles[status] || styles.pending;

        return (
            <div style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                backgroundColor: style.bg,
                color: style.color
            }}>
                {style.text}
            </div>
        );
    };

    const getRecurrenceBadge = (pattern) => {
        const labels = {
            daily: '📅 Ежедневно',
            weekly: '📆 Еженедельно',
            monthly: '📆 Ежемесячно'
        };

        return (
            <div style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: '#8b5cf6',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
            }}>
                <FaRedo style={{ fontSize: '0.7rem' }} />
                {labels[pattern] || pattern}
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Уведомления</h1>
                <Button onClick={() => setIsManualModalOpen(true)}>
                    <FaMicrophone /> Создать уведомление
                </Button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {notifications.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '3rem' }}>
                        <FaBell style={{ fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Нет запланированных уведомлений. Создайте первое!
                        </p>
                    </Card>
                ) : (
                    notifications.map((notification) => (
                        <Card key={notification.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--color-success)'
                                }}>
                                    <FaBell />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <h3 style={{ fontSize: '1rem', margin: 0 }}>
                                            {notification.message || 'Аудио уведомление'}
                                        </h3>
                                        {notification.is_recurring && getRecurrenceBadge(notification.recurrence_pattern)}
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                        Запланировано на: {new Date(notification.scheduled_time).toLocaleString('ru-RU')}
                                    </p>
                                    {notification.is_recurring && notification.recurrence_end_date && (
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>
                                            До: {new Date(notification.recurrence_end_date).toLocaleString('ru-RU')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                {getStatusBadge(notification.status)}
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <ManualNotificationModal
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
                onSuccess={fetchNotifications}
            />
        </div>
    );
};

export default Notifications;
