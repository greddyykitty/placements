import { createAuthAxios } from './authApi';

const http = () => createAuthAxios();

export const adminApi = {
    addCompany: (data) => http().post('/admin/company', data),
    createDrive: (data) => http().post('/admin/drive', data),
    uploadEligibility: (companyName, driveDate, formData) =>
        http().post(`/admin/upload-eligibility?companyName=${encodeURIComponent(companyName)}&driveDate=${driveDate}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    updateApplicationStatus: (id, status) =>
        http().put(`/admin/application/${id}?status=${status}`),
    getApplications: () => http().get('/admin/applications'),
    getStudentAnalytics: (rollNo) => http().get(`/admin/analytics/student/${rollNo}`),
    getBranchAnalytics: (branch) => http().get(`/admin/analytics/branch/${branch}`),
    getCompanyAnalytics: (companyId) => http().get(`/admin/analytics/company/${companyId}`),
    getApplicationsByDrive: (companyName, driveDate) =>
        http().get(`/admin/applications/${encodeURIComponent(companyName)}/${driveDate}`),
    uploadShortlist: (companyName, driveDate, status, formData) =>
        http().post(`/admin/upload-shortlist?companyName=${encodeURIComponent(companyName)}&driveDate=${driveDate}&status=${status}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
};
