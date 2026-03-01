import { createAuthAxios } from './authApi';

const http = () => createAuthAxios();

export const studentApi = {
    getEligibleDrives: () => http().get('/student/drives'),
    apply: (driveId) => http().post(`/student/apply/${driveId}`),
    getMyApplications: () => http().get('/student/applications'),
    getMyNotifications: () => http().get('/student/notifications'),
};
