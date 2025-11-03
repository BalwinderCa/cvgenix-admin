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

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

Create a `.env` file with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Private - All rights reserved
