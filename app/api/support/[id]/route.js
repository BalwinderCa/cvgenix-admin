import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Support from '@/models/Support';

// GET - Fetch a single support message by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const supportMessage = await Support.findById(id);
    if (!supportMessage) {
      return NextResponse.json(
        { success: false, error: 'Support message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: supportMessage }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a support message
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    const { name, email, subject, message, status, adminNotes } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supportMessage = await Support.findByIdAndUpdate(
      id,
      {
        name,
        email,
        subject,
        message,
        status: status || 'new',
        adminNotes: adminNotes || '',
      },
      { new: true, runValidators: true }
    );

    if (!supportMessage) {
      return NextResponse.json(
        { success: false, error: 'Support message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: supportMessage }, { status: 200 });
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

// DELETE - Delete a support message
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const supportMessage = await Support.findByIdAndDelete(id);
    if (!supportMessage) {
      return NextResponse.json(
        { success: false, error: 'Support message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Support message deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

