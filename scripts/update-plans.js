import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '.env');
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf8');
} catch (e) {
  const envLocalPath = resolve(process.cwd(), '.env.local');
  try {
    envContent = readFileSync(envLocalPath, 'utf8');
  } catch (e2) {
    console.error('No .env file found');
    process.exit(1);
  }
}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
});

const PlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    price: { type: Number, required: true, default: 0 },
    priceType: { type: String, enum: ['one-time', 'monthly', 'yearly'], default: 'one-time' },
    credits: { type: Number, required: true, default: 0 },
    creditsDescription: { type: String, trim: true, default: 'Resume + ATS Analysis' },
    features: { type: [String], default: [] },
    status: { type: String, required: true, enum: ['active', 'inactive', 'draft'], default: 'active' },
    popular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);

const plansToUpdate = [
  {
    title: 'Starter Pack',
    subtitle: 'Perfect for getting started',
    price: 4.99,
    priceType: 'one-time',
    credits: 10,
    creditsDescription: 'Resume + ATS Analysis',
    features: [
      '10 Resume Credits',
      '10 ATS Analysis Credits',
      'Basic Templates'
    ],
    status: 'active',
    popular: true
  },
  {
    title: 'Popular Pack',
    subtitle: 'Most popular choice',
    price: 9.99,
    priceType: 'one-time',
    credits: 25,
    creditsDescription: 'Resume + ATS Analysis',
    features: [
      '25 Resume Credits',
      '25 ATS Analysis Credits',
      'All Templates',
      'Priority Support'
    ],
    status: 'active',
    popular: true
  },
  {
    title: 'Professional Pack',
    subtitle: 'For professionals',
    price: 19.99,
    priceType: 'one-time',
    credits: 60,
    creditsDescription: 'Resume + ATS Analysis',
    features: [
      '60 Resume Credits',
      '60 ATS Analysis Credits',
      'All Templates',
      'Priority Support',
      'Custom Branding'
    ],
    status: 'active',
    popular: false
  }
];

async function updatePlans() {
  try {
    console.log('🔍 Starting plan update script...\n');
    console.log('🔍 Updating plans in database...\n');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO')));
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB...');
    console.log('URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    await mongoose.connect(mongoUri);
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: "${dbName}"\n`);

    for (const planData of plansToUpdate) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`Processing: ${planData.title}`);
      console.log('─'.repeat(80));
      
      // Check if plan exists
      const existingPlan = await Plan.findOne({ title: planData.title });
      
      if (existingPlan) {
        console.log(`  ✅ Found existing plan: ${existingPlan._id}`);
        console.log(`  📝 Updating plan...`);
        
        // Update existing plan
        existingPlan.subtitle = planData.subtitle;
        existingPlan.price = planData.price;
        existingPlan.priceType = planData.priceType;
        existingPlan.credits = planData.credits;
        existingPlan.creditsDescription = planData.creditsDescription;
        existingPlan.features = planData.features;
        existingPlan.status = planData.status;
        existingPlan.popular = planData.popular;
        
        await existingPlan.save();
        console.log(`  ✅ Updated successfully!`);
        console.log(`     - Price: $${planData.price}`);
        console.log(`     - Credits: ${planData.credits}`);
        console.log(`     - Features: ${planData.features.length}`);
        console.log(`     - Popular: ${planData.popular ? 'Yes' : 'No'}`);
      } else {
        console.log(`  ➕ Creating new plan...`);
        
        // Create new plan
        const newPlan = await Plan.create(planData);
        console.log(`  ✅ Created successfully!`);
        console.log(`     - ID: ${newPlan._id}`);
        console.log(`     - Price: $${planData.price}`);
        console.log(`     - Credits: ${planData.credits}`);
        console.log(`     - Features: ${planData.features.length}`);
        console.log(`     - Popular: ${planData.popular ? 'Yes' : 'No'}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL PLANS TABLE');
    console.log('='.repeat(80));
    
    const allPlans = await Plan.find({}).sort({ price: 1 });
    
    console.log('\n┌──────────────────────┬──────────────────────┬─────────────┬──────────┬──────────┬─────────┐');
    console.log('│ Title                │ Subtitle             │ Price       │ Credits  │ Features │ Popular │');
    console.log('├──────────────────────┼──────────────────────┼─────────────┼──────────┼──────────┼─────────┤');
    
    allPlans.forEach(plan => {
      const title = (plan.title || 'N/A').padEnd(22);
      const subtitle = (plan.subtitle || 'N/A').substring(0, 22).padEnd(22);
      const price = `$${(plan.price || 0).toFixed(2)}`.padEnd(13);
      const credits = (plan.credits || 0).toString().padEnd(10);
      const features = `${plan.features?.length || 0}`.padEnd(10);
      const popular = (plan.popular ? '✅ Yes' : '❌ No').padEnd(9);
      
      console.log(`│ ${title} │ ${subtitle} │ ${price} │ ${credits} │ ${features} │ ${popular} │`);
    });
    
    console.log('└──────────────────────┴──────────────────────┴─────────────┴──────────┴──────────┴─────────┘');
    
    console.log('\n📋 DETAILED FEATURES:');
    allPlans.forEach(plan => {
      console.log(`\n${plan.title}:`);
      if (plan.features && plan.features.length > 0) {
        plan.features.forEach((feature, i) => {
          console.log(`  ${i + 1}. ${feature}`);
        });
      } else {
        console.log('  (No features)');
      }
    });

    console.log('\n✅ All plans updated successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

updatePlans();

