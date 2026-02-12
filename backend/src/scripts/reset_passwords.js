
import 'dotenv/config';
import { getDb, run } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function resetPasswords() {
    try {
        const db = await getDb();
        console.log('🔒 Starting password reset...');

        const adminHash = await bcrypt.hash('admin123', 10);
        const superadminHash = await bcrypt.hash('admin123', 10);
        const userHash = await bcrypt.hash('admin123', 10);

        // Reset Superadmin
        console.log('   Resetting Superadmin (superadmin@beautex.edu) to: superadmin123');
        await run('UPDATE users SET password = ? WHERE email = ?', [superadminHash, 'superadmin@beautex.edu']);

        // Reset Admin
        console.log('   Resetting Admin (admin@beautex.edu) to: admin123');
        await run('UPDATE users SET password = ? WHERE email = ?', [adminHash, 'admin@beautex.edu']);

        // Reset Teachers (by role)
        console.log('   Resetting all Teachers to: password123');
        await run('UPDATE users SET password = ? WHERE role = ?', [userHash, 'teacher']);

        // Reset Students (by role)
        console.log('   Resetting all Students to: password123');
        await run('UPDATE users SET password = ? WHERE role = ?', [userHash, 'student']);

        console.log('✅ All passwords have been reset successfully!');
    } catch (error) {
        console.error('❌ Reset failed:', error);
    } finally {
        process.exit(0);
    }
}

resetPasswords();
