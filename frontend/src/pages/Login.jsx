import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await authApi.login(form);
            const data = res.data;
            login({
                name: data.name,
                email: data.email,
                role: data.role,
                id: data.id,
                branch: data.branch,
                rollNo: data.rollNo,
            }, data.token);
            navigate(data.role === 'ADMIN' ? '/admin' : '/student');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <div className="auth-logo">
                    <div className="auth-logo-icon">🎓</div>
                    <h2>Placement MS</h2>
                    <p>Sign in to your account</p>
                </div>

                {error && (
                    <div className="alert alert-error">⚠️ {error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="admin@college.edu"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button
                        id="login-submit"
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In →'}
                    </button>
                </form>

                <div className="auth-switch">
                    Don't have an account? <Link to="/register">Register here</Link>
                </div>
            </div>
        </div>
    );
}
