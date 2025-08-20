#!/usr/bin/env tsx

import { PrismaClient, UserType } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserRoles() {
  const userEmail = 'stuart_tse@outlook.com';

  try {
    console.log('🔍 Checking user roles for:', userEmail);
    
    // Find the user with all related data
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        userRoles: {
          orderBy: { assignedAt: 'asc' }
        },
        blogEditorProfile: true
      }
    });

    if (!user) {
      console.error('❌ User not found:', userEmail);
      process.exit(1);
    }

    console.log('\n👤 User Details:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Is Active:', user.isActive);
    console.log('   Is Verified:', user.isVerified);

    console.log('\n🔐 All User Roles:');
    user.userRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.role}`);
      console.log(`      Active: ${role.isActive}`);
      console.log(`      Assigned At: ${role.assignedAt.toISOString()}`);
      console.log(`      Assigned By: ${role.assignedBy || 'N/A'}`);
    });

    console.log('\n✅ Active Roles:');
    const activeRoles = user.userRoles.filter(role => role.isActive);
    activeRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.role}`);
    });

    console.log('\n📝 Blog Editor Profile:');
    if (user.blogEditorProfile) {
      console.log('   Exists: Yes');
      console.log('   Approved:', user.blogEditorProfile.isApproved);
      console.log('   Permissions:', user.blogEditorProfile.permissions);
      console.log('   Bio:', user.blogEditorProfile.bio || 'N/A');
      console.log('   Created At:', user.blogEditorProfile.createdAt.toISOString());
    } else {
      console.log('   Exists: No');
    }

    // Check for any authentication-related records
    console.log('\n🔐 Authentication Records:');
    const accounts = await prisma.account.findMany({
      where: { userId: user.id }
    });
    console.log('   Accounts:', accounts.length);
    
    const sessions = await prisma.session.findMany({
      where: { userId: user.id }
    });
    console.log('   Active Sessions:', sessions.length);

    if (sessions.length > 0) {
      console.log('   Latest Session Expires:', sessions[0].expires.toISOString());
    }

  } catch (error) {
    console.error('❌ Error checking user roles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkUserRoles().catch(console.error);