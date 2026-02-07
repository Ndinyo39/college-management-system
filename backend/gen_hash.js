import bcrypt from 'bcryptjs';

async function generateHash() {
    const hash = await bcrypt.hash('admin123', 10);
    console.log('New hash for admin123:', hash);
}

generateHash().catch(console.error);
