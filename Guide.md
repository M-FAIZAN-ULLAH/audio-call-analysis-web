# Audio Call Analysis System - Setup Guide

This guide will help you set up and run all three components of the Audio Call Analysis System:
1. **Client** (Next.js Frontend)
2. **Server** (Node.js/Express Backend)
3. **Flask** (Python Audio Processing Service)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher recommended)
- **Python 3.12.8** (⚠️ **IMPORTANT**: Use Python 3.12.8 specifically)
- **MongoDB** (running locally or connection string)
- **npm** or **yarn** (comes with Node.js)
- **pip** (comes with Python)

---

## Project Structure

```
audio-call-analysis-web/
├── client/          # Next.js Frontend
├── server/          # Node.js/Express Backend
└── flask/           # Python Flask Audio Processing Service
```

---

## 1. Flask Service Setup (Python 3.12.8)

The Flask service handles audio processing using the Hume API.

### Step 1: Navigate to Flask Directory

```bash
cd flask
```

### Step 2: Create Virtual Environment

```bash
python3.12 -m venv venv
```

**Note**: If `python3.12` doesn't work, use `python3` or `python` but ensure you're using Python 3.12.8. Verify with:
```bash
python --version
# Should output: Python 3.12.8
```

### Step 3: Activate Virtual Environment

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- Flask==3.0.3
- Flask-Cors==4.0.1
- hume==0.6.0

### Step 5: Configure Hume API Key

Edit `flask/app.py` and update the `HUME_API_KEY` variable with your Hume API key:
```python
HUME_API_KEY = "your-hume-api-key-here"
```

### Step 6: Run Flask Service

```bash
python app.py
```

The Flask service will run on **http://127.0.0.1:8000**

**Keep this terminal window open!**

---

## 2. Server Setup (Node.js Backend)

The server handles API requests, user authentication, and database operations.

### Step 1: Navigate to Server Directory

```bash
cd server
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install the exact versions specified in `package.json`:
- axios: ^1.7.2
- bcrypt: ^5.1.1
- cookie-parser: ^1.4.6
- cors: ^2.8.5
- dotenv: ^16.4.5
- express: ^4.19.2
- jsonwebtoken: ^9.0.2
- mongoose: ^8.4.0
- nodemailer: ^6.9.13
- nodemon: ^3.1.0

### Step 3: Create Environment File

Create a `.env` file in the `server/` directory:

```bash
touch .env
```

Add the following environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_KEY=your_jwt_secret_key_here
PORT=5000
```

**Example MongoDB URI:**
- Local: `mongodb://localhost:27017/audio-analysis`
- Atlas: `mongodb+srv://username:password@cluster.mongodb.net/audio-analysis`

**JWT_KEY:** Use a strong random string for JWT token signing (e.g., generate with `openssl rand -base64 32`)

### Step 4: Configure Email Service (Optional)

If you want email functionality, update `server/utilis/emailService.js` with your Gmail credentials or configure a different email service.

### Step 5: Run Server

```bash
npm start
```

Or if you prefer to run without nodemon:

```bash
node index.js
```

The server will run on **http://localhost:5000**

**Keep this terminal window open!**

---

## 3. Client Setup (Next.js Frontend)

The client is the React/Next.js frontend application.

### Step 1: Navigate to Client Directory

```bash
cd client
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install the exact versions specified in `package.json`:
- @ant-design/icons: ^5.3.7
- antd: ^5.17.3
- axios: ^1.7.2
- chart.js: ^4.4.7
- framer-motion: ^11.2.6
- next: 14.2.3
- next-transpile-modules: ^10.0.1
- react: ^18
- react-apexcharts: ^1.4.1
- react-chartjs-2: ^5.3.0
- react-dom: ^18
- react-dropzone: ^14.2.3
- react-icons: ^5.2.1
- react-router-dom: ^6.23.1
- recharts: ^2.15.0
- victory: ^37.0.2

### Step 3: Verify API Configuration

Check `client/api/axiosClient.js` to ensure the base URL points to your server:
```javascript
baseURL: "http://localhost:5000/api/"
```

### Step 4: Run Development Server

```bash
npm run dev
```

The client will run on **http://localhost:3000**

**Keep this terminal window open!**

---

## Running All Services

You need to run all three services simultaneously. Here's the recommended order:

### Terminal 1: Flask Service
```bash
cd flask
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```
✅ Flask running on http://127.0.0.1:8000

### Terminal 2: Node.js Server
```bash
cd server
npm start
```
✅ Server running on http://localhost:5000

### Terminal 3: Next.js Client
```bash
cd client
npm run dev
```
✅ Client running on http://localhost:3000

---

## Accessing the Application

1. Open your browser and navigate to: **http://localhost:3000**
2. You should see the home page
3. Sign up for a new account or log in
4. Start analyzing audio files!

---

## Important Notes

### Python Version
- ⚠️ **CRITICAL**: This project requires **Python 3.12.8** specifically
- Verify your Python version: `python --version`
- If you have multiple Python versions, use `python3.12` explicitly

### Port Configuration
- **Flask**: Port 8000 (hardcoded in `app.py`)
- **Server**: Port 5000 (default, can be changed via `.env`)
- **Client**: Port 3000 (Next.js default)

### API Endpoints
- Flask API: `http://127.0.0.1:8000/upload`
- Server API: `http://localhost:5000/api/`
- Client: `http://localhost:3000`

### Dependencies
- All dependencies use the exact versions specified in `package.json` and `requirements.txt`
- Do not upgrade packages unless necessary, as it may cause compatibility issues

---

## Troubleshooting

### Flask Issues
- **Module not found**: Ensure virtual environment is activated
- **Port already in use**: Change port in `app.py` or kill the process using port 8000
- **Hume API error**: Verify your API key is correct

### Server Issues
- **MongoDB connection error**: Check your `MONGODB_URI` in `.env` file
- **Port already in use**: Change `PORT` in `.env` or kill the process using port 5000
- **JWT error**: Ensure `JWT_KEY` is set in `.env`

### Client Issues
- **API connection error**: Ensure server is running on port 5000
- **Build errors**: Delete `node_modules` and `.next` folder, then run `npm install` again
- **Ant Design errors**: Ensure `next-transpile-modules` is properly configured

### General Issues
- **CORS errors**: Check CORS configuration in `server/index.js`
- **Dependencies mismatch**: Delete `node_modules` and `package-lock.json`, then reinstall
- **Python version mismatch**: Use `python3.12` explicitly or set up a version manager like `pyenv`

---

## Development Workflow

1. Start Flask service first (Terminal 1)
2. Start Node.js server (Terminal 2)
3. Start Next.js client (Terminal 3)
4. Make changes to code
5. Services will auto-reload (nodemon for server, Next.js hot reload for client)
6. Flask requires manual restart if you change `app.py`

---

## Production Deployment

For production deployment:

1. **Flask**: Use a production WSGI server like Gunicorn
2. **Server**: Set `NODE_ENV=production` and use PM2 or similar
3. **Client**: Run `npm run build` then `npm start`

---

## Support

If you encounter any issues:
1. Check all services are running
2. Verify environment variables are set correctly
3. Check console logs for error messages
4. Verify Python version is 3.12.8
5. Ensure all dependencies are installed with correct versions

---

## License

This project is part of the Audio Call Analysis System.

