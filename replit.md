# Subscription Management Dashboard

## Overview

This is a full-stack subscription management application built with React, Express, and PostgreSQL. It provides a comprehensive dashboard for managing user subscriptions, tracking payments, and monitoring business metrics with real-time updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **React SPA**: Single-page application built with React 18 and TypeScript
- **UI Framework**: Shadcn/UI components with Radix UI primitives and Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom design system using CSS variables

### Backend Architecture
- **Node.js/Express**: RESTful API server with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Real-time Communication**: WebSocket integration for live updates
- **Payment Processing**: Stripe integration for subscription billing

## Key Components

### Database Schema
- **Users**: Core user information with Stripe customer integration
- **Subscriptions**: Subscription lifecycle management (active, pending_off, inactive)
- **Activity Logs**: Audit trail for all subscription-related activities
- **Payment History**: Complete payment transaction records

### API Structure
- **Dashboard Metrics**: Real-time business intelligence endpoints
- **Subscription Management**: CRUD operations for subscription lifecycle
- **Activity Logging**: Comprehensive audit trail system
- **Payment Processing**: Stripe webhook integration and payment handling

### Frontend Components
- **Dashboard**: Main analytics view with metrics cards and tables
- **Subscription Table**: Paginated subscription management with filtering
- **Activity Log**: Real-time activity feed
- **Payment Queue**: Live payment processing status

## Data Flow

1. **User Actions**: Frontend components trigger API calls through TanStack Query
2. **API Processing**: Express routes handle business logic and database operations
3. **Database Updates**: Drizzle ORM manages PostgreSQL transactions
4. **Real-time Updates**: WebSocket broadcasts notify all connected clients
5. **UI Refresh**: Frontend automatically updates via query invalidation

## External Dependencies

### Payment Processing
- **Stripe**: Complete payment infrastructure with webhooks
- **Subscription Billing**: Automated recurring payment processing

### Database
- **Neon/PostgreSQL**: Serverless PostgreSQL database
- **Connection Pooling**: Efficient database connection management

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Production build optimization

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations manage schema changes

### Environment Configuration
- **Development**: Hot reloading with Vite dev server
- **Production**: Single Node.js process serving both API and static files
- **Database**: Environment variable configuration for connection strings

### Cron Jobs
- **Payment Processing**: Automated recurring payment handling every 10 minutes
- **Subscription Cleanup**: Expired subscription processing every 5 minutes

The architecture is designed for scalability and maintainability, with clear separation of concerns and comprehensive error handling throughout the stack.