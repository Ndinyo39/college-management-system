import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

async function migrate() {
    console.log('Starting migration...');
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const columns = [
        { name: 'dob', type: 'DATE' },
        { name: 'address', type: 'TEXT' },
        { name: 'guardian_name', type: 'TEXT' },
        { name: 'guardian_contact', type: 'TEXT' },
        { name: 'blood_group', type: 'TEXT' }
    ];

    for (const col of columns) {
        try {
            await db.run(`ALTER TABLE students ADD COLUMN ${col.name} ${col.type}`);
            console.log(`✅ Added column: ${col.name}`);
        } catch (error) {
            if (error.message.includes('duplicate column name')) {
                console.log(`ℹ️ Column ${col.name} already exists`);
            } else {
                console.error(`❌ Error adding ${col.name}:`, error.message);
            }
        }
    }

    console.log('Migration complete.');
    await db.close();
}

migrate();
