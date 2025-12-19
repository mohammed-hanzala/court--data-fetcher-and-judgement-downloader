Court Fetcher - Complete Implementation Guide
📦 Project Overview
This is a full-stack web application that fetches case details from Indian eCourts portals. The application includes:

Frontend: Modern React UI with Tailwind CSS
Backend: Node.js + Express REST API
Database: SQLite for data persistence
Scraper: Modular web scraping architecture
🎯 What You've Received
1. Frontend (React Component)
A fully functional React application with:

Case search form
Results display with case details
Document list with download buttons
Cause list fetcher
Responsive design with modern UI
2. Backend Files
backend/server.js
Express server setup
Database initialization
CORS configuration
Error handling middleware
Graceful shutdown
backend/routes/api.js
/api/search - Search cases
/api/download/:id - Download documents
/api/cause-list - Fetch cause lists
/api/history - Query history
/api/query/:id - Query details
backend/services/fetchers/delhiHC.js
Delhi High Court scraper
Mock data for demo
Commented production code templates
Document download logic
Cause list fetching
3. Configuration Files
package.json
Dependencies and scripts for the project

.env.example
Environment variables template

db/schema.sql
Complete database schema with:

Tables for queries, responses, parsed data, documents
Indexes for performance
Views for common queries
Sample data insertion queries
4. Testing & Setup
setup.sh
Automated setup script that:

Creates directory structure
Installs dependencies
Configures environment
Prepares the project for running
test_api.sh
API testing script with examples for all endpoints

Court_Fetcher.postman_collection.json
Postman/Thunder Client collection for API testing

🚀 Quick Start (5 Minutes)

Step 1: Run Setup
bash
chmod +x setup.sh
./setup.sh
This will:

Install all npm dependencies
Create necessary directories
Set up configuration files
Step 2: Start Backend
bash
npm start
Server will run on http://localhost:5000

Step 3: Set Up Frontend
Option A: Use the React Artifact Directly

The React component is already complete in the artifact
Open it in your browser
Update API calls to point to http://localhost:5000
Option B: Create Standalone React App

bash
# In a new terminal
npx create-react-app frontend
cd frontend
npm install lucide-react
Then copy the React component from the artifact into src/App.jsx

Update src/App.jsx to make real API calls:

javascript
// Replace the mock API call in handleSearch with:
const response = await fetch('http://localhost:5000/api/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});

if (!response.ok) {
  throw new Error('Failed to fetch case details');
}

const data = await response.json();
setSearchResults(data);
Start the frontend:

bash
npm start
🧪 Testing
Test API Endpoints
bash
# Make test script executable
chmod +x test_api.sh

# Run tests
./test_api.sh
Import Postman Collection
Open Postman or Thunder Client
Import Court_Fetcher.postman_collection.json
Run the requests in sequence
Manual Testing
bash
# Health check
curl http://localhost:5000/health

# Search case
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"court":"delhi_hc","caseType":"WP(C)","caseNumber":"12345","year":"2023"}'

# Get history
curl http://localhost:5000/api/history?limit=10
🔧 Configuration
Environment Variables
Edit .env file:

env
PORT=5000                        # Backend server port
NODE_ENV=development             # Environment
DATABASE_PATH=./court_fetcher.db # SQLite database path
UPLOADS_DIR=./backend/uploads    # PDF storage directory
API_TIMEOUT=30000               # Request timeout (ms)
CORS_ORIGIN=http://localhost:3000 # Frontend URL
Database
The database is automatically created on first run. To reset:

bash
rm court_fetcher.db
npm start
To view database:

bash
sqlite3 court_fetcher.db
.tables
SELECT * FROM queries LIMIT 10;
.exit
🎨 Customization
Adding New Court Support
Create new fetcher file:
javascript
// backend/services/fetchers/bombayHC.js
class BombayHCFetcher {
  constructor() {
    this.baseUrl = 'https://bombayhighcourt.nic.in';
  }

  async searchCase(caseType, caseNumber, year) {
    // Implement scraping logic
    // Return same structure as delhiHC.js
  }

  async downloadDocument(url, documentId) {
    // Implement download logic
  }

  async getCauseList(date) {
    // Implement cause list logic
  }
}

module.exports = new BombayHCFetcher();
Update backend/routes/api.js:
javascript
const bombayHCFetcher = require('../services/fetchers/bombayHC');

// In search route:
if (court === 'bombay_hc') {
  result = await bombayHCFetcher.searchCase(caseType, caseNumber, year);
}
Update frontend dropdown to include new court
Customizing UI Theme
The React component uses Tailwind CSS. Modify colors in the component:

javascript
// Change primary color from blue to purple:
// Find: bg-blue-600
// Replace with: bg-purple-600

// Change gradient:
// Find: from-blue-900 to-indigo-900
// Replace with: from-purple-900 to-pink-900
📊 Production Deployment
For Production Use
Implement Real Scraping
Edit backend/services/fetchers/delhiHC.js:

Uncomment the actual implementation code
Update CSS selectors based on actual website structure
Add proper error handling
Implement CAPTCHA solving if needed
Use PostgreSQL Instead of SQLite
bash
npm install pg
Update database connection in server.js:

javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
Add Rate Limiting
bash
npm install express-rate-limit
javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
Add Authentication
bash
npm install jsonwebtoken bcryptjs
Implement JWT-based authentication for API endpoints

Deploy
Backend:

Deploy to Heroku, Railway, or AWS
Set environment variables
Use production database
Frontend:

Build React app: npm run build
Deploy to Vercel, Netlify, or AWS S3
Update API URLs to production backend
Docker Deployment
Create Dockerfile:

dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
Create docker-compose.yml:

yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/data/court_fetcher.db
    volumes:
      - ./data:/data
      - ./uploads:/app/backend/uploads
Run:

bash
docker-compose up -d
🐛 Troubleshooting
Common Issues
1. Database locked error

bash
# Close all connections and restart
rm court_fetcher.db
npm start
2. CORS errors

javascript
// In server.js, update CORS configuration:
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
3. Port already in use

bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Or change PORT in .env
4. Module not found

bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
5. Frontend can't connect to backend

javascript
// Check CORS settings and update fetch URLs
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
6. PDF download fails

bash
# Ensure uploads directory exists and has write permissions
mkdir -p backend/uploads
chmod 755 backend/uploads
📈 Performance Optimization
1. Add Caching
javascript
// Install node-cache
npm install node-cache

// In server.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });

// In api.js
router.post('/search', async (req, res) => {
  const cacheKey = `${court}_${caseType}_${caseNumber}_${year}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  // ... fetch data ...
  cache.set(cacheKey, result);
  res.json(result);
});
2. Database Indexing
Already included in schema.sql:

Indexes on foreign keys
Composite indexes for common queries
Index on timestamp for sorting
3. Implement Pagination
javascript
// In api.js - history endpoint
router.get('/history', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  db.all(
    `SELECT * FROM queries 
     ORDER BY timestamp DESC 
     LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, rows) => {
      // ... handle response
    }
  );
});
🔐 Security Considerations
1. Sanitize Input
bash
npm install validator
javascript
const validator = require('validator');

// In api.js
router.post('/search', (req, res) => {
  const { caseNumber, year } = req.body;
  
  if (!validator.isNumeric(caseNumber.toString())) {
    return res.status(400).json({ error: 'Invalid case number' });
  }
  
  if (year < 1950 || year > new Date().getFullYear()) {
    return res.status(400).json({ error: 'Invalid year' });
  }
  
  // Continue processing...
});
2. Prevent SQL Injection
Already using parameterized queries in all database operations:

javascript
db.run('INSERT INTO queries (court, case_type) VALUES (?, ?)', [court, caseType]);
3. Helmet for HTTP Security
bash
npm install helmet
javascript
const helmet = require('helmet');
app.use(helmet());
4. Environment-based Configuration
Never commit .env file. Use different configs for dev/prod:

javascript
// config.js
module.exports = {
  port: process.env.PORT || 5000,
  database: process.env.DATABASE_PATH || './court_fetcher.db',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};
📊 Monitoring & Logging
1. Winston Logger
bash
npm install winston
javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
Use in your code:

javascript
const logger = require('./logger');

logger.info('Case search initiated', { court, caseNumber });
logger.error('Failed to fetch case', { error: err.message });
2. Request Logging
bash
npm install morgan
javascript
const morgan = require('morgan');
app.use(morgan('combined'));
🧪 Automated Testing
1. Unit Tests with Jest
bash
npm install --save-dev jest supertest
Create tests/api.test.js:

javascript
const request = require('supertest');
const app = require('../backend/server');

describe('Court Fetcher API', () => {
  test('Health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('Search with valid data', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({
        court: 'delhi_hc',
        caseType: 'WP(C)',
        caseNumber: '12345',
        year: '2023'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('Search with missing data', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ court: 'delhi_hc' });
    expect(response.statusCode).toBe(400);
  });
});
Update package.json:

json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
📱 Mobile App Integration
The API is ready for mobile app integration:

React Native Example
javascript
import axios from 'axios';

const API_URL = 'http://your-server.com/api';

export const searchCase = async (court, caseType, caseNumber, year) => {
  try {
    const response = await axios.post(`${API_URL}/search`, {
      court,
      caseType,
      caseNumber,
      year
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadDocument = async (documentId) => {
  const response = await axios.get(
    `${API_URL}/download/${documentId}`,
    { responseType: 'blob' }
  );
  return response.data;
};
🎯 Real Implementation Steps
Phase 1: Setup (Done ✓)
 Project structure
 Database schema
 API endpoints
 Frontend UI
 Mock data
Phase 2: Real Scraping (To Do)
Analyze Target Website
bash
# Visit Delhi High Court website
# Inspect HTML structure
# Identify form fields and response format
Update delhiHC.js with Real Scraping
javascript
async searchCase(caseType, caseNumber, year) {
  try {
    // Step 1: Get the search page to extract any tokens/cookies
    const searchPage = await axios.get(this.searchUrl);
    const $ = cheerio.load(searchPage.data);
    
    // Step 2: Extract form tokens if any
    const formToken = $('input[name="__VIEWSTATE"]').val();
    
    // Step 3: Submit search form
    const response = await axios.post(this.searchUrl, 
      new URLSearchParams({
        case_type: caseType,
        case_no: caseNumber,
        case_year: year,
        __VIEWSTATE: formToken
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 ...'
        }
      }
    );

    // Step 4: Parse response
    const $result = cheerio.load(response.data);
    
    // Extract case details (adjust selectors based on actual HTML)
    const caseDetails = {
      caseNumber: $result('#caseNumber').text().trim(),
      petitioner: $result('#petitioner').text().trim(),
      respondent: $result('#respondent').text().trim(),
      // ... more fields
    };

    return { caseDetails, documents: [], history: [] };
  } catch (error) {
    throw new Error(`Scraping failed: ${error.message}`);
  }
}
Handle CAPTCHAs
bash
npm install puppeteer
javascript
const puppeteer = require('puppeteer');

async searchCaseWithBrowser(caseType, caseNumber, year) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(this.searchUrl);
  
  // Fill form
  await page.type('#caseType', caseType);
  await page.type('#caseNumber', caseNumber);
  await page.type('#year', year);
  
  // Handle CAPTCHA (manual intervention or service)
  // Wait for user to solve or use CAPTCHA solving service
  
  await page.click('#submitBtn');
  await page.waitForNavigation();
  
  const html = await page.content();
  await browser.close();
  
  return this.parseCaseStatus(html);
}
Phase 3: Production Deployment
Use Production Database
bash
# PostgreSQL
DATABASE_URL=postgresql://user:pass@host:5432/dbname
Set up CI/CD
yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          npm install
          npm run build
          # Deploy commands
Monitor with PM2
bash
npm install -g pm2
pm2 start backend/server.js --name court-fetcher
pm2 startup
pm2 save
🎓 Learning Resources
Web Scraping
Cheerio Documentation
Puppeteer Docs
Web Scraping Best Practices
API Development
Express.js Guide
REST API Best Practices
Legal Tech
eCourts Portal
National Judicial Data Grid
📞 Support & Community
Getting Help
Check README.md for basic setup
Review this implementation guide
Test with provided Postman collection
Check logs in logs/ directory
Common Questions
Q: Why is it using mock data? A: Court websites have complex structures, CAPTCHAs, and terms of service. Mock data demonstrates functionality safely. Real implementation requires careful analysis of each court's website.

Q: Can I use this for production? A: Not without implementing real scraping logic and ensuring compliance with court website terms of service.

Q: How do I add more courts? A: Follow the "Adding New Court Support" section. Each court requires its own fetcher implementation.

Q: Is this legal? A: Public court records are generally accessible, but always review and comply with website terms of service. Use responsibly and implement rate limiting.

🎉 Conclusion
You now have a complete, production-ready architecture for a Court Case Fetcher application:

✅ Working Demo with mock data
✅ Complete Backend with REST API
✅ Modern Frontend with React
✅ Database Schema for data persistence
✅ Modular Architecture for easy expansion
✅ Testing Tools for validation
✅ Documentation for maintenance
✅ Deployment Guide for production

Next Steps:
Run the demo to understand the flow
Test all API endpoints with Postman
Analyze target court websites
Implement real scraping in fetcher files
Add more courts using the modular pattern
Deploy to production following the guide
Project Completion Checklist:
 Frontend UI component
 Backend server setup
 API routes implementation
 Database schema
 Mock data for demo
 Configuration files
 Setup scripts
 Testing tools
 Documentation
 Deployment guide
 Real scraping implementation (requires court website analysis)
 CAPTCHA handling (if needed)
 Production deployment
The foundation is complete and ready for real-world implementation!


