import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/database.js';

// Dynamic user lookup that works with both MongoDB and SQLite
async function findUserByEmail(email) {
    const db = await getDb();

    // Check if we're using MongoDB (Mongoose connection)
    if (db.constructor.name === 'NativeConnection') {
        const User = (await import('../models/mongo/User.js')).default;
        return await User.findOne({ email });
    }

    // SQLite query
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    return user;
}

async function findUserById(id) {
    const db = await getDb();

    if (db.constructor.name === 'NativeConnection') {
        const User = (await import('../models/mongo/User.js')).default;
        return await User.findById(id).select('-password');
    }

    const user = await db.get('SELECT id, email, role, status FROM users WHERE id = ?', [id]);
    return user;
}

async function createUser(email, hashedPassword, role) {
    const db = await getDb();

    if (db.constructor.name === 'NativeConnection') {
        const User = (await import('../models/mongo/User.js')).default;
        const newUser = new User({ email, password: hashedPassword, role });
        return await newUser.save();
    }

    const result = await db.run(
        'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, role, 'Active']
    );
    return { id: result.lastID, email, role };
}

export async function register(req, res) {
    try {
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required' });
        }

        // Check if user exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const savedUser = await createUser(email, hashedPassword, role);

        res.status(201).json({
            message: 'User registered successfully',
            userId: savedUser._id || savedUser.id
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        console.log(`🔑 Login attempt for: ${email}`);

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        console.log('🔍 Searching for user in database...');
        const user = await findUserByEmail(email);

        if (!user) {
            console.log(`❌ User not found: ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`✅ User found. Verifying password for: ${email}`);
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log(`❌ Invalid password for: ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if account is active
        if (user.status === 'Inactive') {
            return res.status(403).json({ error: 'Account restricted. Contact superadmin.' });
        }


        // Check System Settings for Portal Access
        const db = await getDb();
        let settings = {};
        if (db.constructor.name !== 'NativeConnection') {
            const settingsRows = await db.all('SELECT * FROM system_settings');
            settings = settingsRows.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});
        }
        // Note: For MongoDB, we'd need a similar settings model fetch. 
        // Assuming SQLite for now as per instructions.

        // 1. Maintenance Mode Check
        if (settings.maintenance_mode === 'true' && user.role !== 'superadmin') {
            return res.status(503).json({ error: 'System is under maintenance. Only Super Admin can login.' });
        }

        // 2. Portal Access Check
        if (user.role === 'student' && settings.student_portal_enabled === 'false') {
            return res.status(403).json({ error: 'Student Portal is currently disabled.' });
        }
        if (user.role === 'teacher' && settings.teacher_portal_enabled === 'false') {
            return res.status(403).json({ error: 'Faculty Portal is currently disabled.' });
        }

        // Generate JWT
        const userId = user._id || user.id;
        const token = jwt.sign(
            { id: userId, email: user.email, role: user.role, status: user.status },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: userId,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
}

export async function getMe(req, res) {
    try {
        const user = await findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
}


