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

async function getTemplateStructure() {
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
    
    // Write full template to file
    const fs = await import('fs/promises');
    await fs.writeFile('/tmp/template-full.json', JSON.stringify(template.toObject(), null, 2));
    console.log('Full template saved to /tmp/template-full.json');
    console.log('Canvas version:', template.canvasData?.version);
    console.log('Objects count:', template.canvasData?.objects?.length);
    console.log('Sample object keys:', Object.keys(template.canvasData?.objects?.[0] || {}));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getTemplateStructure();

