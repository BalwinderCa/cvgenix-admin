import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';
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

async function verifyS3Templates() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cvgenix';
    
    await mongoose.connect(mongoUri);
    const templates = await Template.find({}).select('name thumbnail _id');
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEMPLATE THUMBNAIL VERIFICATION');
    console.log('='.repeat(80));
    console.log(`\nFound ${templates.length} templates\n`);

    let s3Count = 0;
    let cloudinaryCount = 0;
    let localCount = 0;
    let otherCount = 0;

    templates.forEach((template, index) => {
      const thumbnail = template.thumbnail || 'N/A';
      let source = '';
      
      if (thumbnail.includes('s3.amazonaws.com') || thumbnail.includes('amazonaws.com')) {
        source = '🌐 S3';
        s3Count++;
      } else if (thumbnail.includes('cloudinary.com')) {
        source = '☁️  Cloudinary';
        cloudinaryCount++;
      } else if (thumbnail.startsWith('/uploads/') || thumbnail.startsWith('/assets/')) {
        source = '📁 Local';
        localCount++;
      } else {
        source = '❓ Other';
        otherCount++;
      }

      console.log(`${index + 1}. ${template.name}`);
      console.log(`   Source: ${source}`);
      console.log(`   URL: ${thumbnail.substring(0, 80)}${thumbnail.length > 80 ? '...' : ''}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('📈 SUMMARY:');
    console.log('='.repeat(80));
    console.log(`🌐 S3 URLs:        ${s3Count}`);
    console.log(`☁️  Cloudinary:    ${cloudinaryCount}`);
    console.log(`📁 Local files:    ${localCount}`);
    console.log(`❓ Other:          ${otherCount}`);
    console.log(`📊 Total:          ${templates.length}`);
    console.log('='.repeat(80));

    if (s3Count === templates.length) {
      console.log('\n✅ All templates are using S3!');
    } else if (s3Count > 0) {
      console.log(`\n⚠️  ${templates.length - s3Count} template(s) still need migration`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyS3Templates();


