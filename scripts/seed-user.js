#!/usr/bin/env node

/**
 * User Seeding Script
 * Creates a test user with the specified credentials
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUser() {
  try {
    console.log('🌱 Starting user seeding...');

    const email = 'stuart_tse@outlook.com';
    const password = 'Baka1148!';
    const name = 'Stuart Tse';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        passwords: true,
        userRoles: true,
      },
    });

    if (existingUser) {
      console.log('👤 User already exists:', email);
      console.log('📋 User details:');
      console.log('   - ID:', existingUser.id);
      console.log('   - Name:', existingUser.name);
      console.log('   - Email:', existingUser.email);
      console.log('   - Active:', existingUser.isActive);
      console.log('   - Verified:', existingUser.isVerified);
      console.log('   - Roles:', existingUser.userRoles.map(r => r.role).join(', '));
      console.log('   - Has Password:', existingUser.passwords.length > 0);
      
      // Update password if needed
      if (existingUser.passwords.length === 0) {
        console.log('🔐 Adding password to existing user...');
        const hashedPassword = await bcrypt.hash(password, 12);
        
        await prisma.password.create({
          data: {
            userId: existingUser.id,
            hash: hashedPassword,
          },
        });
        
        console.log('✅ Password added successfully!');
      } else {
        // Update existing password
        console.log('🔐 Updating existing password...');
        const hashedPassword = await bcrypt.hash(password, 12);
        
        await prisma.password.update({
          where: { id: existingUser.passwords[0].id },
          data: { hash: hashedPassword },
        });
        
        console.log('✅ Password updated successfully!');
      }
      
      return;
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with transaction
    console.log('👤 Creating new user...');
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          isActive: true,
          isVerified: true,
        },
      });

      // Create password
      await tx.password.create({
        data: {
          userId: newUser.id,
          hash: hashedPassword,
        },
      });

      // Create user roles (CLIENT and DRIVER for testing)
      await tx.userRole.createMany({
        data: [
          {
            userId: newUser.id,
            role: 'CLIENT',
            isActive: true,
          },
          {
            userId: newUser.id,
            role: 'DRIVER',
            isActive: true,
          },
        ],
      });

      // Create client profile
      await tx.clientProfile.create({
        data: {
          userId: newUser.id,
          preferredVehicle: 'BUSINESS',
          loyaltyPoints: 0,
          membershipTier: 'BASIC',
          profileCompletion: 80,
          documentVerified: true,
        },
      });

      // Create driver profile
      await tx.driverProfile.create({
        data: {
          userId: newUser.id,
          licenseNumber: 'HK123456789',
          licenseExpiry: new Date('2025-12-31'),
          isApproved: true,
          rating: 4.5,
          totalTrips: 0,
          languages: ['English', 'Chinese'],
          isAvailable: true,
        },
      });

      return newUser;
    });

    console.log('✅ User created successfully!');
    console.log('📋 User details:');
    console.log('   - ID:', user.id);
    console.log('   - Name:', user.name);
    console.log('   - Email:', user.email);
    console.log('   - Password: Baka1148!');
    console.log('   - Roles: CLIENT, DRIVER');
    console.log('   - Profiles: Client, Driver');

  } catch (error) {
    console.error('❌ Error seeding user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  seedUser()
    .then(() => {
      console.log('🎉 User seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedUser };