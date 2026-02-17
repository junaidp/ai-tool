# Setup Instructions

## Database Configuration Required

Before running the migration, you need to configure your database connection.

### Step 1: Set up Database URL

Edit `/server/.env` and add your PostgreSQL database URL:

```bash
DATABASE_URL="postgresql://username:password@host:5432/database_name"
```

**Options:**

**A. Use Supabase (Recommended)**
1. Go to https://supabase.com
2. Create a new project
3. Go to Project Settings → Database
4. Copy the connection string (URI format)
5. Paste into `.env` as `DATABASE_URL`

**B. Use Local PostgreSQL**
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_tool"
```

**C. Use Docker PostgreSQL**
```bash
# Start PostgreSQL container
docker run --name ai-tool-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ai_tool -p 5432:5432 -d postgres:15

# Then use this URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_tool"
```

### Step 2: Configure OpenAI API Key

Add your OpenAI API key to `/server/.env`:

```bash
OPENAI_API_KEY="sk-your-actual-api-key-here"
```

Get your API key from: https://platform.openai.com/api-keys

### Step 3: Run Migration

Once database is configured:

```bash
cd server
npx prisma migrate dev --name add_material_controls_workflow
npx prisma generate
```

### Step 4: Seed Standard Controls (Optional but Recommended)

```bash
cd server
npx ts-node src/seed-standard-controls.ts
```

### Step 5: Start Development Server

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd ..
npm run dev
```

### Step 6: Access Application

- Frontend: http://localhost:5175
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/api/health

## Quick Start with Docker (Alternative)

If you prefer Docker for everything:

```bash
# Create docker-compose.yml in project root
docker-compose up -d
```

This will start PostgreSQL and the application.

## Verification Checklist

After setup, verify:

- [ ] Database connection works
- [ ] All tables created (check with Prisma Studio: `npx prisma studio`)
- [ ] Backend server starts without errors
- [ ] Frontend loads at localhost:5175
- [ ] Can login with test credentials
- [ ] Principal Risks page loads
- [ ] Material Controls workflow accessible

## Troubleshooting

**Migration fails with "relation already exists"**
```bash
cd server
npx prisma migrate reset  # WARNING: This deletes all data
npx prisma migrate dev
```

**Port already in use**
```bash
# Change PORT in server/.env
PORT=3002
```

**OpenAI API errors**
- Verify API key is correct
- Check you have credits in your OpenAI account
- Ensure no extra spaces in .env file

## Environment Variables Summary

Required in `/server/.env`:
```bash
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV=development
```

## Next Steps After Setup

1. Create your first Principal Risk
2. Walk through Material Controls workflow
3. Generate effectiveness criteria with AI
4. Review generated documentation
