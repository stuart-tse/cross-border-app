import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { getAuthUser } from '@/lib/auth/utils';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'verification', 'avatar', 'blog'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = {
      verification: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
      avatar: ['image/jpeg', 'image/png', 'image/jpg'],
      blog: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    };

    const validTypes = allowedTypes[type as keyof typeof allowedTypes] || allowedTypes.verification;
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}. Allowed: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomSuffix}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let processedBuffer = buffer;

    // Process images
    if (file.type.startsWith('image/')) {
      try {
        // Optimize and resize images
        const maxWidth = type === 'avatar' ? 400 : type === 'blog' ? 1200 : 800;
        const quality = type === 'avatar' ? 90 : 80;

        processedBuffer = await sharp(buffer)
          .resize(maxWidth, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({ quality })
          .toBuffer();

        // Update filename to .jpg for processed images
        const processedFileName = fileName.replace(/\.[^/.]+$/, '.jpg');
        const processedFilePath = join(uploadDir, processedFileName);
        
        await writeFile(processedFilePath, processedBuffer);

        const fileUrl = `/uploads/${type}/${processedFileName}`;
        
        return NextResponse.json({
          success: true,
          file: {
            name: processedFileName,
            originalName: file.name,
            size: processedBuffer.length,
            type: 'image/jpeg',
            url: fileUrl,
            uploadedAt: new Date().toISOString(),
          },
        });
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        // Fallback to original file if processing fails
      }
    }

    // Write original file if not processed
    await writeFile(filePath, processedBuffer);

    const fileUrl = `/uploads/${type}/${fileName}`;

    return NextResponse.json({
      success: true,
      file: {
        name: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// Get uploaded files for user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    // This would typically query a database table that tracks uploads
    // For now, return a placeholder response
    return NextResponse.json({
      files: [],
      message: 'File listing would be implemented with database tracking',
    });
  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}