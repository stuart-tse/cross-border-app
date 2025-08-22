import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ContentType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ContentType | null;
    const category = searchParams.get('category');
    const locale = searchParams.get('locale') || 'en';
    const key = searchParams.get('key');

    let where: any = {
      locale,
      isActive: true,
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (key) where.key = key;

    const contentItems = await prisma.contentItem.findMany({
      where,
      include: {
        translations: true,
      },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
        { title: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: contentItems,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      key,
      type,
      category,
      title,
      content,
      metadata,
      locale = 'en',
      isActive = true,
      sortOrder = 0,
      slug,
      metaTitle,
      metaDescription,
      createdBy,
    } = body;

    // Check if content with this key and locale already exists
    const existing = await prisma.contentItem.findUnique({
      where: {
        key_locale: {
          key,
          locale,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Content with this key already exists for this locale' },
        { status: 400 }
      );
    }

    const contentItem = await prisma.contentItem.create({
      data: {
        key,
        type,
        category,
        title,
        content,
        metadata,
        locale,
        isActive,
        sortOrder,
        slug,
        metaTitle,
        metaDescription,
        createdBy,
        updatedBy: createdBy,
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: contentItem,
    });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      content,
      metadata,
      isActive,
      sortOrder,
      slug,
      metaTitle,
      metaDescription,
      updatedBy,
    } = body;

    const contentItem = await prisma.contentItem.update({
      where: { id },
      data: {
        title,
        content,
        metadata,
        isActive,
        sortOrder,
        slug,
        metaTitle,
        metaDescription,
        updatedBy,
      },
      include: {
        translations: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: contentItem,
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Content ID is required' },
        { status: 400 }
      );
    }

    await prisma.contentItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}