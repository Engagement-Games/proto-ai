#!/bin/bash
echo "Testing Website Analysis API..."
echo ""
curl -X POST http://localhost:3000/api/analyze-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.apple.com"}' \
  2>/dev/null | jq '.'
