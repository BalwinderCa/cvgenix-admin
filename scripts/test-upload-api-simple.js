import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createReadStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
try {
  const envLocalPath = resolve(process.cwd(), '.env.local');
  const envLocal = readFileSync(envLocalPath, 'utf8');
  envLocal.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  });
} catch (e) {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const env = readFileSync(envPath, 'utf8');
    env.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    });
  } catch (e2) {
    // No .env file
  }
}

// Test the upload function directly
async function testUploadDirectly() {
  console.log('🧪 Testing Cloudinary Upload Function Directly...\n');

  const { uploadToCloudinary } = await import('../lib/cloudinary.js');

  // Check if Cloudinary is configured
  const hasCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (!hasCloudinary) {
    console.error('❌ Cloudinary credentials not found in environment!');
    process.exit(1);
  }

  console.log('✅ Cloudinary credentials found\n');

  // Create a simple test image buffer (1x1 pixel PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const imageBuffer = Buffer.from(testImageBase64, 'base64');

  try {
    console.log('📤 Uploading test image to Cloudinary...');
    const result = await uploadToCloudinary(
      imageBuffer,
      'templates/previews/test',
      {
        public_id: `api_test_${Date.now()}`,
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }
    );

    console.log('✅ Upload successful!\n');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log(`\n🌐 Image URL: ${result.url}`);
    console.log('✅ Cloudinary upload integration is working correctly!');
    
    // Test deletion
    const { deleteFromCloudinary } = await import('../lib/cloudinary.js');
    console.log('\n🗑️  Cleaning up test image...');
    await deleteFromCloudinary(result.public_id);
    console.log('✅ Test image deleted');
    
    console.log('\n🎉 All tests passed! Your upload API will use Cloudinary.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Upload failed!');
    console.error('Error:', error.message);
    if (error.http_code) {
      console.error(`HTTP Code: ${error.http_code}`);
    }
    process.exit(1);
  }
}

testUploadDirectly();

