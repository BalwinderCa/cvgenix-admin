import { NextResponse } from 'next/server';
import { uploadToS3, uploadThumbnailsToS3, isS3Configured } from '@/lib/s3';

// Determine folder structure based on upload type
const getFolderForType = (type) => {
  const folderMap = {
    'image': 'images',
    'logo': 'company/logo',
    'company-logo': 'company/logo',
    'thumbnail': 'templates/previews',
    'template': 'templates/previews',
    'avatar': 'avatars',
    'document': 'documents',
  };
  
  return folderMap[type] || 'images';
};

export async function POST(request) {
  try {
    // Check if S3 is configured - REQUIRED
    if (!isS3Configured()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'S3 storage is not configured. Please configure AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME, AWS_REGION) in your environment variables.' 
        },
        { status: 500 }
      );
    }

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

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExtension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    const fileName = `${baseName}_${timestamp}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine content type from file
    const contentType = file.type || 'image/jpeg';
    
    // Get appropriate folder based on upload type
    const folder = getFolderForType(type);
    
    // Upload to S3
    const uploadResult = await uploadToS3(
      buffer,
      fileName,
      contentType,
      {
        folder: folder,
        cacheControl: 'max-age=31536000',
      }
    );
    
    const fileUrl = uploadResult.url;
    let thumbnailUrls = {};

    // Upload thumbnails if provided
    if (thumbnailsJson) {
      try {
        const thumbnails = JSON.parse(thumbnailsJson);
        thumbnailUrls = await uploadThumbnailsToS3(
          thumbnails,
          `${baseName}_${timestamp}`,
          folder
        );
      } catch (error) {
        console.error('Error uploading thumbnails to S3:', error);
        // Continue even if thumbnails fail
      }
    }

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

