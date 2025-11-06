import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { uploadToS3, isS3Configured } from '../lib/s3.js';
import Template from '../models/Template.js';

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

async function migrateTemplatesToS3() {
  try {
    console.log('🔄 Migrating template previews from Cloudinary to S3...\n');

    // Check S3 configuration
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

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cvgenix';
    
    console.log('📡 Connecting to MongoDB...');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: "${dbName}"\n`);

    // Fetch all templates
    const templates = await Template.find({});
    console.log(`📋 Found ${templates.length} templates to process\n`);

    if (templates.length === 0) {
      console.log('⚠️  No templates found in database.');
      await mongoose.disconnect();
      process.exit(0);
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each template
    for (const template of templates) {
      const templateId = template._id.toString();
      const templateName = template.name;
      const currentThumbnail = template.thumbnail || '';

      console.log(`\n${'─'.repeat(80)}`);
      console.log(`Processing: ${templateName} (ID: ${templateId})`);
      console.log(`Current thumbnail: ${currentThumbnail}`);

      // Skip if already using S3 URL
      if (currentThumbnail.includes('s3.amazonaws.com') || 
          currentThumbnail.includes('amazonaws.com') ||
          (process.env.AWS_CLOUDFRONT_URL && currentThumbnail.includes(process.env.AWS_CLOUDFRONT_URL))) {
        console.log(`   ⏭️  Skipping - already using S3 URL`);
        skippedCount++;
        continue;
      }

      // Skip if no thumbnail or default placeholder
      if (!currentThumbnail || currentThumbnail === '/assets/images/templates/default.jpg') {
        console.log(`   ⏭️  Skipping - no thumbnail or default placeholder`);
        skippedCount++;
        continue;
      }

      try {
        let imageBuffer;
        let contentType = 'image/jpeg';

        // If it's a Cloudinary URL, download it first
        if (currentThumbnail.includes('cloudinary.com')) {
          console.log(`   📥 Downloading from Cloudinary...`);
          const response = await fetch(currentThumbnail);
          if (!response.ok) {
            throw new Error(`Failed to download from Cloudinary: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
          contentType = response.headers.get('content-type') || 'image/jpeg';
        } 
        // If it's a local file, read it
        else if (currentThumbnail.startsWith('/uploads/') || currentThumbnail.startsWith('/assets/')) {
          const { readFileSync, existsSync } = await import('fs');
          const { join } = await import('path');
          
          const publicPath = join(process.cwd(), 'public', currentThumbnail);
          if (!existsSync(publicPath)) {
            throw new Error(`Local file not found: ${currentThumbnail}`);
          }
          console.log(`   📖 Reading local file...`);
          imageBuffer = readFileSync(publicPath);
          
          // Determine content type from extension
          if (currentThumbnail.endsWith('.png')) {
            contentType = 'image/png';
          } else if (currentThumbnail.endsWith('.jpg') || currentThumbnail.endsWith('.jpeg')) {
            contentType = 'image/jpeg';
          }
        } else {
          console.log(`   ⚠️  Unknown URL format, skipping`);
          skippedCount++;
          continue;
        }

        // Generate S3 key
        const safeName = templateName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        const timestamp = Date.now();
        const fileExtension = contentType.includes('png') ? 'png' : 'jpg';
        const s3Key = `templates/previews/${safeName}_${templateId}.${fileExtension}`;

        // Upload to S3
        console.log(`   📤 Uploading to S3...`);
        const uploadResult = await uploadToS3(
          imageBuffer,
          `${safeName}_${templateId}.${fileExtension}`,
          contentType,
          {
            folder: 'templates/previews',
            cacheControl: 'max-age=31536000',
          }
        );

        const s3Url = uploadResult.url;
        console.log(`   ✅ Uploaded successfully!`);
        console.log(`   🌐 S3 URL: ${s3Url}`);

        // Update template in database
        template.thumbnail = s3Url;
        await template.save();
        
        console.log(`   💾 Database updated`);
        migratedCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        errorCount++;
        errors.push({
          template: templateName,
          id: templateId,
          error: error.message
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 Migration Summary');
    console.log('='.repeat(80));
    console.log(`✅ Successfully migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach((err, index) => {
        console.log(`   ${index + 1}. ${err.template} (${err.id}): ${err.error}`);
      });
    }

    console.log('\n✅ Migration completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify templates are displaying correctly');
    console.log('   2. Configure S3 bucket policy for public read access (if needed)');
    console.log('   3. Set up CloudFront CDN for better performance (optional)');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

migrateTemplatesToS3();


