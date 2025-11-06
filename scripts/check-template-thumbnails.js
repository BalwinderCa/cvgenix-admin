import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Template from '../models/Template.js';

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

async function checkThumbnails() {
  try {
    console.log('Starting thumbnail check...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cvgenix';
    
    console.log(`Connecting to MongoDB...`);
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: "${dbName}"\n`);

    // Fetch all templates
    console.log('Fetching templates...');
    const templates = await Template.find({}).select('name category thumbnail _id');
    
    console.log(`📋 Found ${templates.length} templates\n`);
    console.log('='.repeat(80));
    console.log('Template Thumbnails:');
    console.log('='.repeat(80));

    if (templates.length === 0) {
      console.log('No templates found in database.');
      await mongoose.disconnect();
      process.exit(0);
    }

    let cloudinaryCount = 0;
    let localCount = 0;
    let defaultCount = 0;

    templates.forEach((template, index) => {
      const thumbnail = template.thumbnail || 'Not set';
      let source = '';
      
      if (thumbnail.includes('cloudinary.com')) {
        source = '🌐 Cloudinary';
        cloudinaryCount++;
      } else if (thumbnail.startsWith('/uploads/') || thumbnail.startsWith('/assets/')) {
        source = '📁 Local';
        localCount++;
      } else if (thumbnail === '/assets/images/templates/default.jpg' || thumbnail.includes('default')) {
        source = '⚪ Default';
        defaultCount++;
      } else if (thumbnail.startsWith('http')) {
        source = '🌐 External URL';
        cloudinaryCount++;
      } else {
        source = '❓ Unknown';
      }

      console.log(`\n${index + 1}. ${template.name}`);
      console.log(`   Category: ${template.category}`);
      console.log(`   ID: ${template._id}`);
      console.log(`   Thumbnail: ${thumbnail}`);
      console.log(`   Source: ${source}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('Summary:');
    console.log('='.repeat(80));
    console.log(`🌐 Cloudinary/External: ${cloudinaryCount}`);
    console.log(`📁 Local files: ${localCount}`);
    console.log(`⚪ Default placeholder: ${defaultCount}`);
    console.log(`📊 Total templates: ${templates.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkThumbnails();

