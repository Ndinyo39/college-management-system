import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');

let db;

// Initialize database connection
export async function getDb() {
    if (!db) {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        // Enable foreign keys
        await db.run('PRAGMA foreign_keys = ON');
    }
    return db;
}

// Initialize database schema
export async function initializeDatabase() {
    const database = await getDb();
    const schema = fs.readFileSync(path.join(__dirname, '../models/schema.sql'), 'utf-8');

    try {
        await database.exec(schema);
        console.log('✅ Database initialized successfully');
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            console.log('ℹ️ Database already initialized (constraints met)');
        } else {
            throw error;
        }
    }
}

// Generic query functions
export async function query(sql, params = []) {
    const database = await getDb();
    return database.all(sql, params);
}

export async function queryOne(sql, params = []) {
    const database = await getDb();
    return database.get(sql, params);
}

export async function run(sql, params = []) {
    const database = await getDb();
    return database.run(sql, params);
}

export default { getDb, query, queryOne, run };
