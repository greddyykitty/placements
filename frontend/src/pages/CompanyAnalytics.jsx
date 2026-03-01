import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { adminApi } from '../api/adminApi';

export default function CompanyAnalytics() {
    const [companyName, setCompanyName] = useState('');
    const [analytics, setData] = useState(null);
    const [graphUrl, setGraphUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetch = async (e) => {
        e.preventDefault();
        if (!companyName.trim()) return;
        setLoading(true);
        setError('');
        setGraphUrl('');
        setData(null);
        try {
            const res = await adminApi.getCompanyAnalytics(encodeURIComponent(companyName.trim()));
            setData(res.data);
            setGraphUrl(`/analytics/company/${encodeURIComponent(companyName.trim())}?t=${Date.now()}`);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Company not found');
        } finally { setLoading(false); }
    };

    return (
        <div className="page-wrapper">
            <Navbar />
            <div className="main-content">
                <div className="dashboard-header">
                    <h1>🏢 Company Analytics</h1>
                    <p>View application status distribution for a specific company's drives.</p>
                </div>

                {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

                <div className="analytics-form">
                    <h3>Search by Company</h3>
                    <form onSubmit={handleFetch} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="form-label">Company Name</label>
                            <input
                                id="ca-company-name"
                                type="text"
                                className="form-control"
                                placeholder="e.g. Google, Infosys"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            id="ca-submit"
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !companyName.trim()}
                            style={{ marginBottom: 0 }}
                        >
                            {loading ? 'Loading...' : '📊 Fetch Analytics'}
                        </button>
                    </form>
                </div>

                {analytics && (
                    <>
                        <div className="stats-grid mb-6">
                            <div className="stat-card">
                                <div className="stat-icon">🏢</div>
                                <div className="stat-value" style={{ fontSize: 18 }}>{analytics.companyName || companyName}</div>
                                <div className="stat-label">Company</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-value">{analytics.totalDrives}</div>
                                <div className="stat-label">Total Drives</div>
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
                                    <div className="card-title">Status Breakdown</div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                                        <div key={status} style={{
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: '16px 24px',
                                            textAlign: 'center',
                                            minWidth: 120,
                                        }}>
                                            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
                                                {count}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                                {status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {graphUrl && (
                    <div className="analytics-image-container">
                        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
                            📊 Company Application Status Chart
                        </h3>
                        <img
                            id="ca-graph-img"
                            src={graphUrl}
                            alt={`Company analytics: ${companyName}`}
                            onError={e => { e.target.style.display = 'none'; }}
                            style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8 }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
