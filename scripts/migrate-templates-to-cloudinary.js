import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import Template from '../models/Template.js';

// Load environment variables from .env.local manually FIRST
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

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

async function migrateTemplatesToCloudinary() {
  try {
    // Dynamically import Cloudinary AFTER environment variables are loaded
    const { uploadToCloudinary } = await import('../lib/cloudinary.js');

    // Check Cloudinary configuration
    if (!isCloudinaryConfigured()) {
      console.error('❌ Cloudinary credentials not found!');
      console.log('\nPlease add these to your .env file:');
      console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
      console.log('CLOUDINARY_API_KEY=your_api_key');
      console.log('CLOUDINARY_API_SECRET=your_api_secret\n');
      process.exit(1);
    }

    console.log('✅ Cloudinary credentials found\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cvgenix';
    
    let dbType = 'Unknown';
    if (mongoUri.includes('mongodb.net') || mongoUri.includes('mongodb+srv')) {
      dbType = 'MongoDB Atlas (Cloud)';
    } else if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      dbType = 'Local MongoDB';
    } else {
      dbType = 'Custom MongoDB';
    }
    
    console.log(`📡 Connecting to: ${dbType}`);
    console.log(`🔗 URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: "${dbName}"\n`);

    // Fetch all templates
    const templates = await Template.find({});
    console.log(`📋 Found ${templates.length} templates to process\n`);

    if (templates.length === 0) {
      console.log('ℹ️  No templates found in database.');
      process.exit(0);
    }

    let uploadedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each template
    for (const template of templates) {
      const templateId = template._id.toString();
      const templateName = template.name;
      const currentThumbnail = template.thumbnail || '';

      console.log(`\n📄 Processing: ${templateName} (ID: ${templateId})`);
      console.log(`   Current thumbnail: ${currentThumbnail}`);

      // Skip if already using Cloudinary URL
      if (currentThumbnail.includes('cloudinary.com') || currentThumbnail.startsWith('http')) {
        console.log(`   ⏭️  Skipping - already using Cloudinary or external URL`);
        skippedCount++;
        continue;
      }

      // Skip if no thumbnail or default placeholder
      if (!currentThumbnail || currentThumbnail === '/assets/images/templates/default.jpg') {
        console.log(`   ⏭️  Skipping - no thumbnail or default placeholder`);
        skippedCount++;
        continue;
      }

      // Try to find the image file
      let imagePath = null;
      const publicPath = join(process.cwd(), 'public', currentThumbnail);
      
      if (existsSync(publicPath)) {
        imagePath = publicPath;
      } else {
        // Try alternative paths
        const altPath1 = join(process.cwd(), currentThumbnail);
        const altPath2 = join(process.cwd(), 'public', 'uploads', 'templates', currentThumbnail.split('/').pop());
        
        if (existsSync(altPath1)) {
          imagePath = altPath1;
        } else if (existsSync(altPath2)) {
          imagePath = altPath2;
        }
      }

      if (!imagePath || !existsSync(imagePath)) {
        console.log(`   ⚠️  Image file not found: ${currentThumbnail}`);
        errorCount++;
        errors.push({
          template: templateName,
          id: templateId,
          error: `Image file not found: ${currentThumbnail}`
        });
        continue;
      }

      try {
        // Read the image file
        console.log(`   📖 Reading image from: ${imagePath}`);
        const imageBuffer = readFileSync(imagePath);
        
        // Generate a safe public_id from template name
        const safeName = templateName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        const publicId = `templates/previews/${safeName}_${templateId}`;

        // Upload to Cloudinary
        console.log(`   📤 Uploading to Cloudinary...`);
        const uploadResult = await uploadToCloudinary(
          imageBuffer,
          'templates/previews',
          {
            public_id: publicId,
            overwrite: false, // Don't overwrite if already exists
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          }
        );

        const cloudinaryUrl = uploadResult.url;
        console.log(`   ✅ Uploaded successfully!`);
        console.log(`   🌐 Cloudinary URL: ${cloudinaryUrl}`);

        // Update template in database
        template.thumbnail = cloudinaryUrl;
        await template.save();
        
        console.log(`   💾 Database updated`);
        uploadedCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`   ❌ Error uploading: ${error.message}`);
        errorCount++;
        errors.push({
          template: templateName,
          id: templateId,
          error: error.message
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successfully uploaded: ${uploadedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach((err, index) => {
        console.log(`   ${index + 1}. ${err.template} (${err.id}): ${err.error}`);
      });
    }

    console.log('\n✅ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:', error);
    process.exit(1);
  }
}

migrateTemplatesToCloudinary();

