# 🏦 SmartFinance India - Complete Personal Finance Manager

## 🌟 Overview
SmartFinance India is a comprehensive MERN stack personal finance management application designed specifically for Indian users. It provides intelligent budgeting, savings goal tracking, transaction management, and AI-powered financial advice - all localized for the Indian market with INR currency support.

## ✨ Features

### 📊 Dashboard & Analytics
- Real-time financial overview with Indian currency (₹)
- Interactive charts and graphs using Recharts
- Monthly/yearly spending analysis
- Income vs expense tracking
- Financial health score

### 💰 Transaction Management
- Easy income/expense tracking
- 13 Indian-specific categories (Food & Dining, Rent/EMI, etc.)
- Advanced filtering and search
- CSV import/export functionality
- Receipt attachment support

### 🎯 Savings Goals
- Create and track multiple savings goals
- 10 goal categories (Emergency Fund, Home Purchase, Wedding, etc.)
- Visual progress tracking with milestones
- Contribution history and analytics
- Smart deadline reminders

### 📋 Budget Planning
- Comprehensive budget creation (Weekly/Monthly/Quarterly/Yearly)
- Category-wise budget allocation
- Real-time spending vs budget tracking
- Overspending alerts and recommendations
- Interactive pie charts and analytics

### 🤖 AI Financial Assistant
- Google Gemini-powered chatbot
- Personalized financial advice for Indians
- SIP, ELSS, PPF investment guidance
- Smart spending recommendations
- 24/7 financial support

### 🔔 Smart Notifications
- Budget threshold alerts
- Savings goal milestone notifications
- Large transaction alerts
- Daily spending summaries
- Achievement celebrations

### 👥 User Management
- Secure JWT authentication
- Role-based access (User/Admin)
- Profile customization
- Multi-user support

### 🛡️ Admin Dashboard
- User management
- System analytics
- Transaction monitoring
- Financial tips management
- Performance metrics

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern UI library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling framework
- **Recharts** - Data visualization
- **React Icons** - Icon library
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM library
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Generative AI** - AI chatbot
- **CORS** - Cross-origin support

### Infrastructure
- **MongoDB Atlas** - Cloud database hosting
- **Vite Dev Server** - Development server
- **ES Modules** - Modern JavaScript
- **RESTful APIs** - Clean architecture

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Google Gemini API key (optional)

### 1. Clone Repository
```bash
git clone https://github.com/anubhav-n-mishra/Smart-finance-app.git
cd Smart-finance-app
```

### 2. Backend Setup
```bash
cd server
npm install

# Create .env file
echo "MONGODB_URI=your_mongodb_connection_string" >> .env
echo "JWT_SECRET=your_jwt_secret_key" >> .env
echo "GEMINI_API_KEY=your_gemini_api_key" >> .env

# Start backend server
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd Smart_Finance_app
npm install

# Start frontend development server
npm run dev
# App runs on http://localhost:5173
```

## 🎯 Usage Guide

### 📱 Getting Started
1. **Register Account**: Create your account with email/password
2. **Complete Profile**: Set your preferences and financial goals
3. **Add Transactions**: Start tracking your income and expenses
4. **Create Budgets**: Set monthly budgets for different categories
5. **Set Savings Goals**: Define your financial objectives
6. **Monitor Progress**: Use dashboard to track your financial health

### 💡 Pro Tips
- Enable notifications for better budget tracking
- Use the AI assistant for personalized financial advice
- Set realistic savings goals with achievable timelines
- Regularly sync your budgets with actual transactions
- Utilize category-wise spending analysis for better insights

## 🏗️ Project Structure
```
Smart-finance-app/
├── Smart_Finance_app/          # Frontend React Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Application pages
│   │   ├── store/              # Redux store setup
│   │   ├── services/           # API service calls
│   │   ├── utils/              # Utility functions
│   │   └── assets/             # Static assets
│   ├── public/                 # Public files
│   └── package.json            # Frontend dependencies
├── server/                     # Backend Node.js Application
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API route handlers
│   ├── middleware/             # Custom middleware
│   ├── utils/                  # Utility functions
│   └── server.js               # Server entry point
├── README.md                   # Project documentation
└── .gitignore                  # Git ignore rules
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Savings Goals
- `GET /api/savings-goals` - Get user goals
- `POST /api/savings-goals` - Create new goal
- `POST /api/savings-goals/:id/contribute` - Add contribution
- `GET /api/savings-goals/stats` - Get goal statistics

### Budget Planning
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id/sync-spending` - Sync with transactions
- `GET /api/budgets/:id/analytics` - Get budget analytics

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## 🇮🇳 Indian Localization

### Currency Support
- Complete INR (₹) integration
- Indian number formatting (Lakhs/Crores)
- Culturally relevant financial categories

### Indian Financial Context
- SIP (Systematic Investment Plan) advice
- ELSS (Equity Linked Savings Scheme) guidance
- PPF (Public Provident Fund) recommendations
- Indian tax planning considerations
- Festival and occasion-based savings goals

### Categories Tailored for India
- **Food & Dining** - Restaurant and food delivery expenses
- **Transportation** - Auto, bus, train, cab expenses
- **Rent/EMI** - Housing and loan payments
- **Bills & Utilities** - Electricity, water, gas, internet
- **Healthcare** - Medical expenses and insurance
- **Education** - School, college, courses
- **Groceries** - Daily essentials and household items

## 🔐 Security Features

### Authentication & Authorization
- JWT-based secure authentication
- Password hashing with bcryptjs
- Role-based access control
- Session management

### Data Protection
- Input validation and sanitization
- CORS configuration
- Error handling without data exposure
- User data isolation

## 📊 Performance Optimizations

### Frontend
- React lazy loading
- Code splitting with Vite
- Optimized bundle size
- Responsive design for mobile

### Backend
- MongoDB indexing
- Efficient aggregation queries
- Connection pooling
- Error handling middleware

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- ESLint for code quality
- Prettier for formatting
- Conventional commits
- Component documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Anubhav N. Mishra**
- GitHub: [@anubhav-n-mishra](https://github.com/anubhav-n-mishra)
- LinkedIn: [Connect with me](https://linkedin.com/in/anubhav-n-mishra)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for reliable database solutions
- Google Gemini AI for intelligent financial advice
- Tailwind CSS for beautiful styling
- All open-source contributors

## 📞 Support

For support, email anubhav@example.com or open an issue in the GitHub repository.

---

## 🎯 Roadmap

### Phase 1 ✅ (Completed)
- [x] User authentication and profiles
- [x] Transaction management
- [x] Basic dashboard with analytics
- [x] AI chatbot integration

### Phase 2 ✅ (Completed)
- [x] Advanced user profiles
- [x] Admin dashboard
- [x] Enhanced transaction features
- [x] Indian market localization

### Phase 3 ✅ (Completed)
- [x] Savings goals management
- [x] Budget planning and tracking
- [x] Smart notification system
- [x] Advanced analytics and insights

### Phase 4 🚧 (Upcoming)
- [ ] Bank account integration
- [ ] Investment portfolio tracking
- [ ] Tax planning tools
- [ ] Mobile application
- [ ] Advanced reporting
- [ ] Multi-language support

---

**⭐ If you found this project helpful, please give it a star!**

Made with ❤️ for the Indian financial ecosystem 🇮🇳
