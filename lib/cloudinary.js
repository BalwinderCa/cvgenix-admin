import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Folder path in Cloudinary (e.g., 'templates/previews')
 * @param {object} options - Additional Cloudinary upload options
 * @returns {Promise<object>} Upload result with secure_url
 */
export async function uploadToCloudinary(buffer, folder = 'templates/previews', options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      ...options,
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    ).end(buffer);
  });
}

/**
 * Upload a base64 image to Cloudinary
 * @param {string} base64Data - Base64 encoded image data (with or without data URL prefix)
 * @param {string} folder - Folder path in Cloudinary
 * @param {object} options - Additional Cloudinary upload options
 * @returns {Promise<object>} Upload result with secure_url
 */
export async function uploadBase64ToCloudinary(base64Data, folder = 'templates/previews', options = {}) {
  // Remove data URL prefix if present
  const base64String = base64Data.includes(',') 
    ? base64Data.split(',')[1] 
    : base64Data;

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      ...options,
    };

    cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64String}`,
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    );
  });
}

/**
 * Upload multiple thumbnails to Cloudinary
 * @param {object} thumbnails - Object with size keys and base64 values
 * @param {string} baseName - Base name for the thumbnails
 * @param {string} folder - Folder path in Cloudinary
 * @returns {Promise<object>} Object with size keys and Cloudinary URLs
 */
export async function uploadThumbnailsToCloudinary(thumbnails, baseName, folder = 'templates/previews') {
  const thumbnailUrls = {};
  
  for (const [size, base64Data] of Object.entries(thumbnails)) {
    if (size === 'original') continue; // Skip original as it's uploaded separately
    
    try {
      const result = await uploadBase64ToCloudinary(
        base64Data,
        `${folder}/thumbnails`,
        {
          public_id: `${baseName}_${size}`,
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        }
      );
      thumbnailUrls[size] = result.url;
    } catch (error) {
      console.error(`Error uploading thumbnail ${size}:`, error);
      // Continue with other thumbnails even if one fails
    }
  }
  
  return thumbnailUrls;
}

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transformations - Transformation options
 * @returns {string} Optimized URL
 */
export function getOptimizedUrl(publicId, transformations = {}) {
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations,
  };
  
  return cloudinary.url(publicId, {
    secure: true,
    ...defaultTransformations,
  });
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} Deletion result
 */
export async function deleteFromCloudinary(publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

export default cloudinary;

