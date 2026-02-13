import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, queryOne, run } from '../config/database.js';

// Dynamic user lookup that works with both MongoDB and SQLite
export async function findUserByEmail(email) {
    const db = await getDb();

    // Check if we're using MongoDB (Mongoose connection)
    if (db.constructor.name === 'NativeConnection') {
        const User = (await import('../models/mongo/User.js')).default;
        return await User.findOne({ email });
    }

    // SQLite query
    // Database abstraction query
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
    return user;
}

async function findUserById(id) {
    const db = await getDb();

    if (db.constructor.name === 'NativeConnection') {
        const User = (await import('../models/mongo/User.js')).default;
        return await User.findById(id).select('-password');
    }

    const user = await queryOne('SELECT id, email, role, status, name FROM users WHERE id = ?', [id]);
    return user;
}

export async function createUser(email, hashedPassword, role, name) {
    const db = await getDb();

    if (db.constructor.name === 'NativeConnection') {
        const User = (await import('../models/mongo/User.js')).default;
        const newUser = new User({ email, password: hashedPassword, role, name, must_change_password: true });
        return await newUser.save();
    }

    const result = await run(
        'INSERT INTO users (email, password, role, status, must_change_password, name) VALUES (?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, role, 'Active', 1, name]
    );

    // For Postgres/Supabase compatibility, we need to fetch the user if lastID is null
    let userId = result.lastID;
    if (!userId) {
        const newUser = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
        if (newUser) userId = newUser.id;
    }

    return { id: userId, email, role, name };
}

export async function register(req, res) {
    try {
        const { email, password, role, name } = req.body;

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
        const savedUser = await createUser(email, hashedPassword, role, name);

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

        // Check if password change is required
        if (user.must_change_password) {
            return res.json({
                requirePasswordChange: true,
                user: {
                    id: user._id || user.id,
                    email: user.email,
                    role: user.role
                }
            });
        }

        // Check if account is active
        if (user.status === 'Inactive') {
            return res.status(403).json({ error: 'Account restricted. Contact superadmin.' });
        }


        // Check System Settings for Portal Access
        const db = await getDb();
        let settings = {};
        if (db.constructor.name !== 'NativeConnection') {
            // For both SQLite and Postgres, we can use db.all or database.js query if we refactor,
            // keeping it simple with direct db check or just using query
            try {
                // We'll use the query abstraction which returns rows array for both
                const { query } = await import('../config/database.js');
                const settingsRows = await query('SELECT * FROM system_settings');
                settings = settingsRows.reduce((acc, curr) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {});
            } catch (err) {
                console.log('Settings fetch error (migrating?):', err.message);
            }
        }
        // Note: For MongoDB, we'd need a similar settings model fetch. 
        // Assuming SQL-based for now as per instructions.

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
            {
                id: userId,
                email: user.email,
                role: user.role,
                status: user.status,
                name: user.name || user.email.split('@')[0]
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: userId,
                name: user.name || user.email.split('@')[0],
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

export async function changePassword(req, res) {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ error: 'Email and new password are required' });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If strict mode, verify old password (optional if forced by system)
        if (oldPassword) {
            const validPassword = await bcrypt.compare(oldPassword, user.password);
            if (!validPassword) return res.status(401).json({ error: 'Invalid old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const db = await getDb();

        if (db.constructor.name === 'NativeConnection') {
            const User = (await import('../models/mongo/User.js')).default;
            await User.updateOne(
                { email },
                { password: hashedPassword, must_change_password: false }
            );
        } else {
            await run(
                'UPDATE users SET password = ?, must_change_password = FALSE WHERE email = ?',
                [hashedPassword, email]
            );
        }

        res.json({ message: 'Password changed successfully. Please login with your new password.' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
}


// Forgot Password - Request password reset
export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({ message: 'If an account exists with this email, you will receive password reset instructions.' });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { email: user.email, purpose: 'password-reset' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // In a real app, you'd save this token in DB with expiry
        // For now, we'll just send it via email

        const { sendPasswordResetEmail } = await import('../services/emailService.js');
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

        await sendPasswordResetEmail(email, resetUrl);

        res.json({ message: 'If an account exists with this email, you will receive password reset instructions.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
}

// Reset Password - Validate token and reset password
export async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.purpose !== 'password-reset') {
                return res.status(400).json({ error: 'Invalid reset token' });
            }
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const user = await findUserByEmail(decoded.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const db = await getDb();

        if (db.constructor.name === 'NativeConnection') {
            const User = (await import('../models/mongo/User.js')).default;
            await User.updateOne(
                { email: decoded.email },
                { password: hashedPassword, must_change_password: false }
            );
        } else {
            await run(
                'UPDATE users SET password = ?, must_change_password = FALSE WHERE email = ?',
                [hashedPassword, decoded.email]
            );
        }

        res.json({ message: 'Password reset successfully. You can now log in with your new password.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
}
