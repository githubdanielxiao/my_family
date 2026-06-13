#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Family Management System - Setup Script${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Install backend dependencies
echo -e "\n${YELLOW}📦 Installing backend dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Initialize database
echo -e "\n${YELLOW}🗄️  Initializing database...${NC}"
node scripts/init-db.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database initialized${NC}"
else
    echo -e "${RED}❌ Failed to initialize database${NC}"
    exit 1
fi

# Seed demo data
echo -e "\n${YELLOW}🌱 Seeding demo data...${NC}"
node scripts/seed-data.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Demo data seeded${NC}"
else
    echo -e "${RED}❌ Failed to seed demo data${NC}"
    exit 1
fi

# Install client dependencies
echo -e "\n${YELLOW}📦 Installing frontend dependencies...${NC}"
cd client
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

cd ..

echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "\n${YELLOW}🚀 To start the application:${NC}"
echo -e "  ${GREEN}npm run dev${NC}\n"
echo -e "${YELLOW}📝 Demo Credentials:${NC}"
echo -e "  Phone: 13800138000"
echo -e "  Password: 13800138000\n"
