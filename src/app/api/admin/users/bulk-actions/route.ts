import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userIds, data } = body;

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and user IDs are required' },
        { status: 400 }
      );
    }

    let results;

    switch (action) {
      case 'activate':
        results = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: true, updatedAt: new Date() }
        });
        break;

      case 'deactivate':
        results = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false, updatedAt: new Date() }
        });
        break;

      case 'verify':
        results = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isVerified: true, updatedAt: new Date() }
        });
        break;

      case 'unverify':
        results = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isVerified: false, updatedAt: new Date() }
        });
        break;

      case 'upgrade_membership':
        if (!data?.membershipTier) {
          return NextResponse.json(
            { error: 'Membership tier is required for upgrade action' },
            { status: 400 }
          );
        }
        
        results = await prisma.clientProfile.updateMany({
          where: { userId: { in: userIds } },
          data: { 
            membershipTier: data.membershipTier,
            updatedAt: new Date()
          }
        });
        break;

      case 'approve_drivers':
        results = await prisma.driverProfile.updateMany({
          where: { userId: { in: userIds } },
          data: { 
            isApproved: true,
            updatedAt: new Date()
          }
        });
        break;

      case 'reject_drivers':
        results = await prisma.driverProfile.updateMany({
          where: { userId: { in: userIds } },
          data: { 
            isApproved: false,
            updatedAt: new Date()
          }
        });
        break;

      case 'approve_editors':
        results = await prisma.blogEditorProfile.updateMany({
          where: { userId: { in: userIds } },
          data: { 
            isApproved: true,
            updatedAt: new Date()
          }
        });
        break;

      case 'send_notification':
        if (!data?.title || !data?.message) {
          return NextResponse.json(
            { error: 'Title and message are required for notification' },
            { status: 400 }
          );
        }

        // Create notifications for all selected users
        const notifications = userIds.map(userId => ({
          userId,
          type: data.type || 'SYSTEM_UPDATE',
          title: data.title,
          message: data.message,
          data: data.additionalData || {}
        }));

        results = await prisma.notification.createMany({
          data: notifications
        });
        break;

      case 'export':
        // Get user data for export
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          include: {
            userRoles: {
              where: { isActive: true },
              select: { role: true }
            },
            clientProfile: true,
            driverProfile: true,
            blogEditorProfile: true
          }
        });

        // Format data for CSV export
        const csvData = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.userRoles?.[0]?.role || '',
          isActive: user.isActive,
          isVerified: user.isVerified,
          membershipTier: user.clientProfile?.membershipTier || '',
          loyaltyPoints: user.clientProfile?.loyaltyPoints || 0,
          driverLicense: user.driverProfile?.licenseNumber || '',
          driverRating: user.driverProfile?.rating || 0,
          driverApproved: user.driverProfile?.isApproved || false,
          editorApproved: user.blogEditorProfile?.isApproved || false,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }));

        return NextResponse.json({
          message: 'Export data prepared',
          data: csvData,
          count: csvData.length
        });

      case 'delete':
        // Soft delete users
        results = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false, updatedAt: new Date() }
        });
        break;

      case 'hard_delete':
        // Hard delete users - use with caution
        results = await prisma.user.deleteMany({
          where: { id: { in: userIds } }
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Successfully processed ${action} for ${results.count || userIds.length} users`,
      action,
      affectedCount: results.count || userIds.length,
      userIds
    });

  } catch (error) {
    console.error('Error processing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk action' },
      { status: 500 }
    );
  }
}