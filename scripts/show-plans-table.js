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

async function showPlansTable() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    const plans = await Plan.find({}).sort({ price: 1 });
    
    console.log('\n' + '═'.repeat(150));
    console.log('📊 PLANS TABLE - DATABASE CONTENTS');
    console.log('═'.repeat(150));
    
    if (plans.length === 0) {
      console.log('\n⚠️  No plans found in the database.\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create a comprehensive table
    console.log('\n┌──────────────┬──────────────────────┬──────────────┬─────────────┬──────────┬──────────┬──────────┬─────────┬──────────┐');
    console.log('│ ID           │ Title                │ Subtitle     │ Price       │ Type     │ Credits  │ Features │ Status  │ Popular  │');
    console.log('├──────────────┼──────────────────────┼──────────────┼─────────────┼──────────┼──────────┼──────────┼─────────┼──────────┤');
    
    plans.forEach(plan => {
      const id = plan._id.toString().substring(0, 12).padEnd(12);
      const title = (plan.title || 'N/A').substring(0, 20).padEnd(20);
      const subtitle = (plan.subtitle || 'N/A').substring(0, 12).padEnd(12);
      const price = `$${(plan.price || 0).toFixed(2)}`.padEnd(13);
      const priceType = (plan.priceType || 'N/A').substring(0, 10).padEnd(10);
      const credits = (plan.credits || 0).toString().padEnd(10);
      const features = `${plan.features?.length || 0}`.padEnd(10);
      const status = (plan.status || 'N/A').padEnd(9);
      const popular = (plan.popular ? '✅ Yes' : '❌ No').padEnd(10);
      
      console.log(`│ ${id} │ ${title} │ ${subtitle} │ ${price} │ ${priceType} │ ${credits} │ ${features} │ ${status} │ ${popular} │`);
    });
    
    console.log('└──────────────┴──────────────────────┴──────────────┴─────────────┴──────────┴──────────┴──────────┴─────────┴──────────┘');
    
    // Detailed view for each plan
    console.log('\n' + '═'.repeat(150));
    console.log('📋 DETAILED PLAN INFORMATION');
    console.log('═'.repeat(150));
    
    plans.forEach((plan, index) => {
      console.log(`\n${'─'.repeat(150)}`);
      console.log(`PLAN #${index + 1}: ${plan.title}`);
      console.log('─'.repeat(150));
      console.log(`  🆔 ID:                  ${plan._id}`);
      console.log(`  📝 Title:                ${plan.title || 'N/A'}`);
      console.log(`  📄 Subtitle:              ${plan.subtitle || 'N/A'}`);
      console.log(`  💰 Price:                $${plan.price || 0}`);
      console.log(`  🔄 Price Type:            ${plan.priceType || 'N/A'}`);
      console.log(`  🎫 Credits:               ${plan.credits || 0}`);
      console.log(`  📋 Credits Description:  ${plan.creditsDescription || 'N/A'}`);
      console.log(`  ✅ Status:               ${plan.status || 'N/A'}`);
      console.log(`  ⭐ Popular:               ${plan.popular ? 'Yes' : 'No'}`);
      console.log(`  📅 Created:               ${plan.createdAt ? new Date(plan.createdAt).toLocaleString() : 'N/A'}`);
      console.log(`  🔄 Updated:               ${plan.updatedAt ? new Date(plan.updatedAt).toLocaleString() : 'N/A'}`);
      
      console.log(`  🎯 Features (${plan.features?.length || 0}):`);
      if (plan.features && plan.features.length > 0) {
        plan.features.forEach((feature, i) => {
          console.log(`     ${i + 1}. ${feature}`);
        });
      } else {
        console.log('     (No features added)');
      }
    });
    
    console.log('\n' + '═'.repeat(150));
    console.log('📊 SUMMARY STATISTICS');
    console.log('═'.repeat(150));
    console.log(`  Total Plans:        ${plans.length}`);
    console.log(`  Active Plans:        ${plans.filter(p => p.status === 'active').length}`);
    console.log(`  Inactive Plans:     ${plans.filter(p => p.status === 'inactive').length}`);
    console.log(`  Draft Plans:        ${plans.filter(p => p.status === 'draft').length}`);
    console.log(`  Popular Plans:      ${plans.filter(p => p.popular).length}`);
    console.log(`  Free Plans:         ${plans.filter(p => (p.price || 0) === 0).length}`);
    console.log(`  Paid Plans:         ${plans.filter(p => (p.price || 0) > 0).length}`);
    console.log(`  One-time Plans:     ${plans.filter(p => p.priceType === 'one-time').length}`);
    console.log(`  Monthly Plans:      ${plans.filter(p => p.priceType === 'monthly').length}`);
    console.log(`  Yearly Plans:       ${plans.filter(p => p.priceType === 'yearly').length}`);
    console.log(`  Total Features:     ${plans.reduce((sum, p) => sum + (p.features?.length || 0), 0)}`);
    console.log(`  Total Credits:      ${plans.reduce((sum, p) => sum + (p.credits || 0), 0)}`);
    console.log('═'.repeat(150) + '\n');

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

showPlansTable();



