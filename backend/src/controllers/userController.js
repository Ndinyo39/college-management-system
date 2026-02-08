import bcrypt from 'bcryptjs';
import { query, run } from '../config/database.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await query('SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['superadmin', 'admin', 'teacher', 'student'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        // Prevent changing own role if it's the last superadmin (safety check)
        const user = await query('SELECT role FROM users WHERE id = ?', [id]);
        if (user[0]?.role === 'superadmin' && role !== 'superadmin') {
            const superadmins = await query("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'");
            if (superadmins[0].count <= 1) {
                return res.status(403).json({ error: 'Cannot downgrade the only superadmin record' });
            }
        }

        await run('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const toggleUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        await run('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `User status set to ${status}` });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Prevent deleting self
        if (req.user.id == id) {
            return res.status(403).json({ error: 'Cannot delete your own account' });
        }

        await run('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const resetUserPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
