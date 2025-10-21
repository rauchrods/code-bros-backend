# Simple Database Setup Guide

## 🚀 Quick Setup

### 1. Install PostgreSQL dependency
```bash
npm install pg
```

### 2. Set up your .env file
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_YNitZE2v5LHQ@ep-muddy-mountain-a4f22mn0-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
FRONTEND_URL=http://localhost:5173
```

### 3. Run the database schema
Connect to your Neon database and execute the `database/minimal-schema.sql` file.

**Using Neon Console:**
1. Go to https://console.neon.tech/
2. Select your database
3. Open SQL Editor
4. Copy and paste the contents of `database/minimal-schema.sql`
5. Execute

### 4. Migrate your problems data
```bash
npm run migrate
```

### 5. Start the server
```bash
npm run dev
```

## 📋 What's Created

### Essential Tables:
- **problems** - Your coding problems
- **problem_starter_codes** - Starter code for each language
- **problem_examples** - Example test cases
- **submissions** - User code submissions

### API Changes:
- Problems now come from database instead of hardcoded array
- Submissions are automatically saved to database
- Problem statistics (acceptance rate, etc.) are tracked

## ✅ Verification

Visit `http://localhost:5000/health` to check database connection status.

The API endpoints remain the same:
- `GET /api/problems` - List all problems
- `GET /api/problems/:id` - Get specific problem
- `POST /api/code/run` - Run code
- `POST /api/code/submit` - Submit code (now saves to DB)

## 🔧 Migration Notes

- Your existing problems from `constants/problems.js` will be imported
- Problem IDs remain the same (using slugs)
- Frontend code should work without changes
- Submissions are now tracked in the database