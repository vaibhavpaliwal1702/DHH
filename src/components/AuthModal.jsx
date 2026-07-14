import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthModal.css';

function AuthModal({ onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (password) => {
        if (password.includes(' ') || password.includes('\t')) return 'Password cannot contain spaces or tabs.';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
        if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least one special character.';
        return null;
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.email || !form.password) {
            setError('Email and password are required.');
            return;
        }
        if (!validateEmail(form.email)) {
            setError('Enter a valid email address.');
            return;
        }
        const passwordError = validatePassword(form.password);
        if (passwordError) {
            setError(passwordError);
            return;
        }
        if (!isLogin && !form.username) {
            setError('Username is required.');
            return;
        }
        setLoading(true);
        const endpoint = isLogin ? '/auth/login' : '/auth/signup';
        const body = isLogin
            ? { email: form.email, password: form.password }
            : { username: form.username, email: form.email, password: form.password };

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong');
            } else {
                login(data.user);
                onClose();
            }
        } catch (err) {
            setError('Network error. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>
                <button className="auth-close" onClick={onClose}>×</button>
                <h2 className="auth-title">{isLogin ? 'Log In' : 'Sign Up'}</h2>

                {!isLogin && (
                    <input
                        className="auth-input"
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                    />
                )}
                <input
                    className="auth-input"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />
                <input
                    className="auth-input"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                />

                {error && <p className="auth-error">{error}</p>}

                <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
                </button>

                <p className="auth-toggle">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                        {isLogin ? ' Sign Up' : ' Log In'}
                    </span>
                </p>
            </div>
        </div>
    );
}

export default AuthModal;