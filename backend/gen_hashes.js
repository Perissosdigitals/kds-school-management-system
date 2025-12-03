const bcrypt = require('bcrypt');

async function generateHashes() {
    const adminHash = await bcrypt.hash('admin123', 10);
    const teacherHash = await bcrypt.hash('teacher123', 10);
    
    console.log(`admin123: ${adminHash}`);
    console.log(`teacher123: ${teacherHash}`);
}

generateHashes();
