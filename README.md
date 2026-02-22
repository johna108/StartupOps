# StartupOps - Startup Operational Command Center

A unified digital platform for early-stage founders to manage execution, validate ideas, collaborate with teams, and gain AI-powered insights. Includes investor discovery and portfolio management.

**Latest Updates (Feb 2026):**
- ✅ **Vercel Deployment**: Full-stack deployed on Vercel (Frontend + Backend Serverless)
- ✅ **CORS Fixed**: Resolved double-slash redirect issues affecting preflight requests
- ✅ **Backend Serverless**: FastAPI running on Vercel with proper OPTIONS handler
- ✅ **Investor Features**: Swipe-based startup discovery, investment portfolio tracking, and Manage Investors portal
- ✅ **Real-Time Metrics**: Live financial calculations (runway, burn rate, team size, total raised)
- ✅ **Enhanced Finance Dashboard**: Income/expense categories, investment tracking with equity percentages
- ✅ **Removed Emergent Agent**: Cleaned up all visual editing dependencies for production deployment

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Shadcn/UI + Supabase Auth Client
- **Backend**: FastAPI (Python) + Supabase Admin SDK
- **Database**: Supabase (PostgreSQL) with Auth, Real-Time, and Row Level Security
- **AI**: Google Gemini 2.5 Flash

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
- Supabase account (free tier works)
- Google Gemini API key (for AI features)

---

## Environment Variables

### Backend (`/backend/.env`)

```env
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

## Database Schema (PostgreSQL via Supabase)

All tables are managed via Supabase with Row Level Security (RLS) policies enforcing access control.

### Tables

#### `profiles`
Stores user profile information synced from Supabase auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
```

#### `startups`
Workspace/startup information.

```sql
CREATE TABLE startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  stage TEXT,
  website TEXT,
  founder_id UUID NOT NULL REFERENCES profiles(id),
  invite_code TEXT UNIQUE,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_startups_founder ON startups(founder_id);
CREATE INDEX idx_startups_invite_code ON startups(invite_code);
```

#### `startup_members`
Team membership with roles.

```sql
CREATE TABLE startup_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(startup_id, user_id)
);

CREATE INDEX idx_startup_members_startup ON startup_members(startup_id);
CREATE INDEX idx_startup_members_user ON startup_members(user_id);
```

#### `tasks`
Task items for the Kanban board.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  milestone_id UUID,
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_startup ON tasks(startup_id);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
```

#### `milestones`
Project milestones with target dates.

```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_milestones_startup ON milestones(startup_id);
```

#### `feedback`
Customer/internal feedback entries.

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  rating INTEGER,
  submitted_by UUID REFERENCES profiles(id),
  source TEXT DEFAULT 'internal',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_startup ON feedback(startup_id);
CREATE INDEX idx_feedback_category ON feedback(category);
```

#### `subscriptions`
Subscription/billing information.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL UNIQUE REFERENCES startups(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `investor_swipes`
Investor swipe history (liked/passed startups).

```sql
CREATE TABLE investor_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  action TEXT DEFAULT 'interested',
  swiped_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(investor_id, startup_id)
);

CREATE INDEX idx_investor_swipes_investor ON investor_swipes(investor_id);
CREATE INDEX idx_investor_swipes_startup ON investor_swipes(startup_id);
```

#### `investments`
Investment records (from investors or founders).

```sql
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  investor_name TEXT NOT NULL,
  amount DECIMAL(12, 2),
  equity_percentage DECIMAL(5, 2),
  investment_type TEXT,
  date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_investments_startup ON investments(startup_id);
```

#### `income`
Revenue/income tracking by category.

```sql
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(12, 2),
  category TEXT,
  date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_income_startup ON income(startup_id);
CREATE INDEX idx_income_category ON income(category);
```

#### `expenses`
Expense tracking by category.

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(12, 2),
  category TEXT,
  date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_startup ON expenses(startup_id);
CREATE INDEX idx_expenses_category ON expenses(category);
```

#### `ai_history`
AI generation history (insights, pitch decks).

```sql
CREATE TABLE ai_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  ai_type TEXT,
  content JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_history_startup ON ai_history(startup_id);
CREATE INDEX idx_ai_history_type ON ai_history(ai_type);
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

### 3. Setup Supabase Database Tables

See SUPABASE_SETUP.md for detailed SQL schema and setup instructions. The database tables are automatically created via the SQL file when you initialize your Supabase project.

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

### Option 1: Docker Compose (Frontend + Backend only)

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8001:8001"
    env_file:
      - ./backend/.env
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
```

**Note**: Database is hosted on Supabase (cloud), not locally.

### Option 2: Cloud Platforms

**Backend (FastAPI):**
- Railway, Render, Fly.io, AWS ECS, Google Cloud Run

**Frontend (React):**
- Vercel, Netlify, Cloudflare Pages

**Database:**
- Supabase (PostgreSQL) - recommended for production

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
