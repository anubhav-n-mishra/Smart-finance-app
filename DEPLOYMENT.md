# 🚀 SmartFinance India - Deployment Guide

## 📋 Overview
This guide will help you deploy the complete SmartFinance India application to production environments.

## 🏗️ Architecture
- **Frontend**: React 19.1.1 SPA (Single Page Application)
- **Backend**: Node.js/Express RESTful API
- **Database**: MongoDB Atlas (Cloud Database)
- **AI Integration**: Google Gemini API
- **Authentication**: JWT-based

## 🛠️ Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Google Gemini API key (optional, has fallback)
- Git

## 📦 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/anubhav-n-mishra/Smart-finance-app.git
cd Smart-finance-app
```

### 2. Backend Setup
```bash
cd server
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
# JWT_SECRET=your_super_secret_jwt_key
# GEMINI_API_KEY=your_gemini_api_key (optional)
# PORT=5000

# Start backend server
npm start
```

### 3. Frontend Setup
```bash
cd ../Smart_Finance_app
npm install

# Start development server
npm run dev
```

## 🌐 Production Deployment

### Option 1: Traditional Server Deployment

#### Backend (Node.js/Express)
```bash
# On your server
git clone https://github.com/anubhav-n-mishra/Smart-finance-app.git
cd Smart-finance-app/server

# Install dependencies
npm install --production

# Set environment variables
export MONGODB_URI="your_mongodb_connection_string"
export JWT_SECRET="your_jwt_secret"
export GEMINI_API_KEY="your_gemini_api_key"
export PORT=5000

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "smartfinance-api"
pm2 startup
pm2 save
```

#### Frontend (React)
```bash
cd ../Smart_Finance_app

# Build for production
npm run build

# Serve with nginx or any static server
# Copy dist/ folder to your web server
```

### Option 2: Docker Deployment

#### Backend Dockerfile
```dockerfile
# server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
# Smart_Finance_app/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
      - JWT_SECRET=your_jwt_secret
      - GEMINI_API_KEY=your_gemini_api_key
    restart: unless-stopped

  frontend:
    build: ./Smart_Finance_app
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### Option 3: Cloud Deployment

#### Heroku Deployment

**Backend (API)**:
```bash
# In server/ directory
echo "web: node server.js" > Procfile

# Create Heroku app
heroku create smartfinance-api

# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set GEMINI_API_KEY="your_gemini_key"

# Deploy
git subtree push --prefix server heroku main
```

**Frontend**:
```bash
# In Smart_Finance_app/ directory
# Build and deploy to Netlify, Vercel, or similar
npm run build

# Deploy dist/ folder to your preferred platform
```

#### Vercel Deployment

**Frontend**:
```bash
# In Smart_Finance_app/ directory
npm install -g vercel
vercel --prod
```

**Backend** (Vercel Functions):
Create `vercel.json` in server/:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

## 🔧 Environment Configuration

### Backend Environment Variables (.env)
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartfinance

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# AI Integration (Optional)
GEMINI_API_KEY=your_google_gemini_api_key

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://yourfrontenddomain.com,http://localhost:3000
```

### Frontend Environment Variables
```env
# API Base URL
VITE_API_URL=https://your-backend-domain.com

# Environment
NODE_ENV=production
```

## 🛡️ Security Configuration

### SSL/HTTPS Setup
```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/smartfinance
server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/smartfinance/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 Monitoring & Logging

### PM2 Process Management
```bash
# Start application
pm2 start server.js --name "smartfinance-api"

# Monitor
pm2 monit

# Logs
pm2 logs smartfinance-api

# Restart
pm2 restart smartfinance-api

# Auto-restart on file changes (development)
pm2 start server.js --watch --name "smartfinance-dev"
```

### Log Management
```bash
# Rotate logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🚀 Performance Optimization

### Frontend Optimization
```bash
# Build with optimization
npm run build

# Analyze bundle size
npm run build -- --analyze
```

### Backend Optimization
```javascript
// server.js additions for production
if (process.env.NODE_ENV === 'production') {
  // Enable trust proxy
  app.set('trust proxy', 1);
  
  // Compression middleware
  const compression = require('compression');
  app.use(compression());
  
  // Rate limiting
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);
}
```

## 🔍 Health Checks

### API Health Endpoint
```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### Frontend Health Check
```javascript
// Add to main application
const healthCheck = async () => {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    console.log('API Health:', data.status);
  } catch (error) {
    console.error('API Health Check Failed:', error);
  }
};
```

## 🛠️ Database Management

### MongoDB Atlas Configuration
1. Create cluster on MongoDB Atlas
2. Configure network access (IP whitelist)
3. Create database user
4. Get connection string
5. Create indexes for performance:

```javascript
// Run in MongoDB shell
db.transactions.createIndex({ "userId": 1, "date": -1 })
db.savingsgoals.createIndex({ "userId": 1, "isCompleted": 1 })
db.budgets.createIndex({ "userId": 1, "isActive": 1 })
db.notifications.createIndex({ "userId": 1, "isRead": 1, "createdAt": -1 })
```

## 📱 Mobile Optimization

### PWA Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'SmartFinance India',
        short_name: 'SmartFinance',
        description: 'Personal Finance Manager for Indians',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

## 🚨 Troubleshooting

### Common Issues

**1. CORS Errors**
```javascript
// server.js
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
};
app.use(cors(corsOptions));
```

**2. MongoDB Connection Issues**
```javascript
// Check connection string encoding
const mongoURI = process.env.MONGODB_URI.replace(
  '<password>',
  encodeURIComponent(password)
);
```

**3. Build Failures**
```bash
# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📧 Support

For deployment issues:
1. Check server logs: `pm2 logs smartfinance-api`
2. Verify environment variables
3. Test API endpoints manually
4. Check database connectivity

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Database indexes created
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Health checks working
- [ ] Monitoring setup (PM2, logs)
- [ ] Backup strategy implemented
- [ ] Error handling tested
- [ ] Performance optimization applied

---

**🎉 Congratulations! Your SmartFinance India application is now deployed!**

Access your application at: `https://yourdomain.com`  
API Health Check: `https://yourdomain.com/api/health`
