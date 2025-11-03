import connectMongoDB from '@/lib/mongodb';
import Plan from '@/models/Plan';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  await connectMongoDB();
  try {
    const { id } = params;
    const plan = await Plan.findById(id);
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: plan }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request, { params }) {
  await connectMongoDB();
  try {
    const { id } = params;
    const body = await request.json();
    const plan = await Plan.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: plan }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  await connectMongoDB();
  try {
    const { id } = params;
    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Plan deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

