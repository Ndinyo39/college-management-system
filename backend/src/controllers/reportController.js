import { query, queryOne, run } from '../config/database.js';

export const getAllReports = async (req, res) => {
    try {
        const { course, trainer_email } = req.query;
        let sql = 'SELECT * FROM trainer_reports ORDER BY created_at DESC';
        let params = [];

        if (trainer_email) {
            sql = 'SELECT * FROM trainer_reports WHERE trainer_email = ? ORDER BY created_at DESC';
            params = [trainer_email];
        } else if (course) {
            sql = 'SELECT * FROM trainer_reports WHERE course_unit = ? ORDER BY created_at DESC';
            params = [course];
        }

        const reports = await query(sql, params);
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getStudentReports = async (req, res) => {
    const { studentId } = req.params;
    try {
        const reports = await query('SELECT * FROM trainer_reports WHERE student_id = ? ORDER BY created_at DESC', [studentId]);
        res.json(reports);
    } catch (error) {
        console.error('Error fetching student reports:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createReport = async (req, res) => {
    const reportData = req.body;
    const trainer_email = req.user.email;
    const trainer_name = req.user.name || trainer_email.split('@')[0];

    const {
        student_id, student_name, registration_number, course_unit, reporting_period,
        total_lessons, attended_lessons, attendance_percentage,
        theory_topics, theory_score, theory_remarks,
        practical_tasks, equipment_used, skill_level, safety_compliance,
        discipline_issues, trainer_observations,
        progress_summary, recommendation
    } = reportData;

    if (!student_id || !course_unit || !reporting_period) {
        return res.status(400).json({ error: 'Student ID, Course, and Reporting Period are required' });
    }

    try {
        const result = await run(`
            INSERT INTO trainer_reports (
                student_id, student_name, registration_number, course_unit, trainer_name, trainer_email, reporting_period,
                total_lessons, attended_lessons, attendance_percentage,
                theory_topics, theory_score, theory_remarks,
                practical_tasks, equipment_used, skill_level, safety_compliance,
                discipline_issues, trainer_observations,
                progress_summary, recommendation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            student_id, student_name, registration_number, course_unit, trainer_name, trainer_email, reporting_period,
            total_lessons || 0, attended_lessons || 0, attendance_percentage || 0,
            theory_topics, theory_score, theory_remarks,
            practical_tasks, equipment_used, skill_level, safety_compliance,
            discipline_issues, trainer_observations,
            progress_summary, recommendation
        ]);

        const newReport = await queryOne('SELECT * FROM trainer_reports WHERE id = ?', [result.lastInsertRowid]);
        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteReport = async (req, res) => {
    const { id } = req.params;
    try {
        // If teacher, only let them delete their own reports
        if (req.user.role === 'teacher') {
            const report = await queryOne('SELECT trainer_email FROM trainer_reports WHERE id = ?', [id]);
            if (report && report.trainer_email !== req.user.email) {
                return res.status(403).json({ error: 'Forbidden: You can only delete your own reports' });
            }
        }

        await run('DELETE FROM trainer_reports WHERE id = ?', [id]);
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
