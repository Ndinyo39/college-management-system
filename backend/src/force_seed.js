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

        // 2. Demo Users
        const users = [
            { email: 'admin@beautex.edu', password: 'admin123', role: 'admin' },
            { email: 'superadmin@beautex.edu', password: 'superadmin123', role: 'superadmin' },
            // Sample Students
            { email: 'sarah.johnson@beautex.edu', password: 'password123', role: 'student' },
            { email: 'michael.chen@beautex.edu', password: 'password123', role: 'student' },
            // Sample Teachers
            { email: 'james.wilson@beautex.edu', password: 'password123', role: 'teacher' },
            { email: 'sarah.anderson@beautex.edu', password: 'password123', role: 'teacher' }
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
