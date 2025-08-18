import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  console.log('👤 Creating admin user...');
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@crossborder.com' },
    update: {},
    create: {
      email: 'admin@crossborder.com',
      name: 'System Administrator',
      phone: '+852 9999 0000',
      isVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created/updated:', adminUser.email);

  // Create admin password
  const existingPassword = await prisma.password.findFirst({
    where: { userId: adminUser.id }
  });

  let adminPassword;
  if (existingPassword) {
    adminPassword = await prisma.password.update({
      where: { id: existingPassword.id },
      data: { hash: await hashPassword('admin123') }
    });
  } else {
    adminPassword = await prisma.password.create({
      data: {
        userId: adminUser.id,
        hash: await hashPassword('admin123'),
      }
    });
  }

  console.log('🔐 Admin password created/updated');

  // Create admin role
  const adminRole = await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: adminUser.id,
        role: UserType.ADMIN,
      }
    },
    update: {
      isActive: true,
    },
    create: {
      userId: adminUser.id,
      role: UserType.ADMIN,
      isActive: true,
    },
  });

  console.log('👨‍💼 Admin role created/updated');

  // Create test client user
  console.log('👤 Creating test client user...');
  
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      email: 'client@test.com',
      name: 'Test Client',
      phone: '+852 9876 5432',
      isVerified: true,
      isActive: true,
    },
  });

  const existingClientPassword = await prisma.password.findFirst({
    where: { userId: clientUser.id }
  });

  let clientPassword;
  if (existingClientPassword) {
    clientPassword = await prisma.password.update({
      where: { id: existingClientPassword.id },
      data: { hash: await hashPassword('client123') }
    });
  } else {
    clientPassword = await prisma.password.create({
      data: {
        userId: clientUser.id,
        hash: await hashPassword('client123'),
      }
    });
  }

  const clientRole = await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: clientUser.id,
        role: UserType.CLIENT,
      }
    },
    update: {
      isActive: true,
    },
    create: {
      userId: clientUser.id,
      role: UserType.CLIENT,
      isActive: true,
    },
  });

  // Create client profile
  const clientProfile = await prisma.clientProfile.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      membershipTier: 'PREMIUM',
      loyaltyPoints: 1500,
      profileCompletion: 85,
      documentVerified: true,
      dateOfBirth: new Date('1985-03-15'),
      gender: 'male',
      nationality: 'Hong Kong',
      passportNumber: 'HK123456789',
    },
  });

  console.log('✅ Test client created:', clientUser.email);

  // Create test driver user
  console.log('👤 Creating test driver user...');
  
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@test.com' },
    update: {},
    create: {
      email: 'driver@test.com',
      name: 'Test Driver',
      phone: '+852 6543 2109',
      isVerified: true,
      isActive: true,
    },
  });

  const existingDriverPassword = await prisma.password.findFirst({
    where: { userId: driverUser.id }
  });

  let driverPassword;
  if (existingDriverPassword) {
    driverPassword = await prisma.password.update({
      where: { id: existingDriverPassword.id },
      data: { hash: await hashPassword('driver123') }
    });
  } else {
    driverPassword = await prisma.password.create({
      data: {
        userId: driverUser.id,
        hash: await hashPassword('driver123'),
      }
    });
  }

  const driverRole = await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: driverUser.id,
        role: UserType.DRIVER,
      }
    },
    update: {
      isActive: true,
    },
    create: {
      userId: driverUser.id,
      role: UserType.DRIVER,
      isActive: true,
    },
  });

  // Create driver profile
  const driverProfile = await prisma.driverProfile.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      licenseNumber: 'HK123456789',
      licenseExpiry: new Date('2025-12-31'),
      isApproved: true,
      rating: 4.8,
      totalTrips: 245,
      languages: ['English', 'Cantonese', 'Mandarin'],
      isAvailable: true,
    },
  });

  console.log('✅ Test driver created:', driverUser.email);

  // Create multi-role user (client + driver)
  console.log('👤 Creating multi-role user...');
  
  const multiUser = await prisma.user.upsert({
    where: { email: 'multi@test.com' },
    update: {},
    create: {
      email: 'multi@test.com',
      name: 'Multi Role User',
      phone: '+852 8765 4321',
      isVerified: true,
      isActive: true,
    },
  });

  const existingMultiPassword = await prisma.password.findFirst({
    where: { userId: multiUser.id }
  });

  let multiPassword;
  if (existingMultiPassword) {
    multiPassword = await prisma.password.update({
      where: { id: existingMultiPassword.id },
      data: { hash: await hashPassword('multi123') }
    });
  } else {
    multiPassword = await prisma.password.create({
      data: {
        userId: multiUser.id,
        hash: await hashPassword('multi123'),
      }
    });
  }

  // Add both CLIENT and DRIVER roles
  const multiClientRole = await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: multiUser.id,
        role: UserType.CLIENT,
      }
    },
    update: {
      isActive: true,
    },
    create: {
      userId: multiUser.id,
      role: UserType.CLIENT,
      isActive: true,
    },
  });

  const multiDriverRole = await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: multiUser.id,
        role: UserType.DRIVER,
      }
    },
    update: {
      isActive: true,
    },
    create: {
      userId: multiUser.id,
      role: UserType.DRIVER,
      isActive: true,
    },
  });

  // Add ADMIN role to multi-user for testing admin functionality
  const multiAdminRole = await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: multiUser.id,
        role: UserType.ADMIN,
      }
    },
    update: {
      isActive: true,
    },
    create: {
      userId: multiUser.id,
      role: UserType.ADMIN,
      isActive: true,
    },
  });

  // Create profiles for multi-user
  const multiClientProfile = await prisma.clientProfile.upsert({
    where: { userId: multiUser.id },
    update: {},
    create: {
      userId: multiUser.id,
      membershipTier: 'VIP',
      loyaltyPoints: 3500,
      profileCompletion: 95,
      documentVerified: true,
      dateOfBirth: new Date('1982-08-20'),
      gender: 'female',
      nationality: 'Canadian',
      passportNumber: 'CA987654321',
    },
  });

  const multiDriverProfile = await prisma.driverProfile.upsert({
    where: { userId: multiUser.id },
    update: {},
    create: {
      userId: multiUser.id,
      licenseNumber: 'HK987654321',
      licenseExpiry: new Date('2026-06-30'),
      isApproved: true,
      rating: 4.9,
      totalTrips: 456,
      languages: ['English', 'Cantonese', 'Mandarin', 'French'],
      isAvailable: true,
    },
  });

  console.log('✅ Multi-role user created:', multiUser.email);

  // Create some sample bookings for testing (commented out for now due to foreign key constraints)
  console.log('📋 Skipping sample bookings creation for initial setup...');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Users Created:');
  console.log('  👨‍💼 Admin: admin@crossborder.com / admin123');
  console.log('  👤 Client: client@test.com / client123');
  console.log('  🚗 Driver: driver@test.com / driver123');
  console.log('  🎭 Multi-role: multi@test.com / multi123 (CLIENT + DRIVER + ADMIN)');
  console.log('\n🔗 You can now test the admin dashboard by logging in as any of these users.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });