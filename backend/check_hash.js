const bcrypt = require('bcrypt');

const password = 'Admin123!';
const oldHash = '$2b$10$rN7vCm3qZ8yJ2xH9wLp.dOJxYxYx8ZCmXqGzHt6PzN7vCm3qZ8yJ2';

async function checkAndGenerate() {
    console.log(`Testing password: ${password}`);
    console.log(`Testing old hash: ${oldHash}`);
    
    const match = await bcrypt.compare(password, oldHash);
    console.log(`Does it match? ${match}`);

    const newHash = await bcrypt.hash(password, 10);
    console.log(`New generated hash: ${newHash}`);
    
    const matchNew = await bcrypt.compare(password, newHash);
    console.log(`Does new hash match? ${matchNew}`);
}

checkAndGenerate();
