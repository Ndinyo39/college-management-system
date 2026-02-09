import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initial parsers at start
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb', parameterLimit: 100000 }));

app.use(helmet());
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Initialize database
const initDb = async () => {
    try {
        await initializeDatabase();
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    }
};
initDb();

// API Routes
app.use('/api', apiRoutes);

// Database check route for debugging
app.get('/api/db-check', async (req, res) => {
    try {
        const db = await import('./config/database.js');
        const userCount = await db.queryOne('SELECT COUNT(*) as count FROM users');
        res.json({
            status: '✅ Connected to Database',
            database: process.env.DATABASE_URL ? 'PostgreSQL (Supabase)' : 'SQLite',
            users: userCount.count,
            message: 'If users is 0, you need to run the SQL in Supabase editor.'
        });
    } catch (error) {
        console.error('❌ Database Check Failed:', error);
        res.status(500).json({
            status: '❌ Database Connection Failed',
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack,
            query: 'SELECT COUNT(*) FROM users',
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                nodeEnv: process.env.NODE_ENV
            },
            note: 'Ensure you have set DATABASE_URL in Vercel and run the schema SQL in Supabase.'
        });
    }
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Beautex College Management System API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth/login',
            students: '/api/students',
            courses: '/api/courses',
            faculty: '/api/faculty',
            attendance: '/api/attendance',
            grades: '/api/grades',
            announcements: '/api/announcements'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
