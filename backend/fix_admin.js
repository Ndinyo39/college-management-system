import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

async function fixAdmin() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.run(
        'UPDATE users SET password = ? WHERE email = ?',
        ['$2a$10$LCvyJlH2SBv8/ew3PgxNT.6GUjlBsQklZNyqwfeO7jFzOlMm5Wb.O', 'admin@beautex.edu']
    );

    console.log('✅ Admin password updated in database');
    await db.close();
}

fixAdmin().catch(console.error);
