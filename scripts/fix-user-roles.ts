#!/usr/bin/env tsx

import { PrismaClient, UserType } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserRoles() {
  const userEmail = 'stuart_tse@outlook.com';
  const targetRole = UserType.BLOG_EDITOR;

  try {
    console.log('🔍 Looking for user:', userEmail);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        userRoles: {
          where: { isActive: true }
        }
      }
    });

    if (!user) {
      console.error('❌ User not found:', userEmail);
      process.exit(1);
    }

    console.log('👤 Found user:', {
      id: user.id,
      name: user.name,
      email: user.email
    });

    console.log('🔐 Current active roles:', user.userRoles.map(r => r.role));

    // Check if user already has the BLOG_EDITOR role
    const hasRole = user.userRoles.some(role => role.role === targetRole);
    
    if (hasRole) {
      console.log('✅ User already has', targetRole, 'role');
      return;
    }

    // Check if there's an inactive BLOG_EDITOR role
    const inactiveRole = await prisma.userRole.findFirst({
      where: {
        userId: user.id,
        role: targetRole,
        isActive: false
      }
    });

    if (inactiveRole) {
      console.log('🔄 Found inactive', targetRole, 'role, reactivating...');
      
      await prisma.userRole.update({
        where: { id: inactiveRole.id },
        data: { 
          isActive: true,
          assignedAt: new Date() 
        }
      });
      
      console.log('✅ Reactivated', targetRole, 'role for user');
    } else {
      console.log('➕ Adding new', targetRole, 'role...');
      
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: targetRole,
          isActive: true,
          assignedBy: 'system' // Mark as system-assigned for debugging
        }
      });
      
      console.log('✅ Added', targetRole, 'role for user');
    }

    // Also create/update the BlogEditorProfile if it doesn't exist
    const blogEditorProfile = await prisma.blogEditorProfile.findUnique({
      where: { userId: user.id }
    });

    if (!blogEditorProfile) {
      console.log('📝 Creating blog editor profile...');
      
      await prisma.blogEditorProfile.create({
        data: {
          userId: user.id,
          bio: 'CrossBorder Services content creator',
          isApproved: true, // Auto-approve for development
          permissions: ['create', 'edit', 'publish', 'delete']
        }
      });
      
      console.log('✅ Created blog editor profile');
    } else if (!blogEditorProfile.isApproved) {
      console.log('🔓 Approving blog editor profile...');
      
      await prisma.blogEditorProfile.update({
        where: { userId: user.id },
        data: { 
          isApproved: true,
          permissions: ['create', 'edit', 'publish', 'delete']
        }
      });
      
      console.log('✅ Approved blog editor profile');
    }

    // Verify the changes
    const updatedUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        userRoles: {
          where: { isActive: true }
        },
        blogEditorProfile: true
      }
    });

    console.log('🎉 Final verification:');
    console.log('   User roles:', updatedUser?.userRoles.map(r => r.role));
    console.log('   Blog editor approved:', updatedUser?.blogEditorProfile?.isApproved);
    console.log('   Blog editor permissions:', updatedUser?.blogEditorProfile?.permissions);

  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixUserRoles().catch(console.error);