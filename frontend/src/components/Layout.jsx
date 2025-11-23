import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBroadcastTower, FaMusic, FaBell, FaHome } from 'react-icons/fa';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: <FaHome />, label: 'Дашборд' },
        { path: '/zones', icon: <FaBroadcastTower />, label: 'Зоны вещания' },
        { path: '/audio', icon: <FaMusic />, label: 'Аудио библиотека' },
        { path: '/notifications', icon: <FaBell />, label: 'Уведомления' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside className="glass" style={{ width: '250px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    <FaBroadcastTower />
                    <span>UniAudio</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <div className="container">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
