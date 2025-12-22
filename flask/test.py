#!/usr/bin/env python3
"""
Test script for audio analysis using Hume API.
Tests the audio processing with a sample URL.
"""

import json
import logging
import os
import re
import time
from hume import HumeBatchClient
from hume.models.config import ProsodyConfig

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Audio call URL to test
TEST_AUDIO_URL = "http://res.cloudinary.com/dczyj0axu/video/upload/v1766418213/Fiver/xmoofcn9g4vhp8jcjjpj.mp3"

# Use new API key
HUME_API_KEY = os.getenv('HUME_API_KEY', 'Mzj1N5sW4Ss8RKll2q9WaGgWJ7K5rwbVUzIMRpo2Qm9ILn8E')


def poll_job_status(client, job_id, max_wait_time=1800, poll_interval=10):
    """
    Poll job status until completion or timeout.
    Uses download_predictions as the most reliable way to check completion.
    """
    start_time = time.time()
    attempt = 0
    temp_file = f"temp_predictions_{job_id}.json"
    
    print(f"\n{'='*60}")
    print(f"Starting to poll job status...")
    print(f"Job ID: {job_id}")
    print(f"Max wait time: {max_wait_time} seconds ({max_wait_time/60:.1f} minutes)")
    print(f"Poll interval: {poll_interval} seconds")
    print(f"{'='*60}\n")
    
    while time.time() - start_time < max_wait_time:
        try:
            attempt += 1
            elapsed = int(time.time() - start_time)
            print(f"[Attempt {attempt}] Polling job status... (elapsed: {elapsed}s)")
            
            # Get job reference
            job = client.get_job(job_id)
            
            # Try downloading predictions - if successful, job is complete
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
                                if 'message' in error_data and 'status' in error_data:
                                    # This is an error response, not predictions
                                    error_msg = error_data.get('message', '').lower()
                                    if 'in progress' in error_msg or 'processing' in error_msg:
                                        print(f"   ⏳ Job still processing (got: {error_data.get('message')})... waiting {poll_interval}s")
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
                        print(f"\n{'='*60}")
                        print(f"✅ SUCCESS! Job completed in {elapsed_total} seconds ({elapsed_total/60:.1f} minutes)")
                        print(f"{'='*60}\n")
                        return job
                
                # File doesn't exist or too small, continue polling
                print(f"   ⏳ Predictions not ready yet... waiting {poll_interval}s")
                time.sleep(poll_interval)
                continue
                
            except Exception as download_error:
                error_msg = str(download_error).lower()
                error_str_full = str(download_error)
                
                # Check if it's a "not ready" error (job still processing)
                if any(keyword in error_msg for keyword in ["not ready", "in progress", "processing", "queued", "pending", "400"]):
                    # Check if it's specifically a 400 with "in progress" message
                    if "400" in error_str_full or "bad request" in error_msg:
                        print(f"   ⏳ Job still processing (400 Bad Request - Job in progress)... waiting {poll_interval}s")
                    else:
                        print(f"   ⏳ Job still processing... waiting {poll_interval}s")
                    time.sleep(poll_interval)
                    continue
                elif any(keyword in error_msg for keyword in ["failed", "error", "cancelled"]) and "in progress" not in error_msg:
                    # Job failed (but not because it's in progress)
                    raise Exception(f"Job {job_id} failed: {error_str_full}")
                else:
                    # Unknown error, but might still be processing
                    print(f"   ⚠️  Download attempt failed (job may still be processing): {error_str_full[:150]}")
                    time.sleep(poll_interval)
                    continue
            
        except Exception as e:
            error_msg = str(e)
            
            # Check if it's a fatal error
            if "failed" in error_msg.lower() or "error" in error_msg.lower():
                if "still processing" not in error_msg.lower():
                    print(f"\n❌ ERROR: {error_msg}")
                    raise
            
            # For other errors, log and continue polling
            if "not found" not in error_msg.lower():
                print(f"   ⚠️  Error polling: {error_msg[:100]}")
            
            time.sleep(poll_interval)
    
    # Clean up temp file if it exists
    if os.path.exists(temp_file):
        try:
            os.remove(temp_file)
        except:
            pass
    
    elapsed_total = int(time.time() - start_time)
    print(f"\n❌ TIMEOUT: Job did not complete within {elapsed_total} seconds")
    return None


def process_audio(url):
    """
    Process audio file using Hume Batch API.
    """
    try:
        print(f"\n{'='*60}")
        print("AUDIO ANALYSIS TEST")
        print(f"{'='*60}")
        print(f"Audio URL: {url}")
        print(f"API Key: {HUME_API_KEY[:10]}...")
        print(f"{'='*60}\n")
        
        # Initialize the Hume client
        print("📡 Initializing Hume client...")
        client = HumeBatchClient(HUME_API_KEY)
        
        # Define the Hume config
        print("⚙️  Configuring ProsodyConfig...")
        config = ProsodyConfig()
        
        # Submit the audio file
        print(f"🚀 Submitting job to Hume API...")
        job = client.submit_job([url], [config])
        
        # Get job ID - try multiple methods
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
        
        # Method 2: Try to get from job's __dict__ or internal attributes
        if not job_id:
            try:
                if hasattr(job, '__dict__'):
                    for key, value in job.__dict__.items():
                        if 'id' in key.lower() and value and isinstance(value, str):
                            job_id = value
                            break
            except:
                pass
        
        # Method 3: Extract from string representation
        if not job_id:
            job_str = str(job)
            job_id_match = re.search(r'[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}', job_str)
            if job_id_match:
                job_id = job_id_match.group(0)
        
        if job_id:
            print(f"✅ Job submitted successfully!")
            print(f"   Job ID: {job_id}\n")
        else:
            print(f"✅ Job submitted successfully!\n")
            # If we don't have job_id, try to get it from the job object's string representation
            job_str = str(job)
            job_id_match = re.search(r'[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}', job_str)
            if job_id_match:
                job_id = job_id_match.group(0)
                print(f"   Extracted Job ID: {job_id}\n")
        
        # Skip await_complete() and go straight to polling
        # await_complete() has issues with retry logic, so we use our own polling
        if job_id:
            print("🔄 Starting polling mode (this is more reliable than await_complete)...")
            print("   Note: This will poll every 10 seconds until job completes\n")
            job = poll_job_status(client, job_id, max_wait_time=1800)  # Wait up to 30 minutes
            if job:
                print("✅ Job completed successfully after polling!\n")
            else:
                raise Exception(f"Job {job_id} did not complete within the maximum wait time (30 minutes)")
        else:
            # Fallback: try await_complete with a short timeout
            print("⚠️  No job ID found, trying await_complete() with 60s timeout...")
            try:
                job.await_complete(timeout=60)
                print("✅ Job completed successfully!\n")
            except Exception as e:
                error_msg = str(e)
                print(f"❌ await_complete() failed: {error_msg[:200]}")
                raise Exception("Could not get job ID and await_complete() failed. Please check the job manually.")
        
        # Download the predictions
        print("📥 Downloading predictions...")
        predictions_file = "test_predictions.json"
        job.download_predictions(predictions_file)
        print(f"✅ Predictions downloaded to: {predictions_file}\n")
        
        # Read and parse predictions
        print("📖 Reading predictions...")
        with open(predictions_file, "r") as file:
            predictions = json.load(file)
        
        # Display summary
        print(f"\n{'='*60}")
        print("ANALYSIS RESULTS SUMMARY")
        print(f"{'='*60}")
        
        # Try to extract some useful info
        if isinstance(predictions, list) and len(predictions) > 0:
            result = predictions[0]
            if 'results' in result:
                results = result['results']
                if 'predictions' in results and len(results['predictions']) > 0:
                    prediction = results['predictions'][0]
                    if 'models' in prediction and 'prosody' in prediction['models']:
                        prosody = prediction['models']['prosody']
                        if 'grouped_predictions' in prosody and len(prosody['grouped_predictions']) > 0:
                            grouped = prosody['grouped_predictions'][0]
                            if 'predictions' in grouped:
                                print(f"✅ Found {len(grouped['predictions'])} prediction segments")
                                
                                # Count emotions
                                total_emotions = 0
                                emotions_found = set()
                                for pred in grouped['predictions']:
                                    if 'emotions' in pred:
                                        total_emotions += len(pred['emotions'])
                                        for emotion in pred['emotions']:
                                            emotions_found.add(emotion.get('name', 'Unknown'))
                                
                                print(f"✅ Total emotions detected: {total_emotions}")
                                print(f"✅ Unique emotions: {len(emotions_found)}")
                                if emotions_found:
                                    print(f"   Emotions: {', '.join(sorted(list(emotions_found)[:10]))}")
                                
                                # Count text segments
                                text_segments = sum(1 for pred in grouped['predictions'] if pred.get('text'))
                                print(f"✅ Text segments: {text_segments}")
        
        print(f"\n{'='*60}")
        print("✅ TEST COMPLETED SUCCESSFULLY!")
        print(f"{'='*60}\n")
        print(f"Full predictions saved to: {predictions_file}")
        print(f"You can view the detailed results in the JSON file.\n")
        
        return predictions
        
    except Exception as e:
        print(f"\n{'='*60}")
        print("❌ TEST FAILED")
        print(f"{'='*60}")
        print(f"Error: {str(e)}")
        print(f"{'='*60}\n")
        raise


if __name__ == '__main__':
    print("\n" + "="*60)
    print("HUME AUDIO ANALYSIS TEST SCRIPT")
    print("="*60)
    
    try:
        results = process_audio(TEST_AUDIO_URL)
        print("✅ All tests passed!\n")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}\n")
        exit(1)

