import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure S3 Client - credentials loaded dynamically
function getS3Client() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials are not configured');
  }

  return new S3Client({
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;

/**
 * Upload a file buffer to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} key - S3 object key (path/filename)
 * @param {string} contentType - MIME type (e.g., 'image/jpeg')
 * @param {object} options - Additional options (folder, ACL, etc.)
 * @returns {Promise<object>} Upload result with URL
 */
export async function uploadToS3(buffer, key, contentType = 'image/jpeg', options = {}) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || BUCKET_NAME;
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const {
    folder = 'templates/previews',
    cacheControl = 'max-age=31536000',
  } = options;

  // Construct full key with folder
  const fullKey = folder ? `${folder}/${key}` : key;

  // Build command - Note: ACL is not included as many modern S3 buckets have ACLs disabled
  // Use bucket policy for public access instead
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fullKey,
    Body: buffer,
    ContentType: contentType,
    CacheControl: cacheControl,
    // ACL removed - use bucket policy for public access
  });

  try {
    const client = getS3Client();
    await client.send(command);

    // Construct public URL
    // Handle different S3 URL formats based on region
    const region = process.env.AWS_REGION || 'us-east-1';
    let url;
    
    if (region === 'us-east-1') {
      // US East (N. Virginia) uses a different format
      url = `https://${bucketName}.s3.amazonaws.com/${fullKey}`;
    } else {
      url = `https://${bucketName}.s3.${region}.amazonaws.com/${fullKey}`;
    }
    
    // If using CloudFront, use that URL instead
    const cloudfrontUrl = process.env.AWS_CLOUDFRONT_URL;
    let publicUrl = url;
    
    // Only use CloudFront if it's a valid URL (not a placeholder)
    if (cloudfrontUrl && 
        cloudfrontUrl.startsWith('http') && 
        !cloudfrontUrl.includes('your-cloudfront-domain') &&
        !cloudfrontUrl.includes('# Optional')) {
      publicUrl = `${cloudfrontUrl.replace(/\/$/, '')}/${fullKey}`;
    }

    return {
      url: publicUrl,
      key: fullKey,
      bucket: bucketName,
      size: buffer.length,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}

/**
 * Upload a base64 image to S3
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} key - S3 object key
 * @param {string} contentType - MIME type
 * @param {object} options - Additional options
 * @returns {Promise<object>} Upload result with URL
 */
export async function uploadBase64ToS3(base64Data, key, contentType = 'image/jpeg', options = {}) {
  // Remove data URL prefix if present
  const base64String = base64Data.includes(',') 
    ? base64Data.split(',')[1] 
    : base64Data;

  // Convert base64 to buffer
  const buffer = Buffer.from(base64String, 'base64');

  return await uploadToS3(buffer, key, contentType, options);
}

/**
 * Upload multiple thumbnails to S3
 * @param {object} thumbnails - Object with size keys and base64 values
 * @param {string} baseName - Base name for the thumbnails
 * @param {string} folder - Folder path in S3
 * @returns {Promise<object>} Object with size keys and S3 URLs
 */
export async function uploadThumbnailsToS3(thumbnails, baseName, folder = 'templates/previews') {
  const thumbnailUrls = {};
  
  for (const [size, base64Data] of Object.entries(thumbnails)) {
    if (size === 'original') continue; // Skip original as it's uploaded separately
    
    try {
      const key = `${baseName}_${size}.jpg`;
      const result = await uploadBase64ToS3(
        base64Data,
        key,
        'image/jpeg',
        { folder: `${folder}/thumbnails` }
      );
      thumbnailUrls[size] = result.url;
    } catch (error) {
      console.error(`Error uploading thumbnail ${size} to S3:`, error);
      // Continue with other thumbnails even if one fails
    }
  }
  
  return thumbnailUrls;
}

/**
 * Delete an object from S3
 * @param {string} key - S3 object key
 * @returns {Promise<object>} Deletion result
 */
export async function deleteFromS3(key) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || BUCKET_NAME;
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const client = getS3Client();
    const result = await client.send(command);
    return result;
  } catch (error) {
    console.error('S3 delete error:', error);
    throw error;
  }
}

/**
 * Generate a presigned URL for temporary access
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @returns {Promise<string>} Presigned URL
 */
export async function getPresignedUrl(key, expiresIn = 3600) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME || BUCKET_NAME;
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const client = getS3Client();
    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('S3 presigned URL error:', error);
    throw error;
  }
}

/**
 * Check if S3 is configured
 * @returns {boolean} True if S3 credentials are configured
 */
export function isS3Configured() {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    (process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME) &&
    process.env.AWS_REGION
  );
}

export default getS3Client;

