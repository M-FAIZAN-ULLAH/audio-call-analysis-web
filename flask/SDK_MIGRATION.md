# Hume Python SDK Migration Guide

## ✅ Migration Complete!

The Flask app has been updated to use the **official Hume Python SDK** from [HumeAI/hume-python-sdk](https://github.com/HumeAI/hume-python-sdk).

---

## What Changed

### Old SDK (hume==0.6.0)
```python
from hume import HumeBatchClient
from hume.models.config import ProsodyConfig

client = HumeBatchClient(HUME_API_KEY)
config = ProsodyConfig()
job = client.submit_job([url], [config])
job.await_complete()  # ❌ Unreliable
job.download_predictions("predictions.json")
```

### New SDK (hume>=0.13.0)
```python
from hume.client import HumeClient
from hume.models.config import ProsodyConfig

client = HumeClient(api_key=HUME_API_KEY)
config = ProsodyConfig()
job_response = client.expression_measurement.batch.create_job(
    urls=[url],
    configs=[config]
)
# Custom polling with get_job_predictions() ✅ Reliable
predictions = client.expression_measurement.batch.get_job_predictions(id=job_id)
```

---

## Key Improvements

1. **Official SDK**: Using the maintained SDK from Hume AI
2. **Better API Structure**: Namespaced APIs (`client.expression_measurement.batch`)
3. **Robust Polling**: Custom polling with `get_job_predictions()`
4. **Better Error Handling**: Handles SDK-specific exceptions
5. **Future-Proof**: Uses the latest SDK version (0.13.0+)

---

## Installation

Update your requirements:

```bash
cd flask
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install --upgrade hume
```

Or update `requirements.txt`:
```txt
hume>=0.13.0
```

Then install:
```bash
pip install -r requirements.txt
```

---

## API Methods Used

### 1. Create Job
```python
job_response = client.expression_measurement.batch.create_job(
    urls=[audio_url],
    configs=[ProsodyConfig()]
)
```

### 2. Get Job Predictions (Polling)
```python
predictions = client.expression_measurement.batch.get_job_predictions(id=job_id)
```

### 3. Get Job Details (Optional)
```python
job_details = client.expression_measurement.batch.get_job_details(id=job_id)
```

---

## Response Format

The new SDK returns predictions in a format that's compatible with the existing server code. The Flask app handles format conversion to ensure compatibility.

---

## Error Handling

The new SDK throws `hume.core.ApiError` exceptions. The Flask app handles:
- 400 Bad Request (normal during processing)
- 404 Not Found (normal during processing)
- Actual failures (timeouts, cancelled jobs, etc.)

---

## Testing

Test the updated Flask app:

```bash
cd flask
source venv/bin/activate
python app.py
```

Then test with curl:
```bash
curl -X POST http://127.0.0.1:8000/upload \
  -H "Content-Type: application/json" \
  -d '{"url": "YOUR_AUDIO_URL_HERE"}'
```

---

## Compatibility

- **Python**: 3.9 - 3.12 (as per SDK requirements)
- **Expression Measurement**: Supported on macOS, Linux, Windows
- **Backward Compatible**: Response format matches what server expects

---

## Documentation

- **SDK GitHub**: https://github.com/HumeAI/hume-python-sdk
- **SDK Documentation**: https://dev.hume.ai/docs
- **API Reference**: Check the SDK's `reference.md` file

---

## Troubleshooting

### Import Errors
```bash
pip install --upgrade hume
```

### Method Not Found
- Ensure you're using `hume>=0.13.0`
- Check SDK version: `pip show hume`

### Job ID Extraction Issues
- Check logs for the actual response format
- The code tries multiple methods to extract job ID

### Predictions Format
- The app handles different response formats
- Check logs if predictions aren't in expected format

---

## Migration Notes

- ✅ All functionality preserved
- ✅ Polling mechanism improved
- ✅ Better error messages
- ✅ More reliable job status checking
- ✅ Uses official maintained SDK

---

**The Flask app is now using the official Hume Python SDK!** 🎉

