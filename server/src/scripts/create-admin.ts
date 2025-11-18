import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabase } from '../database/index.js';

const createAdmin = async () => {
  const db = getDatabase();
  
  // Check if admin already exists
  const existingAdmin = db.users.find(u => u.email === 'admin@school.com' && u.role === 'admin');
  
  if (existingAdmin) {
    // Update password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    existingAdmin.password = hashedPassword;
    console.log('Admin password reset: admin@school.com / admin123');
  } else {
    // Create new admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@school.com',
      password: hashedPassword,
      role: 'admin' as const,
      createdAt: new Date().toISOString(),
    };
    db.users.push(adminUser);
    console.log('Admin created: admin@school.com / admin123');
  }
  
  saveDatabase();
  console.log('Database saved successfully!');
  process.exit(0);
};

createAdmin().catch(console.error);

