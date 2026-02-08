import bcrypt from 'bcryptjs';
import { getDb } from './src/config/database.js';

async function fixLoginIssues() {
    const db = await getDb();
    console.log('🔧 Starting login fix...');

    const usersToFix = [
        { email: 'admin@beautex.edu', password: 'admin123', role: 'admin' },
        { email: 'superadmin@beautex.edu', password: 'superadmin123', role: 'superadmin' },
        { email: 'james.wilson@beautex.edu', password: 'password123', role: 'teacher' },
        { email: 'sarah.johnson@beautex.edu', password: 'password123', role: 'student' }
    ];

    for (const user of usersToFix) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Check if user exists
        const existing = await db.get('SELECT * FROM users WHERE email = ?', [user.email]);

        if (existing) {
            console.log(`Updating ${user.role} (${user.email})...`);
            await db.run(
                'UPDATE users SET password = ?, role = ?, status = ? WHERE email = ?',
                [hashedPassword, user.role, 'Active', user.email]
            );
        } else {
            console.log(`Creating ${user.role} (${user.email})...`);
            await db.run(
                'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
                [user.email, hashedPassword, user.role, 'Active']
            );
        }
    }

    console.log('✅ Login fix applied successfully!');
}

fixLoginIssues()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error fixing login:', err);
        process.exit(1);
    });
