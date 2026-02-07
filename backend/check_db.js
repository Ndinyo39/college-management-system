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
        const admin = users.find(u => u.email === 'admin@beautex.edu');
        if (admin) {
            const isValid = await bcrypt.compare('admin123', admin.password);
            console.log('Password verification for admin123:', isValid);
            console.log('Hash in DB:', admin.password);
        }
    }
    await db.close();
}

checkUsers().catch(console.error);
