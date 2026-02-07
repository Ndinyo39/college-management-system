import { query, queryOne, run } from '../config/database.js';

export async function getAllCourses(req, res) {
    try {
        const courses = await query('SELECT * FROM courses ORDER BY name');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
}

export async function getCourse(req, res) {
    try {
        const course = await queryOne('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch course' });
    }
}

export async function createCourse(req, res) {
    try {
        const { id, name, department, instructor, duration, capacity, schedule, room } = req.body;

        const result = await run(
            `INSERT INTO courses (id, name, department, instructor, duration, capacity, schedule, room)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, department, instructor, duration, capacity, schedule, room]
        );

        const newCourse = await queryOne('SELECT * FROM courses WHERE id = ?', [id]);
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create course' });
    }
}

export async function updateCourse(req, res) {
    try {
        const { name, department, instructor, duration, enrolled, capacity, schedule, room, status } = req.body;

        await run(
            `UPDATE courses SET name = ?, department = ?, instructor = ?, duration = ?, 
       enrolled = ?, capacity = ?, schedule = ?, room = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
            [name, department, instructor, duration, enrolled, capacity, schedule, room, status, req.params.id]
        );

        const updatedCourse = await queryOne('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update course' });
    }
}
