# StartupOps - Supabase PostgreSQL Setup Guide

## ✅ What's Fixed

1. **Migrated from MongoDB to Supabase PostgreSQL** - All data now stored in Supabase
2. **Cleaned dependencies** - Removed Motor, dnspython, and unnecessary packages
3. **Simplified backend** - Uses only Supabase client for database operations
4. **UUID support** - Uses Supabase's native UUID generation

## 🚀 Setup Instructions

### Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization, project name, password
4. Copy your **Project URL** and **Service Role Key** (from Settings > API)

### Step 2: Run Database Setup

1. In Supabase **SQL Editor**, paste the contents of `backend/setup_database.sql`
2. Run the script to create all tables

### Step 3: Configure Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
CORS_ORIGINS=http://localhost:3000
```

### Step 4: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 5: Run the Server

```bash
python -m uvicorn server:app --reload
```

The API will be available at `http://localhost:8000`

## 📦 Database Structure

### Core Tables:
- `profiles` - User profiles (linked to auth.users)
- `startups` - Startup/workspace data
- `startup_members` - Team members with roles
- `tasks` - Kanban tasks
- `milestones` - Project milestones
- `feedback` - User feedback

### Finance Tables:
- `income` - Revenue tracking
- `expenses` - Expense tracking
- `investments` - Investment records

### Auth:
- Built-in Supabase Auth (not a separate table)
- Supports Google OAuth + Email/Password

## 🔑 Key Changes from MongoDB Version

| Feature | MongoDB | Supabase |
|---------|---------|----------|
| Database | Document store | Relational (PostgreSQL) |
| Connection | Motor async driver | Supabase HTTP client |
| IDs | String (uuid4) | UUID type |
| Timestamps | ISO strings | Timestamptz |
| Queries | PyMongo syntax | Supabase RPC |
| Auth | Supabase + manual sync | Supabase built-in |

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:8000/api/

# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test User"}'
```

## 📝 Environment File Structure

```
SUPABASE_URL=<your-project-url>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
GEMINI_API_KEY=<google-gemini-api-key>
CORS_ORIGINS=http://localhost:3000
```

## ✨ Next Steps

1. Update frontend `.env` with Supabase URL and Anon Key
2. Test authentication flow
3. Create test startup and verify database writes
4. Deploy to production

All APIs remain the same - only the database backend has changed!
