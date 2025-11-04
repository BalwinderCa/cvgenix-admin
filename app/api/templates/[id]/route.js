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
    const { 
      name, 
      description, 
      category, 
      tags, 
      status, 
      createdBy,
      renderEngine,
      canvasData,
      builderData,
      isActive,
      isPremium,
      isPopular,
      isNewTemplate,
      thumbnail
    } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name and category are required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData = {
      name,
      description: description !== undefined ? description : '',
      category,
      tags: tags || [],
      status: status !== undefined ? status : 'draft',
      createdBy: createdBy || 'System',
    };

    // Add optional fields if provided
    if (renderEngine !== undefined) updateData.renderEngine = renderEngine;
    if (canvasData !== undefined) updateData.canvasData = canvasData;
    if (builderData !== undefined) updateData.builderData = builderData;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

    // Sync status with isActive - prioritize status field
    if (status !== undefined) {
      if (status === 'active') {
        updateData.isActive = true;
      } else if (status === 'inactive' || status === 'draft') {
        updateData.isActive = false;
      }
    } else if (isActive !== undefined) {
      // If status not provided, use isActive checkbox value
      updateData.isActive = isActive;
      // Sync status based on isActive
      updateData.status = isActive ? 'active' : 'draft';
    }

    // Set other flags
    if (isPremium !== undefined) updateData.isPremium = isPremium;
    if (isPopular !== undefined) updateData.isPopular = isPopular;
    if (isNewTemplate !== undefined) updateData.isNewTemplate = isNewTemplate;

    const template = await Template.findByIdAndUpdate(
      id,
      updateData,
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

