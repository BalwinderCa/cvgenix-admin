import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const thumbnailsJson = formData.get('thumbnails');
    const type = formData.get('type') || 'image';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'templates');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExtension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    const fileName = `${baseName}_${timestamp}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save original file
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Parse thumbnails if provided
    let thumbnailUrls = {};
    if (thumbnailsJson) {
      try {
        const thumbnails = JSON.parse(thumbnailsJson);
        const thumbnailDir = join(uploadsDir, 'thumbnails');
        
        if (!existsSync(thumbnailDir)) {
          await mkdir(thumbnailDir, { recursive: true });
        }

        // Save each thumbnail
        for (const [size, base64Data] of Object.entries(thumbnails)) {
          if (size === 'original') continue; // Skip original as we already saved it
          
          // Convert base64 to buffer
          const base64 = base64Data.split(',')[1] || base64Data;
          const thumbnailBuffer = Buffer.from(base64, 'base64');
          
          // Save thumbnail
          const thumbnailFileName = `${baseName}_${timestamp}_${size}.jpg`;
          const thumbnailPath = join(thumbnailDir, thumbnailFileName);
          await writeFile(thumbnailPath, thumbnailBuffer);
          
          thumbnailUrls[size] = `/uploads/templates/thumbnails/${thumbnailFileName}`;
        }
      } catch (error) {
        console.error('Error saving thumbnails:', error);
        // Continue even if thumbnails fail
      }
    }

    const fileUrl = `/uploads/templates/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        thumbnails: thumbnailUrls,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}


