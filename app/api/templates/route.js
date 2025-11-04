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

    // Build template object
    const finalStatus = status || 'draft';
    const templateData = {
      name,
      description: description || '',
      category,
      tags: tags || [],
      status: finalStatus,
      createdBy: createdBy || 'System',
      renderEngine: renderEngine || 'builder',
      canvasData: canvasData || null,
      builderData: builderData || null,
      isActive: isActive !== undefined ? isActive : (finalStatus === 'active'),
      isPremium: isPremium || false,
      isPopular: isPopular || false,
      isNewTemplate: isNewTemplate || false,
      thumbnail: thumbnail || '/assets/images/templates/default.jpg',
    };

    const template = await Template.create(templateData);

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

