# 🚀 Deployment Guide: Render + Supabase

Complete guide to deploy your Risk & Control Management System to production.

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Supabase account (https://supabase.com)
- [ ] Render account (https://render.com)
- [ ] OpenAI API key (https://platform.openai.com/api-keys)

---

## Part 1: Setup Supabase Database (5 minutes)

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `risk-control-db`
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get Database Connection String

1. In your Supabase project, click **Settings** (gear icon) → **Database**
2. Scroll to **Connection string** section
3. Select **"URI"** tab
4. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
   ```
5. **Replace** `[YOUR-PASSWORD]` with the password you set in Step 1
6. **SAVE THIS** - you'll need it for Render

---

## Part 2: Push Code to GitHub (3 minutes)

### Create GitHub Repository

```bash
# In your project root directory
cd /Users/jp/IdeaProjects/ai-tool

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create repo on GitHub (or use GitHub Desktop)
# Then push:
git remote add origin https://github.com/YOUR-USERNAME/ai-tool.git
git branch -M main
git push -u origin main
```

---

## Part 3: Deploy Backend to Render (10 minutes)

### Step 1: Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `ai-tool` repository

### Step 2: Configure Backend Service

Fill in these settings:

- **Name**: `risk-control-backend`
- **Region**: Same as Supabase (or closest)
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: 
  ```
  npm install && npx prisma generate && npm run build
  ```
- **Start Command**: 
  ```
  npx prisma migrate deploy && npm start
  ```

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase connection string from Part 1 |
| `JWT_SECRET` | Generate random string: `openssl rand -base64 32` |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Once live, you'll get a URL like: `https://risk-control-backend.onrender.com`
4. **SAVE THIS URL** - you need it for frontend

### Step 5: Run Database Migrations

After first deployment:
1. Go to your service → **Shell** tab
2. Run: `npx prisma migrate deploy`
3. Run seed data: `npm run db:seed`

---

## Part 4: Deploy Frontend to Render (5 minutes)

### Step 1: Create Static Site

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Select the same `ai-tool` repository

### Step 2: Configure Frontend

- **Name**: `risk-control-app`
- **Branch**: `main`
- **Root Directory**: Leave empty (root)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Step 3: Add Environment Variable

Click **"Advanced"** → **"Add Environment Variable"**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Your backend URL from Part 3 (e.g., `https://risk-control-backend.onrender.com/api`) |

### Step 4: Deploy

1. Click **"Create Static Site"**
2. Wait 3-5 minutes
3. Your app will be live at: `https://risk-control-app.onrender.com`

---

## Part 5: Update Frontend API URL

### Local Update

1. Create `.env.production` in project root:
   ```bash
   VITE_API_URL=https://risk-control-backend.onrender.com/api
   ```

2. Update `server/src/index.ts` CORS settings:
   ```typescript
   app.use(cors({
     origin: 'https://risk-control-app.onrender.com',
     credentials: true
   }));
   ```

3. Commit and push:
   ```bash
   git add .
   git commit -m "Update production URLs"
   git push
   ```

This will trigger automatic redeployment on Render.

---

## 🎉 You're Live!

Your app is now deployed:

- **Frontend**: https://risk-control-app.onrender.com
- **Backend**: https://risk-control-backend.onrender.com
- **Database**: Supabase (managed)

### Demo Login

- Email: `admin@company.com`
- Password: `demo123`

---

## 🔧 Common Issues & Solutions

### Backend won't start
- Check environment variables are set correctly
- Verify DATABASE_URL has correct password
- Check Render logs: Service → Logs tab

### Frontend can't connect to backend
- Verify VITE_API_URL includes `/api` at the end
- Check CORS settings allow your frontend domain
- Test backend directly: `https://your-backend.onrender.com/api/health`

### Database migration errors
- Run migrations manually in Shell: `npx prisma migrate deploy`
- Check DATABASE_URL is valid Supabase connection string

### Free tier sleeping
- Render free tier services sleep after 15 mins of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid ($7/month) for always-on

---

## 📊 Monitoring

### Backend Health Check
```bash
curl https://risk-control-backend.onrender.com/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2026-02-05T..."}
```

### View Logs
- Render Dashboard → Your Service → Logs tab
- Real-time logs of all requests and errors

---

## 🔄 Updating Your App

Any push to GitHub `main` branch will automatically redeploy:

```bash
git add .
git commit -m "Your changes"
git push
```

Render will automatically:
1. Pull latest code
2. Run build commands
3. Deploy new version
4. Zero-downtime deployment

---

## 💰 Cost Breakdown (FREE!)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Supabase | Free | $0 | 500 MB database, 2 GB bandwidth |
| Render Backend | Free | $0 | Sleeps after 15 min inactivity |
| Render Frontend | Free | $0 | 100 GB bandwidth |
| **Total** | | **$0/month** | Perfect for demo/testing |

### When to Upgrade

Upgrade when you need:
- **Backend always-on**: $7/month (no sleep)
- **More database**: $25/month (8 GB + backups)
- **Custom domain**: Free on Render

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Check Logs**: Always check Render logs first for errors

---

## ✅ Deployment Checklist

- [ ] Supabase project created
- [ ] Database URL copied
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Environment variables added to backend
- [ ] Database migrated and seeded
- [ ] Frontend deployed to Render
- [ ] Frontend API URL configured
- [ ] CORS updated in backend
- [ ] App tested and working
- [ ] Demo login works

**Congratulations! Your app is live! 🎊**
