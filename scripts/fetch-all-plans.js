import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Plan from '../models/Plan.js';

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

async function fetchAllPlans() {
  try {
    console.log('📡 Connecting to database...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cvgenix';
    
    console.log(`Connecting to: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: "${dbName}"\n`);

    // Fetch all plans
    console.log('📋 Fetching all plans...\n');
    const plans = await Plan.find({}).sort({ price: 1 });
    
    console.log(`Found ${plans.length} plan(s) in database\n`);
    console.log('='.repeat(100));
    
    if (plans.length === 0) {
      console.log('No plans found in database.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Display schema information
    console.log('\n📊 PLAN MODEL SCHEMA FIELDS:');
    console.log('='.repeat(100));
    const schemaPaths = Plan.schema.paths;
    Object.keys(schemaPaths).forEach(field => {
      const path = schemaPaths[field];
      console.log(`\n${field}:`);
      console.log(`  Type: ${path.instance || path.constructor.name}`);
      console.log(`  Required: ${path.isRequired ? 'Yes' : 'No'}`);
      console.log(`  Default: ${path.defaultValue !== undefined ? path.defaultValue : 'None'}`);
      if (path.enumValues) {
        console.log(`  Enum: [${path.enumValues.join(', ')}]`);
      }
    });
    console.log('\n' + '='.repeat(100));

    // Display all plans with their fields
    plans.forEach((plan, index) => {
      console.log(`\n${'='.repeat(100)}`);
      console.log(`PLAN #${index + 1}`);
      console.log('='.repeat(100));
      
      const planData = plan.toObject();
      
      // Display all fields
      Object.keys(planData).forEach(key => {
        const value = planData[key];
        let displayValue = value;
        
        // Format different types
        if (value === null || value === undefined) {
          displayValue = 'null/undefined';
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          displayValue = JSON.stringify(value, null, 2);
        } else if (Array.isArray(value)) {
          displayValue = JSON.stringify(value, null, 2);
        } else if (typeof value === 'boolean') {
          displayValue = value ? '✅ true' : '❌ false';
        } else if (typeof value === 'number') {
          displayValue = value.toString();
        }
        
        console.log(`\n${key}:`);
        console.log(`  Type: ${typeof value}`);
        console.log(`  Value: ${displayValue}`);
      });
    });

    // Summary table
    console.log('\n\n' + '='.repeat(100));
    console.log('SUMMARY TABLE:');
    console.log('='.repeat(100));
    console.log('\n┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ Plan Name              │ Price   │ Billing │ Features │ Templates │ Status │ Premium │');
    console.log('├─────────────────────────────────────────────────────────────────────────────────────────────┤');
    
    plans.forEach(plan => {
      const name = (plan.name || 'N/A').substring(0, 22).padEnd(22);
      const price = (plan.price || 0).toString().padEnd(7);
      const billing = (plan.billingCycle || 'N/A').padEnd(7);
      const features = (plan.features?.length || 0).toString().padEnd(8);
      const templates = (plan.templateEditLimit || '∞').toString().padEnd(10);
      const status = (plan.isActive ? '✅ Active' : '❌ Inactive').padEnd(7);
      const premium = (plan.isPremium ? '✅' : '❌').padEnd(7);
      
      console.log(`│ ${name} │ ${price} │ ${billing} │ ${features} │ ${templates} │ ${status} │ ${premium} │`);
    });
    
    console.log('└─────────────────────────────────────────────────────────────────────────────────────────────┘');
    
    console.log('\n' + '='.repeat(100));
    console.log(`📊 Total Plans: ${plans.length}`);
    console.log(`✅ Active Plans: ${plans.filter(p => p.isActive).length}`);
    console.log(`❌ Inactive Plans: ${plans.filter(p => !p.isActive).length}`);
    console.log(`⭐ Premium Plans: ${plans.filter(p => p.isPremium).length}`);
    console.log(`💰 Free Plans: ${plans.filter(p => p.price === 0 || !p.price).length}`);
    console.log('='.repeat(100));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fetchAllPlans();

