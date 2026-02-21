# StartupOps - Startup Operational Command Center

A unified digital platform for early-stage founders to manage execution, validate ideas, collaborate with teams, and gain AI-powered insights. Includes investor discovery and portfolio management.

**Latest Updates (Feb 2026):**
- ✅ **Investor Features**: Swipe-based startup discovery, investment portfolio tracking, and Manage Investors portal
- ✅ **Real-Time Metrics**: Live financial calculations (runway, burn rate, team size, total raised)
- ✅ **Enhanced Finance Dashboard**: Income/expense categories, investment tracking with equity percentages
- ✅ **Removed Emergent Agent**: Cleaned up all visual editing dependencies for production deployment

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Shadcn/UI + Supabase Auth Client
- **Backend**: FastAPI (Python) + Motor (Async MongoDB) + Supabase Admin SDK
- **Database**: MongoDB (application data) + Supabase (authentication)
- **AI**: Google Gemini 2.5 Flash via emergentintegrations library

## Features

- **Authentication**: Google OAuth + Email/Password (Supabase Auth)
- **Role-Based Access**: Founder, Manager, Member, Investor with granular permissions
- **Execution Tracking**: Kanban task board, milestone tracking, progress visualization
- **Investor Features**:
  - Investor discovery swipe interface (Tinder-like)
  - Investment portfolio tracking (My Investments)
  - Manage Investors portal with real-time startup metrics
  - Investor match notifications and contact management
- **Financial Management**: Income, expenses, investments tracking with runway calculations
- **Team Collaboration**: Team management, role assignment, member invitations
- **Analytics**: Real-time metrics dashboard, trend charts, performance indicators
- **AI-Powered Features**: Gemini AI insights and investor pitch generation
- **Dark/Light Theme**: Full theme support with user preference persistence

---

## Prerequisites

- Node.js 18+ and Yarn
- Python 3.10+
- MongoDB 6.0+ (local or Atlas)
- Supabase account (free tier works)
- Google Gemini API key (for AI features)

---

## Environment Variables

### Backend (`/backend/.env`)

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=startupops

# Supabase (get from Supabase Dashboard > Settings > API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Integration (get from Google AI Studio)
GEMINI_API_KEY=your-gemini-api-key

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Frontend (`/frontend/.env`)

```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001

# Supabase (same as backend)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Site URL (for OAuth redirects)
REACT_APP_SITE_URL=http://localhost:3000
```

---

## MongoDB Schema

### Collections

#### `profiles`
Stores user profile information synced from Supabase auth.

```javascript
{
  "id": "uuid",                    // Supabase user ID (primary key)
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.profiles.createIndex({ "id": 1 }, { unique: true })
```

#### `startups`
Workspace/startup information.

```javascript
{
  "id": "uuid",                    // Primary key
  "name": "My Startup",
  "description": "What we do...",
  "industry": "saas",              // saas, fintech, healthtech, edtech, ecommerce, ai_ml, marketplace, other
  "stage": "mvp",                  // idea, mvp, growth, scale
  "website": "https://...",
  "founder_id": "uuid",            // Reference to profiles.id
  "invite_code": "ABC123",         // 8-char uppercase code for team joins
  "subscription_plan": "free",     // free, pro, scale
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.startups.createIndex({ "id": 1 }, { unique: true })
db.startups.createIndex({ "invite_code": 1 }, { unique: true })
```

#### `startup_members`
Team membership with roles.

```javascript
{
  "id": "uuid",                    // Primary key
  "startup_id": "uuid",            // Reference to startups.id
  "user_id": "uuid",               // Reference to profiles.id
  "role": "founder",               // founder, manager, member
  "joined_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.startup_members.createIndex({ "startup_id": 1, "user_id": 1 }, { unique: true })
```

#### `tasks`
Task items for the Kanban board.

```javascript
{
  "id": "uuid",                    // Primary key
  "startup_id": "uuid",            // Reference to startups.id
  "title": "Task title",
  "description": "Task details...",
  "status": "todo",                // todo, in_progress, review, done
  "priority": "medium",            // low, medium, high, urgent
  "assigned_to": "uuid",           // Reference to profiles.id (nullable)
  "created_by": "uuid",            // Reference to profiles.id
  "milestone_id": "uuid",          // Reference to milestones.id (nullable)
  "due_date": "2026-02-01",        // ISO date string (nullable)
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.tasks.createIndex({ "id": 1 }, { unique: true })
db.tasks.createIndex({ "startup_id": 1 })
db.tasks.createIndex({ "milestone_id": 1 })
db.tasks.createIndex({ "assigned_to": 1 })
```

#### `milestones`
Project milestones with target dates.

```javascript
{
  "id": "uuid",                    // Primary key
  "startup_id": "uuid",            // Reference to startups.id
  "title": "MVP Launch",
  "description": "Launch details...",
  "target_date": "2026-03-01",     // ISO date string
  "status": "pending",             // pending, in_progress, completed
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.milestones.createIndex({ "id": 1 }, { unique: true })
db.milestones.createIndex({ "startup_id": 1 })
```

#### `feedback`
Customer/internal feedback entries.

```javascript
{
  "id": "uuid",                    // Primary key
  "startup_id": "uuid",            // Reference to startups.id
  "title": "Feedback title",
  "content": "Detailed feedback...",
  "category": "product",           // product, technical, business, market
  "rating": 4,                     // 1-5 scale
  "submitted_by": "uuid",          // Reference to profiles.id
  "source": "internal",            // internal, external
  "created_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.feedback.createIndex({ "startup_id": 1 })
db.feedback.createIndex({ "category": 1 })
```

#### `subscriptions`
Subscription/billing information.

```javascript
{
  "id": "uuid",                    // Primary key
  "startup_id": "uuid",            // Reference to startups.id
  "plan": "free",                  // free, pro, scale
  "status": "active",              // active, cancelled, past_due
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.subscriptions.createIndex({ "startup_id": 1 }, { unique: true })
```

#### `investor_swipes`
Investor swipe history (liked/passed startups).

```javascript
{
  "id": "uuid",                    // Primary key
  "investor_id": "uuid",           // Reference to profiles.id
  "startup_id": "uuid",            // Reference to startups.id
  "action": "interested",          // interested, passed
  "swiped_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.investor_swipes.createIndex({ "investor_id": 1, "startup_id": 1 }, { unique: true })
db.investor_swipes.createIndex({ "investor_id": 1 })
```

#### `investments`
Investment records (from investors or founders).

```javascript
{
  "id": "uuid",                    // Primary key
  "startup_id": "uuid",            // Reference to startups.id
  "investor_name": "John Investor", // Investor or fund name
  "amount": 100000,                // Investment amount in INR
  "equity_percentage": 5.5,        // Equity given (nullable)
  "investment_type": "seed",       // pre-seed, seed, angel, series-a, series-b, other
  "date": "2026-01-01",            // ISO date string
  "notes": "Additional details...", // Optional notes
  "created_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.investments.createIndex({ "startup_id": 1 })
db.investments.createIndex({ "id": 1 }, { unique: true })
```

#### `income`
Revenue/income tracking by category.

```javascript
{
  "id": "uuid",                    // Primary key
  "startup_id": "uuid",            // Reference to startups.id
  "title": "Income source name",
  "amount": 50000,                 // Amount in INR
  "category": "revenue",           // revenue, investment, grant, other
  "date": "2026-01-01",            // ISO date string
  "notes": "Optional details...",
  "created_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.income.createIndex({ "startup_id": 1 })
db.income.createIndex({ "category": 1 })
```

#### `expenses`
Expense tracking by category.

```javascript
{
  "id": "uuid",                    // Primary key
  "startup_id": "uuid",            // Reference to startups.id
  "title": "Expense description",
  "amount": 5000,                  // Amount in INR
  "category": "salary",            // salary, marketing, operations, infrastructure, legal, other
  "date": "2026-01-01",            // ISO date string
  "notes": "Optional details...",
  "created_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.expenses.createIndex({ "startup_id": 1 })
db.expenses.createIndex({ "category": 1 })
```

#### `ai_history`
AI generation history (insights, pitch decks).

```javascript
{
  "id": "uuid",                    // Primary key
  "startup_id": "uuid",            // Reference to startups.id
  "ai_type": "insights",           // insights, pitch
  "content": "{ ...generated content... }",
  "metadata": {                    // Optional metadata
    "slide_count": 10,
    "model": "gemini-2.5-flash"
  },
  "created_at": "2026-01-01T00:00:00Z"
}

// Indexes
db.ai_history.createIndex({ "startup_id": 1 })
db.ai_history.createIndex({ "ai_type": 1 })
```

---

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/yourusername/startupops.git
cd startupops

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
yarn install
```

### 2. Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Authentication > Providers** and enable:
   - Email (enable "Confirm email" or disable for testing)
   - Google OAuth (add credentials from Google Cloud Console)
3. Go to **Authentication > URL Configuration**:
   - Add `http://localhost:3000/auth/callback` to Redirect URLs
4. Copy API keys from **Settings > API**

### 3. Setup MongoDB

```bash
# Using Docker
docker run -d --name mongodb -p 27017:27017 mongo:6.0

# Or install locally and start
mongod --dbpath /path/to/data

# Create database and indexes (optional - app creates them on startup)
mongosh
use startupops
db.profiles.createIndex({ "id": 1 }, { unique: true })
db.startups.createIndex({ "id": 1 }, { unique: true })
db.startups.createIndex({ "invite_code": 1 }, { unique: true })
db.startup_members.createIndex({ "startup_id": 1, "user_id": 1 })
db.tasks.createIndex({ "id": 1 }, { unique: true })
db.tasks.createIndex({ "startup_id": 1 })
db.milestones.createIndex({ "id": 1 }, { unique: true })
db.milestones.createIndex({ "startup_id": 1 })
db.feedback.createIndex({ "startup_id": 1 })
db.subscriptions.createIndex({ "startup_id": 1 })
```

### 4. Configure Environment Variables

Create `.env` files in both `/backend` and `/frontend` directories using the templates above.

### 5. Run the Application

```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Start frontend
cd frontend
yarn start
```

Access the app at `http://localhost:3000`

---

## Production Deployment

### Option 1: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongo_data:
```

### Option 2: Cloud Platforms

**Backend (FastAPI):**
- Railway, Render, Fly.io, AWS ECS, Google Cloud Run

**Frontend (React):**
- Vercel, Netlify, Cloudflare Pages

**Database:**
- MongoDB Atlas (recommended for production)

### Supabase Production Setup

1. Update **Authentication > URL Configuration**:
   - Add your production domain to Redirect URLs
   - Update Site URL to your production domain
2. Enable Row Level Security if using Supabase database features

---

## Role-Based Access Control

### Roles

| Role | Description |
|------|-------------|
| **Founder** | Full access to everything. Can manage team, billing, and startup settings. |
| **Manager** | Can manage tasks, milestones, and view analytics. Cannot access billing or invite codes. |
| **Member** | Can view and update status of assigned tasks. Limited access to other features. |
| **Investor** | Can discover startups via swipe interface, manage portfolio, and view invested startups' metrics. |

### Permission Matrix

| Feature | Founder | Manager | Member | Investor |
|---------|:-------:|:-------:|:------:|:--------:|
| View Dashboard | ✅ | ✅ | ✅ (limited) | ✅ (portfolio) |
| Create/Edit/Delete Tasks | ✅ | ✅ | ❌ | ❌ |
| Change Own Task Status | ✅ | ✅ | ✅ | ❌ |
| Create/Edit/Delete Milestones | ✅ | ✅ | ❌ | ❌ |
| View/Submit Feedback | ✅ | ✅ | ✅ | ❌ |
| Delete Feedback | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ❌ | ❌ |
| AI Insights | ✅ | ✅ | ❌ | ❌ |
| Pitch Generator | ✅ | ❌ | ❌ | ❌ |
| View Team List | ✅ | ✅ | ✅ | ❌ |
| View Invite Code | ✅ | ❌ | ❌ | ❌ |
| Remove Team Members | ✅ | ❌ | ❌ | ❌ |
| Change Member Roles | ✅ | ❌ | ❌ | ❌ |
| Edit Startup Settings | ✅ | ❌ | ❌ | ❌ |
| Manage Subscription | ✅ | ❌ | ❌ | ❌ |
| Discover Startups (Swipe) | ❌ | ❌ | ❌ | ✅ |
| View My Investments | ❌ | ❌ | ❌ | ✅ |
| Manage Investments | ❌ | ❌ | ❌ | ✅ |
| View Manage Investors Portal | ✅ | ❌ | ❌ | ❌ |

---

## Investor Features (v2.0)

### For Investors

**Discover Startups** (`/discover`)
- Tinder-like swipe interface to discover startups
- Real-time startup metrics displayed on each card
- Undo swipes to change decisions
- Track matched startups with contact details

**My Investments** (`/my-investments`)
- Add investment records to track portfolio
- Record equity percentages and investment types
- View total invested, investment count, and average equity
- Delete investment records

### For Founders

**Manage Investors** (`/investor-portal`)
- View investors interested in your startup
- Real-time startup metrics including:
  - Total raised (sum of investments)
  - Current balance (income + raised - expenses)
  - Monthly burn rate (average expenses)
  - Runway (months of operations possible)
  - Team size (member count)
  - Milestone progress
- Invite investors via email with auto-generated codes
- Copy and regenerate invite codes
- Remove investor access

### API Endpoints for Investor Features

**Investor Discovery:**
- `GET /api/investor/browse` - Get browseable startups
- `POST /api/investor/swipe/{startup_id}` - Record swipe action
- `GET /api/investor/matches` - Get investor's matched startups
- `DELETE /api/investor/matches/{startup_id}` - Remove a match

**Investor Portfolio:**
- `POST /api/startups/{startup_id}/finance/investments` - Add investment
- `GET /api/startups/{startup_id}/finance/investments` - List investments
- `DELETE /api/startups/{startup_id}/finance/investments/{id}` - Delete investment

**Founder Investor Management:**
- `GET /api/startups/{startup_id}/investor-view` - Get startup metrics (investor view)
- `GET /api/startups/{startup_id}/investors` - List active investors and pending invites
- `POST /api/startups/{startup_id}/investors/invite` - Invite investor
- `DELETE /api/startups/{startup_id}/investors/{user_id}` - Remove investor

---

Once running, access the interactive API docs at:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

---

## Demo Mode

Access pre-populated demo data:

```bash
# Setup demo (creates demo user + sample startup with tasks, milestones, feedback)
curl -X POST http://localhost:8001/api/demo/setup

# Login credentials returned:
# Email: demo@startupops.io
# Password: DemoUser2026!
```

---

## License

MIT License - See LICENSE file for details.

---

## Support

For issues and feature requests, please open a GitHub issue.
