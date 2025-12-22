# Server - Node.js/Express Backend API

## 📋 Overview

The server is a Node.js/Express backend application that serves as the main API layer for the audio call analysis system. It handles user authentication, database operations, file management, and coordinates with the Flask microservice for audio processing.

## 🛠️ Development Aspects

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js 4.19.2
- **Database**: MongoDB with Mongoose 8.4.0
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcrypt 5.1.1
- **Email Service**: Nodemailer 6.9.13
- **HTTP Client**: Axios 1.7.2
- **CORS**: cors 2.8.5
- **Environment**: dotenv 16.4.5
- **Development**: nodemon 3.1.0

### Key Features
- RESTful API endpoints
- User authentication and authorization
- JWT-based session management
- MongoDB database operations
- File and folder management
- Bulk audio analysis coordination
- Integration with Flask service
- Email notifications
- Error handling middleware

## 📁 File Hierarchy Structure

```
server/
├── controller/                   # Business logic controllers
│   ├── analysisController.js    # Single file analysis logic
│   ├── bulkAnalysisController.js # Bulk analysis operations
│   ├── bulkController.js         # Folder and file management
│   └── userController.js         # User authentication & management
├── database/                     # Database configuration
│   └── connectDB.js             # MongoDB connection
├── middleware/                   # Custom middleware
│   └── createError.js            # Error creation utility
├── model/                        # Mongoose data models
│   ├── Analysis.js               # Analysis result schema
│   ├── AudioFile.js              # Audio file schema
│   ├── BulkAnalysis.js           # Bulk analysis schema
│   ├── Folder.js                 # Folder schema
│   └── User.js                   # User schema
├── routes/                       # API route definitions
│   ├── analysisRoutes.js         # Analysis endpoints
│   ├── bulkAnalysisRoutes.js     # Bulk analysis endpoints
│   ├── bulkRoutes.js             # Folder/file endpoints
│   └── userRoutes.js             # User endpoints
├── utilis/                       # Utility functions
│   ├── emailService.js           # Email sending service
│   └── jwt.js                    # JWT token utilities
├── index.js                      # Application entry point
├── package.json                  # Dependencies and scripts
└── .env                          # Environment variables
```

## 🔗 How This Project Connects to Others

### Connection to Client (Next.js Frontend)
- **Port**: 3001 (configurable via `.env`)
- **CORS**: Configured to allow `http://localhost:3000`
- **Authentication**: JWT tokens in HTTP-only cookies
- **API Prefix**: `/api`
- **Endpoints**:
  - User: `/api/register`, `/api/login`, `/api/logout`
  - Folders: `/api/folders/*`
  - Analysis: `/api/analysis/*`, `/api/bulk-analysis`

### Connection to Flask (Python Microservice)
- **Flask URL**: `http://localhost:8000`
- **Endpoint**: `/upload` (POST)
- **Purpose**: Audio processing via Hume API
- **Flow**:
  1. Server receives audio file URL from client
  2. Server sends POST request to Flask `/upload` endpoint
  3. Flask processes audio and returns analysis
  4. Server stores results in MongoDB
  5. Server returns results to client

### Connection to MongoDB
- **Default URI**: `mongodb://localhost:27017/audio-analysis`
- **Database Name**: `audio-analysis`
- **Collections**:
  - `users` - User accounts
  - `folders` - Audio file folders
  - `audiofiles` - Individual audio files
  - `analyses` - Single file analysis results
  - `bulkanalyses` - Bulk analysis results

### Data Flow Architecture
```
Client Request → Express Server → MongoDB (Read/Write)
                      ↓
                 Flask Service → Hume API
                      ↓
                 Analysis Results → MongoDB
                      ↓
                 Response → Client
```

## 💻 Development Basic Info

### Prerequisites
- Node.js 18+ and npm
- MongoDB installed and running
- Python 3.12.8 (for Flask service)
- Access to Hume API (for audio processing)

### Environment Variables
Create a `.env` file in the server directory:
```env
MONGODB_URI=mongodb://localhost:27017/audio-analysis
JWT_KEY=your_jwt_secret_key_here
PORT=3001
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### Installation
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start server (development with nodemon)
npm start
```

### Available Scripts
- `npm start` - Start server with nodemon (auto-restart on changes)
- `node index.js` - Start server without nodemon

## 🚀 Guide to Run This Project

### Step 1: Install Dependencies
```bash
cd server
npm install
```

### Step 2: Configure Environment
Create `.env` file with required variables:
```env
MONGODB_URI=mongodb://localhost:27017/audio-analysis
JWT_KEY=your_secure_jwt_secret_key_minimum_32_characters
PORT=3001
```

### Step 3: Start MongoDB
```bash
# macOS/Linux
mongod

# Or if installed via Homebrew
brew services start mongodb-community
```

### Step 4: Start Flask Service
Ensure Flask service is running on port 8000:
```bash
cd ../flask
source venv/bin/activate
python app.py
```

### Step 5: Start Server
```bash
cd server
npm start
```

### Step 6: Verify Server is Running
Check console output:
```
Server is running on port 3001
MongoDB connected successfully
```

### Step 7: Test API Endpoints
Use Postman or curl to test:
```bash
# Health check (if implemented)
curl http://localhost:3001/api/health

# Register user
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

## 📝 API Endpoints

### User Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `PUT /api/users/:id/update-password` - Update password

### Folder Endpoints
- `GET /api/folders` - Get all folders for user
- `POST /api/folders` - Create new folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### Analysis Endpoints
- `GET /api/analysis/:folderId` - Get analysis by folder ID
- `POST /api/bulk-analysis` - Trigger bulk analysis
- Query params: `?page=1&limit=5&fileIndex=0`

## 🔧 Database Models

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  createdAt: Date
}
```

### Folder Model
```javascript
{
  name: String,
  userId: ObjectId,
  audioFiles: [AudioFile],
  status: String,
  createdAt: Date
}
```

### Analysis Model
```javascript
{
  folderId: String,
  analysis: [{
    url: String,
    result: Mixed (Hume API response)
  }],
  createdAt: Date
}
```

## 🔒 Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **HTTP-only Cookies**: Prevents XSS attacks
4. **CORS Configuration**: Restricted origin access
5. **Input Validation**: Request body validation
6. **Error Handling**: Secure error messages

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MongoDB is running: `mongod --version`
   - Check connection string in `.env`
   - Ensure MongoDB is accessible on port 27017

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill process using port: `lsof -ti:3001 | xargs kill`

3. **JWT Errors**
   - Verify JWT_KEY is set in `.env`
   - Check token expiration settings
   - Ensure cookies are being sent with requests

4. **Flask Service Connection Failed**
   - Verify Flask is running on port 8000
   - Check Flask CORS configuration
   - Test Flask endpoint directly

5. **Module Not Found**
   - Run `npm install` again
   - Check `package.json` dependencies
   - Verify Node.js version compatibility

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT Best Practices](https://jwt.io/introduction)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

## 🎯 Development Tips

1. **Error Handling**: Always use try-catch blocks
2. **Async/Await**: Prefer async/await over callbacks
3. **Middleware**: Use middleware for common operations
4. **Validation**: Validate all user inputs
5. **Logging**: Implement proper logging for debugging
6. **Environment Variables**: Never commit `.env` files
7. **Database Indexing**: Add indexes for frequently queried fields

## 🔄 Integration Points

### With Client
- Receives HTTP requests from Next.js frontend
- Returns JSON responses
- Manages user sessions via JWT

### With Flask
- Sends audio URLs for processing
- Receives analysis results
- Handles errors from Flask service

### With MongoDB
- CRUD operations on all collections
- Data validation via Mongoose schemas
- Connection pooling for performance

