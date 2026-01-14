#!/bin/bash

# Court Fetcher - Quick Setup Script
# This script sets up the entire project structure

set -e  # Exit on error

echo "======================================"
echo "Court Fetcher - Setup Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js installation
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js >= 16.0.0${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js version: $NODE_VERSION${NC}"
echo ""

# Create directory structure
echo -e "${BLUE}Creating directory structure...${NC}"
mkdir -p backend/routes
mkdir -p backend/services/fetchers
mkdir -p backend/db
mkdir -p backend/uploads
mkdir -p frontend/src
mkdir -p logs

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Create package.json if it doesn't exist
if [ ! -f package.json ]; then
    echo -e "${BLUE}Creating package.json...${NC}"
    cat > package.json << 'EOF'
{
  "name": "ecourts-case-fetcher",
  "version": "1.0.0",
  "description": "Web application to fetch and download case details from Indian eCourts portals",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js",
    "init-db": "node backend/db/init.js",
    "test": "bash test_api.sh"
  },
  "keywords": ["ecourts", "legal", "india", "court", "case-tracking"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "sqlite3": "^5.1.6",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF
    echo -e "${GREEN}✓ package.json created${NC}"
else
    echo -e "${YELLOW}package.json already exists, skipping...${NC}"
fi
echo ""

# Create .env file
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
DATABASE_PATH=./court_fetcher.db
UPLOADS_DIR=./backend/uploads
API_TIMEOUT=30000
CORS_ORIGIN=http://localhost:3000
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${YELLOW}.env file already exists, skipping...${NC}"
fi
echo ""

# Create .gitignore
if [ ! -f .gitignore ]; then
    echo -e "${BLUE}Creating .gitignore...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment
.env
.env.local

# Database
*.db
*.db-journal

# Uploads
backend/uploads/*
!backend/uploads/.gitkeep

# Logs
logs/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/
frontend/build/
EOF
    echo -e "${GREEN}✓ .gitignore created${NC}"
else
    echo -e "${YELLOW}.gitignore already exists, skipping...${NC}"
fi
echo ""

# Create empty .gitkeep for uploads
touch backend/uploads/.gitkeep

# Install dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Make test script executable
if [ -f test_api.sh ]; then
    chmod +x test_api.sh
    echo -e "${GREEN}✓ test_api.sh is now executable${NC}"
fi

# Create a simple start script
cat > start.sh << 'EOF'
#!/bin/bash
echo "Starting Court Fetcher backend server..."
npm start
EOF
chmod +x start.sh

echo ""
echo -e "${GREEN}======================================"
echo "Setup Complete!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend server:"
echo -e "   ${BLUE}npm start${NC} or ${BLUE}./start.sh${NC}"
echo ""
echo "2. The server will run on: http://localhost:5000"
echo ""
echo "3. Test the API:"
echo -e "   ${BLUE}./test_api.sh${NC} (requires jq to be installed)"
echo ""
echo "4. Setup the frontend:"
echo "   - Copy the React component code to your frontend"
echo "   - Or use the provided React artifact"
echo ""
echo "5. Access the API documentation:"
echo "   - Health check: http://localhost:5000/health"
echo "   - Search: POST http://localhost:5000/api/search"
echo "   - History: GET http://localhost:5000/api/history"
echo ""
echo -e "${YELLOW}Note: The application currently uses mock data.${NC}"
echo -e "${YELLOW}Update backend/services/fetchers/delhiHC.js for production use.${NC}"
echo ""