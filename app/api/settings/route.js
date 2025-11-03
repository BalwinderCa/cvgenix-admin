import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';

// GET - Fetch all settings or by type
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type) {
      const settings = await Settings.findOne({ type });
      if (!settings) {
        // Return default settings if not found
        return NextResponse.json({ success: true, data: null }, { status: 200 });
      }
      return NextResponse.json({ success: true, data: settings }, { status: 200 });
    }

    // Fetch all settings
    const allSettings = await Settings.find({});
    const settingsObject = {};
    allSettings.forEach((setting) => {
      settingsObject[setting.type] = setting;
    });

    return NextResponse.json({ success: true, data: settingsObject }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update settings by type
export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { type, ...settingsData } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Settings type is required' },
        { status: 400 }
      );
    }

    // Find and update or create settings
    const settings = await Settings.findOneAndUpdate(
      { type },
      { ...settingsData, type },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: settings }, { status: 200 });
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

