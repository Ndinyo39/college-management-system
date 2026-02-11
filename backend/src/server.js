import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables as first thing before internal modules
dotenv.config();

import { initializeDatabase, getDb } from './config/database.js';
import apiRoutes from './routes/api.js';

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
    // Also allow potential Netlify subdomains or primary domains
    if (process.env.FRONTEND_URL.includes('netlify.app')) {
        const domain = process.env.FRONTEND_URL.split('//')[1];
        allowedOrigins.push(`https://${domain}`);
    }
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // If in development, allow all
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // If in production, check against allowedOrigins
        if (allowedOrigins.some(o => origin.startsWith(o))) {
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
        const db = await getDb();

        // MongoDB Check
        if (process.env.MONGODB_URI) {
            const User = (await import('./models/mongo/User.js')).default;
            const userCount = await User.countDocuments();
            return res.json({
                status: '✅ Connected to MongoDB Atlas',
                database: 'MongoDB',
                users: userCount,
                message: 'MongoDB is active.'
            });
        }

        // Supabase/Postgres Check
        if (process.env.DATABASE_URL) {
            const result = await db.query('SELECT COUNT(*) as count FROM users');
            return res.json({
                status: '✅ Connected to Supabase (PostgreSQL)',
                database: 'PostgreSQL',
                users: parseInt(result.rows[0].count),
                message: 'Supabase is active.'
            });
        }

        // SQLite Check
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        res.json({
            status: '✅ Connected to local SQLite',
            database: 'SQLite',
            users: userCount.count,
            message: 'SQLite is active. Vercel deployments require MongoDB or a cloud database.'
        });

    } catch (error) {
        console.error('❌ Database Check Failed:', error);
        res.status(500).json({
            status: '❌ Database Connection Failed',
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
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
