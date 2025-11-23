import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBroadcastTower, FaMusic, FaBell, FaHome, FaUser, FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/', icon: <FaHome />, label: 'Дашборд' },
        { path: '/zones', icon: <FaBroadcastTower />, label: 'Зоны вещания' },
        { path: '/audio', icon: <FaMusic />, label: 'Аудио библиотека' },
        { path: '/notifications', icon: <FaBell />, label: 'Уведомления' },
    ];

    if (user?.role === 'admin') {
        navItems.push({ path: '/admin', icon: <FaUserShield />, label: 'Админ панель' });
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside className="glass" style={{ width: '250px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    <FaBroadcastTower />
                    <span>UniAudio</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: location.pathname === item.path ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {user && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', marginBottom: '0.5rem' }}>
                            <FaUser style={{ color: 'var(--color-primary)' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{user.username}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--danger)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.9375rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            <FaSignOutAlt />
                            <span>Выйти</span>
                        </button>
                    </div>
                )}
            </aside>

            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <div className="container">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
