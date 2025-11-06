import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env
const envPath = resolve(process.cwd(), '.env');
const env = readFileSync(envPath, 'utf8');
env.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const PlanSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  price: Number,
  priceType: String,
  credits: Number,
  creditsDescription: String,
  features: [String],
  status: String,
  popular: Boolean,
}, { timestamps: true });

const Plan = mongoose.models?.Plan || mongoose.model('Plan', PlanSchema);

const plans = [
  {
    title: 'Starter Pack',
    subtitle: 'Perfect for getting started',
    price: 4.99,
    priceType: 'one-time',
    credits: 10,
    creditsDescription: 'Resume + ATS Analysis',
    features: ['10 Resume Credits', '10 ATS Analysis Credits', 'Basic Templates'],
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
    features: ['25 Resume Credits', '25 ATS Analysis Credits', 'All Templates', 'Priority Support'],
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
    features: ['60 Resume Credits', '60 ATS Analysis Credits', 'All Templates', 'Priority Support', 'Custom Branding'],
    status: 'active',
    popular: false
  }
];

async function main() {
  try {
    process.stdout.write('Connecting...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    process.stdout.write('Connected!\n\n');

    for (const planData of plans) {
      process.stdout.write(`Updating ${planData.title}...\n`);
      const existing = await Plan.findOne({ title: planData.title });
      
      if (existing) {
        Object.assign(existing, planData);
        await existing.save();
        process.stdout.write(`  Updated: ${existing._id}\n`);
      } else {
        const newPlan = await Plan.create(planData);
        process.stdout.write(`  Created: ${newPlan._id}\n`);
      }
    }

    const all = await Plan.find({}).sort({ price: 1 });
    process.stdout.write(`\nTotal plans: ${all.length}\n`);
    
    all.forEach(p => {
      process.stdout.write(`\n${p.title}:\n`);
      process.stdout.write(`  Price: $${p.price}\n`);
      process.stdout.write(`  Credits: ${p.credits}\n`);
      process.stdout.write(`  Features: ${p.features.length}\n`);
      process.stdout.write(`  Popular: ${p.popular}\n`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }
}

main();



