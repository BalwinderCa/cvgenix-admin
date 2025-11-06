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

async function getPlans() {
  try {
    console.log('🔍 Fetching plans from database...\n');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found');
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB...');
    console.log(`URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);
    
    await mongoose.connect(mongoUri);
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: "${dbName}"\n`);

    const plans = await Plan.find({}).sort({ price: 1 });
    
    console.log(`📋 Found ${plans.length} plan(s) in database\n`);
    console.log('='.repeat(100));

    if (plans.length === 0) {
      console.log('⚠️  No plans found in the database.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Show detailed information for each plan
    plans.forEach((plan, index) => {
      const planObj = plan.toObject();
      console.log(`\n${'='.repeat(100)}`);
      console.log(`PLAN #${index + 1}`);
      console.log('='.repeat(100));
      console.log(`\n📄 RAW DATABASE DOCUMENT:`);
      console.log(JSON.stringify(planObj, null, 2));
      
      console.log(`\n📊 FORMATTED VIEW:`);
      console.log(`  ID:                  ${plan._id}`);
      console.log(`  Title:               ${plan.title || 'N/A'}`);
      console.log(`  Subtitle:            ${plan.subtitle || 'N/A'}`);
      console.log(`  Price:               $${plan.price || 0}`);
      console.log(`  Price Type:          ${plan.priceType || 'N/A'}`);
      console.log(`  Credits:              ${plan.credits || 0}`);
      console.log(`  Credits Description: ${plan.creditsDescription || 'N/A'}`);
      console.log(`  Status:               ${plan.status || 'N/A'}`);
      console.log(`  Popular:              ${plan.popular ? '✅ Yes' : '❌ No'}`);
      console.log(`  Features (${plan.features?.length || 0}):`);
      if (plan.features && plan.features.length > 0) {
        plan.features.forEach((feature, i) => {
          console.log(`    ${i + 1}. ${feature}`);
        });
      } else {
        console.log('    (No features)');
      }
      console.log(`  Created At:           ${plan.createdAt || 'N/A'}`);
      console.log(`  Updated At:           ${plan.updatedAt || 'N/A'}`);
    });

    // Summary table
    console.log('\n\n' + '='.repeat(100));
    console.log('📊 SUMMARY TABLE');
    console.log('='.repeat(100));
    console.log('\n┌─────────────────────────────┬───────────┬─────────────┬──────────┬─────────┬─────────┐');
    console.log('│ Title                      │ Price     │ Price Type  │ Credits  │ Status │ Popular │');
    console.log('├─────────────────────────────┼───────────┼─────────────┼──────────┼─────────┼─────────┤');
    
    plans.forEach(plan => {
      const title = (plan.title || 'N/A').substring(0, 27).padEnd(27);
      const price = `$${(plan.price || 0).toFixed(2)}`.padEnd(11);
      const priceType = (plan.priceType || 'N/A').padEnd(13);
      const credits = (plan.credits || 0).toString().padEnd(10);
      const status = (plan.status || 'N/A').padEnd(9);
      const popular = (plan.popular ? '✅' : '❌').padEnd(9);
      console.log(`│ ${title} │ ${price} │ ${priceType} │ ${credits} │ ${status} │ ${popular} │`);
    });
    
    console.log('└─────────────────────────────┴───────────┴─────────────┴──────────┴─────────┴─────────┘');
    
    console.log('\n' + '='.repeat(100));
    console.log('📈 STATISTICS:');
    console.log('='.repeat(100));
    console.log(`  Total Plans:        ${plans.length}`);
    console.log(`  Active Plans:       ${plans.filter(p => p.status === 'active').length}`);
    console.log(`  Inactive Plans:     ${plans.filter(p => p.status === 'inactive').length}`);
    console.log(`  Draft Plans:        ${plans.filter(p => p.status === 'draft').length}`);
    console.log(`  Popular Plans:      ${plans.filter(p => p.popular).length}`);
    console.log(`  Free Plans:         ${plans.filter(p => (p.price || 0) === 0).length}`);
    console.log(`  Paid Plans:         ${plans.filter(p => (p.price || 0) > 0).length}`);
    console.log(`  Total Features:     ${plans.reduce((sum, p) => sum + (p.features?.length || 0), 0)}`);
    console.log('='.repeat(100));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

getPlans();



