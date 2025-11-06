# CVGenix Admin Dashboard

A comprehensive admin dashboard built with Next.js, MongoDB, and Tailwind CSS.

## Features

- **Dashboard**: Analytics dashboard with charts and statistics
- **Users Management**: Complete CRUD operations for user management
- **Templates Management**: CRUD operations for template management
- **Plans Management**: Subscription plans management with features like templates edit limits, ATS scores, etc.
- **Settings**: 
  - Company Settings
  - Payment Settings (Stripe, PayPal, Bank Transfer, API Keys)
  - Other Settings (Site configuration, notifications, etc.)
- **Email**: Full email management interface
- **Calendar**: Event management with FullCalendar integration

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **State Management**: Redux Toolkit
- **UI Components**: Custom component library based on Dashcode

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd cvgenix-admin
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:5000](http://localhost:5000) in your browser.

## Project Structure

```
├── app/
│   ├── (dashboard)/
│   │   ├── analytics/      # Analytics dashboard
│   │   ├── users/          # Users management
│   │   ├── templates/      # Templates management
│   │   ├── plans/          # Plans management
│   │   ├── settings/       # Settings pages
│   │   ├── email/          # Email interface
│   │   └── calender/       # Calendar interface
│   └── api/                # API routes
├── components/
│   ├── partials/
│   │   ├── table/          # Table components
│   │   ├── settings/       # Settings components
│   │   └── app/           # App-specific components
│   └── ui/                 # UI components
├── models/                 # MongoDB models
├── store/                  # Redux store
└── constant/               # Constants and configuration
```

## Environment Variables

Create a `.env` or `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# AWS S3 (Optional - for template preview image storage)
# If not provided, images will be stored locally in public/uploads/templates
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_CLOUDFRONT_URL=https://your-cloudfront-domain.cloudfront.net  # Optional: for CDN
```

**Note**: AWS S3 is optional. If you don't provide S3 credentials, the system will automatically fall back to local file storage. However, using S3 is recommended for better scalability, reliability, and CDN delivery (with CloudFront).

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Private - All rights reserved
