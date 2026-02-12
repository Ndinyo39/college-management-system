import axios from 'axios';

const API_BASE_URL = '/api';

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
    forgotPassword: (data) => api.post('auth/forgot-password', data),
    resetPassword: (data) => api.post('auth/reset-password', data),
    getMe: () => api.get('auth/me'),
};

// Students
export const studentsAPI = {
    getAll: () => api.get('students'),
    getById: (id) => api.get(`students/${encodeURIComponent(id)}`),
    create: (data) => api.post('students', data),
    update: (id, data) => api.put(`students/${encodeURIComponent(id)}`, data),
    delete: (id) => api.delete(`students/${encodeURIComponent(id)}`),
    search: (query) => api.get(`students/search?q=${query}`),
};

// Courses
export const coursesAPI = {
    getAll: () => api.get('courses'),
    getById: (id) => api.get(`courses/${encodeURIComponent(id)}`),
    create: (data) => api.post('courses', data),
    update: (id, data) => api.put(`courses/${encodeURIComponent(id)}`, data),
};

// Faculty
export const facultyAPI = {
    getAll: () => api.get('faculty'),
    getById: (id) => api.get(`faculty/${encodeURIComponent(id)}`),
    create: (data) => api.post('faculty', data),
    update: (id, data) => api.put(`faculty/${encodeURIComponent(id)}`, data),
    delete: (id) => api.delete(`faculty/${encodeURIComponent(id)}`),
};

// Attendance
export const attendanceAPI = {
    getAll: (course, date) => api.get('attendance', { params: { course, date } }),
    mark: (data) => api.post('attendance', data),
    update: (id, data) => api.put(`attendance/${encodeURIComponent(id)}`, data),
};

// Grades
export const gradesAPI = {
    getAll: (course) => api.get('grades', { params: { course } }),
    create: (data) => api.post('grades', data),
    update: (id, data) => api.put(`grades/${encodeURIComponent(id)}`, data),
    delete: (id) => api.delete(`grades/${encodeURIComponent(id)}`),
};

// Announcements
export const announcementsAPI = {
    getAll: (category, priority) => api.get('announcements', { params: { category, priority } }),
    create: (data) => api.post('announcements', data),
    update: (id, data) => api.put(`announcements/${encodeURIComponent(id)}`, data),
    delete: (id) => api.delete(`announcements/${encodeURIComponent(id)}`),
};

// Notifications
export const notificationsAPI = {
    getAll: () => api.get('notifications'),
    markRead: (id) => api.put(`notifications/${encodeURIComponent(id)}/read`),
};

// Sessions (Schedule)
export const sessionsAPI = {
    getAll: () => api.get('sessions'),
    create: (data) => api.post('sessions', data),
    delete: (id) => api.delete(`sessions/${encodeURIComponent(id)}`),
};

// Users (Superadmin Only)
export const usersAPI = {
    getAll: () => api.get('users'),
    updateRole: (id, role) => api.put(`users/${encodeURIComponent(id)}/role`, { role }),
    updateStatus: (id, status) => api.put(`users/${encodeURIComponent(id)}/status`, { status }),
    resetPassword: (id, newPassword) => api.put(`users/${encodeURIComponent(id)}/password`, { newPassword }),
    delete: (id) => api.delete(`users/${encodeURIComponent(id)}`),
};

// Academic Reports
export const reportsAPI = {
    getAll: (params) => api.get('reports', { params }),
    getStudentReports: (studentId) => api.get(`reports/student/${encodeURIComponent(studentId)}`),
    create: (data) => api.post('reports', data),
    delete: (id) => api.delete(`reports/${encodeURIComponent(id)}`),
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
