# Client - Next.js Frontend Application

## 📋 Overview

The client is a Next.js-based React frontend application that provides a comprehensive user interface for audio call analysis. It features user authentication, dashboard management, bulk audio analysis, and real-time emotion visualization.

## 🛠️ Development Aspects

### Technology Stack
- **Framework**: Next.js 14.2.3
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4.3
- **Component Library**: Ant Design 5.17.3
- **Charts**: Chart.js 4.4.7, React-Chartjs-2 5.3.0
- **HTTP Client**: Axios 1.7.2
- **Routing**: React Router DOM 6.23.1
- **Icons**: React Icons 5.2.1
- **File Upload**: React Dropzone 14.2.3

### Key Features
- User authentication (Login/Signup)
- Protected routes with JWT tokens
- Single audio file upload and analysis
- Bulk audio analysis with folder management
- Real-time emotion visualization
- Transcript sentiment analysis
- Business insights and recommendations
- Responsive design for all devices

## 📁 File Hierarchy Structure

```
client/
├── api/                          # API configuration and calls
│   ├── api.js                    # API endpoint functions
│   └── axiosClient.js            # Axios instance configuration
├── components/                   # React components
│   ├── Assets/                   # Image assets
│   ├── Dashboard/                # Dashboard components
│   │   ├── Content/              # Main content components
│   │   │   ├── Bulk/             # Bulk analysis components
│   │   │   │   ├── BulkAnalysis.js
│   │   │   │   └── FolderManager.js
│   │   │   ├── EmotionAnalysisChart.js  # Emotion visualization
│   │   │   ├── UploadAudio.js    # Single file upload
│   │   │   └── home.js           # Dashboard home
│   │   ├── Layout/               # Layout components
│   │   │   ├── index.js          # Main layout
│   │   │   └── ProfileUpdateModal.js
│   │   ├── Navbar/               # Navigation bar
│   │   └── Sidebar/              # Sidebar navigation
│   ├── Home/                     # Landing page components
│   │   ├── Contact.js
│   │   ├── Features.js
│   │   ├── Footer.js
│   │   ├── Guidelines.js
│   │   ├── Header.js
│   │   ├── Hero.js
│   │   └── index.js
│   ├── Login/                    # Login component
│   ├── Signup/                   # Signup component
│   └── utilis/                   # Utility components
│       ├── get-audio-url.js      # Audio URL helper
│       ├── Protected.js          # Route protection
│       └── userContext.js        # User context provider
├── pages/                        # Next.js pages
│   ├── _app.js                   # App wrapper
│   ├── _document.js              # Document wrapper
│   ├── index.js                  # Home page
│   ├── login.js                  # Login page
│   ├── signup.js                 # Signup page
│   └── dashboard/                # Dashboard pages
│       ├── index.js              # Main dashboard
│       └── bulk-analysis.js     # Bulk analysis page
├── styles/                       # CSS styles
│   ├── globals.css               # Global styles
│   └── *.module.css              # Component-specific styles
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── next.config.mjs               # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── jsconfig.json                 # JavaScript configuration
```

## 🔗 How This Project Connects to Others

### Connection to Server (Node.js/Express)
- **Base URL**: `http://localhost:3001/api/`
- **Authentication**: JWT tokens stored in cookies
- **API Endpoints Used**:
  - `/api/register` - User registration
  - `/api/login` - User authentication
  - `/api/logout` - User logout
  - `/api/users/:id/update-password` - Password update
  - `/api/folders` - Folder CRUD operations
  - `/api/bulk-analysis` - Bulk analysis trigger
  - `/api/analysis/:folderId` - Get analysis results

### Connection to Flask (Python Microservice)
- **Base URL**: `http://localhost:8000/`
- **Purpose**: Audio processing via Hume API
- **Flow**:
  1. Client uploads audio file to server
  2. Server sends file URL to Flask service
  3. Flask processes audio using Hume API
  4. Flask returns emotion analysis results
  5. Server stores results in MongoDB
  6. Client fetches and displays results

### Data Flow
```
User Action → Client (Next.js) → Server (Express) → Flask (Python) → Hume API
                                                      ↓
User View ← Client (Next.js) ← Server (Express) ← Results stored in MongoDB
```

## 💻 Development Basic Info

### Prerequisites
- Node.js 18+ and npm
- MongoDB running locally or remotely
- Python 3.12.8 (for Flask service)
- All three services running simultaneously

### Environment Variables
Create a `.env.local` file (if needed):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Installation
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Run development server
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Guide to Run This Project

### Step 1: Install Dependencies
```bash
cd client
npm install
```

### Step 2: Ensure Other Services Are Running
Before starting the client, ensure:
1. **MongoDB** is running on `localhost:27017`
2. **Server** (Node.js) is running on `http://localhost:3001`
3. **Flask** service is running on `http://localhost:8000`

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Access Application
Open your browser and navigate to:
```
http://localhost:3000
```

### Step 5: Test the Application
1. **Sign Up**: Create a new account
2. **Login**: Authenticate with your credentials
3. **Dashboard**: Access the main dashboard
4. **Upload Audio**: Test single file upload
5. **Bulk Analysis**: Create folders and analyze multiple files

## 📝 Key Components Explained

### Authentication Flow
- Uses JWT tokens stored in HTTP-only cookies
- Protected routes check authentication status
- User context provides global user state

### API Integration
- `axiosClient.js` configures base URL and credentials
- `api.js` contains all API endpoint functions
- Automatic token inclusion via `withCredentials: true`

### State Management
- React Context API for user state
- Local state for component-specific data
- No external state management library required

### Routing
- Next.js file-based routing
- Protected routes using `Protected.js` wrapper
- Dynamic routes for dashboard pages

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure server CORS is configured to allow `http://localhost:3000`
   - Check `server/index.js` CORS configuration

2. **API Connection Failed**
   - Verify server is running on port 3001
   - Check `axiosClient.js` base URL configuration

3. **Authentication Issues**
   - Clear browser cookies
   - Check JWT token expiration
   - Verify server authentication endpoints

4. **Build Errors**
   - Delete `node_modules` and `.next` folder
   - Run `npm install` again
   - Check Node.js version compatibility

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Ant Design Components](https://ant.design/components/overview/)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [React Documentation](https://react.dev/)

## 🎯 Development Tips

1. **Hot Reload**: Next.js provides automatic hot reload during development
2. **Component Structure**: Keep components modular and reusable
3. **API Calls**: Always handle loading and error states
4. **Responsive Design**: Test on multiple screen sizes
5. **Performance**: Use React.memo for expensive components
