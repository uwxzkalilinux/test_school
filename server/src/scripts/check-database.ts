// Script to check if database is set up correctly
import 'dotenv/config';
import { supabaseDb } from '../database/index.js';

async function checkDatabase() {
  console.log('🔍 Checking Supabase database...\n');

  try {
    // Check if admin user exists
    const admin = await supabaseDb.getUserByEmail('admin@school.com');
    
    if (admin) {
      console.log('✅ Admin user exists:', admin.email);
    } else {
      console.log('❌ Admin user NOT found!');
      console.log('⚠️  You need to run supabase_schema.sql in Supabase SQL Editor');
      return;
    }

    // Check classes
    const classes = await supabaseDb.getClasses();
    console.log(`✅ Classes: ${classes.length} found`);

    // Check subjects
    const subjects = await supabaseDb.getSubjects();
    console.log(`✅ Subjects: ${subjects.length} found`);

    // Check teachers
    const teachers = await supabaseDb.getTeachers();
    console.log(`✅ Teachers: ${teachers.length} found`);

    // Check students
    const students = await supabaseDb.getStudents();
    console.log(`✅ Students: ${students.length} found`);

    console.log('\n✅ Database is set up correctly!');
    console.log('\n📝 Test accounts:');
    console.log('   Admin: admin@school.com / admin123');
    console.log('   Teacher: teacher1@school.com / teacher123');
    console.log('   Student: student1@school.com / student123');
    console.log('   Parent: parent1@school.com / parent123');

  } catch (error: any) {
    console.error('❌ Error checking database:', error.message);
    console.error('\n⚠️  Possible issues:');
    console.error('   1. SQL Schema not run in Supabase');
    console.error('   2. Wrong Supabase credentials in .env');
    console.error('   3. Network connection issue');
  }
}

checkDatabase();

