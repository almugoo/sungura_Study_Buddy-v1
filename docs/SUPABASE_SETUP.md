# Supabase Setup Guide for Sungura AI

## 1. Database Schema

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Create a table for student profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  university TEXT,
  courses TEXT[] DEFAULT '{}',
  learning_style TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create a table for chat history
CREATE TABLE public.chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  course_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chats" 
  ON public.chats FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" 
  ON public.chats FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Performance Indices
CREATE INDEX idx_chats_user_id ON public.chats(user_id);
```

## 2. Environment Variables

Update your `.env` files:

### `apps/api/.env`
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### `apps/mobile/.env`
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Implementation Steps
1. Create Supabase project.
2. Run the SQL script above.
3. Replace Firebase Auth with Supabase Auth (Optional start, or run in parallel).
4. Update the Mobile app to save state to Supabase.

## 4. Supabase Storage for Course Materials
1. Go to your Supabase project → **Storage**.
2. Create a new bucket named: `course-materials`.
3. Set the bucket to **Public** (or configure RLS policies if you want user-specific access).
4. The mobile app will upload files to paths like: `{user_id}/{course_name}/{timestamp}.pdf`.

