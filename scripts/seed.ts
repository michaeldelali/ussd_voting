import { initDatabase } from '../lib/database/init';
import { Candidate, User } from '../lib/database/models';
import { authService } from '../lib/utils/auth';

async function seedDatabase() {
  try {
    await initDatabase();

    console.log('Seeding database...');

    // Create admin user
    const existingUser = await User.findOne({ where: { email: 'admin@borbor.com' } });
    if (!existingUser) {
      await authService.createUser('admin@borbor.com', 'admin123', 'Admin User');
      console.log('✅ Admin user created: admin@borbor.com / admin123');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create sample candidates
    const candidates = [
      { name: 'Elikem Group', code: '013', description: 'Popular dance group from Accra' },
    ];

    for (const candidateData of candidates) {
      const existing = await Candidate.findOne({ where: { code: candidateData.code } });
      if (!existing) {
        await Candidate.create(candidateData);
        console.log(`✅ Created candidate: ${candidateData.name} (${candidateData.code})`);
      } else {
        console.log(`✅ Candidate already exists: ${candidateData.name} (${candidateData.code})`);
      }
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📱 USSD Code: *920*922#');
    console.log('🌐 Dashboard: http://localhost:3000/dashboard');
    console.log('🔑 Login: admin@borbor.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();