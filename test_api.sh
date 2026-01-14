#!/bin/bash

# API Testing Script for Court Fetcher
# Make sure the backend server is running before executing this script

BASE_URL="http://localhost:5000/api"

echo "======================================"
echo "Court Fetcher API Test Suite"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
curl -s http://localhost:5000/health | jq '.'
echo ""
echo ""

# Test 2: Search Case
echo -e "${BLUE}Test 2: Search Case${NC}"
SEARCH_RESPONSE=$(curl -s -X POST "$BASE_URL/search" \
  -H "Content-Type: application/json" \
  -d '{
    "court": "delhi_hc",
    "caseType": "WP(C)",
    "caseNumber": "12345",
    "year": "2023"
  }')

echo "$SEARCH_RESPONSE" | jq '.'
QUERY_ID=$(echo "$SEARCH_RESPONSE" | jq -r '.queryId')
echo -e "${GREEN}Query ID: $QUERY_ID${NC}"
echo ""
echo ""

# Test 3: Get Query Details
echo -e "${BLUE}Test 3: Get Query Details${NC}"
curl -s "$BASE_URL/query/$QUERY_ID" | jq '.'
echo ""
echo ""

# Test 4: Get Query History
echo -e "${BLUE}Test 4: Get Query History${NC}"
curl -s "$BASE_URL/history?limit=10" | jq '.'
echo ""
echo ""

# Test 5: Request Cause List
echo -e "${BLUE}Test 5: Request Cause List${NC}"
CAUSE_LIST_RESPONSE=$(curl -s -X POST "$BASE_URL/cause-list" \
  -H "Content-Type: application/json" \
  -d '{
    "court": "delhi_hc",
    "date": "2025-10-02"
  }')

echo "$CAUSE_LIST_RESPONSE" | jq '.'
echo ""
echo ""

# Test 6: Download Document (simulate)
echo -e "${BLUE}Test 6: Download Document Info${NC}"
DOC_ID=$(echo "$SEARCH_RESPONSE" | jq -r '.documents[0].id // 1')
echo "Document ID: $DOC_ID"
echo "Download URL: $BASE_URL/download/$DOC_ID"
echo ""

# Test 7: Invalid Request
echo -e "${BLUE}Test 7: Invalid Request (Missing Parameters)${NC}"
curl -s -X POST "$BASE_URL/search" \
  -H "Content-Type: application/json" \
  -d '{
    "court": "delhi_hc"
  }' | jq '.'
echo ""
echo ""

echo -e "${GREEN}======================================"
echo "All API tests completed!"
echo "======================================${NC}"

# Instructions for actual downloads
echo ""
echo "To test actual file downloads, use:"
echo "curl -O -J $BASE_URL/download/1"
echo ""
echo "To download cause list:"
echo "FILENAME=\$(curl -s -X POST $BASE_URL/cause-list -H 'Content-Type: application/json' -d '{\"court\":\"delhi_hc\",\"date\":\"2025-10-02\"}' | jq -r '.downloadUrl')"
echo "curl -O -J http://localhost:5000\$FILENAME"