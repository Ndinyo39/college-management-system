import { getDb } from './config/database.js';
import bcrypt from 'bcryptjs';

async function fixDatabase() {
    try {
        const db = await getDb();

        console.log('--- Fixing Users ---');
        const superadmin = await db.get('SELECT * FROM users WHERE role = ?', ['superadmin']);

        if (!superadmin) {
            console.log('Superadmin not found. Creating...');
            const hashedPassword = await bcrypt.hash('superadmin123', 10);
            await db.run(
                'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
                ['superadmin@beautex.edu', hashedPassword, 'superadmin', 'Active']
            );
            console.log('✅ Superadmin created: superadmin@beautex.edu / superadmin123');
        } else {
            console.log('✅ Superadmin already exists:', superadmin.email);
            // Optional: Reset password if requested, but for now just confirm existence
        }

        console.log('--- Fixing System Settings ---');
        try {
            const settingsCount = await db.get('SELECT COUNT(*) as count FROM system_settings');
            if (settingsCount.count === 0) {
                console.log('System settings empty. Seeding defaults...');
                const defaults = [
                    ['college_name', 'Beautex Technical College'],
                    ['college_abbr', 'BTC'],
                    ['academic_year', '2025/2026'],
                    ['semester', 'Semester 1'],
                    ['contact_email', 'admin@beautex.edu'],
                    ['maintenance_mode', 'false'],
                    ['student_portal_enabled', 'true'],
                    ['teacher_portal_enabled', 'true'],
                    ['parent_portal_enabled', 'true'],
                    ['allow_registration', 'true'],
                    ['grading_system', 'standard']
                ];

                for (const [key, value] of defaults) {
                    await db.run('INSERT INTO system_settings (key, value) VALUES (?, ?)', [key, value]);
                }
                console.log('✅ System settings seeded.');
            } else {
                console.log('✅ System settings already exist.');
            }

            // Force update maintenance_mode to false to ensure login is possible
            await db.run('UPDATE system_settings SET value = ? WHERE key = ?', ['false', 'maintenance_mode']);
            console.log('✅ Forced maintenance_mode to false.');

        } catch (e) {
            console.error('Error accessing system_settings (Table might not exist):', e.message);
            // Create table if missing (should be handled by schema.sql but good fallback)
            await db.run(`
                CREATE TABLE IF NOT EXISTS system_settings (
                  key TEXT PRIMARY KEY,
                  value TEXT,
                  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('✅ system_settings table created (fallback).');
            // Re-run the seeding part... (simplified here, assume next run fixes it or just relying on schema.sql having run)
        }

    } catch (error) {
        console.error('Database fix failed:', error);
    }
}

fixDatabase();
