import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

// GET - Fetch all FAQs
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const featured = searchParams.get('featured');

    let query = {};
    if (category) query.category = category;
    if (active !== null) query.isActive = active === 'true';
    if (featured === 'true') query.isFeatured = true;

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, data: faqs }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new FAQ
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { question, answer, category, order, isActive, isFeatured } = body;

    // Validate required fields
    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      category: category || 'General',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
    });

    return NextResponse.json({ success: true, data: faq }, { status: 201 });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

