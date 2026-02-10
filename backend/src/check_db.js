import { getDb } from './config/database.js';

async function checkDatabase() {
    try {
        const db = await getDb();
        console.log('--- Checking Users ---');
        const users = await db.all('SELECT email, role, status FROM users');
        console.log(JSON.stringify(users, null, 2));

        console.log('--- Checking System Settings ---');
        try {
            const settings = await db.all('SELECT * FROM system_settings');
            console.log(JSON.stringify(settings, null, 2));
        } catch (e) {
            console.log('Error reading system_settings (Table might not exist):', e.message);
        }

    } catch (error) {
        console.error('Database check failed:', error);
    }
}

checkDatabase();
