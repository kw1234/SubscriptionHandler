# Deployment Guide

This guide covers deploying the Subscription Management Dashboard to various hosting platforms.

## 🏗️ Build Process

The application uses a single build process that creates both frontend and backend artifacts:

```bash
npm run build
```

This command:
1. Builds the React frontend using Vite
2. Bundles the Express server using ESBuild
3. Creates optimized production-ready files in the `dist/` directory

## 🌐 Platform-Specific Deployment

### Replit (Recommended for Development)

1. **Import from GitHub**
   - Go to [Replit](https://replit.com)
   - Click "Create Repl" > "Import from GitHub"
   - Enter your repository URL
   
2. **Configure Environment**
   - Add a PostgreSQL database from the sidebar
   - Environment variables are auto-configured
   
3. **Deploy**
   - Click "Run" to start development server
   - Use "Deploy" button for production deployment

### Railway

1. **Connect Repository**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway link
   railway up
   ```

2. **Add Database**
   - Go to Railway dashboard
   - Add PostgreSQL service
   - Connect to your project

3. **Environment Variables**
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   NODE_ENV=production
   PORT=${{PORT}}
   ```

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure `vercel.json`**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/index.ts",
         "use": "@vercel/node"
       },
       {
         "src": "client/**/*",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist/public"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "/dist/public/$1"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Heroku

1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Configure Environment**
   ```bash
   heroku config:set NODE_ENV=production
   ```

4. **Create `Procfile`**
   ```
   web: npm start
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### DigitalOcean App Platform

1. **Create App**
   - Connect your GitHub repository
   - Choose "Web Service" component

2. **Build Configuration**
   ```yaml
   name: subscription-dashboard
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/your-repo
       branch: main
     run_command: npm start
     build_command: npm run build
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     env:
     - key: NODE_ENV
       value: production
   databases:
   - name: db
     engine: PG
     version: "13"
   ```

### Docker Deployment

1. **Create `Dockerfile`**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   # Copy package files
   COPY package*.json ./
   RUN npm ci --only=production

   # Copy source code
   COPY . .

   # Build application
   RUN npm run build

   # Expose port
   EXPOSE 5004

   # Start application
   CMD ["npm", "start"]
   ```

2. **Create `docker-compose.yml`**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "5004:5004"
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgresql://postgres:password@db:5432/subscription_db
       depends_on:
         - db
     
     db:
       image: postgres:13
       environment:
         - POSTGRES_DB=subscription_db
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

## 🗄️ Database Setup

### Database Migration
After deployment, run the database setup:

```bash
# Push schema to database
npm run db:push

# Optional: Seed with demo data
npm run db:seed
```

### Environment Variables

Required environment variables for production:

```env
DATABASE_URL=your_production_database_url
NODE_ENV=production
PORT=5004
```

Optional (for real Stripe integration):
```env
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_PRICE_ID=price_your_stripe_price_id
```

## 🔍 Health Checks

The application includes built-in health check endpoints:

- `GET /health` - Basic health check
- `GET /api/health` - API health with database connectivity

## 📊 Monitoring

### Performance Monitoring
- Monitor API response times
- Track WebSocket connection health
- Monitor database query performance

### Error Tracking
- Server logs available via platform dashboards
- Database connection monitoring
- Real-time error notifications

## 🔐 Security Considerations

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Enable database connection pooling
- [ ] Set up backup strategies

### Environment Security
- Never commit `.env` files
- Use platform secret management
- Rotate database credentials regularly
- Monitor for suspicious activity

## 🚀 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection**
   - Verify DATABASE_URL format
   - Check database server accessibility
   - Ensure proper credentials

2. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify TypeScript compilation

3. **Runtime Errors**
   - Check environment variables
   - Monitor server logs
   - Verify database schema

### Performance Optimization

1. **Database**
   - Enable connection pooling
   - Add database indexes
   - Monitor query performance

2. **Application**
   - Enable gzip compression
   - Implement caching strategies
   - Optimize WebSocket connections

3. **Frontend**
   - Enable browser caching
   - Optimize bundle size
   - Use CDN for static assets

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review server logs
3. Test database connectivity
4. Verify environment configuration

---

Happy deploying! 🚀