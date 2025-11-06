import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';

// GET - Fetch all payments
export async function GET() {
  try {
    await connectDB();
    const payments = await Payment.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: payments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new payment
export async function POST(request) {
  try {
    await connectDB();
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

    // Check if transaction ID already exists
    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment with this transaction ID already exists' },
        { status: 400 }
      );
    }

    const payment = await Payment.create({
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
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
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






