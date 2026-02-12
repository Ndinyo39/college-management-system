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

// Always allow Vercel domains in production for this test deployment
allowedOrigins.push('vercel.app');

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // If in development, allow all
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // If in production, check against allowedOrigins
        const isAllowed = allowedOrigins.some(o => {
            if (o === 'vercel.app') return origin.endsWith('.vercel.app');
            return origin.startsWith(o);
        });

        if (isAllowed) {
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
