// Quick script to generate bcrypt hashes for default passwords
// Run: node generate_passwords.cjs

const bcrypt = require('bcryptjs');

async function generateHashes() {
  const passwords = {
    admin: 'admin123',
    teacher: 'teacher123',
    student: 'student123',
    parent: 'parent123'
  };

  console.log('Generating password hashes...\n');
  
  const hashes = {};
  for (const [key, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    hashes[key] = hash;
    console.log(`${key}: ${hash}`);
  }
  
  console.log('\n--- SQL Values ---');
  console.log(`Admin: '${hashes.admin}'`);
  console.log(`Teacher: '${hashes.teacher}'`);
  console.log(`Student: '${hashes.student}'`);
  console.log(`Parent: '${hashes.parent}'`);
}

generateHashes().catch(console.error);

