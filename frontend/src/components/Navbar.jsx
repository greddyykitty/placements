import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const isAdmin = user.role === 'ADMIN';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <NavLink to={isAdmin ? '/admin' : '/student'} className="navbar-brand">
                    <div className="navbar-brand-icon">🎓</div>
                    <span className="navbar-brand-text">PlacementMS</span>
                </NavLink>

                <div className="navbar-nav">
                    {isAdmin ? (
                        <>
                            <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
                                📊 Dashboard
                            </NavLink>
                            <NavLink to="/admin/analytics/branch" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                🏛️ Branch
                            </NavLink>
                            <NavLink to="/admin/analytics/company" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                🏢 Company
                            </NavLink>
                            <NavLink to="/admin/analytics/student" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                👤 Student
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/student" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
                                🏠 Dashboard
                            </NavLink>
                        </>
                    )}
                </div>

                <div className="navbar-user">
                    <div className="user-badge">
                        <span>{user.name}</span>
                        <span className={`role-chip ${user.role.toLowerCase()}`}>{user.role}</span>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
