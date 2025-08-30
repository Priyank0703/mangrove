# 🌿 Community Mangrove Watch

A comprehensive participatory monitoring system for mangrove forest conservation, enabling communities, NGOs, government agencies, and researchers to collaborate in protecting these vital ecosystems.

## 🚀 Features

### Core Functionality
- **Incident Reporting**: Submit detailed reports with photos, location data, and impact assessments
- **Role-Based Access**: Different interfaces for community members, NGOs, government officials, and researchers
- **Real-time Monitoring**: Track mangrove health and threats with comprehensive dashboards
- **Photo Documentation**: Upload and manage evidence photos with drag-and-drop interface
- **Geolocation Tracking**: Precise location mapping for accurate incident reporting
- **Validation System**: Multi-tier validation process for report accuracy

### User Roles & Permissions
- **Community Members**: Submit reports, view own reports and public approved reports
- **NGO Staff**: Validate reports, access analytics, manage community engagement
- **Government Officials**: Full administrative access, validation, and policy enforcement
- **Researchers**: Access approved reports for research and analysis

### Advanced Features
- **Gamification System**: Earn points and achievements for contributions
- **Data Analytics**: Comprehensive reporting and visualization tools
- **Export Capabilities**: Download reports and data for external analysis
- **AI/ML Integration**: Automated report analysis and validation suggestions
- **Mobile Responsive**: Works seamlessly across all devices

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

### Frontend
- **React 19** with modern hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Hook Form** for form management
- **React Dropzone** for file uploads
- **Recharts** for data visualization
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Development Tools
- **ESLint** for code linting
- **PostCSS** for CSS processing
- **Autoprefixer** for CSS compatibility

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd community-mangrove-watch
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mangrove-watch
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start the Application

#### Option A: Using the provided scripts
```bash
# From the root directory
npm run dev
```

#### Option B: Manual start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/health

## 📁 Project Structure

```
community-mangrove-watch/
├── backend/
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   └── upload.js        # File upload middleware
│   ├── models/
│   │   ├── Report.js        # Report data model
│   │   └── User.js          # User data model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── reports.js       # Report management routes
│   │   └── users.js         # User management routes
│   ├── uploads/             # File upload directory
│   ├── server.js            # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   └── DebugInfo.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── SubmitReport.jsx
│   │   │   ├── ReportDetail.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── Analytics.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── README.md
└── package.json
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
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

### Database Setup

The application uses MongoDB with the following collections:
- **users**: User accounts and profiles
- **reports**: Incident reports and metadata

### File Upload Configuration

- **Maximum file size**: 5MB per file
- **Maximum files per upload**: 5 photos
- **Supported formats**: JPEG, PNG, GIF
- **Storage location**: `backend/uploads/`

## 🔐 Authentication & Authorization

### User Roles
1. **Community** (default): Can submit reports and view own reports
2. **NGO**: Can validate reports and access analytics
3. **Government**: Full administrative access
4. **Researcher**: Can view approved reports for research

### JWT Token
- **Expiration**: 7 days
- **Refresh**: Available via `/api/auth/refresh`
- **Storage**: Local storage (frontend)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token

### Reports
- `GET /api/reports` - Get reports with filtering and pagination
- `POST /api/reports` - Submit new report
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `POST /api/reports/:id/validate` - Validate report (NGO/Govt)
- `GET /api/reports/stats/summary` - Get summary statistics
- `GET /api/reports/stats` - Get comprehensive statistics

### Users
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/profile/:id` - Get user profile
- `GET /api/users/search` - Search users
- `GET /api/users/stats` - Get user statistics
- `PUT /api/users/:id/status` - Update user status
- `GET /api/users/me/reports` - Get current user's reports
- `GET /api/users/me/achievements` - Get user achievements

## 🎯 Usage Examples

### Submitting a Report
1. Navigate to "Submit Report"
2. Fill in incident details
3. Upload photos (drag & drop)
4. Set location (GPS or manual entry)
5. Add impact assessment
6. Submit for validation

### Validating Reports (NGO/Govt)
1. Access Admin Panel
2. View pending reports
3. Review evidence and details
4. Add validation notes
5. Approve or reject

### Viewing Analytics
1. Access Analytics page (Researchers)
2. View comprehensive statistics
3. Export data for research
4. Generate reports

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Configure MongoDB connection
3. Set up file storage (consider cloud storage for production)
4. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables for production API

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=your-frontend-domain
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Community members and conservationists worldwide
- Environmental organizations supporting mangrove protection
- Open source community for the amazing tools and libraries

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Mobile App**: Native mobile application
- **Real-time Notifications**: Push notifications for report updates
- **Advanced Analytics**: Machine learning for trend analysis
- **GIS Integration**: Advanced mapping and spatial analysis
- **Blockchain**: Immutable record keeping
- **API Integration**: Connect with external conservation databases
- **Multi-language Support**: Internationalization
- **Offline Support**: Work without internet connection

---

**Made with ❤️ for mangrove conservation**
