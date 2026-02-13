import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getDb, run, query } from './config/database.js';

async function seed() {
    try {
        console.log('🚀 Starting Force Seed...');
        const db = await getDb();

        // 1. Check Tables
        const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('📊 Existing Tables:', tables.map(t => t.table_name).join(', '));

        if (!tables.some(t => t.table_name === 'users')) {
            console.error('❌ users table missing! Initializing schema...');
            const { initializeDatabase } = await import('./config/database.js');
            await initializeDatabase();
        }

        // Demo Users
        const users = [
            { email: 'beautexcollege01@gmail.com', password: 'Beautex@2026', role: 'superadmin' },
            { email: 'admin@beautex.edu', password: 'Beautex@2026', role: 'admin' }
        ];

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await run(`
                INSERT INTO users (email, password, role, status, must_change_password) 
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (email) DO UPDATE SET 
                    password = EXCLUDED.password,
                    role = EXCLUDED.role,
                    status = EXCLUDED.status,
                    must_change_password = EXCLUDED.must_change_password
            `, [user.email, hashedPassword, user.role, 'Active', false]);
            console.log(`✅ Upserted user: ${user.email} (${user.role})`);
        }

        // 3. Check settings
        const settings = await query('SELECT count(*) as count FROM system_settings');
        console.log(`⚙️ Settings count: ${settings[0].count}`);

        if (parseInt(settings[0].count) === 0) {
            console.log('📝 Seeding default settings...');
            const defaultSettings = [
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
            for (const [key, value] of defaultSettings) {
                await run('INSERT INTO system_settings (key, value) VALUES (?, ?)', [key, value]);
            }
            console.log('✅ Settings seeded.');
        }

        console.log('✨ Seeding complete!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    }
    process.exit(0);
}

seed();
