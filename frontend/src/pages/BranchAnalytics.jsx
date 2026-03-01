import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { adminApi } from '../api/adminApi';

export default function BranchAnalytics() {
    const [branch, setBranch] = useState('');
    const [analytics, setData] = useState(null);
    const [graphUrl, setGraphUrl] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const branches = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE'];

    const handleFetch = async (e) => {
        e.preventDefault();
        if (!branch) return;
        setLoading(true);
        setError('');
        setGraphUrl('');
        setData(null);
        try {
            const res = await adminApi.getBranchAnalytics(branch);
            setData(res.data);

            // Graph from Python analytics service via backend proxy
            setGraphUrl(`/analytics/branch-graph/${branch}?t=${Date.now()}`);

            // Fetch AI analysis directly from the AI proxy endpoint (returns JSON { analysis: "..." })
            if (res.data.aiAnalysisUrl) {
                // The URL coming back from spring boot is e.g. "http://analytics:8000/branch-ai-analysis/CSE" 
                // However, the frontend proxy is configured to hit /analytics/
                try {
                    const aiRes = await fetch(`/analytics/branch-ai-analysis/${branch}`);
                    if (aiRes.ok) {
                        const aiData = await aiRes.json();
                        setAiAnalysis(aiData.analysis);
                    }
                } catch (errAi) {
                    console.error("AI Analysis failed:", errAi);
                    setAiAnalysis("AI Analysis could not be fetched at this time.");
                }
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch analytics');
        } finally { setLoading(false); }
    };

    return (
        <div className="page-wrapper">
            <Navbar />
            <div className="main-content">
                <div className="dashboard-header">
                    <h1>🏛️ Branch Analytics</h1>
                    <p>View the placement performance of students by branch.</p>
                </div>

                {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

                <div className="analytics-form">
                    <h3>Select Branch</h3>
                    <form onSubmit={handleFetch} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="form-label">Branch</label>
                            <select
                                id="ba-branch"
                                className="form-control"
                                value={branch}
                                onChange={e => setBranch(e.target.value)}
                                required
                            >
                                <option value="">-- Select Branch --</option>
                                {branches.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            id="ba-submit"
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !branch}
                            style={{ marginBottom: 0 }}
                        >
                            {loading ? 'Loading...' : '📊 Fetch Analytics'}
                        </button>
                    </form>
                </div>

                {analytics && (
                    <div className="stats-grid mb-6">
                        <div className="stat-card">
                            <div className="stat-icon">🏛️</div>
                            <div className="stat-value">{analytics.branch}</div>
                            <div className="stat-label">Branch</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-value">{analytics.totalStudents}</div>
                            <div className="stat-label">Total Students</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-value">{analytics.selected}</div>
                            <div className="stat-label">Students Selected</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📈</div>
                            <div className="stat-value">
                                {analytics.totalStudents > 0
                                    ? `${Math.round((analytics.selected / analytics.totalStudents) * 100)}%`
                                    : '0%'}
                            </div>
                            <div className="stat-label">Placement Rate</div>
                        </div>
                    </div>
                )}

                {graphUrl && (
                    <div className="analytics-image-container">
                        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
                            📊 Branch Placement Graph
                        </h3>
                        {loading ? (
                            <div className="loading"><div className="spinner" />Loading graph...</div>
                        ) : (
                            <img
                                id="ba-graph-img"
                                src={graphUrl}
                                alt={`Branch analytics: ${branch}`}
                                onError={e => { e.target.style.display = 'none'; }}
                                style={{ maxWidth: '100%', borderRadius: 8 }}
                            />
                        )}
                    </div>
                )}

                {aiAnalysis && (
                    <div className="card mt-6">
                        <div className="card-header" style={{ paddingBottom: '12px' }}>
                            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>✨</span> AI Placement Insights
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50" style={{ borderRadius: '0 0 8px 8px', lineHeight: '1.6', fontSize: '15px' }}>
                            {aiAnalysis.split('\n').map((paragraph, index) => (
                                <p key={index} style={{ marginBottom: paragraph ? '12px' : '0' }}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
