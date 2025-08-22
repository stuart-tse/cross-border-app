import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ListType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listType = searchParams.get('listType') as ListType | null;
    const locale = searchParams.get('locale') || 'en';
    const parentId = searchParams.get('parentId');

    let where: any = {
      locale,
      isActive: true,
    };

    if (listType) where.listType = listType;
    if (parentId) where.parentId = parentId;

    const listItems = await prisma.listItem.findMany({
      where,
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { label: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: listItems,
    });
  } catch (error) {
    console.error('Error fetching list items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch list items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      listType,
      key,
      label,
      value,
      description,
      icon,
      color,
      parentId,
      sortOrder = 0,
      isActive = true,
      isDefault = false,
      locale = 'en',
      metadata,
    } = body;

    // Check if item with this key already exists for this list type and locale
    const existing = await prisma.listItem.findUnique({
      where: {
        listType_key_locale: {
          listType,
          key,
          locale,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Item with this key already exists for this list type and locale' },
        { status: 400 }
      );
    }

    const listItem = await prisma.listItem.create({
      data: {
        listType,
        key,
        label,
        value,
        description,
        icon,
        color,
        parentId,
        sortOrder,
        isActive,
        isDefault,
        locale,
        metadata,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: listItem,
    });
  } catch (error) {
    console.error('Error creating list item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create list item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      label,
      value,
      description,
      icon,
      color,
      parentId,
      sortOrder,
      isActive,
      isDefault,
      metadata,
    } = body;

    const listItem = await prisma.listItem.update({
      where: { id },
      data: {
        label,
        value,
        description,
        icon,
        color,
        parentId,
        sortOrder,
        isActive,
        isDefault,
        metadata,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: listItem,
    });
  } catch (error) {
    console.error('Error updating list item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update list item' },
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
        { success: false, error: 'List item ID is required' },
        { status: 400 }
      );
    }

    await prisma.listItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'List item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting list item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete list item' },
      { status: 500 }
    );
  }
}