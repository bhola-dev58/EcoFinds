# EcoFinds - Full-Stack Sustainable Second-Hand Marketplace

A complete second-hand marketplace built with React Native + Node.js + MySQL. Features real-time search, JWT authentication, file uploads, and modern UI/UX.

## 🚀 Quick Start

```bash
# 1. Clone and setup backend
git clone https://github.com/bhola-dev58/EcoFinds.git
cd EcoFinds/backend
npm install && npm run init-db && npm run dev

# 2. Setup frontend (new terminal)
cd .. && npm install && npm start
```

**Test Account**: `test@example.com` / `testuser123`

## 💻 Tech Stack

**Frontend**: React Native, TypeScript, Axios, AsyncStorage  
**Backend**: Node.js, Express.js, JWT, Multer, bcrypt  
**Database**: MySQL with connection pooling  
**Security**: Input validation, SQL injection protection, CORS  

## ✨ Key Features

- 🔐 **JWT Authentication** - Secure login/register with token refresh
- 📋 **Product CRUD** - Create, edit, delete with image uploads
- 🔍 **Real-time Search** - Live search with filters and counters
- 🛒 **Shopping Cart** - Multi-user cart with database sync
- 📱 **Modern UI** - Collapsible menu, responsive design, banner integration
- 🔒 **Security** - Password hashing, input validation, protected routes

## 🏢 Project Structure

```
EcoFindsApp/
├── src/                    # Frontend (React Native)
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── context/            # Auth & App state
│   └── services/           # API integration
└── backend/                # Backend (Node.js)
    ├── routes/             # API endpoints
    ├── middleware/         # Auth & validation
    ├── config/             # DB connection
    └── uploads/            # File storage
```

## 🚀 Prerequisites

- **Node.js** (v14+)
- **XAMPP** (for MySQL)
- **Expo CLI** (`npm install -g @expo/cli`)

## ⚙️ Environment Setup

**Backend (.env):**
```env
DB_HOST=localhost
DB_NAME=ecofinds
JWT_SECRET=your-secret-key
```

**API Base URL** (frontend): Update in `src/services/apiService.ts`

## 📜 API Reference

**Base URL**: `http://localhost:3000/api`

### Main Endpoints
```
POST /auth/login          # User authentication
GET  /products            # List products (?search=&category=&page=)
POST /products            # Create product (auth required)
GET  /cart                # User cart (auth required)
POST /cart/add            # Add to cart (auth required)
GET  /categories          # Available categories
```

**Auth**: Add `Authorization: Bearer <jwt-token>` header for protected routes.

## 💻 Development Commands

```bash
# Frontend
npm start                 # Start Expo dev server
npm run ios/android       # Run on device/emulator

# Backend (in /backend)
npm run dev               # Start with nodemon
npm run init-db           # Initialize database
```

## 🎨 UI/UX Design

The app features a clean, modern design with:
- **Primary Color**: Green (#4CAF50) - representing sustainability
- **Typography**: System fonts with consistent sizing
- **Icons**: Emoji-based icons for universal understanding
- **Layout**: Card-based design with appropriate spacing
- **Feedback**: Toast messages and alerts for user actions

## 🔧 Contributing

### Development Setup
1. Fork the repo and create a feature branch
2. Follow the Quick Start guide above
3. Make changes with proper TypeScript types
4. Test both frontend and backend functionality
5. Submit PR with clear description

### Code Style
- **TypeScript**: Strict typing throughout
- **React**: Functional components with hooks
- **API**: RESTful conventions
- **Database**: Parameterized queries only

### Key Areas for Contribution
- 🐛 **Bug fixes** - Check issues tab
- ✨ **Features** - Image upload improvements, real-time messaging
- 🔒 **Security** - Authentication improvements, rate limiting
- 🎨 **UI/UX** - Mobile responsiveness, dark mode
- 📝 **Docs** - API documentation, code comments

## 🗺️ Roadmap

- [ ] **Cloud Storage** - AWS S3/Cloudinary for images
- [ ] **Real-time Chat** - Socket.io messaging
- [ ] **Push Notifications** - Firebase integration  
- [ ] **Payment Gateway** - Stripe/PayPal
- [ ] **Reviews System** - User ratings
- [ ] **Dark Mode** - Theme switching
- [ ] **Admin Panel** - Web dashboard

## 🚀 Deployment

**Backend**: Deploy to Heroku/Railway/DigitalOcean  
**Frontend**: Use `expo build` for app stores or `expo build:web` for web  
**Database**: Use managed MySQL (PlanetScale, AWS RDS)

## 📄 License

MIT License - see LICENSE file. Free for commercial and personal use.

---

**EcoFinds** - Sustainable Second-Hand Marketplace promoting circular economy 🌱  
*Made by our team*
