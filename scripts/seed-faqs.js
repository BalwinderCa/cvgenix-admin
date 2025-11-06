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

const sampleFAQs = [
  {
    question: "Is my resume ATS-friendly?",
    answer: "Yes. All templates are optimized for Applicant Tracking Systems (ATS). Our analyzer highlights keywords and formatting issues to improve pass rates.",
    category: "ATS",
    order: 1,
    isActive: true,
    isFeatured: true,
  },
  {
    question: "Can I export my resume?",
    answer: "Yes, you can export your resume in multiple formats including PDF, Word, and HTML. Export options are available in the resume builder after you've created your resume.",
    category: "Export",
    order: 2,
    isActive: true,
    isFeatured: true,
  },
  {
    question: "Do I need a credit card to start?",
    answer: "No, you can start using CVGenix for free. We offer a free plan that allows you to create one resume. For additional features and unlimited resumes, you can choose from our paid plans.",
    category: "Pricing",
    order: 3,
    isActive: true,
    isFeatured: true,
  },
  {
    question: "Can I customize templates?",
    answer: "Yes, all templates are fully customizable. You can edit text, change colors, adjust layouts, add or remove sections, and personalize every aspect of your resume to match your style and needs.",
    category: "Templates",
    order: 4,
    isActive: true,
    isFeatured: true,
  },
];

async function seedFAQs() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cvgenix';
    
    console.log('📡 Connecting to MongoDB...');
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: "${dbName}"\n`);

    // Check existing FAQs
    const existingFAQs = await FAQ.find({
      question: { $in: sampleFAQs.map(f => f.question) }
    });

    if (existingFAQs.length > 0) {
      console.log(`Found ${existingFAQs.length} existing FAQs. Deleting and recreating...`);
      await FAQ.deleteMany({
        question: { $in: sampleFAQs.map(f => f.question) }
      });
    }

    // Insert FAQs
    const createdFAQs = await FAQ.insertMany(sampleFAQs);
    console.log(`\n✅ Successfully created ${createdFAQs.length} FAQs:`);
    createdFAQs.forEach(faq => {
      console.log(`  - ${faq.question} (${faq.category}) - ID: ${faq._id}`);
    });

    // Verify total count
    const finalCount = await FAQ.find({}).countDocuments();
    console.log(`\n📊 Total FAQs in database: ${finalCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding FAQs:', error);
    process.exit(1);
  }
}

seedFAQs();

