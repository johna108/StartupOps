-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Startups table
create table startups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  industry text,
  stage text,
  website text,
  founder_id uuid references auth.users not null,
  invite_code text,
  subscription_plan text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Startup Members table
create table startup_members (
  id uuid default uuid_generate_v4() primary key,
  startup_id uuid references startups on delete cascade not null,
  user_id uuid references auth.users not null,
  role text not null check (role in ('founder', 'manager', 'member', 'investor')),
  joined_at timestamptz default now(),
  unique(startup_id, user_id)
);

-- Milestones table
create table milestones (
  id uuid default uuid_generate_v4() primary key,
  startup_id uuid references startups on delete cascade not null,
  title text not null,
  description text,
  target_date date,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  startup_id uuid references startups on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  assigned_to uuid references auth.users(id),
  created_by uuid references auth.users(id),
  milestone_id uuid references milestones(id) on delete set null,
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Feedback table
create table feedback (
  id uuid default uuid_generate_v4() primary key,
  startup_id uuid references startups on delete cascade not null,
  title text not null,
  content text,
  category text,
  rating integer,
  submitted_by uuid references auth.users(id),
  source text default 'internal',
  created_at timestamptz default now()
);

-- Subscriptions table
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  startup_id uuid references startups on delete cascade not null unique,
  plan text default 'free',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Finance: Income
create table income (
  id uuid default uuid_generate_v4() primary key,
  startup_id uuid references startups on delete cascade not null,
  title text not null,
  amount numeric(10, 2) not null,
  category text,
  date date default CURRENT_DATE,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Finance: Expenses
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  startup_id uuid references startups on delete cascade not null,
  title text not null,
  amount numeric(10, 2) not null,
  category text,
  date date default CURRENT_DATE,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Finance: Investments
create table investments (
  id uuid default uuid_generate_v4() primary key,
  startup_id uuid references startups on delete cascade not null,
  investor_name text not null,
  amount numeric(10, 2) not null,
  equity_percentage numeric(5, 2),
  investment_type text,
  date date default CURRENT_DATE,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Enable RLS (Row Level Security) - Optional validation layer
alter table profiles enable row level security;
alter table startups enable row level security;
alter table startup_members enable row level security;
alter table tasks enable row level security;
alter table milestones enable row level security;
alter table feedback enable row level security;

-- AI History table - stores generated insights and pitches
create table ai_history (
  id uuid default uuid_generate_v4() primary key,
  startup_id uuid references startups on delete cascade not null,
  type text not null check (type in ('insight', 'pitch')),
  subtype text,
  content text not null,
  metadata jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Investor Swipes table - tracks investor interest in startups (Tinder-like)
create table investor_swipes (
  id uuid default uuid_generate_v4() primary key,
  investor_id uuid references auth.users not null,
  startup_id uuid references startups on delete cascade not null,
  action text not null check (action in ('interested', 'passed')),
  created_at timestamptz default now(),
  unique(investor_id, startup_id)
);

alter table investor_swipes enable row level security;

-- Policies (Simplified for development - allow service role to do everything)
-- In production, you'd want stricter policies.
create policy "Public profiles" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

