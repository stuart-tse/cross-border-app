const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'stuart_tse@outlook.com' },
      include: {
        userRoles: true,
        passwords: true,
        clientProfile: true,
      },
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      isVerified: user.isVerified,
      roles: user.userRoles,
      hasPassword: user.passwords.length > 0,
    });
    
    if (user.passwords.length > 0) {
      const isValid = await bcrypt.compare('TestPassword123!', user.passwords[0].hash);
      console.log('Password verification:', isValid);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

debugUser();