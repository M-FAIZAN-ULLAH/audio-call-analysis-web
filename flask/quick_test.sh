#!/bin/bash
# Quick test script to verify Flask app is working

echo "=========================================="
echo "Quick Flask App Test"
echo "=========================================="

FLASK_URL="http://127.0.0.1:8000"

echo ""
echo "1. Testing health endpoint..."
curl -s "$FLASK_URL/" | python3 -m json.tool || echo "❌ Health check failed - is Flask running?"

echo ""
echo "2. Testing /test endpoint (this will take 2-5 minutes)..."
echo "   Starting test at $(date)"
curl -X POST "$FLASK_URL/test" \
  -H "Content-Type: application/json" \
  -d '{}' \
  --max-time 1200 \
  -v 2>&1 | head -50

echo ""
echo "   Test completed at $(date)"
echo ""
echo "3. Check debug log:"
echo "   cat /Users/amk/Documents/Full-Stack-Audio/.cursor/debug.log"

