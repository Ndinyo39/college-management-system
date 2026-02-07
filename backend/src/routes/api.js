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

const router = express.Router();

// Auth routes (public)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.getMe);

// Student routes (protected)
router.get('/students', authenticateToken, studentController.getAllStudents);
router.get('/students/search', authenticateToken, studentController.searchStudents);
router.get('/students/:id', authenticateToken, studentController.getStudent);
router.post('/students', authenticateToken, studentController.createStudent);
router.put('/students/:id', authenticateToken, studentController.updateStudent);
router.delete('/students/:id', authenticateToken, studentController.deleteStudent);

// Course routes (protected)
router.get('/courses', authenticateToken, courseController.getAllCourses);
router.get('/courses/:id', authenticateToken, courseController.getCourse);
router.post('/courses', authenticateToken, courseController.createCourse);
router.put('/courses/:id', authenticateToken, courseController.updateCourse);

// Faculty routes (protected)
router.get('/faculty', authenticateToken, facultyController.getAllFaculty);
router.get('/faculty/:id', authenticateToken, facultyController.getFaculty);
router.post('/faculty', authenticateToken, facultyController.createFaculty);

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
router.post('/announcements', authenticateToken, announcementController.createAnnouncement);
router.put('/announcements/:id', authenticateToken, announcementController.updateAnnouncement);
router.delete('/announcements/:id', authenticateToken, announcementController.deleteAnnouncement);

// Notification routes (protected)
router.get('/notifications', authenticateToken, notificationController.getAll);
router.put('/notifications/:id/read', authenticateToken, notificationController.markRead);

export default router;
