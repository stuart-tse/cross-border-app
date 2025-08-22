import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/database/client';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// POST /api/client/upload - Handle file uploads
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = session.user;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'avatar' | 'document'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type and size
    const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for avatars, 10MB for documents
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` 
      }, { status: 400 });
    }

    const allowedTypes = type === 'avatar' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type === 'avatar' ? 'avatars' : 'documents');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${user.id}_${timestamp}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate URL
    const fileUrl = `/uploads/${type === 'avatar' ? 'avatars' : 'documents'}/${fileName}`;

    // Update user avatar if type is avatar
    if (type === 'avatar') {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: fileUrl }
      });
    }

    return NextResponse.json({
      url: fileUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
      message: 'File uploaded successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/client/upload - Delete uploaded files
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = session.user;

    const body = await request.json();
    const { fileUrl, type } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
    }

    // Validate that the file belongs to the user
    const fileName = path.basename(fileUrl);
    if (!fileName.startsWith(user.id)) {
      return NextResponse.json({ error: 'Unauthorized to delete this file' }, { status: 403 });
    }

    // Remove file from filesystem
    const filePath = path.join(process.cwd(), 'public', fileUrl);
    try {
      const { unlink } = await import('fs/promises');
      await unlink(filePath);
    } catch (fileError) {
      console.warn('File not found on filesystem:', filePath);
    }

    // Update user avatar if it was an avatar file
    if (type === 'avatar') {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: null }
      });
    }

    return NextResponse.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}