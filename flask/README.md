# Flask - Python Audio Processing Microservice

## 📋 Overview

The Flask service is a Python microservice that handles audio file processing using the Hume AI API. It receives audio file URLs, processes them through Hume's emotion analysis API, and returns detailed emotion predictions and transcriptions.

## 🛠️ Development Aspects

### Technology Stack
- **Framework**: Flask 3.0.3
- **CORS**: Flask-Cors 4.0.1
- **AI Service**: Hume SDK 0.6.0
- **Python Version**: 3.12.8 (required)
- **HTTP Client**: httpx (via Hume SDK)

### Key Features
- Audio file processing via Hume API
- Emotion analysis (Prosody model)
- Batch processing support
- CORS enabled for cross-origin requests
- Error handling and validation
- JSON response formatting

## 📁 File Hierarchy Structure

```
flask/
├── app.py                       # Main Flask application
├── requirements.txt             # Python dependencies
├── predictions.json             # Temporary prediction storage
├── venv/                        # Python virtual environment
│   ├── bin/                     # Executables (activate, python, etc.)
│   ├── lib/                     # Installed packages
│   └── pyvenv.cfg               # Virtual environment config
└── guide.txt                    # Additional documentation
```

### Key Files Explained

#### `app.py`
- Main Flask application file
- Contains all routes and processing logic
- Handles audio file processing via Hume API
- Returns formatted JSON responses

#### `requirements.txt`
- Lists all Python package dependencies
- Used for virtual environment setup
- Ensures version compatibility

#### `venv/`
- Python virtual environment
- Isolates project dependencies
- Contains Python 3.12.8 interpreter

## 🔗 How This Project Connects to Others

### Connection to Server (Node.js/Express)
- **Port**: 8000 (default Flask port)
- **Endpoint**: `POST /upload`
- **Request Format**:
  ```json
  {
    "url": "https://example.com/audio.mp3"
  }
  ```
- **Response Format**:
  ```json
  {
    "predictions": [...],
    "status": "success"
  }
  ```

### Connection to Hume AI API
- **Service**: Hume Batch API
- **Model**: ProsodyConfig (emotion analysis)
- **Process**:
  1. Submit audio URL to Hume
  2. Wait for job completion
  3. Download predictions
  4. Return formatted results

### Data Flow
```
Server (Express) → Flask Service → Hume API
                      ↓
                 Process Audio
                      ↓
                 Get Predictions
                      ↓
Server (Express) ← JSON Response ← Flask Service
```

### Integration Flow
1. **Client** uploads audio file to **Server**
2. **Server** stores file and gets URL
3. **Server** sends POST request to **Flask** `/upload` with file URL
4. **Flask** submits job to **Hume API**
5. **Hume** processes audio and returns predictions
6. **Flask** formats and returns results to **Server**
7. **Server** stores results in MongoDB
8. **Client** fetches results from **Server**

## 💻 Development Basic Info

### Prerequisites
- Python 3.12.8 (specific version required)
- pip (Python package manager)
- Hume API key
- Virtual environment support

### Environment Setup
```bash
# Check Python version
python3 --version  # Should be 3.12.8

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Hume API Key
The API key is currently hardcoded in `app.py`:
```python
HUME_API_KEY = "tU7rsK37ybnJxvRF3h5uUNMwNpAnaamXBOpRQCtm1MkVuV93"
```

**Note**: For production, move this to environment variables:
```python
import os
HUME_API_KEY = os.getenv("HUME_API_KEY")
```

### Installation
```bash
# Navigate to flask directory
cd flask

# Create virtual environment (if not exists)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt
```

## 🚀 Guide to Run This Project

### Step 1: Verify Python Version
```bash
python3 --version
# Should output: Python 3.12.8
```

### Step 2: Create Virtual Environment
```bash
cd flask
python3 -m venv venv
```

### Step 3: Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### Step 4: Install Dependencies
```bash
pip install -r requirements.txt
```

This will install:
- Flask==3.0.3
- Flask-Cors==4.0.1
- hume==0.6.0

### Step 5: Verify Hume API Key
Check `app.py` and ensure the Hume API key is set:
```python
HUME_API_KEY = "tU7rsK37ybnJxvRF3h5uUNMwNpAnaamXBOpRQCtm1MkVuV93"
```

### Step 6: Start Flask Server
```bash
python app.py
```

### Step 7: Verify Server is Running
You should see output like:
```
 * Running on http://127.0.0.1:8000
```

### Step 8: Test the Endpoint
```bash
# Test upload endpoint
curl -X POST http://localhost:8000/upload \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/audio.mp3"}'
```

## 📝 API Endpoints

### POST /upload
Process an audio file via Hume API.

**Request:**
```json
{
  "url": "https://example.com/audio-file.mp3"
}
```

**Response:**
```json
{
  "predictions": [
    {
      "results": {
        "predictions": [
          {
            "models": {
              "prosody": {
                "grouped_predictions": [
                  {
                    "predictions": [
                      {
                        "emotions": [...],
                        "text": "transcription text"
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]
      }
    }
  ],
  "status": "success"
}
```

### GET /
Health check endpoint (if implemented).

## 🔧 Configuration

### CORS Settings
Currently configured to allow all origins:
```python
CORS(app)
```

For production, restrict to specific origins:
```python
CORS(app, origins=["http://localhost:3001"])
```

### Hume API Configuration
- **Model**: ProsodyConfig (emotion analysis)
- **Processing**: Batch API (async processing)
- **Output**: Predictions with emotions and transcriptions

## 🔧 Troubleshooting

### Common Issues

1. **Python Version Mismatch**
   ```bash
   # Install Python 3.12.8
   # macOS with Homebrew:
   brew install python@3.12
   
   # Verify version
   python3.12 --version
   ```

2. **Virtual Environment Not Activating**
   ```bash
   # macOS/Linux: Ensure you use 'source'
   source venv/bin/activate
   
   # Windows: Use backslashes
   venv\Scripts\activate
   ```

3. **Module Not Found Errors**
   ```bash
   # Ensure virtual environment is activated
   # Reinstall dependencies
   pip install -r requirements.txt --force-reinstall
   ```

4. **Hume API Errors**
   - Verify API key is correct
   - Check API key has sufficient credits
   - Ensure audio URL is accessible
   - Check audio file format (MP3, MP4 supported)

5. **Port Already in Use**
   ```bash
   # Find process using port 8000
   lsof -ti:8000
   
   # Kill process
   lsof -ti:8000 | xargs kill
   ```

6. **CORS Errors**
   - Verify Flask-Cors is installed
   - Check CORS configuration in `app.py`
   - Ensure server is sending correct headers

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Hume AI Documentation](https://dev.hume.ai/)
- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)

## 🎯 Development Tips

1. **Virtual Environment**: Always use venv for isolation
2. **API Key Security**: Move API keys to environment variables
3. **Error Handling**: Implement comprehensive error handling
4. **Logging**: Add logging for debugging
5. **Testing**: Test with various audio formats
6. **Performance**: Consider async processing for multiple files
7. **Validation**: Validate input URLs before processing

## 🔄 Processing Flow

1. **Receive Request**: Flask receives POST request with audio URL
2. **Initialize Client**: Create HumeBatchClient with API key
3. **Submit Job**: Submit audio URL to Hume API
4. **Wait for Completion**: `job.await_complete()` blocks until done
5. **Download Results**: Download predictions to `predictions.json`
6. **Parse Results**: Load and parse JSON predictions
7. **Return Response**: Format and return to server

## ⚠️ Important Notes

1. **API Key**: Currently hardcoded - move to environment variables for production
2. **File Storage**: `predictions.json` is temporary - consider cleanup
3. **Error Handling**: Add more specific error handling for different failure cases
4. **Rate Limiting**: Consider implementing rate limiting for API calls
5. **Logging**: Add proper logging for production deployment
6. **Security**: Implement authentication if exposing publicly

## 🚀 Production Considerations

1. **Environment Variables**: Use `.env` file for configuration
2. **Error Logging**: Implement proper logging system
3. **Health Checks**: Add health check endpoints
4. **Rate Limiting**: Implement rate limiting
5. **Monitoring**: Add application monitoring
6. **Scaling**: Consider using Gunicorn or uWSGI for production
7. **Security**: Implement API authentication

