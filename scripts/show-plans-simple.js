import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Plan from '../models/Plan.js';

// Load environment variables
try {
  const envPath = resolve(process.cwd(), '.env');
  const env = readFileSync(envPath, 'utf8');
  env.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2].trim();
    }
  });
} catch (e) {
  console.error('Error loading .env:', e.message);
}

async function showPlans() {
  try {
    console.log('🔍 Starting script...\n');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO')));
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB...');
    console.log('URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    await mongoose.connect(mongoUri);
    console.log('✅ Connected!\n');

    const plans = await Plan.find({}).sort({ price: 1 });
    
    console.log(`📋 Found ${plans.length} plan(s)\n`);
    console.log('='.repeat(80));

    if (plans.length === 0) {
      console.log('No plans found in database.');
      await mongoose.disconnect();
      return;
    }

    plans.forEach((plan, index) => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`PLAN #${index + 1} - ID: ${plan._id}`);
      console.log('='.repeat(80));
      console.log(`Title:              ${plan.title || 'N/A'}`);
      console.log(`Subtitle:           ${plan.subtitle || 'N/A'}`);
      console.log(`Price:              $${plan.price || 0}`);
      console.log(`Price Type:         ${plan.priceType || 'N/A'}`);
      console.log(`Credits:            ${plan.credits || 0}`);
      console.log(`Credits Description: ${plan.creditsDescription || 'N/A'}`);
      console.log(`Status:             ${plan.status || 'N/A'}`);
      console.log(`Popular:            ${plan.popular ? '✅ Yes' : '❌ No'}`);
      console.log(`Features (${plan.features?.length || 0}):`);
      if (plan.features && plan.features.length > 0) {
        plan.features.forEach((feature, i) => {
          console.log(`  ${i + 1}. ${feature}`);
        });
      } else {
        console.log('  (No features)');
      }
      console.log(`Created:            ${plan.createdAt || 'N/A'}`);
      console.log(`Updated:            ${plan.updatedAt || 'N/A'}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY TABLE:');
    console.log('='.repeat(80));
    console.log('\n┌─────────────────────────┬──────────┬─────────────┬──────────┬─────────┬────────┐');
    console.log('│ Title                  │ Price    │ Price Type  │ Credits  │ Status  │ Popular│');
    console.log('├─────────────────────────┼──────────┼─────────────┼──────────┼─────────┼────────┤');
    
    plans.forEach(plan => {
      const title = (plan.title || 'N/A').substring(0, 23).padEnd(23);
      const price = `$${(plan.price || 0).toFixed(2)}`.padEnd(10);
      const priceType = (plan.priceType || 'N/A').padEnd(13);
      const credits = (plan.credits || 0).toString().padEnd(10);
      const status = (plan.status || 'N/A').padEnd(9);
      const popular = (plan.popular ? '✅' : '❌').padEnd(8);
      console.log(`│ ${title} │ ${price} │ ${priceType} │ ${credits} │ ${status} │ ${popular} │`);
    });
    
    console.log('└─────────────────────────┴──────────┴─────────────┴──────────┴─────────┴────────┘');
    
    console.log(`\n📊 Total: ${plans.length} plan(s)`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

showPlans();

