import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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
  } catch (e2) {}
}

import Template from '../models/Template.js';

async function viewTemplate() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cvgenix';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    const template = await Template.findOne({ name: 'Professional Business Analyst Resume' });
    
    if (!template) {
      console.log('Template not found');
      process.exit(1);
    }
    
    console.log('\n=== TEMPLATE STRUCTURE ===\n');
    console.log('Name:', template.name);
    console.log('Category:', template.category);
    console.log('Render Engine:', template.renderEngine);
    console.log('Status:', template.status);
    console.log('Is Active:', template.isActive);
    console.log('Tags:', template.tags);
    console.log('\n=== CANVAS DATA STRUCTURE ===\n');
    console.log(JSON.stringify(template.canvasData, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

viewTemplate();

