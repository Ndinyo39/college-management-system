import bcrypt from 'bcryptjs';
import { run } from './src/config/database.js';

async function fixPassword() {
    const password = 'superadmin123';
    const hash = await bcrypt.hash(password, 10);
    await run('UPDATE users SET password = ? WHERE email = ?', [hash, 'superadmin@beautex.edu']);
    console.log('✅ Superadmin password updated to superadmin123');
}

fixPassword().catch(console.error);
