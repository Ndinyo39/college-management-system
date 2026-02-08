import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

import bcrypt from 'bcryptjs';

async function checkUsers() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const users = await db.all('SELECT id, email, password, role FROM users');
    console.log('--- USERS TABLE ---');
    console.log(users);

    if (users.length > 0) {
        const emailsToCheck = [
            { email: 'admin@beautex.edu', pass: 'admin123' },
            { email: 'superadmin@beautex.edu', pass: 'superadmin123' },
            { email: 'james.wilson@beautex.edu', pass: 'password123' },
            { email: 'sarah.johnson@beautex.edu', pass: 'password123' }
        ];

        for (const check of emailsToCheck) {
            const user = users.find(u => u.email === check.email);
            if (user) {
                const isValid = await bcrypt.compare(check.pass, user.password);
                console.log(`User: ${check.email} | Role: ${user.role} | Password Valid: ${isValid ? '✅' : '❌'}`);
            } else {
                console.log(`User: ${check.email} | ❌ Not Found`);
            }
        }
    }
    await db.close();
}

checkUsers().catch(console.error);
