import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Template from '@/models/Template';

// GET - Fetch a single template by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: template }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a template
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    const { name, description, category, content, tags, status, thumbnail, createdBy } = body;

    // Validate required fields
    if (!name || !category || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, category, and content are required' },
        { status: 400 }
      );
    }

    const template = await Template.findByIdAndUpdate(
      id,
      {
        name,
        description: description || '',
        category,
        content,
        tags: tags || [],
        status: status || 'draft',
        thumbnail: thumbnail || '/assets/images/templates/default.jpg',
        createdBy: createdBy || 'System',
      },
      { new: true, runValidators: true }
    );

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: template }, { status: 200 });
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

// DELETE - Delete a template
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const template = await Template.findByIdAndDelete(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Template deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

