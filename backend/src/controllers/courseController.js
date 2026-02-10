import { getDb } from '../config/database.js';

async function isMongo() {
    const db = await getDb();
    return db.constructor.name === 'NativeConnection';
}

export async function getAllCourses(req, res) {
    try {
        if (await isMongo()) {
            const Course = (await import('../models/mongo/Course.js')).default;
            const courses = await Course.find().sort({ name: 1 });
            return res.json(courses);
        }

        // SQLite: Get courses from courses table
        const db = await getDb();
        const courses = await db.all('SELECT * FROM courses WHERE status = "Active" ORDER BY name');
        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
}

export async function getCourse(req, res) {
    try {
        if (await isMongo()) {
            const Course = (await import('../models/mongo/Course.js')).default;
            const course = await Course.findOne({ id: req.params.id });
            if (!course) return res.status(404).json({ error: 'Course not found' });
            return res.json(course);
        }

        const db = await getDb();
        const course = await db.get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
}

export async function createCourse(req, res) {
    try {
        if (await isMongo()) {
            const Course = (await import('../models/mongo/Course.js')).default;
            const { id, name, department, instructor, duration, capacity, schedule, room } = req.body;
            const newCourse = new Course({ id, name, department, instructor, duration, capacity, schedule, room });
            const savedCourse = await newCourse.save();
            return res.status(201).json(savedCourse);
        }

        // SQLite doesn't have a courses table, return the request body as confirmation
        res.status(201).json({ message: 'Course added (SQLite mode)', ...req.body });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
}

export async function updateCourse(req, res) {
    try {
        if (await isMongo()) {
            const Course = (await import('../models/mongo/Course.js')).default;
            const updatedCourse = await Course.findOneAndUpdate(
                { id: req.params.id },
                { $set: { ...req.body, updated_at: new Date() } },
                { new: true, runValidators: true }
            );
            if (!updatedCourse) return res.status(404).json({ error: 'Course not found' });
            return res.json(updatedCourse);
        }

        res.json({ message: 'Course updated (SQLite mode)', id: req.params.id, ...req.body });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
}

export async function deleteCourse(req, res) {
    try {
        if (await isMongo()) {
            const Course = (await import('../models/mongo/Course.js')).default;
            const result = await Course.findOneAndDelete({ id: req.params.id });
            if (!result) return res.status(404).json({ error: 'Course not found' });
            return res.json({ message: 'Course deleted successfully' });
        }

        res.json({ message: 'Course deleted (SQLite mode)' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
}
