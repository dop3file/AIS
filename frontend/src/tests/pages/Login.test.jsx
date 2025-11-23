import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { AuthProvider } from '../../contexts/AuthContext';

const MockedLogin = () => (
    <BrowserRouter>
        <AuthProvider>
            <Login />
        </AuthProvider>
    </BrowserRouter>
);

describe('Login Component', () => {
    it('renders login form', () => {
        render(<MockedLogin />);
        expect(screen.getByText(/Вход в систему/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
    });

    it('shows login button', () => {
        render(<MockedLogin />);
        const loginButton = screen.getByRole('button', { name: /Войти/i });
        expect(loginButton).toBeInTheDocument();
    });

    it('shows link to registration', () => {
        render(<MockedLogin />);
        expect(screen.getByText(/Нет аккаунта/i)).toBeInTheDocument();
        expect(screen.getByText(/Зарегистрироваться/i)).toBeInTheDocument();
    });

    it('has email input', () => {
        render(<MockedLogin />);
        const emailInput = screen.getByRole('textbox', { type: /email/i });
        expect(emailInput).toBeInTheDocument();
    });

    it('has password input', () => {
        render(<MockedLogin />);
        // Password inputs don't have a specific role, so we find by type
        const inputs = document.querySelectorAll('input[type="password"]');
        expect(inputs.length).toBeGreaterThan(0);
    });
});
