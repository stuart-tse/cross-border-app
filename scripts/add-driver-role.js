#!/usr/bin/env node

/**
 * Add Driver Role Script
 * Adds DRIVER role and profile to existing user
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDriverRole() {
  try {
    console.log('🚗 Adding DRIVER role to user...');

    const email = 'stuart_tse@outlook.com';

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: true,
        driverProfile: true,
      },
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return;
    }

    // Check if user already has DRIVER role
    const hasDriverRole = user.userRoles.some(role => role.role === 'DRIVER');
    
    if (hasDriverRole) {
      console.log('✅ User already has DRIVER role');
    } else {
      // Add DRIVER role
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: 'DRIVER',
          isActive: true,
        },
      });
      console.log('✅ DRIVER role added successfully!');
    }

    // Check if user has driver profile
    if (!user.driverProfile) {
      // Create driver profile
      await prisma.driverProfile.create({
        data: {
          userId: user.id,
          licenseNumber: 'HK123456789',
          licenseExpiry: new Date('2025-12-31'),
          isApproved: true,
          rating: 4.5,
          totalTrips: 0,
          languages: ['English', 'Chinese'],
          isAvailable: true,
        },
      });
      console.log('✅ Driver profile created successfully!');
    } else {
      console.log('✅ User already has driver profile');
    }

    // Get updated user info
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: true,
      },
    });

    console.log('📋 Updated user roles:', updatedUser.userRoles.map(r => r.role).join(', '));

  } catch (error) {
    console.error('❌ Error adding driver role:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  addDriverRole()
    .then(() => {
      console.log('🎉 Driver role setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { addDriverRole };