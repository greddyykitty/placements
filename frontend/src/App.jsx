import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import BranchAnalytics from './pages/BranchAnalytics';
import CompanyAnalytics from './pages/CompanyAnalytics';
import StudentAnalytics from './pages/StudentAnalytics';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Admin-only */}
                    <Route path="/admin" element={
                        <PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>
                    } />
                    <Route path="/admin/analytics/branch" element={
                        <PrivateRoute role="ADMIN"><BranchAnalytics /></PrivateRoute>
                    } />
                    <Route path="/admin/analytics/company" element={
                        <PrivateRoute role="ADMIN"><CompanyAnalytics /></PrivateRoute>
                    } />
                    <Route path="/admin/analytics/student" element={
                        <PrivateRoute role="ADMIN"><StudentAnalytics /></PrivateRoute>
                    } />

                    {/* Student-only */}
                    <Route path="/student" element={
                        <PrivateRoute role="STUDENT"><StudentDashboard /></PrivateRoute>
                    } />

                    {/* Redirects */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
