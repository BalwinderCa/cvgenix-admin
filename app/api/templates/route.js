import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Template from '@/models/Template';

// GET - Fetch all templates
export async function GET() {
  try {
    await connectDB();
    const templates = await Template.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: templates }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new template
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, description, category, content, tags, status, thumbnail, createdBy } = body;

    // Validate required fields
    if (!name || !category || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, category, and content are required' },
        { status: 400 }
      );
    }

    const template = await Template.create({
      name,
      description: description || '',
      category,
      content,
      tags: tags || [],
      status: status || 'draft',
      thumbnail: thumbnail || '/assets/images/templates/default.jpg',
      createdBy: createdBy || 'System',
    });

    return NextResponse.json({ success: true, data: template }, { status: 201 });
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

