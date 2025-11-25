#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="http://localhost:3001/api/v1"

echo "🚀 Setting up Demo Users..."

# 1. Login as Admin to get Token
echo "🔑 Logging in as System Admin..."
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kds-school.com",
    "password": "password123"
  }')

TOKEN=$(echo "$LOGIN_RES" | jq -r '.access_token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to login as admin. Please ensure the server is running and seeded.${NC}"
  echo "Response: $LOGIN_RES"
  exit 1
fi

echo -e "${GREEN}Logged in successfully.${NC}"

# Function to create user
create_user() {
  local email=$1
  local password=$2
  local role=$3
  local firstName=$4
  local lastName=$5

  echo "👤 Creating user: $email ($role)..."
  
  RESPONSE=$(curl -s -X POST "$API_URL/users" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"email\": \"$email\",
      \"password\": \"$password\",
      \"role\": \"$role\",
      \"firstName\": \"$firstName\",
      \"lastName\": \"$lastName\"
    }")

  STATUS=$(echo "$RESPONSE" | jq -r '.statusCode // 201')
  
  if [ "$STATUS" == "409" ]; then
    echo -e "${GREEN}User $email already exists.${NC}"
  elif [ "$STATUS" == "201" ] || [ "$STATUS" == "200" ] || [ -z "$STATUS" ]; then
    # Check if ID exists in response to confirm success
    ID=$(echo "$RESPONSE" | jq -r '.id')
    if [ "$ID" != "null" ]; then
       echo -e "${GREEN}User $email created successfully.${NC}"
    else
       echo -e "${RED}Failed to create user $email.${NC}"
       echo "Response: $RESPONSE"
    fi
  else
    echo -e "${RED}Failed to create user $email. Status: $STATUS${NC}"
    echo "Response: $RESPONSE"
  fi
}

# 2. Create Demo Users
# Fondatrice / Admin / Directrice (All map to admin role in frontend for now, but let's create unique ones if needed or just one admin)
# ModernLogin.tsx uses admin@kds-school.ci for all admin roles
create_user "admin@kds-school.ci" "admin123" "admin" "Admin" "Demo"

# Comptable (acoulibaly@kds-school.ci) -> Role: teacher (as per frontend)
create_user "acoulibaly@kds-school.ci" "teacher123" "teacher" "Awa" "Coulibaly"

# Enseignant (mkone@kds-school.ci) -> Role: teacher
create_user "mkone@kds-school.ci" "teacher123" "teacher" "Moussa" "Kone"

# Agent / Parent (parent1@example.ci) -> Role: parent
create_user "parent1@example.ci" "parent123" "parent" "Parent" "Test"

echo -e "${GREEN}✅ Demo users setup complete.${NC}"
