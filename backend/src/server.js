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
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
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
        process.exit(1);
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
