# 🚀 Smart Personal Finance Manager - Setup Guide

## Quick Start

Your project is now fully set up with both frontend and backend! Here's how to get started:

## Project Structure

```
D:\sfa\
├── Smart_Finance_app/     # React frontend
├── server/                # Node.js backend  
└── docs/                  # Documentation
```

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to server directory
cd D:\sfa\server

# Install dependencies
npm install

# Configure environment
# Copy .env.example to .env and update values
cp .env.example .env

# Start the server
npm run dev
```

**Backend will run on:** `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd D:\sfa\Smart_Finance_app

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

## Configuration

### Backend Environment Variables (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/smart-finance

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# OpenAI API (for chatbot)
OPENAI_API_KEY=your_openai_api_key_here

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Database Setup

### Option 1: Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. Database will be created automatically

### Option 2: MongoDB Atlas (Recommended)
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in server/.env

## Features Included

### ✅ Backend Features
- **Authentication System**: JWT-based login/register
- **Transaction Management**: CRUD operations for income/expenses
- **Dashboard APIs**: Statistics, categories, trends
- **Admin Panel**: User management, analytics
- **AI Chatbot**: OpenAI integration with financial context
- **Security**: Password hashing, input validation, CORS

### ✅ Frontend Features
- **Authentication UI**: Login/register pages
- **Dashboard**: Charts showing financial overview
- **Responsive Design**: Tailwind CSS styling
- **State Management**: Redux Toolkit
- **Protected Routes**: Role-based access control
- **Modern Icons**: Lucide React icons

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Transactions
- `GET /transactions` - Get user transactions
- `POST /transactions` - Create transaction
- `PUT /transactions/:id` - Update transaction  
- `DELETE /transactions/:id` - Delete transaction

### Dashboard
- `GET /dashboard/stats` - Get summary statistics
- `GET /dashboard/categories` - Get category breakdown
- `GET /dashboard/trends` - Get monthly trends

### Admin (Admin users only)
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/analytics` - Platform analytics

### AI Chatbot
- `POST /chatbot/query` - Send message to AI advisor

## Testing the App

### 1. Create a User Account
1. Go to `http://localhost:5173`
2. Click "Register here"
3. Fill out the form and submit
4. You'll be automatically logged in

### 2. Add Some Transactions
- Navigate to Dashboard
- Add sample income/expense data
- Watch the charts update

### 3. Try the AI Chatbot
- Go to AI Advisor page
- Ask questions like "How much did I spend this month?"
- Get personalized financial advice

### 4. Admin Features (Optional)
- Create an admin user by manually updating the database
- Set `role: 'admin'` in the users collection
- Access admin panel at `/admin`

## Development Commands

### Backend Commands
```bash
npm start          # Start production server
npm run dev        # Start development server (nodemon)
```

### Frontend Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**: Make sure MongoDB is running or check your Atlas connection string

### Issue: "CORS errors"
**Solution**: Verify `FRONTEND_URL` in backend .env matches your frontend URL

### Issue: "JWT token errors"
**Solution**: Make sure `JWT_SECRET` is set in backend .env

### Issue: "OpenAI API not working"
**Solution**: Add your OpenAI API key or use the mock responses (works without key)

## Next Steps

### Week 1 Completed ✅
- [x] Project structure setup
- [x] Authentication system
- [x] Basic UI components
- [x] Database models

### Week 2 Tasks
- [ ] Complete Transaction management UI
- [ ] Enhanced dashboard charts
- [ ] User profile management
- [ ] Data validation & error handling

### Week 3 Tasks  
- [ ] Full AI chatbot implementation
- [ ] Admin panel features
- [ ] User management system
- [ ] Financial tips management

### Week 4 Tasks
- [ ] Testing & bug fixes
- [ ] Production deployment
- [ ] Documentation completion
- [ ] Performance optimization

## Deployment

When ready to deploy:

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in deployment platform

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
- Already cloud-ready if using Atlas
- Update connection string in production

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check that both servers are running

Good luck with your Smart Personal Finance Manager project! 🎉
