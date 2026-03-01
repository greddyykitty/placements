import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTS = ['APPLIED', 'ONGOING', 'REJECTED', 'SELECTED'];

export default function AdminDashboard() {
    const { user } = useAuth();

    // State
    const [tab, setTab] = useState('companies');
    const [applications, setApps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Company form
    const [companyForm, setCompanyForm] = useState({
        name: '', location: '', packageAmount: '', description: ''
    });

    // Drive form
    const [companies, setCompanies] = useState([]);
    const [driveForm, setDriveForm] = useState({
        companyName: '', driveDate: '', status: 'OPEN'
    });

    // Eligibility
    const [eligCompanyName, setEligCompanyName] = useState('');
    const [eligDriveDate, setEligDriveDate] = useState('');
    const [eligFile, setEligFile] = useState(null);

    // Shortlist
    const [shortlistCompanyName, setShortlistCompanyName] = useState('');
    const [shortlistDriveDate, setShortlistDriveDate] = useState('');
    const [shortlistStatus, setShortlistStatus] = useState('SELECTED');
    const [shortlistFile, setShortlistFile] = useState(null);

    // Application filter
    const [filterCompanyName, setFilterCompanyName] = useState('');
    const [filterDriveDate, setFilterDriveDate] = useState('');

    const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
    const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 4000); };

    const loadApplications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminApi.getApplications();
            setApps(res.data);
            setFilterCompanyName('');
            setFilterDriveDate('');
            showSuccess('Showing all applications');
        } catch {
            showError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearchDriveApplications = async (e) => {
        e.preventDefault();
        if (!filterCompanyName || !filterDriveDate) {
            showError('Please provide both Company Name and Drive Date to search');
            return;
        }

        try {
            setLoading(true);
            const res = await adminApi.getApplicationsByDrive(filterCompanyName, filterDriveDate);
            setApps(res.data);
            showSuccess(`Showing applications for ${filterCompanyName} on ${filterDriveDate}`);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to search drive applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, [loadApplications]);

    // Add company
    const handleAddCompany = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await adminApi.addCompany({
                name: companyForm.name,
                location: companyForm.location,
                packageAmount: parseFloat(companyForm.packageAmount),
                description: companyForm.description,
            });
            setCompanies(prev => [...prev, res.data]);
            showSuccess('Company added successfully!');
            setCompanyForm({ name: '', location: '', packageAmount: '', description: '' });
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to add company');
        } finally { setLoading(false); }
    };

    // Add drive
    const handleAddDrive = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminApi.createDrive({
                companyName: driveForm.companyName,
                driveDate: driveForm.driveDate,
                status: driveForm.status,
            });
            showSuccess('Drive created successfully!');
            setDriveForm({ companyName: '', driveDate: '', status: 'OPEN' });
        } catch (err) {
            showError(err.response?.data?.message || err.response?.data?.error || 'Failed to create drive');
        } finally { setLoading(false); }
    };

    // Upload eligibility
    const handleUploadEligibility = async (e) => {
        e.preventDefault();
        if (!eligFile || !eligCompanyName || !eligDriveDate) {
            showError('Provide Company Name, Drive Date and CSV file');
            return;
        }
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('file', eligFile);
            const res = await adminApi.uploadEligibility(eligCompanyName, eligDriveDate, fd);
            showSuccess(`Eligibility uploaded: ${res.data.recordsAdded} records added`);
            setEligCompanyName('');
            setEligDriveDate('');
            setEligFile(null);
        } catch (err) {
            showError(err.response?.data?.message || err.response?.data?.error || 'Upload failed');
        } finally { setLoading(false); }
    };

    // Upload shortlist
    const handleUploadShortlist = async (e) => {
        e.preventDefault();
        if (!shortlistFile || !shortlistCompanyName || !shortlistDriveDate) {
            showError('Provide Company Name, Drive Date and CSV file');
            return;
        }
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('file', shortlistFile);
            const res = await adminApi.uploadShortlist(shortlistCompanyName, shortlistDriveDate, shortlistStatus, fd);
            showSuccess(`Shortlist processed: ${res.data.shortlistedCount} Selected, ${res.data.rejectedCount} Rejected. (${res.data.totalProcessed} Total)`);
            setShortlistCompanyName('');
            setShortlistDriveDate('');
            setShortlistStatus('SELECTED');
            setShortlistFile(null);
            loadApplications();
        } catch (err) {
            showError(err.response?.data?.message || err.response?.data?.error || 'Shortlist upload failed');
        } finally { setLoading(false); }
    };

    // Update application status
    const handleStatusChange = async (appId, newStatus) => {
        try {
            await adminApi.updateApplicationStatus(appId, newStatus);
            showSuccess('Status updated');
            loadApplications();
        } catch (err) {
            showError('Failed to update status');
        }
    };

    const getBadgeClass = (val) => {
        const map = {
            APPLIED: 'badge-applied', ONGOING: 'badge-ongoing',
            SELECTED: 'badge-selected', REJECTED: 'badge-rejected',
            OPEN: 'badge-open', CLOSED: 'badge-closed',
        };
        return `badge ${map[val] || ''}`;
    };

    return (
        <div className="page-wrapper">
            <Navbar />
            <div className="main-content">
                <div className="dashboard-header">
                    <h1>👋 Welcome, {user?.name}</h1>
                    <p>Manage companies, drives, eligibility, and applications from here.</p>
                </div>

                {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}
                {success && <div className="alert alert-success mb-4">✅ {success}</div>}

                {/* Stats */}
                <div className="stats-grid mb-6">
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-value">{applications.length}</div>
                        <div className="stat-label">Total Applications</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">
                            {applications.filter(a => a.status === 'SELECTED').length}
                        </div>
                        <div className="stat-label">Selected</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-value">
                            {applications.filter(a => a.status === 'ONGOING').length}
                        </div>
                        <div className="stat-label">Ongoing</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">❌</div>
                        <div className="stat-value">
                            {applications.filter(a => a.status === 'REJECTED').length}
                        </div>
                        <div className="stat-label">Rejected</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {[
                        { key: 'companies', label: '🏢 Add Company' },
                        { key: 'drives', label: '📅 Add Drive' },
                        { key: 'eligibility', label: '📤 Upload Eligibility' },
                        { key: 'shortlist', label: '🏆 Upload Shortlist' },
                        { key: 'applications', label: '📋 Applications' },
                    ].map(t => (
                        <button
                            key={t.key}
                            className={`tab ${tab === t.key ? 'active' : ''}`}
                            onClick={() => setTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Add Company */}
                {tab === 'companies' && (
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Add New Company</div>
                            <div className="card-subtitle">Create a company profile for recruitment drives</div>
                        </div>
                        <form onSubmit={handleAddCompany}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Company Name</label>
                                    <input
                                        id="co-name"
                                        type="text"
                                        className="form-control"
                                        placeholder="Google"
                                        value={companyForm.name}
                                        onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input
                                        id="co-location"
                                        type="text"
                                        className="form-control"
                                        placeholder="Bangalore"
                                        value={companyForm.location}
                                        onChange={e => setCompanyForm({ ...companyForm, location: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Package (LPA)</label>
                                <input
                                    id="co-package"
                                    type="number"
                                    className="form-control"
                                    placeholder="12.5"
                                    step="0.1"
                                    value={companyForm.packageAmount}
                                    onChange={e => setCompanyForm({ ...companyForm, packageAmount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    id="co-desc"
                                    rows={3}
                                    className="form-control"
                                    placeholder="Company description..."
                                    value={companyForm.description}
                                    onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                            <button
                                id="co-submit"
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : '+ Add Company'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Add Drive */}
                {tab === 'drives' && (
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Create Placement Drive</div>
                            <div className="card-subtitle">Schedule a drive for a company</div>
                        </div>
                        <form onSubmit={handleAddDrive}>
                            <div className="form-group">
                                <label className="form-label">Company Name</label>
                                <input
                                    id="dr-company"
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Google, Infosys"
                                    value={driveForm.companyName}
                                    onChange={e => setDriveForm({ ...driveForm, companyName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Drive Date</label>
                                    <input
                                        id="dr-date"
                                        type="date"
                                        className="form-control"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={driveForm.driveDate}
                                        onChange={e => setDriveForm({ ...driveForm, driveDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        id="dr-status"
                                        className="form-control"
                                        value={driveForm.status}
                                        onChange={e => setDriveForm({ ...driveForm, status: e.target.value })}
                                    >
                                        <option value="OPEN">OPEN</option>
                                        <option value="CLOSED">CLOSED</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                id="dr-submit"
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : '+ Create Drive'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Upload Eligibility */}
                {tab === 'eligibility' && (
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Upload Eligibility CSV</div>
                            <div className="card-subtitle">Upload a CSV with roll numbers to mark eligible students</div>
                        </div>
                        <form onSubmit={handleUploadEligibility}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Company Name</label>
                                    <input
                                        id="elig-company"
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Google"
                                        value={eligCompanyName}
                                        onChange={e => setEligCompanyName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Drive Date</label>
                                    <input
                                        id="elig-date"
                                        type="date"
                                        className="form-control"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={eligDriveDate}
                                        onChange={e => setEligDriveDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">CSV File (column: rollNo)</label>
                                <input
                                    id="elig-file"
                                    type="file"
                                    accept=".csv"
                                    className="form-control"
                                    onChange={e => setEligFile(e.target.files[0])}
                                    required
                                />
                            </div>
                            <p className="text-muted mb-4">
                                CSV format: one header row with <strong>rollNo</strong>, then one roll number per row.
                            </p>
                            <button
                                id="elig-submit"
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Uploading...' : '⬆ Upload CSV'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Upload Shortlist */}
                {tab === 'shortlist' && (
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Upload Shortlist CSV</div>
                            <div className="card-subtitle">Upload a CSV to bulk accept/reject students for a drive</div>
                        </div>
                        <form onSubmit={handleUploadShortlist}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Company Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Google"
                                        value={shortlistCompanyName}
                                        onChange={e => setShortlistCompanyName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Drive Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={shortlistDriveDate}
                                        onChange={e => setShortlistDriveDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Target Status for Roll Nos in CSV</label>
                                    <select
                                        className="form-control"
                                        value={shortlistStatus}
                                        onChange={e => setShortlistStatus(e.target.value)}
                                    >
                                        <option value="SELECTED">SELECTED</option>
                                        <option value="ONGOING">ONGOING</option>
                                    </select>
                                    <small className="text-muted mt-1 display-block">
                                        Students NOT in the CSV will automatically be marked as REJECTED.
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">CSV File (column: rollNo)</label>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="form-control"
                                        onChange={e => setShortlistFile(e.target.files[0])}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : '🏆 Process Shortlist'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Applications */}
                {
                    tab === 'applications' && (
                        <div className="card">
                            <div className="card-header">
                                <div className="flex-between">
                                    <div>
                                        <div className="card-title">Student Applications</div>
                                        <div className="card-subtitle">{applications.length} applications found</div>
                                    </div>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={loadApplications}
                                    >
                                        🔄 View All Applications
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 border-b border-gray-lighter bg-gray-50">
                                <form onSubmit={handleSearchDriveApplications} className="flex gap-4 items-end">
                                    <div className="form-group flex-1 mb-0">
                                        <label className="form-label text-sm">Company Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Google"
                                            value={filterCompanyName}
                                            onChange={e => setFilterCompanyName(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group flex-1 mb-0">
                                        <label className="form-label text-sm">Drive Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={filterDriveDate}
                                            onChange={e => setFilterDriveDate(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                        style={{ height: '42px', padding: '0 24px' }}
                                    >
                                        {loading ? 'Searching...' : '🔍 Search Specific Drive'}
                                    </button>
                                </form>
                            </div>

                            {applications.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📋</div>
                                    <h3>No Applications Found</h3>
                                    <p>Try clearing your search or wait for students to apply.</p>
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Roll No</th>
                                                <th>Student Name</th>
                                                <th>Company</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map(app => (
                                                <tr key={app.id}>
                                                    <td>#{app.id}</td>
                                                    <td>{app.student?.rollNo || '—'}</td>
                                                    <td>{app.student?.name || '—'}</td>
                                                    <td>{app.drive?.company?.name || '—'}</td>
                                                    <td>{app.drive?.driveDate || '—'}</td>
                                                    <td>
                                                        <span className={getBadgeClass(app.status)}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="form-control"
                                                            style={{ padding: '4px 8px', fontSize: '12px' }}
                                                            value={app.status}
                                                            onChange={e => handleStatusChange(app.id, e.target.value)}
                                                        >
                                                            {STATUS_OPTS.map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >
        </div >
    );
}
