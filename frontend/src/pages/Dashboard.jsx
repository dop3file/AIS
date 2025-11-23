import React, { useState, useEffect } from 'react';
import { FaBroadcastTower, FaMusic, FaBell } from 'react-icons/fa';
import api from '../services/api';
import Card from '../components/Card';

const Dashboard = () => {
    const [stats, setStats] = useState({ zones: 0, audio: 0, notifications: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [zonesRes, audioRes, notifRes] = await Promise.all([
                    api.get('/zones/'),
                    api.get('/audio/'),
                    api.get('/notifications/')
                ]);
                setStats({
                    zones: zonesRes.data.length,
                    audio: audioRes.data.length,
                    notifications: notifRes.data.length
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon, color }) => (
        <Card style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
                width: '64px', height: '64px',
                borderRadius: '1rem', backgroundColor: `${color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', color: color
            }}>
                {icon}
            </div>
            <div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>{title}</p>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '1' }}>{value}</h2>
            </div>
        </Card>
    );

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Дашборд</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard title="Активные зоны" value={stats.zones} icon={<FaBroadcastTower />} color="#6366f1" />
                <StatCard title="Аудио файлы" value={stats.audio} icon={<FaMusic />} color="#ec4899" />
                <StatCard title="Запланированные уведомления" value={stats.notifications} icon={<FaBell />} color="#22c55e" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <Card>
                    <h3 style={{ marginBottom: '1rem' }}>Статус системы</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                        Все системы работают нормально
                    </div>
                </Card>

                <Card>
                    <h3 style={{ marginBottom: '1rem' }}>Быстрые действия</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Выберите модуль в боковом меню, чтобы начать работу.</p>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
