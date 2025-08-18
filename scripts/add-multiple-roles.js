const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMultipleRoles() {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'stuart_tse@outlook.com' },
      include: { userRoles: true }
    });

    if (!user) {
      console.log('User not found. Creating user first...');
      process.exit(1);
    }

    console.log('Current user roles:', user.userRoles);

    // Add ADMIN role
    const adminRole = await prisma.userRole.upsert({
      where: {
        userId_role: {
          userId: user.id,
          role: 'ADMIN'
        }
      },
      update: {
        isActive: true
      },
      create: {
        userId: user.id,
        role: 'ADMIN',
        isActive: true,
        assignedBy: 'system'
      }
    });

    // Add DRIVER role
    const driverRole = await prisma.userRole.upsert({
      where: {
        userId_role: {
          userId: user.id,
          role: 'DRIVER'
        }
      },
      update: {
        isActive: true
      },
      create: {
        userId: user.id,
        role: 'DRIVER',
        isActive: true,
        assignedBy: 'system'
      }
    });

    // Create driver profile if it doesn't exist
    await prisma.driverProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        licenseNumber: 'TEST123456',
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        isApproved: true,
        languages: ['English', 'Chinese'],
        isAvailable: true
      }
    });

    console.log('Added roles:', { adminRole, driverRole });
    
    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'stuart_tse@outlook.com' },
      include: { 
        userRoles: true,
        clientProfile: true,
        driverProfile: true
      }
    });
    
    console.log('Updated user with multiple roles:', {
      id: updatedUser.id,
      email: updatedUser.email,
      roles: updatedUser.userRoles.map(r => ({ role: r.role, isActive: r.isActive })),
      profiles: {
        client: !!updatedUser.clientProfile,
        driver: !!updatedUser.driverProfile
      }
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error adding multiple roles:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

addMultipleRoles();