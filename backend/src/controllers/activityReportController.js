import { query, queryOne, run } from '../config/database.js';

// ============ DAILY REPORTS ============

export const getAllDailyReports = async (req, res) => {
    try {
        const { limit = 30, startDate, endDate } = req.query;

        let sql = 'SELECT * FROM daily_activity_reports WHERE 1=1';
        const params = [];

        if (startDate) {
            sql += ' AND report_date >= ?';
            params.push(startDate);
        }
        if (endDate) {
            sql += ' AND report_date <= ?';
            params.push(endDate);
        }

        sql += ' ORDER BY report_date DESC LIMIT ?';
        params.push(parseInt(limit));

        const reports = await query(sql, params);
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching daily reports:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getDailyReport = async (req, res) => {
    try {
        const { date } = req.params;
        const report = await queryOne(
            'SELECT * FROM daily_activity_reports WHERE report_date = ?',
            [date]
        );

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        res.json({ success: true, data: report });
    } catch (error) {
        console.error('Error fetching daily report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createDailyReport = async (req, res) => {
    try {
        const {
            report_date, classes_conducted, total_attendance_percentage,
            assessments_conducted, total_students_present, total_students_absent,
            late_arrivals, new_enrollments, staff_present, staff_absent, facilities_issues,
            equipment_maintenance, notable_events, incidents, achievements, additional_notes
        } = req.body;

        const reported_by = req.user.email;

        const result = await run(
            `INSERT INTO daily_activity_reports (
                report_date, reported_by, classes_conducted, total_attendance_percentage,
                assessments_conducted, total_students_present, total_students_absent,
                late_arrivals, new_enrollments, staff_present, staff_absent, facilities_issues,
                equipment_maintenance, notable_events, incidents, achievements, additional_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                report_date, reported_by, classes_conducted || 0, total_attendance_percentage || 0,
                assessments_conducted || 0, total_students_present || 0, total_students_absent || 0,
                late_arrivals || 0, new_enrollments || 0, staff_present || 0, staff_absent || 0, facilities_issues || '',
                equipment_maintenance || '', notable_events || '', incidents || '', achievements || '', additional_notes || ''
            ]
        );

        res.status(201).json({ success: true, data: { id: result.lastID } });
    } catch (error) {
        console.error('Error creating daily report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateDailyReport = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            classes_conducted, total_attendance_percentage, assessments_conducted,
            total_students_present, total_students_absent, late_arrivals, new_enrollments,
            staff_present, staff_absent, facilities_issues, equipment_maintenance,
            notable_events, incidents, achievements, additional_notes
        } = req.body;

        await run(
            `UPDATE daily_activity_reports SET
                classes_conducted = ?, total_attendance_percentage = ?, assessments_conducted = ?,
                total_students_present = ?, total_students_absent = ?, late_arrivals = ?, new_enrollments = ?,
                staff_present = ?, staff_absent = ?, facilities_issues = ?,
                equipment_maintenance = ?, notable_events = ?, incidents = ?,
                achievements = ?, additional_notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [
                classes_conducted, total_attendance_percentage, assessments_conducted,
                total_students_present, total_students_absent, late_arrivals, new_enrollments,
                staff_present, staff_absent, facilities_issues, equipment_maintenance,
                notable_events, incidents, achievements, additional_notes, id
            ]
        );

        res.json({ success: true, message: 'Report updated successfully' });
    } catch (error) {
        console.error('Error updating daily report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteDailyReport = async (req, res) => {
    try {
        const { id } = req.params;
        await run('DELETE FROM daily_activity_reports WHERE id = ?', [id]);
        res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting daily report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============ WEEKLY REPORTS ============

export const getAllWeeklyReports = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const reports = await query(
            'SELECT * FROM weekly_summary_reports ORDER BY week_start_date DESC LIMIT ?',
            [parseInt(limit)]
        );
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching weekly reports:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getWeeklyReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await queryOne(
            'SELECT * FROM weekly_summary_reports WHERE id = ?',
            [id]
        );

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        res.json({ success: true, data: report });
    } catch (error) {
        console.error('Error fetching weekly report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createWeeklyReport = async (req, res) => {
    try {
        const {
            week_start_date, week_end_date, total_classes_conducted, average_attendance,
            total_assessments, active_students, avg_student_attendance, disciplinary_cases,
            courses_completed, new_enrollments, key_achievements, challenges_faced,
            action_items, revenue_collected, notes
        } = req.body;

        const reported_by = req.user.email;

        const result = await run(
            `INSERT INTO weekly_summary_reports (
                week_start_date, week_end_date, reported_by, total_classes_conducted,
                average_attendance, total_assessments, active_students, avg_student_attendance,
                disciplinary_cases, courses_completed, new_enrollments, key_achievements,
                challenges_faced, action_items, revenue_collected, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                week_start_date, week_end_date, reported_by, total_classes_conducted || 0,
                average_attendance || 0, total_assessments || 0, active_students || 0,
                avg_student_attendance || 0, disciplinary_cases || 0, courses_completed || 0,
                new_enrollments || 0, key_achievements || '', challenges_faced || '',
                action_items || '', revenue_collected || 0, notes || ''
            ]
        );

        res.status(201).json({ success: true, data: { id: result.lastID } });
    } catch (error) {
        console.error('Error creating weekly report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateWeeklyReport = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            total_classes_conducted, average_attendance, total_assessments,
            active_students, avg_student_attendance, disciplinary_cases,
            courses_completed, new_enrollments, key_achievements, challenges_faced,
            action_items, revenue_collected, notes
        } = req.body;

        await run(
            `UPDATE weekly_summary_reports SET
                total_classes_conducted = ?, average_attendance = ?, total_assessments = ?,
                active_students = ?, avg_student_attendance = ?, disciplinary_cases = ?,
                courses_completed = ?, new_enrollments = ?, key_achievements = ?,
                challenges_faced = ?, action_items = ?, revenue_collected = ?,
                notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [
                total_classes_conducted, average_attendance, total_assessments,
                active_students, avg_student_attendance, disciplinary_cases,
                courses_completed, new_enrollments, key_achievements, challenges_faced,
                action_items, revenue_collected, notes, id
            ]
        );

        res.json({ success: true, message: 'Report updated successfully' });
    } catch (error) {
        console.error('Error updating weekly report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteWeeklyReport = async (req, res) => {
    try {
        const { id } = req.params;
        await run('DELETE FROM weekly_summary_reports WHERE id = ?', [id]);
        res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting weekly report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============ MONTHLY REPORTS ============

export const getAllMonthlyReports = async (req, res) => {
    try {
        const { limit = 12 } = req.query;
        const reports = await query(
            'SELECT * FROM monthly_summary_reports ORDER BY month_start_date DESC LIMIT ?',
            [parseInt(limit)]
        );
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching monthly reports:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getMonthlyReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await queryOne(
            'SELECT * FROM monthly_summary_reports WHERE id = ?',
            [id]
        );

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        res.json({ success: true, data: report });
    } catch (error) {
        console.error('Error fetching monthly report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createMonthlyReport = async (req, res) => {
    try {
        const {
            month, month_start_date, month_end_date, total_students, new_enrollments,
            graduations, dropouts, total_classes, average_attendance, total_assessments,
            average_pass_rate, total_faculty, new_hires, faculty_departures, revenue,
            expenses, major_achievements, challenges, strategic_initiatives,
            goals_next_month, additional_notes
        } = req.body;

        const reported_by = req.user.email;

        const result = await run(
            `INSERT INTO monthly_summary_reports (
                month, month_start_date, month_end_date, reported_by, total_students,
                new_enrollments, graduations, dropouts, total_classes, average_attendance,
                total_assessments, average_pass_rate, total_faculty, new_hires,
                faculty_departures, revenue, expenses, major_achievements, challenges,
                strategic_initiatives, goals_next_month, additional_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                month, month_start_date, month_end_date, reported_by, total_students || 0,
                new_enrollments || 0, graduations || 0, dropouts || 0, total_classes || 0,
                average_attendance || 0, total_assessments || 0, average_pass_rate || 0,
                total_faculty || 0, new_hires || 0, faculty_departures || 0, revenue || 0,
                expenses || 0, major_achievements || '', challenges || '',
                strategic_initiatives || '', goals_next_month || '', additional_notes || ''
            ]
        );

        res.status(201).json({ success: true, data: { id: result.lastID } });
    } catch (error) {
        console.error('Error creating monthly report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateMonthlyReport = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            total_students, new_enrollments, graduations, dropouts, total_classes,
            average_attendance, total_assessments, average_pass_rate, total_faculty,
            new_hires, faculty_departures, revenue, expenses, major_achievements,
            challenges, strategic_initiatives, goals_next_month, additional_notes
        } = req.body;

        await run(
            `UPDATE monthly_summary_reports SET
                total_students = ?, new_enrollments = ?, graduations = ?, dropouts = ?,
                total_classes = ?, average_attendance = ?, total_assessments = ?,
                average_pass_rate = ?, total_faculty = ?, new_hires = ?,
                faculty_departures = ?, revenue = ?, expenses = ?, major_achievements = ?,
                challenges = ?, strategic_initiatives = ?, goals_next_month = ?,
                additional_notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [
                total_students, new_enrollments, graduations, dropouts, total_classes,
                average_attendance, total_assessments, average_pass_rate, total_faculty,
                new_hires, faculty_departures, revenue, expenses, major_achievements,
                challenges, strategic_initiatives, goals_next_month, additional_notes, id
            ]
        );

        res.json({ success: true, message: 'Report updated successfully' });
    } catch (error) {
        console.error('Error updating monthly report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteMonthlyReport = async (req, res) => {
    try {
        const { id } = req.params;
        await run('DELETE FROM monthly_summary_reports WHERE id = ?', [id]);
        res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting monthly report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============ DASHBOARD STATS ============

export const getReportsSummary = async (req, res) => {
    try {
        const dailyCount = await queryOne('SELECT COUNT(*) as count FROM daily_activity_reports');
        const weeklyCount = await queryOne('SELECT COUNT(*) as count FROM weekly_summary_reports');
        const monthlyCount = await queryOne('SELECT COUNT(*) as count FROM monthly_summary_reports');

        const latestDaily = await queryOne(
            'SELECT * FROM daily_activity_reports ORDER BY report_date DESC LIMIT 1'
        );

        res.json({
            success: true,
            data: {
                daily_reports: dailyCount.count,
                weekly_reports: weeklyCount.count,
                monthly_reports: monthlyCount.count,
                latest_daily: latestDaily
            }
        });
    } catch (error) {
        console.error('Error fetching reports summary:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
