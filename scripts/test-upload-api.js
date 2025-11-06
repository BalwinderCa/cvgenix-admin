import { readFileSync } from 'fs';
import { resolve } from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

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

async function testUploadAPI() {
  console.log('🧪 Testing Upload API Endpoint...\n');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const uploadUrl = `${baseUrl}/api/upload/image`;

  console.log(`📍 Testing endpoint: ${uploadUrl}\n`);

  // Check if Cloudinary is configured
  const hasCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (hasCloudinary) {
    console.log('✅ Cloudinary credentials detected - uploads will go to Cloudinary\n');
  } else {
    console.log('ℹ️  No Cloudinary credentials - uploads will use local storage\n');
  }

  // Create a simple test image buffer (1x1 pixel PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const imageBuffer = Buffer.from(testImageBase64, 'base64');

  // Create FormData
  const formData = new FormData();
  formData.append('file', imageBuffer, {
    filename: 'test-image.png',
    contentType: 'image/png',
  });
  formData.append('type', 'image');

  try {
    console.log('📤 Sending upload request...');
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Upload successful!\n');
      console.log('Response:', JSON.stringify(result, null, 2));
      
      const url = result.data.url;
      if (url.startsWith('http')) {
        console.log(`\n🌐 Image uploaded to Cloudinary: ${url}`);
        console.log('✅ Cloudinary integration is working!');
      } else {
        console.log(`\n📁 Image saved locally: ${url}`);
        console.log('ℹ️  Using local storage (Cloudinary may not be configured)');
      }
    } else {
      console.error('❌ Upload failed!');
      console.error('Error:', result.error);
      process.exit(1);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused!');
      console.error('   Make sure the Next.js dev server is running:');
      console.error('   npm run dev\n');
      process.exit(1);
    } else {
      console.error('❌ Request failed!');
      console.error('Error:', error.message);
      process.exit(1);
    }
  }
}

testUploadAPI();

