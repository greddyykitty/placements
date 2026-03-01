import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

export default function Register() {
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'STUDENT',
        rollNo: '', branch: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
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
            await authApi.register(form);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1800);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const isStudent = form.role === 'STUDENT';

    return (
        <div className="auth-page">
            <div className="auth-box" style={{ maxWidth: 520 }}>
                <div className="auth-logo">
                    <div className="auth-logo-icon">📝</div>
                    <h2>Create Account</h2>
                    <p>Register to access the placement portal</p>
                </div>

                {error && <div className="alert alert-error">⚠️ {error}</div>}
                {success && <div className="alert alert-success">✅ {success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid-2" style={{ marginBottom: 0 }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                id="reg-name"
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select
                                id="reg-role"
                                name="role"
                                className="form-control"
                                value={form.role}
                                onChange={handleChange}
                            >
                                <option value="STUDENT">Student</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            id="reg-email"
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="student@college.edu"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            id="reg-password"
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Minimum 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    {isStudent && (
                        <div className="grid-2" style={{ marginBottom: 0 }}>
                            <div className="form-group">
                                <label className="form-label">Roll Number</label>
                                <input
                                    id="reg-rollno"
                                    type="text"
                                    name="rollNo"
                                    className="form-control"
                                    placeholder="CS001"
                                    value={form.rollNo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Branch</label>
                                <select
                                    id="reg-branch"
                                    name="branch"
                                    className="form-control"
                                    value={form.branch}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Branch</option>
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="ME">ME</option>
                                    <option value="CE">CE</option>
                                    <option value="IT">IT</option>
                                    <option value="EEE">EEE</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <button
                        id="reg-submit"
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account →'}
                    </button>
                </form>

                <div className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
