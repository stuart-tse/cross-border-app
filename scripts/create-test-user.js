const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'stuart_tse@outlook.com' },
      update: {},
      create: {
        email: 'stuart_tse@outlook.com',
        name: 'Stuart Tse',
        phone: '+1234567890',
        isVerified: true,
        isActive: true,
        userRoles: {
          create: {
            role: 'CLIENT',
            isActive: true,
          },
        },
        passwords: {
          create: {
            hash: hashedPassword,
          },
        },
        clientProfile: {
          create: {
            membershipTier: 'PREMIUM',
          },
        },
      },
      include: {
        userRoles: true,
        passwords: true,
        clientProfile: true,
      },
    });
    
    console.log('Test user created/updated:', { id: user.id, email: user.email, roles: user.userRoles });
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating test user:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTestUser();