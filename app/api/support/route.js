import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Support from '@/models/Support';

// GET - Fetch all support messages
export async function GET() {
  try {
    await connectDB();
    const supportMessages = await Support.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: supportMessages }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new support message
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, subject, message, status, adminNotes } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supportMessage = await Support.create({
      name,
      email,
      subject,
      message,
      status: status || 'new',
      adminNotes: adminNotes || '',
    });

    return NextResponse.json({ success: true, data: supportMessage }, { status: 201 });
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

