import { readFileSync } from 'fs';
import { resolve } from 'path';
import { uploadToS3, isS3Configured } from '../lib/s3.js';

// Load environment variables
try {
  const envPath = resolve(process.cwd(), '.env');
  const env = readFileSync(envPath, 'utf8');
  env.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {
  console.error('Error loading .env:', e.message);
}

async function testS3() {
  console.log('🧪 Testing AWS S3 Integration...\n');

  if (!isS3Configured()) {
    console.error('❌ S3 credentials not found!');
    console.log('\nPlease add these to your .env file:');
    console.log('AWS_ACCESS_KEY_ID=your_access_key_id');
    console.log('AWS_SECRET_ACCESS_KEY=your_secret_access_key');
    console.log('AWS_REGION=us-east-1');
    console.log('AWS_S3_BUCKET_NAME=your-bucket-name\n');
    process.exit(1);
  }

  console.log('✅ S3 credentials found');
  console.log(`   Region: ${process.env.AWS_REGION}`);
  console.log(`   Bucket: ${process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME}\n`);

  try {
    console.log('📤 Testing S3 upload...');
    
    // Create a simple test image (1x1 pixel PNG in base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(testImageBase64, 'base64');
    
    const timestamp = Date.now();
    const testKey = `test/s3_test_${timestamp}.png`;
    
    const result = await uploadToS3(
      imageBuffer,
      testKey,
      'image/png',
      {
        folder: '',
      }
    );

    console.log('✅ Upload successful!');
    console.log(`   URL: ${result.url}`);
    console.log(`   Key: ${result.key}`);
    console.log(`   Bucket: ${result.bucket}`);
    console.log(`   Size: ${result.size} bytes\n`);

    // Test URL accessibility
    console.log('🔍 Testing URL accessibility...');
    try {
      const response = await fetch(result.url);
      if (response.ok) {
        console.log('✅ URL is accessible!');
        console.log(`   Status: ${response.status}`);
      } else {
        console.log(`⚠️  URL returned status: ${response.status}`);
      }
    } catch (error) {
      console.log(`⚠️  Could not verify URL accessibility: ${error.message}`);
    }
    
    console.log('\n🎉 S3 integration is working correctly!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Upload test failed!');
    console.error('Error:', error.message);
    if (error.$metadata) {
      console.error(`HTTP Code: ${error.$metadata.httpStatusCode}`);
    }
    process.exit(1);
  }
}

testS3();

