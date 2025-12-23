#!/usr/bin/env python3
"""
Quick test script to verify Flask app and Hume API integration.
Tests the /test endpoint to ensure everything works.
"""

import requests
import json
import time
import sys

FLASK_URL = "http://127.0.0.1:8000"
TEST_URL = "http://res.cloudinary.com/dczyj0axu/video/upload/v1766430541/Fiver/pmqgdztaobs7lyecpfs7.mp3"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    try:
        response = requests.get(f"{FLASK_URL}/", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print("❌ Health check failed")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_hume_endpoint():
    """Test the /test endpoint"""
    print("\n" + "="*60)
    print("TEST 2: Hume API Test Endpoint")
    print("="*60)
    print(f"Testing with URL: {TEST_URL}")
    print("This will take 2-5 minutes...")
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{FLASK_URL}/test",
            json={"url": TEST_URL},
            timeout=1200  # 20 minutes timeout
        )
        elapsed = time.time() - start_time
        
        print(f"\nStatus: {response.status_code}")
        print(f"Time taken: {elapsed:.1f} seconds ({elapsed/60:.1f} minutes)")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nResponse:")
            print(json.dumps(result, indent=2))
            
            if result.get('test_status') == 'PASSED':
                print("\n✅ Test endpoint passed!")
                if 'summary' in result:
                    summary = result['summary']
                    print(f"   - Prediction segments: {summary.get('prediction_segments', 'N/A')}")
                    print(f"   - Emotions detected: {summary.get('emotions_detected', 'N/A')}")
                    print(f"   - Text segments: {summary.get('text_segments', 'N/A')}")
                return True
            else:
                print(f"\n❌ Test endpoint failed: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"\n❌ Test endpoint returned error status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("\n❌ Request timed out (took longer than 20 minutes)")
        return False
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection error - is Flask server running?")
        return False
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_upload_endpoint():
    """Test the /upload endpoint"""
    print("\n" + "="*60)
    print("TEST 3: Upload Endpoint")
    print("="*60)
    print(f"Testing with URL: {TEST_URL}")
    print("This will take 2-5 minutes...")
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{FLASK_URL}/upload",
            json={"url": TEST_URL},
            timeout=1200  # 20 minutes timeout
        )
        elapsed = time.time() - start_time
        
        print(f"\nStatus: {response.status_code}")
        print(f"Time taken: {elapsed:.1f} seconds ({elapsed/60:.1f} minutes)")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nResponse type: {type(result).__name__}")
            
            if isinstance(result, list):
                print(f"✅ Upload endpoint returned list with {len(result)} items")
                if len(result) > 0 and 'results' in result[0]:
                    print("✅ Response contains 'results' key")
                    return True
                else:
                    print("⚠️  Response structure unexpected")
                    return False
            else:
                print(f"⚠️  Upload endpoint returned {type(result).__name__}, expected list")
                print(f"Response preview: {str(result)[:200]}...")
                return False
        else:
            print(f"\n❌ Upload endpoint returned error status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("\n❌ Request timed out (took longer than 20 minutes)")
        return False
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection error - is Flask server running?")
        return False
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("\n" + "="*60)
    print("HUME API FLASK APP TEST SUITE")
    print("="*60)
    print(f"Flask URL: {FLASK_URL}")
    print(f"Test Audio URL: {TEST_URL}")
    print("="*60)
    
    # Check if Flask is running
    if not test_health():
        print("\n❌ Flask server is not running or not accessible!")
        print("Please start Flask server first: python app.py")
        sys.exit(1)
    
    # Run tests
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Test Endpoint", test_hume_endpoint()))
    results.append(("Upload Endpoint", test_upload_endpoint()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(result[1] for result in results)
    if all_passed:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
        sys.exit(1)

