import { getDb } from '../config/database.js';

async function isMongo() {
    const db = await getDb();
    return db.constructor.name === 'NativeConnection';
}

export const getAllReports = async (req, res) => {
    try {
        const { course, trainer_email } = req.query;

        if (await isMongo()) {
            const TrainerReport = (await import('../models/mongo/TrainerReport.js')).default;
            let query = {};
            if (trainer_email) query.trainer_email = trainer_email;
            else if (course) query.course_unit = course;
            const reports = await TrainerReport.find(query).sort({ created_at: -1 });
            return res.json(reports);
        }

        const db = await getDb();
        let sql = 'SELECT * FROM trainer_reports';
        let params = [];

        if (trainer_email) {
            sql += ' WHERE trainer_email = ?';
            params.push(trainer_email);
        } else if (course) {
            sql += ' WHERE course_unit = ?';
            params.push(course);
        }
        sql += ' ORDER BY created_at DESC';

        const reports = await db.all(sql, params);
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getStudentReports = async (req, res) => {
    const { studentId } = req.params;
    try {
        if (await isMongo()) {
            const TrainerReport = (await import('../models/mongo/TrainerReport.js')).default;
            const reports = await TrainerReport.find({ student_id: studentId }).sort({ created_at: -1 });
            return res.json(reports);
        }

        const db = await getDb();
        const reports = await db.all('SELECT * FROM trainer_reports WHERE student_id = ? ORDER BY created_at DESC', [studentId]);
        res.json(reports);
    } catch (error) {
        console.error('Error fetching student reports:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createReport = async (req, res) => {
    const reportData = req.body;
    const trainer_email = req.user.email;
    const trainer_name = req.user.name || (trainer_email ? trainer_email.split('@')[0] : 'Trainer');

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
        if (await isMongo()) {
            const TrainerReport = (await import('../models/mongo/TrainerReport.js')).default;
            const newReport = new TrainerReport({
                student_id, student_name, registration_number, course_unit,
                trainer_name, trainer_email, reporting_period,
                total_lessons: total_lessons || 0,
                attended_lessons: attended_lessons || 0,
                attendance_percentage: attendance_percentage || 0,
                theory_topics, theory_score, theory_remarks,
                practical_tasks, equipment_used, skill_level, safety_compliance,
                discipline_issues, trainer_observations,
                progress_summary, recommendation
            });
            const savedReport = await newReport.save();
            return res.status(201).json(savedReport);
        }

        const db = await getDb();
        const result = await db.run(
            `INSERT INTO trainer_reports (
                student_id, student_name, registration_number, course_unit,
                trainer_name, trainer_email, reporting_period,
                total_lessons, attended_lessons, attendance_percentage,
                theory_topics, theory_score, theory_remarks,
                practical_tasks, equipment_used, skill_level, safety_compliance,
                discipline_issues, trainer_observations,
                progress_summary, recommendation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, student_name, registration_number, course_unit,
                trainer_name, trainer_email, reporting_period,
                total_lessons || 0, attended_lessons || 0, attendance_percentage || 0,
                theory_topics, theory_score, theory_remarks,
                practical_tasks, equipment_used, skill_level, safety_compliance,
                discipline_issues, trainer_observations,
                progress_summary, recommendation]
        );
        const report = await db.get('SELECT * FROM trainer_reports WHERE id = ?', [result.lastID]);
        res.status(201).json(report);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteReport = async (req, res) => {
    const { id } = req.params;
    try {
        if (await isMongo()) {
            const TrainerReport = (await import('../models/mongo/TrainerReport.js')).default;
            const report = await TrainerReport.findById(id);
            if (!report) return res.status(404).json({ error: 'Report not found' });
            if (req.user.role === 'teacher' && report.trainer_email !== req.user.email) {
                return res.status(403).json({ error: 'Forbidden: You can only delete your own reports' });
            }
            await TrainerReport.findByIdAndDelete(id);
            return res.json({ message: 'Report deleted successfully' });
        }

        const db = await getDb();
        const report = await db.get('SELECT * FROM trainer_reports WHERE id = ?', [id]);
        if (!report) return res.status(404).json({ error: 'Report not found' });
        if (req.user.role === 'teacher' && report.trainer_email !== req.user.email) {
            return res.status(403).json({ error: 'Forbidden: You can only delete your own reports' });
        }
        await db.run('DELETE FROM trainer_reports WHERE id = ?', [id]);
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
