# 📌 Smart Personal Finance Manager - Project Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMART FINANCE MANAGER                        │
│                         ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│   (React.js)    │    │   (Node.js)     │    │   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React Router  │◄──►│ • Express.js    │◄──►│ • Users         │
│ • Redux Toolkit │    │ • JWT Auth      │    │ • Transactions  │
│ • Tailwind CSS  │    │ • Mongoose      │    │ • Tips          │
│ • Recharts      │    │ • bcryptjs      │    │                 │
│ • Axios         │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   DEPLOYMENT    │    │   AI SERVICE    │
│                 │    │                 │
│ • Vercel        │    │ • OpenAI API    │
│ • Netlify       │    │ • GPT-3.5       │
│ • MongoDB Atlas │    │ • Financial     │
│ • Render/Railway│    │   Advisor       │
└─────────────────┘    └─────────────────┘
```

## Component Flow

### Frontend Components
```
App.jsx
├── AuthPages/
│   ├── Login.jsx
│   └── Register.jsx
├── Dashboard/
│   ├── Dashboard.jsx (Main dashboard with charts)
│   ├── Transactions.jsx (CRUD operations)
│   └── Profile.jsx (User settings)
├── AI/
│   └── Chatbot.jsx (AI financial advisor)
├── Admin/
│   └── AdminDashboard.jsx (User & content management)
└── Shared/
    ├── Navbar.jsx
    └── ProtectedRoute.jsx
```

### Backend API Structure
```
server.js (Main entry point)
├── routes/
│   ├── auth.js (/api/auth/*)
│   ├── transactions.js (/api/transactions/*)
│   ├── dashboard.js (/api/dashboard/*)
│   ├── admin.js (/api/admin/*)
│   └── chatbot.js (/api/chatbot/*)
├── models/
│   ├── User.js
│   ├── Transaction.js
│   └── Tip.js
├── middleware/
│   ├── auth.js (JWT verification)
│   └── errorHandler.js
└── config/
    └── database.js (MongoDB connection)
```

## Data Flow

### User Authentication Flow
1. User registers/logs in → Frontend sends credentials
2. Backend validates → Returns JWT token
3. Frontend stores token → All subsequent requests include token
4. Backend verifies token → Grants/denies access

### Transaction Management Flow
1. User adds transaction → Frontend form submission
2. Backend validates data → Stores in MongoDB
3. Dashboard updates → Real-time charts refresh
4. AI chatbot has context → Can analyze spending

### AI Chatbot Flow
1. User asks question → "How much did I spend on food?"
2. Backend fetches user's financial data
3. Creates context prompt for OpenAI API
4. Returns personalized financial advice
5. Frontend displays response

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access**: User vs Admin permissions
- **Input Validation**: Mongoose schema validation
- **CORS Protection**: Configured for frontend domain
- **Environment Variables**: Sensitive data in .env

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "role": "user|admin",
  "isActive": true,
  "lastLogin": "2024-01-01T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Transactions Collection
```json
{
  "_id": "ObjectId", 
  "userId": "ObjectId (ref: Users)",
  "type": "income|expense",
  "amount": 150.50,
  "category": "food|rent|salary|etc",
  "description": "Grocery shopping",
  "date": "2024-01-01T00:00:00Z",
  "paymentMethod": "cash|card|bank-transfer",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Tips Collection
```json
{
  "_id": "ObjectId",
  "title": "Save before you spend",
  "content": "Always set aside 20% of income...",
  "category": "budgeting|saving|investing",
  "isActive": true,
  "createdBy": "ObjectId (ref: Users)",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Transactions 
- `GET /api/transactions` - Get user transactions (with filters)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Dashboard
- `GET /api/dashboard/stats` - Income/expense summary
- `GET /api/dashboard/categories` - Category-wise spending
- `GET /api/dashboard/trends` - Monthly trends

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/tips` - Manage financial tips

### AI Chatbot
- `POST /api/chatbot/query` - Send query to AI advisor

## Technology Stack Details

### Frontend (React.js)
- **React 19.1.1**: Latest React with new features
- **React Router**: Client-side routing
- **Redux Toolkit**: State management
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization library
- **Lucide React**: Modern icon library
- **Axios**: HTTP client for API calls

### Backend (Node.js)
- **Express.js**: Web application framework
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management

### Database (MongoDB)
- **MongoDB Atlas**: Cloud database service
- **Mongoose ODM**: Schema-based solution
- **Aggregation Pipeline**: Complex queries for analytics
- **Indexes**: Optimized query performance

### AI Integration
- **OpenAI API**: GPT-3.5-turbo for financial advice
- **Contextual Prompts**: User data integrated into AI responses
- **Fallback System**: Mock responses when API unavailable

## Deployment Strategy

### Frontend Deployment (Vercel/Netlify)
1. Build React app (`npm run build`)
2. Deploy static files to CDN
3. Configure environment variables
4. Set up custom domain (optional)

### Backend Deployment (Render/Railway)
1. Push code to Git repository
2. Connect deployment service to repo
3. Configure environment variables
4. Set up MongoDB Atlas connection
5. Enable auto-deploy on push

### Database Deployment (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Set up cluster (free tier available)
3. Configure network access (whitelist IPs)
4. Create database user credentials
5. Get connection string for backend

## Development Workflow

### Setup Instructions
1. Clone repositories
2. Install dependencies (`npm install` in both folders)
3. Configure environment variables
4. Start MongoDB (local) or connect to Atlas
5. Run backend (`npm run dev`)
6. Run frontend (`npm run dev`)
7. Access app at `http://localhost:5173`

### Project Timeline (4 weeks)
- **Week 1**: Setup, authentication, basic UI
- **Week 2**: Transaction CRUD, dashboard charts  
- **Week 3**: AI chatbot, admin panel
- **Week 4**: Testing, deployment, documentation

This architecture provides a scalable, secure, and feature-rich personal finance management system with AI-powered insights.
