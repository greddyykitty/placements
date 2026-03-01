import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { studentApi } from '../api/studentApi';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState('drives');
    const [drives, setDrives] = useState([]);
    const [applications, setApps] = useState([]);
    const [notifications, setNotifs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
    const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 4000); };

    const loadDrives = useCallback(async () => {
        try {
            const res = await studentApi.getEligibleDrives();
            setDrives(res.data);
        } catch { /* silent */ }
    }, []);

    const loadApplications = useCallback(async () => {
        try {
            const res = await studentApi.getMyApplications();
            setApps(res.data);
        } catch { /* silent */ }
    }, []);

    const loadNotifications = useCallback(async () => {
        try {
            const res = await studentApi.getMyNotifications();
            setNotifs(res.data);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        loadDrives();
        loadApplications();
        loadNotifications();
    }, [loadDrives, loadApplications, loadNotifications]);

    const handleApply = async (driveId) => {
        setLoading(true);
        try {
            await studentApi.apply(driveId);
            showSuccess('Application submitted successfully!');
            loadApplications();
            loadDrives();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to apply');
        } finally { setLoading(false); }
    };

    const getBadgeClass = (val) => {
        const map = {
            APPLIED: 'badge-applied', ONGOING: 'badge-ongoing',
            SELECTED: 'badge-selected', REJECTED: 'badge-rejected',
            OPEN: 'badge-open', CLOSED: 'badge-closed',
            UNREAD: 'badge-unread', READ: 'badge-read',
        };
        return `badge ${map[val] || ''}`;
    };

    const getApplicationForDrive = (driveId) =>
        applications.find(a => a.drive?.id === driveId);

    const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

    return (
        <div className="page-wrapper">
            <Navbar />
            <div className="main-content">
                <div className="dashboard-header">
                    <h1>👋 Hello, {user?.name}</h1>
                    <p>Track your placement drives, applications & notifications below.</p>
                </div>

                {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}
                {success && <div className="alert alert-success mb-4">✅ {success}</div>}

                {/* Stats */}
                <div className="stats-grid mb-6">
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-value">{drives.length}</div>
                        <div className="stat-label">Eligible Drives</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-value">{applications.length}</div>
                        <div className="stat-label">Applications</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">
                            {applications.filter(a => a.status === 'SELECTED').length}
                        </div>
                        <div className="stat-label">Selected</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔔</div>
                        <div className="stat-value">{unreadCount}</div>
                        <div className="stat-label">Unread Notifications</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button className={`tab ${tab === 'drives' ? 'active' : ''}`} onClick={() => setTab('drives')}>
                        🎯 Eligible Drives
                    </button>
                    <button className={`tab ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')}>
                        📋 My Applications
                    </button>
                    <button className={`tab ${tab === 'notifications' ? 'active' : ''}`} onClick={() => setTab('notifications')}>
                        🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </button>
                </div>

                {/* Eligible Drives */}
                {tab === 'drives' && (
                    <div>
                        {drives.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🎯</div>
                                <h3>No Eligible Drives</h3>
                                <p>You will appear here when admin uploads eligibility for your roll number.</p>
                            </div>
                        ) : (
                            <div className="drive-grid">
                                {drives.map(drive => (
                                    <div key={drive.id} className="drive-card">
                                        <div className="drive-card-company">
                                            {drive.company?.name || `Drive #${drive.id}`}
                                        </div>
                                        <div className="drive-card-meta">
                                            📍 {drive.company?.location || 'N/A'}
                                        </div>
                                        <div className="drive-card-meta">
                                            💰 {drive.company?.packageAmount ? `${drive.company.packageAmount} LPA` : 'N/A'}
                                        </div>
                                        <div className="drive-card-meta">
                                            📝 {drive.company?.description || ''}
                                        </div>
                                        <div className="drive-card-footer">
                                            <div>
                                                <span className={getBadgeClass(drive.status)}>{drive.status}</span>
                                                <span className="text-muted" style={{ marginLeft: 8, fontSize: 12 }}>
                                                    {drive.driveDate}
                                                </span>
                                            </div>
                                            {(() => {
                                                const app = getApplicationForDrive(drive.id);
                                                if (app) {
                                                    return (
                                                        <span className={getBadgeClass(app.status)}>
                                                            {app.status}
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        id={`apply-${drive.id}`}
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleApply(drive.id)}
                                                        disabled={loading}
                                                    >
                                                        Apply Now
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* My Applications */}
                {tab === 'applications' && (
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">My Applications</div>
                            <div className="card-subtitle">{applications.length} applications submitted</div>
                        </div>
                        {applications.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📋</div>
                                <h3>No Applications Yet</h3>
                                <p>Apply to eligible drives to see them here.</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Company</th>
                                            <th>Drive Date</th>
                                            <th>Status</th>
                                            <th>Offer Letter</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map(app => (
                                            <tr key={app.id}>
                                                <td>#{app.id}</td>
                                                <td>{app.drive?.company?.name || '—'}</td>
                                                <td>{app.drive?.driveDate || '—'}</td>
                                                <td>
                                                    <span className={getBadgeClass(app.status)}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {app.offerLetterUrl ? (
                                                        <a href={app.offerLetterUrl} target="_blank" rel="noreferrer"
                                                            style={{ color: 'var(--primary-light)', fontSize: 13 }}>
                                                            Download
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Notifications */}
                {tab === 'notifications' && (
                    <div>
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🔔</div>
                                <h3>No Notifications</h3>
                                <p>You'll receive notifications when drives are added or status changes.</p>
                            </div>
                        ) : (
                            <div className="notification-list">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`notification-item ${n.status === 'UNREAD' ? 'unread' : ''}`}
                                    >
                                        <div className="notification-icon">
                                            {n.status === 'UNREAD' ? '🔔' : '🔕'}
                                        </div>
                                        <div className="notification-body">
                                            <div className="notification-message">{n.message}</div>
                                            <div className="notification-time">
                                                <span className={getBadgeClass(n.status)}>{n.status}</span>
                                                {n.createdAt && (
                                                    <span style={{ marginLeft: 8 }}>
                                                        {new Date(n.createdAt).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
