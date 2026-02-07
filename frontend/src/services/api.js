import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';

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

export default api;
