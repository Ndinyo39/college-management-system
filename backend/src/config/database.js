import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pg from 'pg';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');
const DATABASE_URL = process.env.DATABASE_URL;
const MONGODB_URI = process.env.MONGODB_URI;

const { Pool } = pg;

let db;
let pgPool;
let mongoConnection;

// Initialize database connection
export async function getDb() {
    // 1. Check for MongoDB Atlas (Priority)
    if (MONGODB_URI) {
        if (!mongoConnection) {
            try {
                await mongoose.connect(MONGODB_URI);
                mongoConnection = mongoose.connection;
                console.log('🍃 Connected to MongoDB Atlas');
            } catch (err) {
                console.error('❌ MongoDB Connection Error:', err);
                throw err;
            }
        }
        return mongoConnection;
    }

    // 2. Check for PostgreSQL (Supabase)
    if (DATABASE_URL) {
        if (!pgPool) {
            pgPool = new Pool({
                connectionString: DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                }
            });
            console.log('🐘 Connected to Supabase (PostgreSQL)');
        }
        return pgPool;
    }

    // 3. Fallback to SQLite
    if (!db) {
        const sqlite3 = (await import('sqlite3')).default;
        const { open } = await import('sqlite');

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

// Initialize database schema (Only for SQLite)
export async function initializeDatabase() {
    if (MONGODB_URI) {
        console.log('ℹ️ MongoDB detected. Schemas are handled by Mongoose models.');
        return;
    }
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

// Generic query functions (Will be bypassed by Mongoose models)
export async function query(sql, params = []) {
    const database = await getDb();
    if (DATABASE_URL) {
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
        return { lastID: null, changes: result.rowCount };
    }
    return database.run(sql, params);
}

export default { getDb, query, queryOne, run };
