# Community Mangrove Watch 🌿

A participatory monitoring system for mangrove forests where coastal communities, fishermen, and citizen scientists can report environmental incidents and threats.

## 🌟 Features

### 🔐 Authentication & User Management

- **User Registration & Login** with JWT authentication
- **Role-based Access Control**:
  - **Community Members**: Submit reports, view their own reports
  - **NGOs/Government**: Validate reports, access admin panel
  - **Researchers**: View analytics and download data

### 📝 Incident Reporting System

- **Comprehensive Report Creation**:
  - Title, description, and categorization
  - Photo uploads (stored locally)
  - GPS coordinates from browser
  - Severity assessment
  - Impact evaluation
- **Report Status Tracking**: Pending → Approved/Rejected/Under Investigation
- **Geolocation Support** with address mapping

### 🤖 AI/ML Integration (Stub)

- **Mock AI Validation** for uploaded reports
- **Placeholder for Real AI** implementation
- **Automated Risk Assessment** simulation

### 🏆 Gamification System

- **Points System**: Earn points for valid reports
- **Leaderboard**: Track top contributors
- **Achievement Tracking**: Monitor user progress

### 📊 Dashboard & Analytics

- **Admin Panel**: Report validation and management
- **Analytics Dashboard**: Data visualization and insights
- **Export Functionality**: CSV data export
- **Interactive Charts**: Category and status distributions

## 🛠️ Tech Stack

### Backend

- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Express Validator** for input validation
- **Helmet** for security headers

### Frontend

- **React.js** with **Vite** build tool
- **TailwindCSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **React Hook Form** for form handling
- **Lucide React** for icons
- **React Hot Toast** for notifications

## 📁 Project Structure

```
community-mangrove-watch/
├── backend/                 # Express.js server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & upload middleware
│   ├── uploads/            # File storage
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── frontend/               # React.js application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── assets/         # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd community-mangrove-watch
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Update MONGODB_URI, JWT_SECRET, etc.

# Start MongoDB (make sure MongoDB is running)
# On Windows: Start MongoDB service
# On macOS: brew services start mongodb-community
# On Linux: sudo systemctl start mongod

# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## ⚙️ Environment Configuration

### Backend (.env)

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

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Reports

- `GET /api/reports` - Get all reports (filtered by user role)
- `POST /api/reports` - Submit new report
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `PUT /api/reports/:id/validate` - Validate report (NGO/Govt only)
- `POST /api/reports/:id/ai-analysis` - AI analysis (stub)

### Statistics

- `GET /api/reports/stats/summary` - Dashboard summary stats
- `GET /api/reports/stats` - Admin panel comprehensive stats

### Users

- `GET /api/users/leaderboard` - User leaderboard
- `GET /api/users/profile` - User profile

## 👥 User Roles & Permissions

### Community Members

- ✅ Submit incident reports
- ✅ View own reports
- ✅ Upload photos
- ✅ Earn points for valid reports
- ❌ Validate other reports
- ❌ Access admin panel

### NGOs & Government Officials

- ✅ All Community Member permissions
- ✅ Validate and approve/reject reports
- ✅ Access admin panel
- ✅ View comprehensive statistics
- ✅ Export data
- ✅ AI analysis access

### Researchers

- ✅ View all reports
- ✅ Access analytics dashboard
- ✅ Export data for research
- ✅ View comprehensive statistics
- ❌ Submit reports
- ❌ Validate reports

## 🎯 Key Features in Detail

### Report Submission

1. **Location Detection**: Automatic GPS coordinates from browser
2. **Photo Upload**: Multiple photo support with local storage
3. **Category Classification**: Cutting, dumping, reclamation, pollution, other
4. **Severity Assessment**: Low, medium, high, critical
5. **Impact Evaluation**: Biodiversity, carbon storage, coastal protection

### Admin Panel

1. **Report Management**: Approve, reject, or mark for investigation
2. **Statistics Dashboard**: Real-time metrics and charts
3. **Filtering & Search**: Advanced report filtering
4. **Data Export**: CSV export functionality
5. **User Management**: Monitor user activity

### Analytics Dashboard

1. **Interactive Charts**: Bar charts, pie charts, time series
2. **Geographic Distribution**: Regional incident mapping
3. **Trend Analysis**: Temporal patterns and insights
4. **Data Export**: Research-friendly data formats

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Role-based Access Control** (RBAC)
- **Input Validation** with express-validator
- **File Upload Security** with file type and size validation
- **CORS Protection** for cross-origin requests
- **Helmet.js** for security headers

## 📱 Responsive Design

- **Mobile-first** approach
- **Progressive Web App** features
- **Touch-friendly** interface
- **Cross-browser** compatibility

## 🚀 Future Enhancements

### AI/ML Integration

- **Image Recognition** for automatic damage assessment
- **Natural Language Processing** for report analysis
- **Predictive Analytics** for threat prediction
- **Satellite Image Integration** for large-scale monitoring

### Advanced Features

- **Real-time Notifications** for urgent incidents
- **Mobile App** for offline reporting
- **Blockchain Integration** for data integrity
- **API Integration** with external environmental databases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mangrove Conservation** organizations worldwide
- **Coastal Communities** for their environmental stewardship
- **Open Source Community** for the amazing tools and libraries

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**🌿 Together, let's protect our mangrove forests for future generations! 🌿**
