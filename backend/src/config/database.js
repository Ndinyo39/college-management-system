import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pg from 'pg';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getDbConfig = () => ({
    dbPath: process.env.DB_PATH || path.join(__dirname, '../../database.sqlite'),
    DATABASE_URL: process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : undefined,
    MONGODB_URI: process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : undefined
});

const { Pool } = pg;

let db;
let pgPool;
let mongoConnection;

// Initialize database connection
export async function getDb() {
    const config = getDbConfig();

    // 1. Check for MongoDB Atlas (Priority)
    if (config.MONGODB_URI) {
        if (!mongoConnection) {
            try {
                await mongoose.connect(config.MONGODB_URI);
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
    if (config.DATABASE_URL) {
        if (!pgPool) {
            const { default: pg } = await import('pg'); // Dynamically import pg
            pgPool = new pg.Pool({
                connectionString: config.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            });
            pgPool.on('error', (err) => {
                console.error('Unexpected error on idle client', err);
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
        const dbDir = path.dirname(config.dbPath);
        if (!fs.existsSync(dbDir)) {
            console.log(`📁 Creating missing database directory: ${dbDir}`);
            fs.mkdirSync(dbDir, { recursive: true });
        }

        db = await open({
            filename: config.dbPath,
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
    const config = getDbConfig();
    const schemaFile = path.join(__dirname, '../models/schema.sql');
    let schema = fs.readFileSync(schemaFile, 'utf-8');

    if (config.MONGODB_URI) {
        console.log('ℹ️ MongoDB detected. Schemas are handled by Mongoose models.');
        return;
    }

    if (config.DATABASE_URL) {
        console.log('🐘 Initializing PostgreSQL schema...');
        // Basic SQLite -> Postgres translations for our schema
        schema = schema
            .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
            .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
            .replace(/DATETIME/gi, 'TIMESTAMP')
            .replace(/date\('now'\)/gi, 'CURRENT_DATE')
            .replace(/BOOLEAN DEFAULT 1/gi, 'BOOLEAN DEFAULT TRUE')
            .replace(/BOOLEAN DEFAULT 0/gi, 'BOOLEAN DEFAULT FALSE')
            .replace(/INSERT OR IGNORE/gi, 'INSERT') // We'll handle conflicts differently if needed
            .replace(/PRAGMA foreign_keys = ON;/gi, ''); // Not needed in Postgres

        // Split schema into individual statements (basic split by ; but careful with multi-line)
        const statements = schema.split(';').filter(s => s.trim().length > 0);
        for (let statement of statements) {
            try {
                // If the statement contains a hash or similar with $, it might be interpreted as a placeholder
                // We'll use a simple check and if it's a demo data insert, we'll try to execute it carefully
                await database.query(statement.trim());
            } catch (err) {
                // Ignore "already exists" errors
                const errMsg = err.message.toLowerCase();
                if (!errMsg.includes('already exists') &&
                    !errMsg.includes('already a primary key') &&
                    !errMsg.includes('duplicate key') &&
                    !errMsg.includes('already been assigned')) {
                    console.warn(`⚠️ Postgres Init Warning: ${err.message}`);
                    console.error('Full Postgres Error:', err);
                    console.warn(`Statement prefix: ${statement.trim().substring(0, 50)}...`);
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
    const config = getDbConfig();
    if (config.DATABASE_URL) {
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
    const config = getDbConfig();
    if (config.DATABASE_URL) {
        let paramCount = 0;
        const pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);
        const result = await database.query(pgSql, params);
        return result.rows[0];
    }
    return database.get(sql, params);
}

export async function run(sql, params = []) {
    const database = await getDb();
    const config = getDbConfig();
    if (config.DATABASE_URL) {
        let paramCount = 0;
        let pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);

        // Dialect translation for common seed/crud patterns
        pgSql = pgSql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');

        // Append ON CONFLICT only for INSERT statements IF NOT ALREADY PRESENT
        if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toLowerCase().includes('on conflict')) {
            const lowerPgSql = pgSql.toLowerCase();
            if (lowerPgSql.includes('insert into users')) {
                pgSql += ' ON CONFLICT (email) DO NOTHING';
            } else if (lowerPgSql.includes('students') || lowerPgSql.includes('courses') || lowerPgSql.includes('faculty')) {
                pgSql += ' ON CONFLICT (id) DO NOTHING';
            }
        }

        const result = await database.query(pgSql, params);
        return { lastID: null, changes: result.rowCount };
    }
    return database.run(sql, params);
}

export default { getDb, query, queryOne, run };
