import { getDb, query, queryOne, run } from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../../database.sqlite');

export async function getSettings(req, res) {
    try {
        const settings = await query('SELECT * FROM system_settings');

        // Convert array to object
        const settingsObj = settings.reduce((acc, curr) => {
            let value = curr.value;
            // Parse booleans
            if (value === 'true') value = true;
            else if (value === 'false') value = false;

            acc[curr.key] = value;
            return acc;
        }, {});

        res.json(settingsObj);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
}

export async function updateSettings(req, res) {
    try {
        const settings = req.body;

        for (const [key, value] of Object.entries(settings)) {
            let stringValue = value;
            if (typeof value === 'boolean') stringValue = value.toString();

            await run(`
                INSERT INTO system_settings (key, value, updated_at) 
                VALUES (?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
            `, [key, stringValue]);
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
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
