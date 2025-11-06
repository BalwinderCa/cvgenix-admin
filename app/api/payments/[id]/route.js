import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';

// GET - Fetch a single payment by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: payment }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a payment
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    const {
      userId,
      userName,
      userEmail,
      amount,
      currency,
      paymentMethod,
      transactionId,
      status,
      description,
      planId,
      planName,
    } = body;

    // Validate required fields
    if (!userId || !userName || !userEmail || !amount || !paymentMethod || !transactionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if transaction ID is being changed and if it's already taken by another payment
    const existingPayment = await Payment.findOne({ transactionId, _id: { $ne: id } });
    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment with this transaction ID already exists' },
        { status: 400 }
      );
    }

    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        userId,
        userName,
        userEmail,
        amount,
        currency: currency || 'USD',
        paymentMethod,
        transactionId,
        status: status || 'pending',
        description,
        planId,
        planName,
      },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: payment }, { status: 200 });
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

// DELETE - Delete a payment
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Payment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}






