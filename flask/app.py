# Import necessary packages
from flask import Flask, request, jsonify
from flask_cors import CORS
from hume import HumeBatchClient
from hume.models.config import ProsodyConfig
import json
import logging
from datetime import datetime
import os
import time
import re

# Create a Flask application
app = Flask(__name__)

# Apply CORS to allow cross-origin requests
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Use API key from environment or fallback
HUME_API_KEY = os.getenv('HUME_API_KEY', 'CirCEvEsqm8cRAAHhyMcJGub6elwD7JtPLYHAWgqDkrFJHsA')


def poll_job_status(client, job_id, max_wait_time=1800, poll_interval=10):
    """
    Poll job status until completion or timeout.
    Uses download_predictions as the most reliable way to check completion.
    Enhanced with test.py logic for better reliability.
    """
    start_time = time.time()
    attempt = 0
    temp_file = f"temp_predictions_{job_id}.json"
    
    logging.info(f"[AUDIO PROCESSING] Starting to poll job status - Job ID: {job_id}, Max wait: {max_wait_time}s")
    
    while time.time() - start_time < max_wait_time:
        try:
            attempt += 1
            elapsed = int(time.time() - start_time)
            logging.info(f"[AUDIO PROCESSING] Polling attempt {attempt} for Job ID: {job_id} (elapsed: {elapsed}s)")
            
            # Get job reference
            job = client.get_job(job_id)
            
            # The most reliable way to check if job is complete is to try downloading predictions
            # If download succeeds, job is complete. If it fails, job is still processing.
            try:
                job.download_predictions(temp_file)
                
                # Verify the file actually contains valid predictions (not an error message)
                if os.path.exists(temp_file):
                    with open(temp_file, 'r') as f:
                        content = f.read().strip()
                        
                        # Check if it's an error message
                        if content.startswith('{') and '"message"' in content:
                            try:
                                error_data = json.loads(content)
                                if 'message' in error_data:
                                    error_msg = error_data.get('message', '').lower()
                                    
                                    if 'in progress' in error_msg or 'processing' in error_msg:
                                        logging.info(f"[AUDIO PROCESSING] Job {job_id} still processing (got: {error_data.get('message')})... (attempt {attempt})")
                                        os.remove(temp_file)  # Clean up error file
                                        time.sleep(poll_interval)
                                        continue
                                    else:
                                        raise Exception(f"Job error: {error_data.get('message')}")
                            except json.JSONDecodeError:
                                pass  # Not JSON, might be valid predictions
                
                # If we get here and file exists with valid content, job is complete!
                if os.path.exists(temp_file):
                    file_size = os.path.getsize(temp_file)
                    if file_size > 100:  # Reasonable size for predictions
                        elapsed_total = int(time.time() - start_time)
                        logging.info(f"[AUDIO PROCESSING] Job {job_id} is complete! Downloaded predictions successfully.")
                        
                        # Clean up temp file
                        os.remove(temp_file)
                        return job
                
                # File doesn't exist or too small, continue polling
                logging.info(f"[AUDIO PROCESSING] Job {job_id} still processing... (attempt {attempt})")
                time.sleep(poll_interval)
                continue
                
            except Exception as download_error:
                error_msg = str(download_error).lower()
                error_str_full = str(download_error)
                
                # Check if it's a "not ready" error (job still processing)
                if any(keyword in error_msg for keyword in ["not ready", "in progress", "processing", "queued", "pending", "400"]):
                    # Check if it's specifically a 400 with "in progress" message
                    if "400" in error_str_full or "bad request" in error_msg:
                        logging.info(f"[AUDIO PROCESSING] Job {job_id} still processing (400 Bad Request - Job in progress)... (attempt {attempt})")
                    else:
                        logging.info(f"[AUDIO PROCESSING] Job {job_id} still processing... (attempt {attempt})")
                    time.sleep(poll_interval)
                    continue
                elif any(keyword in error_msg for keyword in ["failed", "error", "cancelled"]) and "in progress" not in error_msg:
                    # Job failed (but not because it's in progress)
                    raise Exception(f"Job {job_id} failed: {error_str_full}")
                else:
                    # Unknown error, but might still be processing
                    logging.warning(f"[AUDIO PROCESSING] Download attempt failed (job may still be processing): {error_str_full[:150]}")
                    time.sleep(poll_interval)
                    continue
            
        except Exception as e:
            error_msg = str(e)
            
            # Check if it's a fatal error
            if "failed" in error_msg.lower() or "error" in error_msg.lower():
                if "still processing" not in error_msg.lower():
                    logging.error(f"[AUDIO PROCESSING] Job {job_id} error: {error_msg}")
                    raise
            
            # For other errors, log and continue polling
            if "not found" not in error_msg.lower():
                logging.warning(f"[AUDIO PROCESSING] Error polling job {job_id}: {error_msg}")
            
            time.sleep(poll_interval)
    
    # Clean up temp file if it exists
    if os.path.exists(temp_file):
        try:
            os.remove(temp_file)
        except:
            pass
    
    logging.error(f"[AUDIO PROCESSING] Job {job_id} did not complete within {max_wait_time} seconds")
    return None


def process_mp3(file_path):
    """
    Process audio file using Hume Batch API with ProsodyConfig.
    Enhanced with test.py logic for better reliability.
    Returns standardized format for consistent results.
    """
    try:
        logging.info(f"[AUDIO PROCESSING] Starting audio analysis - URL: {file_path}")
        
        # Initialize the Hume client with API key
        try:
            client = HumeBatchClient(HUME_API_KEY)
        except Exception as client_error:
            raise Exception(f"Failed to initialize Hume client: {str(client_error)}")

        # Define the Hume config for processing audio files (MP3, MP4, WAV, etc.)
        config = ProsodyConfig()

        # Submit the audio file to Hume for processing
        urls = [file_path]  # Provide the file path as a URL
        job = client.submit_job(urls, [config])

        # Get job ID safely - try multiple methods (BatchJob may have different attributes)
        job_id = None
        
        # Method 1: Try direct attributes
        for attr in ['id', 'job_id', '_id', 'jobId', 'job_id_']:
            if hasattr(job, attr):
                try:
                    job_id = getattr(job, attr)
                    if job_id:
                        break
                except:
                    pass
        
        # Method 2: Try to get from job's internal attributes
        if not job_id:
            try:
                if hasattr(job, '__dict__'):
                    for key, value in job.__dict__.items():
                        if 'id' in key.lower() and value and isinstance(value, str):
                            job_id = value
                            break
            except:
                pass
        
        # Method 3: Extract from string representation as last resort
        if not job_id:
            job_str = str(job)
            job_id_match = re.search(r'[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}', job_str)
            if job_id_match:
                job_id = job_id_match.group(0)
        
        if job_id:
            logging.info(f"[AUDIO PROCESSING] Job submitted - Job ID: {job_id}, Waiting for completion...")
        else:
            logging.info(f"[AUDIO PROCESSING] Job submitted, Waiting for completion...")
        
        # Skip await_complete() and use polling directly for better reliability
        # await_complete() has internal retry issues, so we use our own polling mechanism
        if job_id:
            logging.info(f"[AUDIO PROCESSING] Starting polling mode for Job ID: {job_id}")
            job = poll_job_status(client, job_id, max_wait_time=1800)  # Wait up to 30 minutes total
            if job:
                logging.info(f"[AUDIO PROCESSING] Job completed successfully after polling")
            else:
                raise Exception(f"Job {job_id} did not complete within the maximum wait time (30 minutes)")
        else:
            # Fallback: try await_complete with short timeout, then extract job ID from error
            logging.info(f"[AUDIO PROCESSING] No job ID found, trying await_complete() with 60s timeout...")
            try:
                job.await_complete(timeout=60)
                logging.info(f"[AUDIO PROCESSING] Job completed successfully")
            except Exception as timeout_error:
                error_msg = str(timeout_error)
                logging.warning(f"[AUDIO PROCESSING] await_complete() timeout. Error: {error_msg}")
                
                # Extract job ID from error message
                if not job_id:
                    job_id_match = re.search(r"client\.get_job\('([^']+)'\)", error_msg)
                    if job_id_match:
                        job_id = job_id_match.group(1)
                        logging.info(f"[AUDIO PROCESSING] Extracted Job ID from error message: {job_id}")
                
                # If we have a job ID now, poll for status
                if job_id:
                    logging.info(f"[AUDIO PROCESSING] Switching to polling mode for Job ID: {job_id}")
                    job = poll_job_status(client, job_id, max_wait_time=1800)
                    if job:
                        logging.info(f"[AUDIO PROCESSING] Job completed successfully after polling")
                    else:
                        raise Exception(f"Job {job_id} did not complete within the maximum wait time")
                else:
                    raise Exception("Could not get job ID and await_complete() failed")

        # Download the predictions
        predictions_file = "predictions.json"
        logging.info(f"[AUDIO PROCESSING] Downloading predictions to {predictions_file}...")
        job.download_predictions(predictions_file)
        logging.info(f"[AUDIO PROCESSING] Predictions downloaded successfully")

        # Read and parse predictions
        with open(predictions_file, "r") as file:
            predictions = json.load(file)

        # Clean up predictions file
        try:
            os.remove(predictions_file)
            logging.info(f"[AUDIO PROCESSING] Cleaned up temporary file: {predictions_file}")
        except Exception as cleanup_error:
            logging.warning(f"[AUDIO PROCESSING] Could not remove temp file: {cleanup_error}")

        # Return the original Hume format (array format) that Node.js expects
        # This is the format: [{"source": {...}, "results": {"predictions": [...]}}]
        # Node.js formatData function handles this format correctly
        logging.info(f"[AUDIO PROCESSING] Successfully processed audio - URL: {file_path}")
        logging.info(f"[AUDIO PROCESSING] Predictions type: {type(predictions)}, Length: {len(predictions) if isinstance(predictions, (list, dict)) else 'N/A'}")
        
        # Validate predictions structure (from test.py logic)
        if isinstance(predictions, list) and len(predictions) > 0:
            result = predictions[0]
            if 'results' in result and 'predictions' in result['results']:
                logging.info(f"[AUDIO PROCESSING] Predictions structure validated - contains results and predictions")
        
        # Return predictions in original Hume format (array)
        # This matches what Node.js expects in formatData function
        # Format: [{"source": {...}, "results": {"predictions": [...]}}]
        if isinstance(predictions, list):
            logging.info(f"[AUDIO PROCESSING] Returning predictions as list with {len(predictions)} items")
            return predictions
        elif isinstance(predictions, dict):
            # If it's a dict, wrap it in an array to match expected format
            logging.info(f"[AUDIO PROCESSING] Wrapping dict predictions in array")
            return [predictions]
        else:
            logging.warning(f"[AUDIO PROCESSING] Unexpected predictions type: {type(predictions)}")
            # Return as-is, but log warning
            return predictions

    except Exception as e:
        error_msg = str(e)
        logging.error(f"[AUDIO PROCESSING] Error processing file: {error_msg} - URL: {file_path}")
        
        return {
            'success': False,
            'error': error_msg,
            'message': f'Error processing file: {error_msg}',
            'results': None
        }


@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Process audio file endpoint.
    Expects JSON with 'url' field containing audio file URL.
    Returns standardized format with predictions, emotions, and text.
    """
    try:
        # Validate request
        if not request.json or 'url' not in request.json:
            logging.warning(f"[API] POST /upload - Invalid request - Missing 'url' field")
            return jsonify({
                'success': False,
                'error': 'Missing required field: url',
                'message': 'Please provide a valid audio file URL in the request body',
                'results': None
            }), 400

        url = request.json.get('url', '').strip()
        
        if not url:
            logging.warning(f"[API] POST /upload - Invalid request - Empty URL")
            return jsonify({
                'success': False,
                'error': 'Empty URL provided',
                'message': 'URL cannot be empty',
                'results': None
            }), 400

        logging.info(f"[API] POST /upload - Process Audio File - URL: {url}")
        
        # Process the audio file
        result = process_mp3(str(url))

        # Check if result is an error response
        if isinstance(result, dict) and result.get('success') is False:
            # Error occurred, return error format
            logging.error(f"[API] POST /upload - Error: {result.get('error')}")
            return jsonify(result), 500

        # Return the original Hume format (array) that Node.js expects
        # Node.js formatData function will process this correctly
        # Format: [{"source": {...}, "results": {"predictions": [...]}}]
        logging.info(f"[API] POST /upload - Success - Processed audio file")
        logging.info(f"[API] POST /upload - Response type: {type(result)}, Size: {len(str(result))} chars")
        
        # Ensure we return JSON
        response = jsonify(result)
        logging.info(f"[API] POST /upload - Sending response to client...")
        return response

    except Exception as e:
        logging.error(f"[API] POST /upload - Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': f'Error processing audio file: {str(e)}',
            'results': None
        }), 500


@app.route('/')
def hello():
    """
    Health check endpoint.
    Returns server status and API information.
    """
    logging.info("[API] GET / - Health Check")
    return jsonify({
        'success': True,
        'message': 'Flask Audio Analysis Server is running',
        'version': '2.0.0',
        'api_key_configured': bool(HUME_API_KEY),
        'api_key_prefix': HUME_API_KEY[:10] if HUME_API_KEY else None,
        'endpoints': {
            'health': '/',
            'test': '/test (POST) - Test Hume API',
            'custom': '/custom',
            'upload': '/upload (POST)'
        }
    })


@app.route('/custom')
def custom():
    """
    Custom endpoint for testing.
    Returns standardized response format.
    """
    logging.info("[API] GET /custom - Custom Endpoint")
    return jsonify({
        'success': True,
        'message': 'This is a custom endpoint!',
        'data': {
            'timestamp': datetime.now().isoformat(),
            'status': 'active'
        }
    })


@app.route('/test', methods=['POST'])
def test_hume():
    """
    Test endpoint that uses test.py logic to verify Hume API works.
    Accepts optional 'url' in JSON body, or uses default test URL.
    """
    try:
        # Get test URL from request or use default
        test_url = None
        if request.json and 'url' in request.json:
            test_url = request.json.get('url', '').strip()
        
        if not test_url:
            test_url = "http://res.cloudinary.com/dczyj0axu/video/upload/v1766430541/Fiver/pmqgdztaobs7lyecpfs7.mp3"
        
        logging.info(f"[TEST] Starting Hume API test with URL: {test_url}")
        logging.info(f"[TEST] API Key: {HUME_API_KEY[:10]}...")
        
        # Use the same process_mp3 function
        result = process_mp3(test_url)
        
        # Check if result is an error
        if isinstance(result, dict) and result.get('success') is False:
            return jsonify({
                'success': False,
                'test_status': 'FAILED',
                'error': result.get('error'),
                'message': result.get('message'),
                'url_tested': test_url
            }), 500
        
        # Validate predictions structure (from test.py)
        validation_result = {
            'success': True,
            'test_status': 'PASSED',
            'url_tested': test_url,
            'predictions_received': True,
            'predictions_type': type(result).__name__,
            'summary': {}
        }
        
        if isinstance(result, list) and len(result) > 0:
            first_result = result[0]
            if 'results' in first_result and 'predictions' in first_result['results']:
                predictions = first_result['results']['predictions']
                if len(predictions) > 0:
                    prediction = predictions[0]
                    if 'models' in prediction and 'prosody' in prediction['models']:
                        prosody = prediction['models']['prosody']
                        if 'grouped_predictions' in prosody and len(prosody['grouped_predictions']) > 0:
                            grouped = prosody['grouped_predictions'][0]
                            if 'predictions' in grouped:
                                validation_result['summary'] = {
                                    'prediction_segments': len(grouped['predictions']),
                                    'emotions_detected': sum(len(p.get('emotions', [])) for p in grouped['predictions']),
                                    'text_segments': sum(1 for p in grouped['predictions'] if p.get('text'))
                                }
        
        logging.info(f"[TEST] Test completed successfully!")
        return jsonify(validation_result)
        
    except Exception as e:
        error_msg = str(e)
        logging.error(f"[TEST] Test failed with error: {error_msg}")
        return jsonify({
            'success': False,
            'test_status': 'FAILED',
            'error': error_msg,
            'message': f'Test failed: {error_msg}'
        }), 500


# Error handlers for consistent error responses
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors with consistent format"""
    return jsonify({
        'success': False,
        'error': 'Not Found',
        'message': 'The requested endpoint was not found',
        'results': None
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors with consistent format"""
    import traceback
    error_trace = traceback.format_exc()
    logging.error(f"[FLASK] 500 Error: {error_trace}")
    return jsonify({
        'success': False,
        'error': 'Internal Server Error',
        'message': 'An internal server error occurred',
        'results': None
    }), 500

@app.errorhandler(400)
def bad_request(error):
    """Handle 400 errors with consistent format"""
    return jsonify({
        'success': False,
        'error': 'Bad Request',
        'message': str(error.description) if hasattr(error, 'description') else 'Invalid request',
        'results': None
    }), 400

# Start the server on port 8000
if __name__ == '__main__':
    logging.info("[FLASK SERVER] Starting Flask server on port 8000")
    logging.info(f"[FLASK SERVER] Using Hume API Key: {HUME_API_KEY[:10]}...")
    logging.info("[FLASK SERVER] Server ready to process audio files")
    app.run(port=8000, debug=False)
