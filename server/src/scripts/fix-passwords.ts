// Script to fix passwords in Supabase database
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { supabaseDb } from '../database/index.js';

async function fixPasswords() {
  console.log('🔧 Fixing passwords in database...\n');

  const accounts = [
    { email: 'admin@school.com', password: 'admin123', role: 'admin' },
    { email: 'teacher1@school.com', password: 'teacher123', role: 'teacher' },
    { email: 'teacher2@school.com', password: 'teacher123', role: 'teacher' },
    { email: 'teacher3@school.com', password: 'teacher123', role: 'teacher' },
    { email: 'student1@school.com', password: 'student123', role: 'student' },
    { email: 'student2@school.com', password: 'student123', role: 'student' },
    { email: 'student3@school.com', password: 'student123', role: 'student' },
    { email: 'student4@school.com', password: 'student123', role: 'student' },
    { email: 'parent1@school.com', password: 'parent123', role: 'parent' },
  ];

  for (const account of accounts) {
    try {
      const user = await supabaseDb.getUserByEmail(account.email);
      
      if (user) {
        const hashedPassword = await bcrypt.hash(account.password, 10);
        await supabaseDb.updateUser(user.id, { password: hashedPassword });
        console.log(`✅ Updated password for: ${account.email}`);
      } else {
        console.log(`⚠️  User not found: ${account.email}`);
      }
    } catch (error: any) {
      console.error(`❌ Error updating ${account.email}:`, error.message);
    }
  }

  console.log('\n✅ Password update complete!');
  console.log('\n📝 Test accounts:');
  console.log('   Admin: admin@school.com / admin123');
  console.log('   Teacher: teacher1@school.com / teacher123');
  console.log('   Student: student1@school.com / student123');
  console.log('   Parent: parent1@school.com / parent123');
}

fixPasswords();

