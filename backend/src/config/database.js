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

        // Ensure directory exists for DB_PATH
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            console.log(`📁 Creating missing database directory: ${dbDir}`);
            fs.mkdirSync(dbDir, { recursive: true });
        }

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
    const database = await getDb();
    const schemaFile = path.join(__dirname, '../models/schema.sql');
    let schema = fs.readFileSync(schemaFile, 'utf-8');

    if (MONGODB_URI) {
        console.log('ℹ️ MongoDB detected. Schemas are handled by Mongoose models.');
        return;
    }

    if (DATABASE_URL) {
        console.log('🐘 Initializing PostgreSQL schema...');
        // Basic SQLite -> Postgres translations for our schema
        schema = schema
            .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
            .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
            .replace(/INSERT OR IGNORE/gi, 'INSERT') // We'll handle conflicts differently if needed
            .replace(/PRAGMA foreign_keys = ON;/gi, ''); // Not needed in Postgres

        // Split schema into individual statements (basic split by ;)
        const statements = schema.split(';').filter(s => s.trim().length > 0);
        for (let statement of statements) {
            try {
                await database.query(statement);
            } catch (err) {
                // Ignore "already exists" errors
                if (!err.message.includes('already exists') && !err.message.includes('already a primary key')) {
                    console.warn(`⚠️ Postgres Init Warning: ${err.message}`);
                }
            }
        }
        console.log('✅ PostgreSQL Schema checked/initialized');
        return;
    }

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
        let pgSql = sql.replace(/\?/g, (_, i, s) => {
            // Very basic param counting
            const count = (s.slice(0, i).match(/\?/g) || []).length + 1;
            return `$${count}`;
        });

        // Dialect translation for common seed/crud patterns
        pgSql = pgSql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');
        if (sql.toLowerCase().includes('insert into users')) {
            pgSql += ' ON CONFLICT (email) DO NOTHING';
        } else if (sql.toLowerCase().includes('students') || sql.toLowerCase().includes('courses') || sql.toLowerCase().includes('faculty')) {
            pgSql += ' ON CONFLICT (id) DO NOTHING';
        }

        const result = await database.query(pgSql, params);
        return { lastID: null, changes: result.rowCount };
    }
    return database.run(sql, params);
}

export default { getDb, query, queryOne, run };
