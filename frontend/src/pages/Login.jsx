import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <Card className="login-card">
                <h1>🎵 University Audio System</h1>
                <h2>Вход в систему</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <Button type="submit" disabled={loading} className="login-button">
                        {loading ? 'Вход...' : 'Войти'}
                    </Button>
                </form>

                <p className="register-link">
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </p>
            </Card>
        </div>
    );
};

export default Login;
