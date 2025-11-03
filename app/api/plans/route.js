import connectMongoDB from '@/lib/mongodb';
import Plan from '@/models/Plan';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectMongoDB();
  try {
    const plans = await Plan.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: plans }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  await connectMongoDB();
  try {
    const body = await request.json();
    const plan = await Plan.create(body);
    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

