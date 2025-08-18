const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    
    // First find the user
    const user = await prisma.user.findUnique({
      where: { email: 'stuart_tse@outlook.com' },
      include: { passwords: true },
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Update the password
    await prisma.password.update({
      where: { id: user.passwords[0].id },
      data: { hash: hashedPassword },
    });
    
    console.log('Password updated successfully');
    
    // Verify the new password
    const isValid = await bcrypt.compare('TestPassword123!', hashedPassword);
    console.log('Password verification after update:', isValid);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error updating password:', error);
    await prisma.$disconnect();
  }
}

updatePassword();