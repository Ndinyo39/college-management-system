import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as studentController from '../controllers/studentController.js';
import * as courseController from '../controllers/courseController.js';
import * as facultyController from '../controllers/facultyController.js';
import * as attendanceController from '../controllers/attendanceController.js';
import * as gradeController from '../controllers/gradeController.js';
import * as announcementController from '../controllers/announcementController.js';
import notificationController from '../controllers/notificationController.js';
import * as sessionController from '../controllers/sessionController.js';
import * as userController from '../controllers/userController.js';
import * as reportController from '../controllers/reportController.js';
import * as activityReportController from '../controllers/activityReportController.js';
import * as settingsController from '../controllers/settingsController.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Auth routes (public)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/change-password', authController.changePassword);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/auth/me', authenticateToken, authController.getMe);

// Student routes (protected)
router.get('/students', authenticateToken, studentController.getAllStudents);
router.get('/students/search', authenticateToken, studentController.searchStudents);
router.get('/students/:id', authenticateToken, studentController.getStudent);
router.post('/students', authenticateToken, authorizeRoles('admin', 'superadmin'), studentController.createStudent);
router.put('/students/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), studentController.updateStudent);
router.delete('/students/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), studentController.deleteStudent);

// Course routes (protected)
router.get('/courses', authenticateToken, courseController.getAllCourses);
router.get('/courses/:id', authenticateToken, courseController.getCourse);
router.post('/courses', authenticateToken, authorizeRoles('admin', 'superadmin'), courseController.createCourse);
router.put('/courses/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), courseController.updateCourse);
router.delete('/courses/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), courseController.deleteCourse);

// Faculty routes (protected)
router.get('/faculty', authenticateToken, facultyController.getAllFaculty);
router.get('/faculty/:id', authenticateToken, facultyController.getFaculty);
router.post('/faculty', authenticateToken, authorizeRoles('admin', 'superadmin'), facultyController.createFaculty);
router.put('/faculty/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), facultyController.updateFaculty);
router.delete('/faculty/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), facultyController.deleteFaculty);

// Attendance routes (protected)
router.get('/attendance', authenticateToken, attendanceController.getAllAttendance);
router.post('/attendance', authenticateToken, attendanceController.markAttendance);
router.put('/attendance/:id', authenticateToken, attendanceController.updateAttendance);

// Grade routes (protected)
router.get('/grades', authenticateToken, gradeController.getAllGrades);
router.post('/grades', authenticateToken, gradeController.createGrade);
router.put('/grades/:id', authenticateToken, gradeController.updateGrade);
router.delete('/grades/:id', authenticateToken, gradeController.deleteGrade);

// Announcement routes (protected)
router.get('/announcements', authenticateToken, announcementController.getAllAnnouncements);
router.post('/announcements', authenticateToken, authorizeRoles('admin', 'superadmin'), announcementController.createAnnouncement);
router.put('/announcements/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), announcementController.updateAnnouncement);
router.delete('/announcements/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), announcementController.deleteAnnouncement);

// Notification routes (protected)
router.get('/notifications', authenticateToken, notificationController.getAll);
router.put('/notifications/:id/read', authenticateToken, notificationController.markRead);

// Session (Schedule) routes (protected)
router.get('/sessions', authenticateToken, sessionController.getAllSessions);
router.post('/sessions', authenticateToken, authorizeRoles('admin', 'superadmin'), sessionController.createSession);
router.delete('/sessions/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), sessionController.deleteSession);

// User Management routes (Superadmin Only)
router.get('/users', authenticateToken, authorizeRoles('superadmin'), userController.getAllUsers);
router.put('/users/:id/role', authenticateToken, authorizeRoles('superadmin'), userController.updateUserRole);
router.put('/users/:id/status', authenticateToken, authorizeRoles('superadmin'), userController.toggleUserStatus);
router.put('/users/:id/password', authenticateToken, authorizeRoles('superadmin'), userController.resetUserPassword);
router.delete('/users/:id', authenticateToken, authorizeRoles('superadmin'), userController.deleteUser);

// Academic Reports (Trainers/Admin/Superadmin)
router.get('/reports', authenticateToken, authorizeRoles('teacher', 'admin', 'superadmin'), reportController.getAllReports);
router.get('/reports/student/:studentId', authenticateToken, authorizeRoles('teacher', 'admin', 'superadmin', 'student'), reportController.getStudentReports);
router.post('/reports', authenticateToken, authorizeRoles('teacher', 'admin', 'superadmin'), reportController.createReport);
router.delete('/reports/:id', authenticateToken, authorizeRoles('teacher', 'admin', 'superadmin'), reportController.deleteReport);

// Activity Reports (Admin/Superadmin Only)
// Daily Reports
router.get('/activity-reports/daily', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.getAllDailyReports);
router.get('/activity-reports/daily/:date', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.getDailyReport);
router.post('/activity-reports/daily', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.createDailyReport);
router.put('/activity-reports/daily/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.updateDailyReport);
router.delete('/activity-reports/daily/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.deleteDailyReport);

// Weekly Reports
router.get('/activity-reports/weekly', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.getAllWeeklyReports);
router.get('/activity-reports/weekly/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.getWeeklyReport);
router.post('/activity-reports/weekly', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.createWeeklyReport);
router.put('/activity-reports/weekly/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.updateWeeklyReport);
router.delete('/activity-reports/weekly/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.deleteWeeklyReport);

// Monthly Reports
router.get('/activity-reports/monthly', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.getAllMonthlyReports);
router.get('/activity-reports/monthly/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.getMonthlyReport);
router.post('/activity-reports/monthly', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.createMonthlyReport);
router.put('/activity-reports/monthly/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.updateMonthlyReport);
router.delete('/activity-reports/monthly/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.deleteMonthlyReport);

// Reports Summary
router.get('/activity-reports/summary', authenticateToken, authorizeRoles('admin', 'superadmin'), activityReportController.getReportsSummary);


// Settings Routes (Admin & Superadmin)
router.get('/settings', authenticateToken, authorizeRoles('admin', 'superadmin'), settingsController.getSettings);
router.put('/settings', authenticateToken, authorizeRoles('admin', 'superadmin'), settingsController.updateSettings);
router.get('/settings/backup', authenticateToken, authorizeRoles('superadmin'), settingsController.downloadBackup);

export default router;
