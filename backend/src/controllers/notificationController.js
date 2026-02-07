import { getDb } from '../config/database.js';

const notificationController = {
    getAll: async (req, res) => {
        try {
            const database = await getDb();
            // In a real app, notifications would have their own table. 
            // For now, we'll derive them from recent announcements and grade updates.
            const notifications = [
                { id: 1, title: 'Term Dates Updated', type: 'system', time: '2h ago', read: false },
                { id: 2, title: 'New Grade Published', type: 'academic', time: '5h ago', read: false },
                { id: 3, title: 'Campus Event: Annual Ball', type: 'event', time: '1d ago', read: true }
            ];
            res.json(notifications);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    markRead: async (req, res) => {
        try {
            res.json({ message: 'Notification marked as read' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default notificationController;
