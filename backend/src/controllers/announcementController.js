import { getDb } from '../config/database.js';

async function isMongo() {
    const db = await getDb();
    return db.constructor.name === 'NativeConnection';
}

export async function getAllAnnouncements(req, res) {
    try {
        if (await isMongo()) {
            const Announcement = (await import('../models/mongo/Announcement.js')).default;
            const announcements = await Announcement.find().sort({ date: -1 });
            return res.json(announcements);
        }

        const db = await getDb();
        const announcements = await db.all('SELECT * FROM announcements ORDER BY date DESC');
        res.json(announcements);
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
}

export async function createAnnouncement(req, res) {
    try {
        const { title, content, author, category, priority, date } = req.body;

        if (await isMongo()) {
            const Announcement = (await import('../models/mongo/Announcement.js')).default;
            const newAnnouncement = new Announcement({ title, content, author, category, priority, date });
            const saved = await newAnnouncement.save();
            return res.status(201).json(saved);
        }

        const db = await getDb();
        const result = await db.run(
            'INSERT INTO announcements (title, content, author, category, priority, date) VALUES (?, ?, ?, ?, ?, ?)',
            [title, content, author, category, priority, date || new Date().toISOString().split('T')[0]]
        );
        const announcement = await db.get('SELECT * FROM announcements WHERE id = ?', [result.lastID]);
        res.status(201).json(announcement);
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
}

export async function updateAnnouncement(req, res) {
    try {
        if (await isMongo()) {
            const Announcement = (await import('../models/mongo/Announcement.js')).default;
            const updated = await Announcement.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            if (!updated) return res.status(404).json({ error: 'Announcement not found' });
            return res.json(updated);
        }

        const db = await getDb();
        const fields = Object.keys(req.body);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => req.body[f]);
        values.push(req.params.id);

        await db.run(`UPDATE announcements SET ${setClause} WHERE id = ?`, values);
        const announcement = await db.get('SELECT * FROM announcements WHERE id = ?', [req.params.id]);
        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
        res.json(announcement);
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({ error: 'Failed to update announcement' });
    }
}

export async function deleteAnnouncement(req, res) {
    try {
        if (await isMongo()) {
            const Announcement = (await import('../models/mongo/Announcement.js')).default;
            const result = await Announcement.findByIdAndDelete(req.params.id);
            if (!result) return res.status(404).json({ error: 'Announcement not found' });
            return res.json({ message: 'Announcement deleted successfully' });
        }

        const db = await getDb();
        const result = await db.run('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        if (result.changes === 0) return res.status(404).json({ error: 'Announcement not found' });
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
}
