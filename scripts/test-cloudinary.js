import { v2 as cloudinary } from 'cloudinary';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local manually
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
  // .env.local doesn't exist, try .env
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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  console.log('🧪 Testing Cloudinary Integration...\n');

  // Check if credentials are configured
  const hasCredentials = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (!hasCredentials) {
    console.error('❌ Cloudinary credentials not found!');
    console.log('\nPlease add these to your .env file:');
    console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('CLOUDINARY_API_KEY=your_api_key');
    console.log('CLOUDINARY_API_SECRET=your_api_secret\n');
    process.exit(1);
  }

  console.log('✅ Cloudinary credentials found');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY.substring(0, 8)}...`);
  console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET.substring(0, 8)}...\n`);

  // Test connection by getting account info
  try {
    console.log('🔍 Testing Cloudinary connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!\n');
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Cloudinary connection failed!');
    console.error('Error:', error.message);
    if (error.http_code === 401) {
      console.error('\n⚠️  Authentication failed. Please check your API credentials.');
    }
    process.exit(1);
  }

  // Test upload functionality
  try {
    console.log('\n📤 Testing upload functionality...');
    
    // Create a simple test image (1x1 pixel PNG in base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${testImageBase64}`,
      {
        folder: 'templates/previews/test',
        public_id: `test_${Date.now()}`,
        resource_type: 'image',
      }
    );

    console.log('✅ Upload successful!');
    console.log(`   URL: ${uploadResult.secure_url}`);
    console.log(`   Public ID: ${uploadResult.public_id}`);
    console.log(`   Format: ${uploadResult.format}`);
    console.log(`   Size: ${uploadResult.bytes} bytes\n`);

    // Test deletion
    console.log('🗑️  Testing deletion...');
    const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Deletion successful!');
    console.log('   Result:', deleteResult.result);
    
    console.log('\n🎉 All tests passed! Cloudinary is ready to use.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Upload test failed!');
    console.error('Error:', error.message);
    if (error.http_code) {
      console.error(`HTTP Code: ${error.http_code}`);
    }
    process.exit(1);
  }
}

testCloudinary();

