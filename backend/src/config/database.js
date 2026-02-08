import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');
const DATABASE_URL = process.env.DATABASE_URL;

let db;
let pgPool;

// Initialize database connection
export async function getDb() {
    // If DATABASE_URL is present, we use PostgreSQL (Supabase)
    if (DATABASE_URL) {
        if (!pgPool) {
            pgPool = new pg.Pool({
                connectionString: DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false // Required for Supabase/Vercel
                }
            });
            console.log('🐘 Connected to Supabase (PostgreSQL)');
        }
        return pgPool;
    }

    // Fallback to SQLite
    if (!db) {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        // Enable foreign keys
        await db.run('PRAGMA foreign_keys = ON');
        console.log('📂 Connected to local SQLite');
    }
    return db;
}

// Initialize database schema
export async function initializeDatabase() {
    if (DATABASE_URL) {
        console.log('ℹ️ Skipping auto-initialization for PostgreSQL. Use the Supabase SQL editor.');
        return;
    }

    const database = await getDb();
    const schema = fs.readFileSync(path.join(__dirname, '../models/schema.sql'), 'utf-8');

    try {
        await database.exec(schema);
        console.log('✅ SQLite Database initialized successfully');
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            console.log('ℹ️ SQLite Database already initialized (constraints met)');
        } else {
            throw error;
        }
    }
}

// Generic query functions
export async function query(sql, params = []) {
    const database = await getDb();
    if (DATABASE_URL) {
        const res = await database.query(sql.replace(/\?/g, (val, i) => `$${params.indexOf(val) + 1}`), params);
        // Note: Simple regex replacement for ? -> $1, $2 is fragile for complex queries, 
        // but works for the current codebase's simple queries.
        // For production pg-native syntax is better ($1, $2, etc)

        // Let's improve the replacement to actually count parameters correctly
        let paramCount = 0;
        const pgSql = sql.replace(/\?/g, () => {
            paramCount++;
            return `$${paramCount}`;
        });
        const result = await database.query(pgSql, params);
        return result.rows;
    }
    return database.all(sql, params);
}

export async function queryOne(sql, params = []) {
    const database = await getDb();
    if (DATABASE_URL) {
        let paramCount = 0;
        const pgSql = sql.replace(/\?/g, () => {
            paramCount++;
            return `$${paramCount}`;
        });
        const result = await database.query(pgSql, params);
        return result.rows[0];
    }
    return database.get(sql, params);
}

export async function run(sql, params = []) {
    const database = await getDb();
    if (DATABASE_URL) {
        let paramCount = 0;
        const pgSql = sql.replace(/\?/g, () => {
            paramCount++;
            return `$${paramCount}`;
        });
        const result = await database.query(pgSql, params);
        return { lastID: null, changes: result.rowCount }; // Mocking SQLite return style
    }
    return database.run(sql, params);
}

export default { getDb, query, queryOne, run };
