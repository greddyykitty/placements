import { createAuthAxios } from './authApi';

const http = () => createAuthAxios();

export const adminApi = {
    addCompany: (data) => http().post('/admin/company', data),
    createDrive: (data) => http().post('/admin/drive', data),
    uploadEligibility: (driveId, formData) =>
        http().post(`/admin/upload-eligibility/${driveId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    updateApplicationStatus: (id, status) =>
        http().put(`/admin/application/${id}?status=${status}`),
    getApplications: () => http().get('/admin/applications'),
    getStudentAnalytics: (rollNo) => http().get(`/admin/analytics/student/${rollNo}`),
    getBranchAnalytics: (branch) => http().get(`/admin/analytics/branch/${branch}`),
    getCompanyAnalytics: (companyId) => http().get(`/admin/analytics/company/${companyId}`),
};
