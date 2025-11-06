import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['company', 'payment', 'other'],
      unique: true,
    },
    // Company Settings
    companyName: {
      type: String,
      default: '',
    },
    companyEmail: {
      type: String,
      default: '',
    },
    companyPhone: {
      type: String,
      default: '',
    },
    companyAddress: {
      type: String,
      default: '',
    },
    companyCity: {
      type: String,
      default: '',
    },
    companyState: {
      type: String,
      default: '',
    },
    companyZip: {
      type: String,
      default: '',
    },
    companyCountry: {
      type: String,
      default: '',
    },
    companyWebsite: {
      type: String,
      default: '',
    },
    companyLogo: {
      type: String,
      default: '',
    },
    companyDescription: {
      type: String,
      default: '',
    },
    taxId: {
      type: String,
      default: '',
    },
    
    // Payment Settings
    paymentMethod: {
      type: String,
      default: 'stripe',
      enum: ['stripe', 'paypal', 'bank_transfer', 'other'],
    },
    stripePublicKey: {
      type: String,
      default: '',
    },
    stripeSecretKey: {
      type: String,
      default: '',
    },
    stripeWebhookSecret: {
      type: String,
      default: '',
    },
    paypalClientId: {
      type: String,
      default: '',
    },
    paypalSecret: {
      type: String,
      default: '',
    },
    bankAccountName: {
      type: String,
      default: '',
    },
    bankAccountNumber: {
      type: String,
      default: '',
    },
    bankRoutingNumber: {
      type: String,
      default: '',
    },
    bankName: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    
    // Third-party API Keys
    openaiApiKey: {
      type: String,
      default: '',
    },
    claudeApiKey: {
      type: String,
      default: '',
    },
    otherApiKeys: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
          key: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
    
    // Other Settings
    siteName: {
      type: String,
      default: 'CVGenix Admin',
    },
    siteDescription: {
      type: String,
      default: '',
    },
    adminEmail: {
      type: String,
      default: '',
    },
    supportEmail: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
    },
    timeFormat: {
      type: String,
      default: '12h',
      enum: ['12h', '24h'],
    },
    language: {
      type: String,
      default: 'en',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation during development
const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

export default Settings;

