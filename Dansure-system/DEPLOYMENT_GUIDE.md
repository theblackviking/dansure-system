# 🔥 Dansure Engineering Group — Deployment Guide

## Overview
This app uses **Next.js** (frontend + API) deployed on **Vercel** (free) with **Supabase** (free PostgreSQL database).

---

## STEP 1: Set Up Supabase (Free Database)

1. Go to **https://supabase.com** and sign up (free)
2. Click **"New Project"**
   - Name: `dansure-engineering`
   - Database Password: choose a strong password
   - Region: pick closest to Ghana (Europe West or US East)
3. Wait for project to spin up (~1 min)
4. Go to **SQL Editor** (left sidebar)
5. Paste the entire contents of `supabase_schema.sql` and click **Run**
6. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## STEP 2: Push Code to GitHub

1. Create a free account at **https://github.com**
2. Create a new repository: `dansure-engineering`
3. In your terminal (in the project folder):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/dansure-engineering.git
   git push -u origin main
   ```

---

## STEP 3: Deploy on Vercel (Free Hosting)

1. Go to **https://vercel.com** and sign up (use GitHub)
2. Click **"New Project"**
3. Import your `dansure-engineering` GitHub repo
4. In **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service role key |
   | `JWT_SECRET` | any long random string (e.g. `dansure-fire-engineering-ghana-2024-secure`) |

5. Click **Deploy**
6. In ~2 minutes, your app will be live at `https://dansure-engineering.vercel.app`

---

## STEP 4: Custom Domain (Optional)

In Vercel → Settings → Domains, you can add a custom domain like `app.dansure.com` for free.

---

## Default Login Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `dansure2024` | Admin |
| `staff` | `staff123` | Staff |

**⚠️ Change these passwords in Supabase after first login!**

---

## Adding New Users

Run this SQL in Supabase SQL Editor (replace with actual bcrypt hash):
```sql
-- Generate hash at: https://bcrypt-generator.com (rounds: 10)
INSERT INTO users (username, name, password_hash, role)
VALUES ('newuser', 'New User Name', 'BCRYPT_HASH_HERE', 'staff');
```

---

## Free Tier Limits (More Than Enough)

| Service | Free Limit |
|---------|-----------|
| Vercel | 100GB bandwidth/month, unlimited deploys |
| Supabase | 500MB database, 2GB bandwidth, 50,000 rows |

Both free tiers will comfortably handle years of data for a growing company.

---

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your values
npm run dev
# Open http://localhost:3000
```
