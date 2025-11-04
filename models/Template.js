import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema(
  {
    // Core Info
    name: {
      type: String,
      required: [true, 'Please provide a template name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Professional', 'Creative', 'Minimalist', 'Modern', 'Classic', 'Executive', 'Resume', 'Cover Letter', 'CV', 'Portfolio', 'Other'],
      default: 'Professional',
    },
    
    // Visual Assets
    thumbnail: {
      type: String,
      default: '/assets/images/templates/default.jpg',
    },
    
    // Template Engine & Data
    renderEngine: {
      type: String,
      enum: ['html', 'builder', 'canvas', 'jsx'],
      default: 'builder',
    },
    canvasData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    builderData: {
      components: [{
        type: {
          type: String,
        },
        tagName: {
          type: String,
          default: 'div',
        },
        content: {
          type: String,
          default: '',
        },
        style: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        attributes: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        classes: [{
          type: String,
        }],
        components: {
          type: mongoose.Schema.Types.Mixed,
          default: [],
        },
      }],
      style: {
        type: String,
        default: '',
      },
    },
    
    // Status & Flags
    isActive: {
      type: Boolean,
      default: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isNewTemplate: {
      type: Boolean,
      default: false,
    },
    // Legacy status field (mapped to isActive)
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
    },
    
    // Organization
    tags: {
      type: [String],
      default: [],
    },
    
    // Additional fields
    createdBy: {
      type: String,
      default: 'System',
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
TemplateSchema.index({ category: 1, isActive: 1 });
TemplateSchema.index({ isPopular: 1, isActive: 1 });
TemplateSchema.index({ isNewTemplate: 1, isActive: 1 });
TemplateSchema.index({ tags: 1, isActive: 1 });

// Virtual for full template name
TemplateSchema.virtual('fullName').get(function() {
  return `${this.name} - ${this.category}`;
});

// Ensure virtual fields are serialized
TemplateSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to sync status with isActive
TemplateSchema.pre('save', function(next) {
  if (this.status === 'active') {
    this.isActive = true;
  } else if (this.status === 'inactive') {
    this.isActive = false;
  } else if (this.status === 'draft') {
    this.isActive = false;
  }
  next();
});

// Prevent recompilation during development
const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);

export default Template;

