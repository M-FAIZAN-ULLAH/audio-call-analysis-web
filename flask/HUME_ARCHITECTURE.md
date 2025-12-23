# Hume API Integration Architecture

## Overview

This document explains how the Hume API is integrated into the Audio Call Analysis System and how all components work together.

---

## System Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │─────▶│   Server    │─────▶│    Flask    │─────▶│  Hume API   │
│  (Next.js)  │      │  (Node.js)  │      │  (Python)   │      │  (Cloud)    │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
     Port 3000          Port 5000          Port 8000
```

---

## How Hume API Works

### 1. **Hume Batch API Overview**

Hume API is a cloud-based service that analyzes audio files for:
- **Emotions** (prosody analysis)
- **Speech-to-text** transcription
- **Sentiment analysis**
- **Voice characteristics**

### 2. **Hume Processing Flow**

```
1. Submit Job
   └─> Client submits audio URL to Hume
   └─> Hume returns a Job ID
   └─> Job is queued for processing

2. Polling Phase
   └─> Job status: QUEUED → PROCESSING → COMPLETED
   └─> API returns 400 Bad Request while processing (this is NORMAL!)
   └─> Must poll repeatedly until predictions are ready

3. Download Results
   └─> Once complete, download predictions JSON
   └─> Contains emotions, text, timestamps, scores
```

### 3. **Key Characteristics**

- **Asynchronous**: Jobs take 2-5 minutes typically
- **400 Errors are Normal**: Hume returns 400 while job is processing
- **Polling Required**: Cannot use simple `await_complete()` - needs custom polling
- **Predictions Format**: Complex nested JSON structure

---

## Component Breakdown

### **Client (Next.js - Port 3000)**

**Location**: `client/`

**Responsibilities**:
- Upload audio files to Cloudinary
- Display analysis results
- Handle user interactions

**Key Files**:
- `components/Dashboard/Content/UploadAudio.js` - Single file upload
- `components/Dashboard/Content/Bulk/BulkAnalysis.js` - Bulk analysis
- `api/api.js` - API client

**Flow**:
1. User uploads audio → Cloudinary
2. Gets Cloudinary URL
3. Calls `/api/analysis` with URL
4. Receives formatted results
5. Displays emotions, text, charts

---

### **Server (Node.js/Express - Port 5000)**

**Location**: `server/`

**Responsibilities**:
- API routing and authentication
- Database operations (MongoDB)
- Calling Flask service
- Formatting responses for client

**Key Files**:
- `controller/analysisController.js` - Single file analysis
- `controller/bulkController.js` - Bulk analysis
- `routes/analysisRoutes.js` - API routes

**Flow**:
1. Receives request from client with audio URL
2. Calls Flask service: `POST http://127.0.0.1:8000/upload`
3. Waits for Flask response (this can take 2-5 minutes!)
4. Formats Hume response for client
5. Returns formatted data

**Important**: Server processes bulk files **sequentially** (one at a time) to avoid overwhelming Flask/Hume.

---

### **Flask (Python - Port 8000)**

**Location**: `flask/`

**Responsibilities**:
- Interface with Hume API
- Handle async job polling
- Process audio files
- Return raw Hume predictions

**Key Files**:
- `app.py` - Main Flask application
- `test.py` - Test script with robust polling

**Flow**:
1. Receives audio URL from server
2. Initializes Hume client with API key
3. Submits job to Hume API
4. **Polls job status** (critical step!)
   - Checks every 10 seconds
   - Handles 400 errors (normal during processing)
   - Waits up to 30 minutes
5. Downloads predictions when ready
6. Returns predictions JSON to server

**Why Flask was "sucking"**:
- Old code used `job.await_complete()` which hangs/timeouts
- No proper error handling
- No polling mechanism
- Didn't handle Hume's async nature

**Fixed Implementation**:
- ✅ Custom polling with `poll_job_status()`
- ✅ Handles 400 errors gracefully
- ✅ Proper timeout handling (30 min max)
- ✅ Better error messages
- ✅ Logging for debugging

---

## Data Flow Example

### Single File Analysis

```
1. User uploads audio.mp3
   └─> Client uploads to Cloudinary
   └─> Gets URL: https://res.cloudinary.com/.../audio.mp3

2. Client → Server
   POST /api/analysis
   { "url": "https://res.cloudinary.com/.../audio.mp3" }

3. Server → Flask
   POST http://127.0.0.1:8000/upload
   { "url": "https://res.cloudinary.com/.../audio.mp3" }

4. Flask → Hume API
   - Submit job with URL
   - Get job ID: abc-123-def-456
   - Poll every 10s for 2-5 minutes
   - Download predictions when ready

5. Flask → Server
   Returns raw Hume predictions JSON:
   [
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
                         "time": { "begin": 0, "end": 5 },
                         "emotions": [
                           { "name": "Anger", "score": 0.85 },
                           { "name": "Distress", "score": 0.72 }
                         ],
                         "text": "Hello, how are you?"
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
   ]

6. Server → Client
   Formats and filters emotions:
   [
     {
       "time": { "begin": 0, "end": 5 },
       "emotions": [
         { "name": "Anger", "score": 0.85 },
         { "name": "Distress", "score": 0.72 }
       ],
       "text": "Hello, how are you?"
     }
   ]

7. Client displays results
   - Shows emotions on timeline
   - Displays transcribed text
   - Shows emotion charts
```

---

## Hume API Response Structure

### Raw Response Format

```json
[
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
                      "time": {
                        "begin": 0,
                        "end": 5.2
                      },
                      "emotions": [
                        {
                          "name": "Anger",
                          "score": 0.85
                        },
                        {
                          "name": "Distress",
                          "score": 0.72
                        }
                      ],
                      "text": "Hello, how are you today?"
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
]
```

### Key Paths

- **Emotions**: `[0].results.predictions[0].models.prosody.grouped_predictions[0].predictions[].emotions[]`
- **Text**: `[0].results.predictions[0].models.prosody.grouped_predictions[0].predictions[].text`
- **Time**: `[0].results.predictions[0].models.prosody.grouped_predictions[0].predictions[].time`

---

## Common Issues & Solutions

### Issue 1: Flask Hangs/Timeouts

**Problem**: `job.await_complete()` hangs forever

**Solution**: Use custom polling with `poll_job_status()`
- Polls every 10 seconds
- Handles 400 errors (normal during processing)
- Has 30-minute timeout

### Issue 2: 400 Bad Request Errors

**Problem**: Getting 400 errors from Hume API

**Solution**: This is **NORMAL**! Hume returns 400 while job is processing.
- Don't treat 400 as error during polling
- Only error if job status is "FAILED" or timeout

### Issue 3: Job Never Completes

**Problem**: Job seems stuck

**Solution**: 
- Check job ID is valid
- Verify API key is correct
- Check audio URL is accessible
- Increase timeout (default: 30 minutes)

### Issue 4: Slow Processing

**Problem**: Takes too long

**Solution**: This is expected!
- Hume API typically takes 2-5 minutes per file
- For bulk analysis, files process sequentially
- 10 files = ~20-50 minutes total

---

## Testing the Flask Service

### Test Script

Run the test script to verify Hume integration:

```bash
cd flask
source venv/bin/activate
python test.py
```

This will:
1. Submit a test audio file
2. Poll for completion
3. Download and display results
4. Show summary statistics

### Manual Testing

```bash
# Start Flask
cd flask
source venv/bin/activate
python app.py

# In another terminal, test the endpoint
curl -X POST http://127.0.0.1:8000/upload \
  -H "Content-Type: application/json" \
  -d '{"url": "YOUR_AUDIO_URL_HERE"}'
```

---

## Environment Setup

### Flask Requirements

```txt
Flask==3.1.2
Flask-Cors==5.0.0
hume==0.6.0
Werkzeug==3.1.2
ItsDangerous==2.2.0
Blinker==1.9.0
```

### Python Version

**Critical**: Use Python 3.12.8

```bash
python3.12 --version  # Should show 3.12.8
```

### Hume API Key

Set in `flask/app.py`:
```python
HUME_API_KEY = "your-api-key-here"
```

---

## Performance Considerations

### Single File
- **Time**: 2-5 minutes
- **API Calls**: ~20-30 polling requests
- **Network**: Minimal (just polling)

### Bulk Analysis (10 files)
- **Time**: 20-50 minutes (sequential)
- **API Calls**: ~200-300 polling requests
- **Network**: Moderate

### Optimization Tips
1. **Parallel Processing**: Could process multiple files in parallel (but be careful with rate limits)
2. **Caching**: Cache results to avoid re-processing
3. **Queue System**: Use a proper job queue (Redis, RabbitMQ) for production

---

## Monitoring & Debugging

### Flask Logs

The Flask app now includes detailed logging:
- Job submission
- Polling attempts
- Completion status
- Errors

### Check Logs

```bash
# Flask logs will show:
[2024-01-01 12:00:00] INFO - Starting audio processing for URL: ...
[2024-01-01 12:00:01] INFO - Job submitted successfully! Job ID: abc-123
[2024-01-01 12:00:11] INFO - Polling attempt 1 - Elapsed: 10s
[2024-01-01 12:02:30] INFO - ✅ Job completed in 150 seconds
```

### Common Log Messages

- `"Job still processing (400 Bad Request is expected)"` - **Normal**, job is queued
- `"Job completed successfully!"` - **Success**, predictions ready
- `"TIMEOUT: Job did not complete"` - **Error**, job took too long

---

## Summary

### What Was Fixed

1. ✅ **Robust Polling**: Custom `poll_job_status()` function
2. ✅ **Error Handling**: Proper handling of 400 errors (normal during processing)
3. ✅ **Timeout Management**: 30-minute max wait time
4. ✅ **Logging**: Detailed logs for debugging
5. ✅ **Response Format**: Standardized error responses

### How It Works Now

1. Flask receives audio URL
2. Submits to Hume API
3. Polls every 10 seconds
4. Handles 400 errors gracefully
5. Downloads predictions when ready
6. Returns results to server

### Key Takeaways

- **Hume API is async** - jobs take 2-5 minutes
- **400 errors are normal** - don't treat as failures during polling
- **Polling is required** - `await_complete()` is unreliable
- **Sequential processing** - bulk files process one at a time
- **Proper error handling** - now implemented correctly

---

## Next Steps

1. ✅ Flask app is now fixed and should work reliably
2. Test with a real audio file
3. Monitor logs for any issues
4. Consider adding retry logic for failed jobs
5. Add job status endpoint for progress tracking

---

**The Flask app should now work properly!** 🎉

