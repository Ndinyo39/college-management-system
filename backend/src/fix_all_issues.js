import 'dotenv/config';
import { run, query } from './config/database.js';
import bcrypt from 'bcryptjs';

async function fixEverything() {
    try {
        console.log('🐘 Connected to Supabase (PostgreSQL)');

        // 1. Fix Faculty Table Schema
        console.log('🔍 Checking faculty table schema...');
        const facultyCols = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'faculty'
        `);
        const colNames = facultyCols.map(c => c.column_name);

        if (!colNames.includes('position')) {
            console.log('➕ Adding position column to faculty...');
            await run('ALTER TABLE faculty ADD COLUMN position TEXT');
        }
        if (!colNames.includes('specialization')) {
            console.log('➕ Adding specialization column to faculty...');
            await run('ALTER TABLE faculty ADD COLUMN specialization TEXT');
        }
        console.log('✅ Faculty table schema fixed');

        // 2. Fix Admin User
        console.log('🔍 Checking admin user...');
        const adminEmail = 'admin@beautex.edu';
        const user = await query(`SELECT * FROM users WHERE email = $1`, [adminEmail]);

        const hashedPassword = await bcrypt.hash('admin123', 10);

        if (user.length === 0) {
            console.log('➕ Creating admin user...');
            await run(`
                INSERT INTO users (email, password, role, status, must_change_password) 
                VALUES (?, ?, ?, ?, FALSE)
            `, [adminEmail, hashedPassword, 'superadmin', 'Active']);
        } else {
            console.log('🔄 Resetting admin user password and must_change_password flag...');
            await run(`
                UPDATE users 
                SET password = ?, must_change_password = FALSE, role = 'superadmin' 
                WHERE email = ?
            `, [hashedPassword, adminEmail]);
        }
        console.log('✅ Admin user reset to admin123 with no password change requirement');

        // 3. Fix existing student/teacher user accounts if they have must_change_password = 1
        console.log('🔄 Updating all users to not require password change for now...');
        await run('UPDATE users SET must_change_password = FALSE');
        console.log('✅ All users updated');

    } catch (err) {
        console.error('❌ Error fixing everything:', err);
    }
    process.exit(0);
}

fixEverything();
