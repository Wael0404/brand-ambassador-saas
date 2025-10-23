# Brand Ambassador SaaS Platform

A complete SaaS solution that allows brands to automatically generate their own dashboard and mobile application to manage their ambassadors.

## Features

### MVP Features Implemented

1. **Brand Registration & Authentication**
   - 3-step registration process (Enterprise Info → App Configuration → Plan Selection)
   - JWT-based authentication
   - Secure password hashing with bcrypt

2. **Plan Management**
   - Three subscription tiers: Starter (€99), Pro (€199), Enterprise (€299)
   - Stripe integration for payments
   - Automatic subscription management
   - Invoice tracking

3. **Brand Dashboard**
   - Plan-based module access
   - Offer management (CRUD operations)
   - Plan management with Stripe integration
   - Brand configuration management

4. **Multi-tenant Architecture**
   - Subdomain-based brand isolation
   - Automatic subdomain generation
   - Brand-specific configurations

5. **Mobile App Configuration**
   - Automatic JSON configuration generation
   - Brand-specific app settings
   - Plan-based feature activation

## Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Payments**: Stripe
- **File Upload**: Multer
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15
- **Development**: Hot reload enabled

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Stripe account (for payments)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd brand-ambassador-saas
   ```

2. **Configure environment variables**
   ```bash
   cp backend/env.example backend/.env
   ```
   
   Update the `.env` file with your actual values:
   - Stripe keys (get from Stripe dashboard)
   - Database credentials
   - JWT secret

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api

### Local Development

If you prefer to run without Docker:

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database**
   ```bash
   # Start PostgreSQL locally or use Docker
   docker run -d --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=brand_ambassador_saas -p 5432:5432 postgres:15
   ```

## API Documentation

The API is fully documented with Swagger. Once the backend is running, visit:
http://localhost:3001/api

### Key Endpoints

#### Authentication
- `POST /auth/register` - Brand registration
- `POST /auth/login` - Brand login
- `GET /auth/profile` - Get user profile

#### Brands
- `GET /brands/:id` - Get brand details
- `PUT /brands/:id/config` - Update brand configuration
- `PUT /brands/:id/app-config` - Update app configuration
- `GET /brands/:id/app-config.json` - Get mobile app config

#### Plans
- `GET /plans` - Get all available plans
- `GET /plans/subscriptions/:brandId` - Get brand subscriptions

#### Offers
- `POST /offers` - Create offer
- `GET /offers` - Get brand offers
- `PUT /offers/:id` - Update offer
- `DELETE /offers/:id` - Delete offer

#### Stripe
- `POST /stripe/create-checkout-session` - Create payment session
- `POST /stripe/webhook` - Handle Stripe webhooks
- `GET /stripe/invoices/:customerId` - Get invoices

## Database Schema

### Core Entities

1. **Brands** - Brand information and configuration
2. **Users** - User accounts linked to brands
3. **Plans** - Subscription plans with features
4. **Subscriptions** - Active brand subscriptions
5. **Offers** - Brand offers managed through the platform

### Multi-tenant Strategy

- Each brand gets a unique subdomain
- Data isolation through brand-specific queries
- Shared database with tenant-aware queries
- Automatic subdomain generation

## Stripe Integration

### Setup
1. Create a Stripe account
2. Get your API keys from the dashboard
3. Set up webhook endpoints
4. Configure the webhook secret

### Webhook Events Handled
- `checkout.session.completed` - New subscription
- `invoice.payment_succeeded` - Payment confirmation
- `customer.subscription.deleted` - Subscription cancellation

## Development

### Project Structure
```
brand-ambassador-saas/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── brands/         # Brand management
│   │   ├── plans/          # Plan and subscription management
│   │   ├── offers/         # Offer CRUD operations
│   │   ├── stripe/         # Payment integration
│   │   └── upload/         # File upload handling
│   └── Dockerfile
├── frontend/               # Next.js application
│   ├── src/
│   │   └── app/           # App router pages
│   └── Dockerfile
└── docker-compose.yml     # Development environment
```

### Adding New Features

1. **Backend**: Create new modules following NestJS patterns
2. **Frontend**: Add pages and components in the app directory
3. **Database**: Add new entities to TypeORM
4. **API**: Document endpoints with Swagger decorators

## Deployment

### Production Considerations

1. **Environment Variables**: Set production values
2. **Database**: Use managed PostgreSQL service
3. **File Storage**: Use cloud storage for uploads
4. **SSL**: Enable HTTPS for all endpoints
5. **Monitoring**: Add logging and monitoring
6. **Scaling**: Consider horizontal scaling for high traffic

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Testing

### Backend Tests
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend Tests
```bash
cd frontend
npm run test
```
