import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { adminApi } from '../api/adminApi';

export default function StudentAnalytics() {
    const [rollNo, setRollNo] = useState('');
    const [analytics, setData] = useState(null);
    const [graphUrl, setGraphUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetch = async (e) => {
        e.preventDefault();
        if (!rollNo.trim()) return;
        setLoading(true);
        setError('');
        setGraphUrl('');
        setData(null);
        try {
            const res = await adminApi.getStudentAnalytics(rollNo.trim());
            setData(res.data);
            setGraphUrl(`/analytics/student-graph/${rollNo.trim()}?t=${Date.now()}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Student not found or no data');
        } finally { setLoading(false); }
    };

    return (
        <div className="page-wrapper">
            <Navbar />
            <div className="main-content">
                <div className="dashboard-header">
                    <h1>👤 Student Analytics</h1>
                    <p>View the full placement history and status for an individual student.</p>
                </div>

                {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

                <div className="analytics-form">
                    <h3>Search Student by Roll Number</h3>
                    <form onSubmit={handleFetch} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="form-label">Roll Number</label>
                            <input
                                id="sa-rollno"
                                type="text"
                                className="form-control"
                                placeholder="E.g. CS001"
                                value={rollNo}
                                onChange={e => setRollNo(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            id="sa-submit"
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !rollNo.trim()}
                            style={{ marginBottom: 0 }}
                        >
                            {loading ? 'Loading...' : '🔍 Search'}
                        </button>
                    </form>
                </div>

                {analytics && (
                    <>
                        <div className="stats-grid mb-6">
                            <div className="stat-card">
                                <div className="stat-icon">👤</div>
                                <div className="stat-value" style={{ fontSize: 20 }}>{analytics.studentName}</div>
                                <div className="stat-label">Student Name</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🆔</div>
                                <div className="stat-value" style={{ fontSize: 20 }}>{analytics.rollNo}</div>
                                <div className="stat-label">Roll Number</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📋</div>
                                <div className="stat-value">{analytics.totalApplications}</div>
                                <div className="stat-label">Total Applications</div>
                            </div>
                        </div>

                        {analytics.statusBreakdown && Object.keys(analytics.statusBreakdown).length > 0 && (
                            <div className="card mb-6">
                                <div className="card-header">
                                    <div className="card-title">Application Status Breakdown</div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
                                        const colorMap = {
                                            APPLIED: '#6366f1', ONGOING: '#f59e0b',
                                            SELECTED: '#10b981', REJECTED: '#ef4444'
                                        };
                                        return (
                                            <div key={status} style={{
                                                background: 'var(--bg-elevated)',
                                                border: `1px solid ${colorMap[status] || 'var(--border)'}40`,
                                                borderRadius: 'var(--radius-md)',
                                                padding: '16px 24px',
                                                textAlign: 'center',
                                                minWidth: 100,
                                            }}>
                                                <div style={{ fontSize: 28, fontWeight: 800, color: colorMap[status] || 'var(--text-primary)' }}>
                                                    {count}
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                                    {status}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {graphUrl && (
                    <div className="analytics-image-container">
                        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
                            📊 Student Application History Graph
                        </h3>
                        <img
                            id="sa-graph-img"
                            src={graphUrl}
                            alt={`Student analytics: ${rollNo}`}
                            onError={e => { e.target.style.display = 'none'; }}
                            style={{ maxWidth: '100%', borderRadius: 8 }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
