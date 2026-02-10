import { getDb } from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../../database.sqlite');

export async function getSettings(req, res) {
    try {
        const db = await getDb();
        const settings = await db.all('SELECT * FROM system_settings');

        // Convert array to object
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            // Parse booleans
            if (curr.value === 'true') acc[curr.key] = true;
            else if (curr.value === 'false') acc[curr.key] = false;
            else acc[curr.key] = curr.value;
            return acc;
        }, {});

        res.json(settingsObj);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
}

export async function updateSettings(req, res) {
    let db;
    try {
        db = await getDb();
        const settings = req.body;

        // Use a transaction for multiple updates
        await db.run('BEGIN TRANSACTION');

        for (const [key, value] of Object.entries(settings)) {
            let stringValue = value;
            if (typeof value === 'boolean') stringValue = value.toString();

            await db.run(`
                INSERT OR REPLACE INTO system_settings (key, value, updated_at) 
                VALUES (?, ?, CURRENT_TIMESTAMP)
            `, [key, stringValue]);
        }

        await db.run('COMMIT');
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        if (db) await db.run('ROLLBACK');
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
}

export async function downloadBackup(req, res) {
    try {
        res.download(dbPath, 'college_cms_backup_' + new Date().toISOString().split('T')[0] + '.sqlite');
    } catch (error) {
        console.error('Error downloading backup:', error);
        res.status(500).json({ error: 'Failed to download backup' });
    }
}
