# Test Setup Guide

## Prerequisites Check

Before running the application, ensure you have:

- [ ] Node.js (v16 or higher) installed
- [ ] MongoDB (v5 or higher) installed and running
- [ ] npm or yarn package manager

## Quick Test Commands

### 1. Check Node.js Version

```bash
node --version
npm --version
```

### 2. Check MongoDB Status

```bash
# Windows
net start MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

### 3. Test Backend

```bash
cd backend
npm install
npm run dev
```

Expected output:

```
Connected to MongoDB
Server running on port 5000
```

### 4. Test Frontend

```bash
cd frontend
npm install
npm run dev
```

Expected output:

```
Local:   http://localhost:3000/
Network: use --host to expose
```

## API Endpoint Tests

### Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "Community Mangrove Watch API is running"
}
```

### Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "community"
  }'
```

## Common Issues & Solutions

### MongoDB Connection Error

**Error**: `MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**:

1. Start MongoDB service
2. Check if MongoDB is running on port 27017
3. Verify connection string in `.env` file

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:

1. Change PORT in `.env` file
2. Kill process using the port: `npx kill-port 5000`

### Frontend Build Error

**Error**: `Cannot find module 'react'`

**Solution**:

1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again

### CORS Error

**Error**: `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**:

1. Check CORS_ORIGIN in backend `.env` file
2. Ensure it matches your frontend URL
3. Restart backend server

## Browser Testing

1. Open http://localhost:3000
2. Check browser console for errors
3. Test user registration
4. Test user login
5. Test report submission
6. Test admin panel (if NGO/Government role)

## Database Verification

### Check MongoDB Collections

```bash
# Connect to MongoDB
mongosh

# Switch to database
use mangrove-watch

# List collections
show collections

# Check users
db.users.find().pretty()

# Check reports
db.reports.find().pretty()
```

## Performance Testing

### Backend Load Test

```bash
# Install artillery for load testing
npm install -g artillery

# Test API endpoints
artillery quick --count 100 --num 10 http://localhost:5000/api/health
```

### Frontend Performance

1. Open Chrome DevTools
2. Go to Performance tab
3. Record page load
4. Check for slow operations

## Security Testing

### JWT Token Validation

1. Try accessing protected routes without token
2. Test with expired token
3. Test with invalid token

### File Upload Security

1. Try uploading non-image files
2. Test file size limits
3. Verify file type validation

## Success Criteria

Your setup is working correctly if:

- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] User registration works
- [ ] User login works
- [ ] Report submission works
- [ ] Admin panel accessible (for appropriate roles)
- [ ] Analytics dashboard loads
- [ ] File uploads work
- [ ] No console errors in browser
- [ ] API endpoints respond correctly

## Next Steps

Once testing is complete:

1. Create your first user account
2. Submit a test report
3. Explore the admin panel
4. Test the analytics dashboard
5. Customize the application for your needs

## Support

If you encounter issues:

1. Check the console logs
2. Verify all prerequisites
3. Check the README.md file
4. Review the error messages
5. Check MongoDB connection
6. Verify environment variables
