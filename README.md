# Subscription Management Dashboard

A comprehensive subscription management system with 24-hour renewal cycles, real-time monitoring, and mock payment processing. Built with React, Node.js, Express, and PostgreSQL.

## 🚀 Features

- **24-Hour Subscription Cycles**: Automated renewal system with precise timing
- **Pending Off State Management**: Users remain active until their current period expires
- **Real-Time Dashboard**: Live metrics and updates via WebSocket connections
- **Mock Payment System**: Development-friendly payment simulation (90% success rate)
- **Activity Logging**: Complete audit trail of all subscription activities
- **Payment History**: Detailed transaction records and status tracking
- **Responsive UI**: Modern interface built with Tailwind CSS and Shadcn/UI

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** with Shadcn/UI components for modern styling
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing
- **WebSocket** integration for real-time updates

### Backend
- **Node.js/Express** RESTful API server
- **Drizzle ORM** with PostgreSQL database
- **WebSocket Server** for real-time communications
- **Mock Stripe Integration** for development testing

### Database Schema
- **Users**: Core user authentication and profile data
- **Subscriptions**: Subscription lifecycle with status tracking
- **Activity Logs**: Comprehensive audit trail system
- **Payment History**: Complete payment transaction records

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git for version control

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd subscription-management-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/subscription_db
   NODE_ENV=development
   PORT=5004
   ```

4. **Set up the database**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Seed with demo data (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5004`

## 🚀 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Environment Variables for Production

```env
DATABASE_URL=your_production_database_url
NODE_ENV=production
PORT=5004
```

### Deploy to Cloud Platforms

#### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

#### Railway
1. Connect GitHub repository to Railway
2. Add PostgreSQL service
3. Set environment variables
4. Deploy with one click

#### Heroku
1. Create Heroku app: `heroku create your-app-name`
2. Add PostgreSQL addon: `heroku addons:create heroku-postgresql:mini`
3. Set environment variables: `heroku config:set NODE_ENV=production`
4. Deploy: `git push heroku main`

## 📊 Key Features Explained

### Subscription Lifecycle
- **Active**: User has an active subscription with automatic renewal
- **Pending Off**: User requested cancellation but remains active until period expires
- **Inactive**: Subscription has expired or been cancelled

### 24-Hour Renewal System
- Subscriptions automatically renew every 24 hours
- Failed payments trigger retry mechanisms
- Users can turn subscriptions on/off with grace periods

### Mock Payment System
- Simulates real payment processing without charges
- 90% success rate for testing various scenarios
- Detailed payment history and status tracking

## 🔧 API Endpoints

### Dashboard
- `GET /api/dashboard/metrics` - Real-time business metrics
- `GET /api/subscriptions` - Paginated subscription list
- `GET /api/activity-logs` - Recent activity feed
- `GET /api/payment-history` - Payment transaction history

### Subscription Management
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id/toggle` - Toggle subscription on/off
- `GET /api/subscriptions/:id` - Get subscription details

## 🎨 UI Components

The application uses a modern design system with:
- **Responsive Layout**: Mobile-first design approach
- **Dark/Light Theme**: Automatic theme switching
- **Interactive Components**: Tables, forms, and real-time updates
- **Status Indicators**: Visual feedback for all states

## 🔄 Real-Time Updates

WebSocket integration provides:
- Live dashboard metrics updates
- Real-time subscription status changes
- Instant activity log updates
- Payment processing notifications

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with demo data

### Database Operations
```bash
# Push schema changes
npm run db:push

# Generate and run migrations
npm run db:generate
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and API client
├── server/                 # Express backend
│   ├── services/           # Business logic
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── db.ts               # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
└── package.json            # Dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the GitHub issues page
2. Review the documentation
3. Contact the development team

---

Built with ❤️ using modern web technologies