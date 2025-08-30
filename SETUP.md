# 🚀 Community Mangrove Watch - Setup Guide

This guide will help you set up and run the Community Mangrove Watch project on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### Verify Installation
```bash
# Check Node.js version
node --version  # Should be v18 or higher

# Check npm version
npm --version   # Should be v8 or higher

# Check MongoDB version
mongod --version  # Should be v5 or higher

# Check Git version
git --version
```

## 🛠️ Installation Steps

### Step 1: Clone the Repository
```bash
# Clone the repository
git clone <repository-url>
cd community-mangrove-watch

# Verify the project structure
ls -la
```

You should see:
```
community-mangrove-watch/
├── backend/
├── frontend/
├── README.md
├── SETUP.md
└── package.json
```

### Step 2: Install Dependencies

#### Option A: Using the root setup script (Recommended)
```bash
# Install all dependencies (backend, frontend, and root)
npm run setup
```

#### Option B: Manual installation
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### Step 3: Configure Environment Variables

#### Backend Configuration
Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add the following content to `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/mangrove-watch

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

#### Frontend Configuration (Optional)
Create a `.env` file in the `frontend` directory if you need to override default settings:

```bash
cd frontend
touch .env
```

Add the following content to `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=Community Mangrove Watch
VITE_APP_VERSION=1.0.0
```

### Step 4: Start MongoDB

#### Option A: Local MongoDB Installation
```bash
# Start MongoDB service
mongod

# Or on macOS with Homebrew
brew services start mongodb-community

# Or on Windows
net start MongoDB
```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `MONGODB_URI` in your `.env` file with the Atlas connection string

### Step 5: Create Upload Directory
```bash
# Create uploads directory for file storage
cd backend
mkdir uploads
```

### Step 6: Start the Application

#### Option A: Using the root script (Recommended)
```bash
# From the root directory
npm run dev
```

This will start both backend and frontend simultaneously.

#### Option B: Manual start
```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

## 🌐 Access the Application

Once everything is running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 👥 Create Test Users

After starting the application, you can create test users with different roles:

### Community Member
- Register with role: "Community Member"
- Can submit reports and view public reports

### NGO Staff
- Register with role: "NGO Staff"
- Can validate reports and access admin panel

### Government Official
- Register with role: "Government Official"
- Full administrative access

### Researcher
- Register with role: "Researcher"
- Can access analytics and research data

## 🔧 Development Workflow

### Running in Development Mode
```bash
# Start both backend and frontend with hot reload
npm run dev
```

### Building for Production
```bash
# Build the frontend
npm run build

# Start production server
npm start
```

### Running Tests
```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

### Code Linting
```bash
# Lint all code
npm run lint

# Lint backend only
npm run lint:backend

# Lint frontend only
npm run lint:frontend
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Kill processes using ports 3000 and 5000
npx kill-port 3000 5000

# Or manually find and kill processes
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

#### 2. MongoDB Connection Error
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB if not running
mongod

# Check MongoDB connection
mongo --eval "db.runCommand('ping')"
```

#### 3. Node Modules Issues
```bash
# Clear all node_modules and reinstall
npm run clean
npm run install:all
```

#### 4. Environment Variables Not Loading
```bash
# Check if .env file exists
ls -la backend/.env

# Verify .env file content
cat backend/.env
```

#### 5. CORS Errors
- Ensure `CORS_ORIGIN` in `.env` matches your frontend URL
- Check that the proxy is configured in `vite.config.js`

#### 6. File Upload Issues
```bash
# Check uploads directory permissions
ls -la backend/uploads

# Create uploads directory if missing
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### Debug Mode

Enable detailed logging by setting `LOG_LEVEL=debug` in your `.env` file.

### Database Reset

To reset the database:
```bash
# Connect to MongoDB
mongo

# Switch to database
use mangrove-watch

# Drop all collections
db.users.drop()
db.reports.drop()

# Exit MongoDB
exit
```

## 📊 Monitoring and Logs

### Backend Logs
- Check console output for backend logs
- Set `LOG_LEVEL=debug` for detailed logging

### Frontend Logs
- Open browser developer tools (F12)
- Check Console tab for frontend logs

### Database Monitoring
```bash
# Connect to MongoDB shell
mongo

# Switch to database
use mangrove-watch

# View collections
show collections

# View documents
db.users.find()
db.reports.find()
```

## 🔒 Security Considerations

### Development Environment
- Use strong JWT secrets in production
- Never commit `.env` files to version control
- Use environment-specific configurations

### Production Deployment
- Set `NODE_ENV=production`
- Use HTTPS in production
- Configure proper CORS settings
- Set up proper file storage (cloud storage recommended)
- Use environment variables for sensitive data

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Check the browser developer tools for frontend errors
4. Verify all prerequisites are installed correctly
5. Ensure MongoDB is running and accessible
6. Check that all environment variables are set correctly

For additional support:
- Create an issue in the repository
- Check the main README.md file
- Contact the development team

---

**Happy coding! 🌿**
