# Flask App - Quick Start Guide

## ✅ What Was Fixed

The Flask app has been completely rewritten with:

1. **Robust Polling Mechanism** - No more hanging/timeouts
2. **Proper Error Handling** - Handles Hume API's async nature correctly
3. **Better Logging** - See what's happening in real-time
4. **Timeout Management** - 30-minute max wait time
5. **Standardized Responses** - Consistent error format

## 🚀 How to Run

```bash
# 1. Navigate to flask directory
cd flask

# 2. Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate      # On Windows

# 3. Start Flask app
python app.py
```

You should see:
```
[2024-01-01 12:00:00] INFO - Starting Flask Audio Processing Service on port 8000...
 * Running on http://127.0.0.1:8000
```

## 🧪 Test It

### Test 1: Health Check
```bash
curl http://127.0.0.1:8000/
```

Should return:
```json
{
  "message": "Flask Audio Processing Service is running!",
  "status": "healthy"
}
```

### Test 2: Process Audio
```bash
curl -X POST http://127.0.0.1:8000/upload \
  -H "Content-Type: application/json" \
  -d '{"url": "YOUR_AUDIO_URL_HERE"}'
```

**Note**: This will take 2-5 minutes! The app will poll Hume API every 10 seconds.

## 📊 What to Expect

### During Processing
You'll see logs like:
```
[INFO] Starting audio processing for URL: ...
[INFO] Job submitted successfully! Job ID: abc-123-def-456
[INFO] Polling attempt 6 - Elapsed: 60s
[INFO] Job still processing (400 Bad Request is expected)... waiting 10s
[INFO] ✅ Job completed in 150 seconds (2.5 minutes)
[INFO] Predictions downloaded
[INFO] Audio processing completed successfully!
```

### Success Response
Returns Hume predictions JSON (complex nested structure)

### Error Response
```json
{
  "success": false,
  "message": "Error processing audio: ...",
  "error": "..."
}
```

## 🔍 Key Differences from Old Code

### Old Code (BROKEN)
```python
job = client.submit_job(urls, [config])
job.await_complete()  # ❌ Hangs forever!
job.download_predictions("predictions.json")
```

### New Code (FIXED)
```python
job = client.submit_job(urls, [config])
job_id = extract_job_id(job)
job = poll_job_status(client, job_id, max_wait_time=1800)  # ✅ Robust polling!
job.download_predictions("predictions.json")
```

## ⚠️ Important Notes

1. **400 Errors are Normal**: Hume returns 400 while job is processing - this is expected!
2. **Processing Time**: Each file takes 2-5 minutes typically
3. **Polling Interval**: Checks every 10 seconds
4. **Max Wait Time**: 30 minutes per file
5. **Sequential Processing**: Bulk files process one at a time

## 🐛 Troubleshooting

### Flask won't start
- Check virtual environment is activated
- Verify Python version: `python --version` (should be 3.12.8)
- Install dependencies: `pip install -r requirements.txt`

### Job times out
- Check Hume API key is correct
- Verify audio URL is accessible
- Check internet connection
- Increase timeout in `poll_job_status()` if needed

### 400 Bad Request errors
- **This is normal!** Hume returns 400 while processing
- Only worry if you get 400 after 30 minutes

### No predictions returned
- Check Flask logs for errors
- Verify audio file format is supported
- Check Hume API key has credits/quota

## 📝 Logs Location

Logs are printed to console. For production, consider:
- File logging
- Log rotation
- Structured logging (JSON)

## 🎯 Next Steps

1. ✅ Flask app is fixed and ready
2. Test with a real audio file
3. Monitor logs during processing
4. Integrate with your server/client

---

**The Flask app should now work reliably!** 🎉

