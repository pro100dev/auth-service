#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing Auth Service API${NC}\n"

# 1. Register
echo -e "${GREEN}1. Testing Register${NC}"
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nickname": "TestUser"
  }'
echo -e "\n"

# 2. Login
echo -e "${GREEN}2. Testing Login${NC}"
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
echo -e "\n"

# 3. Refresh Tokens (replace with actual values)
echo -e "${GREEN}3. Testing Refresh Tokens${NC}"
echo "Replace userId and refreshToken with actual values from login response"
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-here",
    "refreshToken": "refresh-token-here"
  }'
echo -e "\n"

# 4. Get Profile (replace with actual token)
echo -e "${GREEN}4. Testing Get Profile${NC}"
echo "Replace your-access-token-here with actual token from login response"
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer your-access-token-here"
echo -e "\n"

# 5. Google OAuth
echo -e "${GREEN}5. Testing Google OAuth${NC}"
echo "This requires a browser. Visit:"
echo "http://localhost:3000/auth/google"
echo -e "\n"

echo -e "${BLUE}Note: Replace placeholder values (tokens, IDs) with actual values from previous responses${NC}" 