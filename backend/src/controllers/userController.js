import bcrypt from 'bcryptjs';
import { getDb, query, queryOne, run } from '../config/database.js';

async function isMongo() {
    const db = await getDb();
    return db.constructor.name === 'NativeConnection';
}

export async function getAllUsers(req, res) {
    try {
        if (await isMongo()) {
            const User = (await import('../models/mongo/User.js')).default;
            const users = await User.find().select('-password').sort({ email: 1 });
            return res.json(users);
        }

        const users = await query('SELECT id, email, role, status FROM users ORDER BY email');
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

export async function updateUserRole(req, res) {
    try {
        const { role } = req.body;

        if (await isMongo()) {
            const User = (await import('../models/mongo/User.js')).default;
            const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
            if (!user) return res.status(404).json({ error: 'User not found' });
            return res.json(user);
        }

        await run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        const user = await queryOne('SELECT id, email, role, status FROM users WHERE id = ?', [req.params.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
}

export async function toggleUserStatus(req, res) {
    try {
        if (await isMongo()) {
            const User = (await import('../models/mongo/User.js')).default;
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            user.status = user.status === 'Active' ? 'Inactive' : 'Active';
            await user.save();
            return res.json({ id: user._id, email: user.email, role: user.role, status: user.status });
        }

        const user = await queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        await run('UPDATE users SET status = ? WHERE id = ?', [newStatus, req.params.id]);
        res.json({ id: user.id, email: user.email, role: user.role, status: newStatus });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({ error: 'Failed to toggle user status' });
    }
}

export async function resetUserPassword(req, res) {
    try {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        if (await isMongo()) {
            const User = (await import('../models/mongo/User.js')).default;
            const user = await User.findByIdAndUpdate(req.params.id, { password: hashedPassword }, { new: true }).select('-password');
            if (!user) return res.status(404).json({ error: 'User not found' });
            return res.json({ message: 'Password reset successfully' });
        }

        const result = await run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);
        if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
}

export async function deleteUser(req, res) {
    try {
        if (await isMongo()) {
            const User = (await import('../models/mongo/User.js')).default;
            const result = await User.findByIdAndDelete(req.params.id);
            if (!result) return res.status(404).json({ error: 'User not found' });
            return res.json({ message: 'User deleted successfully' });
        }

        const user = await queryOne('SELECT email FROM users WHERE id = ?', [req.params.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        console.log(`🗑️ Deletion request for user ID: ${req.params.id} (${user.email})`);

        // Delete from all potential profile tables
        await run('DELETE FROM students WHERE email = ?', [user.email]);
        await run('DELETE FROM faculty WHERE email = ?', [user.email]);

        const result = await run('DELETE FROM users WHERE id = ?', [req.params.id]);
        console.log(`📊 Deletion result: ${JSON.stringify(result)}`);

        res.json({ message: 'User and all linked records deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
}
