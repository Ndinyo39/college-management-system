import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const authAPI = {
    login: (email, password) => api.post('auth/login', { email, password }),
    register: (email, password, role) => api.post('auth/register', { email, password, role }),
    getMe: () => api.get('auth/me'),
};

// Students
export const studentsAPI = {
    getAll: () => api.get('students'),
    getById: (id) => api.get(`students/${id}`),
    create: (data) => api.post('students', data),
    update: (id, data) => api.put(`students/${id}`, data),
    delete: (id) => api.delete(`students/${id}`),
    search: (query) => api.get(`students/search?q=${query}`),
};

// Courses
export const coursesAPI = {
    getAll: () => api.get('courses'),
    getById: (id) => api.get(`courses/${id}`),
    create: (data) => api.post('courses', data),
    update: (id, data) => api.put(`courses/${id}`, data),
};

// Faculty
export const facultyAPI = {
    getAll: () => api.get('faculty'),
    getById: (id) => api.get(`faculty/${id}`),
    create: (data) => api.post('faculty', data),
    update: (id, data) => api.put(`faculty/${id}`, data),
    delete: (id) => api.delete(`faculty/${id}`),
};

// Attendance
export const attendanceAPI = {
    getAll: (course, date) => api.get('attendance', { params: { course, date } }),
    mark: (data) => api.post('attendance', data),
    update: (id, data) => api.put(`attendance/${id}`, data),
};

// Grades
export const gradesAPI = {
    getAll: (course) => api.get('grades', { params: { course } }),
    create: (data) => api.post('grades', data),
    update: (id, data) => api.put(`grades/${id}`, data),
    delete: (id) => api.delete(`grades/${id}`),
};

// Announcements
export const announcementsAPI = {
    getAll: (category, priority) => api.get('announcements', { params: { category, priority } }),
    create: (data) => api.post('announcements', data),
    update: (id, data) => api.put(`announcements/${id}`, data),
    delete: (id) => api.delete(`announcements/${id}`),
};

// Notifications
export const notificationsAPI = {
    getAll: () => api.get('notifications'),
    markRead: (id) => api.put(`notifications/${id}/read`),
};

// Sessions (Schedule)
export const sessionsAPI = {
    getAll: () => api.get('sessions'),
    create: (data) => api.post('sessions', data),
    delete: (id) => api.delete(`sessions/${id}`),
};

// Users (Superadmin Only)
export const usersAPI = {
    getAll: () => api.get('users'),
    updateRole: (id, role) => api.put(`users/${id}/role`, { role }),
    updateStatus: (id, status) => api.put(`users/${id}/status`, { status }),
    resetPassword: (id, newPassword) => api.put(`users/${id}/password`, { newPassword }),
    delete: (id) => api.delete(`users/${id}`),
};

// Academic Reports
export const reportsAPI = {
    getAll: (params) => api.get('reports', { params }),
    getStudentReports: (studentId) => api.get(`reports/student/${studentId}`),
    create: (data) => api.post('reports', data),
    delete: (id) => api.delete(`reports/${id}`),
};

// Activity Reports (College-wide)
export const activityReportsAPI = {
    // Daily Reports
    getDailyReports: (params) => api.get('activity-reports/daily', { params }),
    getDailyReport: (date) => api.get(`activity-reports/daily/${date}`),
    createDailyReport: (data) => api.post('activity-reports/daily', data),
    updateDailyReport: (id, data) => api.put(`activity-reports/daily/${id}`, data),
    deleteDailyReport: (id) => api.delete(`activity-reports/daily/${id}`),

    // Weekly Reports
    getWeeklyReports: (params) => api.get('activity-reports/weekly', { params }),
    getWeeklyReport: (id) => api.get(`activity-reports/weekly/${id}`),
    createWeeklyReport: (data) => api.post('activity-reports/weekly', data),
    updateWeeklyReport: (id, data) => api.put(`activity-reports/weekly/${id}`, data),
    deleteWeeklyReport: (id) => api.delete(`activity-reports/weekly/${id}`),

    // Monthly Reports
    getMonthlyReports: (params) => api.get('activity-reports/monthly', { params }),
    getMonthlyReport: (id) => api.get(`activity-reports/monthly/${id}`),
    createMonthlyReport: (data) => api.post('activity-reports/monthly', data),
    updateMonthlyReport: (id, data) => api.put(`activity-reports/monthly/${id}`, data),
    deleteMonthlyReport: (id) => api.delete(`activity-reports/monthly/${id}`),

    // Summary
    getSummary: () => api.get('activity-reports/summary'),
};

export default api;
