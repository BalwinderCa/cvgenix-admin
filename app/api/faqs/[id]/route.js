import connectDB from '@/lib/mongodb';
import FAQ from '@/models/FAQ';
import { NextResponse } from 'next/server';

// GET - Fetch single FAQ
export async function GET(request, { params }) {
  await connectDB();
  try {
    const { id } = params;
    const faq = await FAQ.findById(id);
    if (!faq) {
      return NextResponse.json({ success: false, error: 'FAQ not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: faq }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PUT - Update FAQ
export async function PUT(request, { params }) {
  await connectDB();
  try {
    const { id } = params;
    const body = await request.json();
    const faq = await FAQ.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!faq) {
      return NextResponse.json({ success: false, error: 'FAQ not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: faq }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE - Delete FAQ
export async function DELETE(request, { params }) {
  await connectDB();
  try {
    const { id } = params;
    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) {
      return NextResponse.json({ success: false, error: 'FAQ not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'FAQ deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

