// Analytics images are served via backend proxy (/analytics/*) to avoid CORS
export const analyticsApi = {
    branchGraphUrl: (branch) => `/analytics/branch/${branch}`,
    companyGraphUrl: (companyId) => `/analytics/company/${companyId}`,
    studentGraphUrl: (rollNo) => `/analytics/student/${rollNo}`,
};
