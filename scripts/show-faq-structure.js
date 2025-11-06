import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import FAQ from '../models/FAQ.js';

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

async function showFAQStructure() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cvgenix';
    
    await mongoose.connect(mongoUri);
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: "${dbName}"\n`);

    // Get schema information
    const schema = FAQ.schema;
    const paths = schema.paths;

    console.log('='.repeat(80));
    console.log('📊 FAQ TABLE STRUCTURE');
    console.log('='.repeat(80));
    console.log('\nCollection Name: faqs\n');

    console.log('┌──────────────────────┬──────────────┬──────────┬─────────────┬─────────────────────┐');
    console.log('│ Field Name            │ Type         │ Required │ Default     │ Additional Info     │');
    console.log('├──────────────────────┼──────────────┼──────────┼─────────────┼─────────────────────┤');

    Object.keys(paths).forEach(field => {
      if (field === '__v') return; // Skip version key
      
      const path = paths[field];
      const fieldName = field.padEnd(22);
      const type = (path.instance || path.constructor.name).padEnd(14);
      const required = (path.isRequired ? 'Yes' : 'No').padEnd(10);
      const defaultValue = (path.defaultValue !== undefined ? String(path.defaultValue) : 'None').padEnd(13);
      
      let additionalInfo = '';
      if (path.enumValues) {
        additionalInfo = `Enum: [${path.enumValues.join(', ')}]`;
      } else if (path.options && path.options.min !== undefined) {
        additionalInfo = `Min: ${path.options.min}`;
      } else if (path.options && path.options.max !== undefined) {
        additionalInfo = `Max: ${path.options.max}`;
      }
      
      console.log(`│ ${fieldName} │ ${type} │ ${required} │ ${defaultValue} │ ${additionalInfo.padEnd(19)} │`);
    });

    console.log('└──────────────────────┴──────────────┴──────────┴─────────────┴─────────────────────┘');

    // Show detailed field information
    console.log('\n' + '='.repeat(80));
    console.log('📋 DETAILED FIELD INFORMATION');
    console.log('='.repeat(80));

    Object.keys(paths).forEach(field => {
      if (field === '__v') return;
      
      const path = paths[field];
      console.log(`\n${field}:`);
      console.log(`  Type: ${path.instance || path.constructor.name}`);
      console.log(`  Required: ${path.isRequired ? 'Yes' : 'No'}`);
      console.log(`  Default: ${path.defaultValue !== undefined ? path.defaultValue : 'None'}`);
      if (path.enumValues) {
        console.log(`  Allowed Values: ${path.enumValues.join(', ')}`);
      }
      if (path.options && path.options.trim !== undefined) {
        console.log(`  Trimmed: Yes`);
      }
    });

    // Show indexes
    console.log('\n' + '='.repeat(80));
    console.log('🔍 INDEXES');
    console.log('='.repeat(80));
    const indexes = schema.indexes();
    indexes.forEach((index, i) => {
      console.log(`\n${i + 1}. ${JSON.stringify(index[0])}`);
    });

    // Show sample document
    const sampleFAQ = await FAQ.findOne({});
    if (sampleFAQ) {
      console.log('\n' + '='.repeat(80));
      console.log('📄 SAMPLE FAQ DOCUMENT');
      console.log('='.repeat(80));
      console.log(JSON.stringify(sampleFAQ.toObject(), null, 2));
    }

    // Show all FAQs summary
    const allFAQs = await FAQ.find({});
    console.log('\n' + '='.repeat(80));
    console.log('📊 DATABASE SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total FAQs: ${allFAQs.length}`);
    console.log(`Active FAQs: ${allFAQs.filter(f => f.isActive).length}`);
    console.log(`Featured FAQs: ${allFAQs.filter(f => f.isFeatured).length}`);
    console.log(`Categories: ${[...new Set(allFAQs.map(f => f.category))].join(', ')}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showFAQStructure();


