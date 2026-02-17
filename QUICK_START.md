# Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database (local, Docker, or Supabase)
- [ ] OpenAI API key

## 5-Minute Setup

### 1. Configure Environment Variables

Edit `/server/.env` with your credentials:

```bash
# Required: PostgreSQL Database
DATABASE_URL="postgresql://username:password@host:5432/database"

# Required: OpenAI API Key
OPENAI_API_KEY="sk-your-key-here"

# Optional: Defaults are fine
JWT_SECRET="change-this-to-random-string"
PORT=3001
NODE_ENV=development
```

**Quick Database Options:**

**Option A: Supabase (Easiest - Free Tier)**
1. Visit https://supabase.com → Create project
2. Copy connection string from Settings → Database
3. Paste as DATABASE_URL

**Option B: Docker (Local)**
```bash
docker run --name ai-tool-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_tool \
  -p 5432:5432 -d postgres:15

# Use: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_tool"
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..
npm install
```

### 3. Run Database Migration

```bash
cd server
npx prisma migrate dev --name initial_setup
npx prisma generate
```

### 4. Seed Standard Controls (Recommended)

```bash
npx ts-node src/seed-standard-controls.ts
```

This adds 32 baseline controls across Operations, Reporting, Financial, and Compliance domains.

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6. Access Application

🌐 **Frontend**: http://localhost:5175
🔌 **Backend API**: http://localhost:3001/api
💚 **Health Check**: http://localhost:3001/api/health

### 7. Login

Default credentials (if using seed data):
- Email: `admin@example.com`
- Password: `admin123`

## What to Try First

### 1. Create a Principal Risk
Navigate to **Principal Risks** → **Add Principal Risk**

Example:
- **Title**: Cybersecurity breach exposing customer data
- **Threat Lens**: Business Model, Performance
- **Domains**: Operations, Compliance
- **Owner**: CISO

### 2. Generate Effectiveness Criteria
Navigate to **Effectiveness Criteria** → **AI Generate**

Fill in organizational context:
- Regulatory Posture: Regulated
- Operating Stage: Steady-state
- Complexity: Group (moderate)
- Governance Maturity: Developing

AI will generate 5-7 criteria with B/H/C categorization.

### 3. Build Material Controls
Navigate to **Material Controls** → Select your principal risk

Walk through 6-step workflow:
1. Select Risk
2. Map Processes
3. Assess Maturity
4. Review Standard Controls
5. Capture As-Is Controls
6. Analyze Gaps → Generate To-Be Controls

### 4. Export RCM
At Step 6, export your Risk-Control Matrix (As-Is and To-Be versions).

## Troubleshooting

### "Prisma migrate failed"
```bash
# Reset and retry
cd server
npx prisma migrate reset
npx prisma migrate dev
```

### "Port 3001 already in use"
Change PORT in `/server/.env` to 3002 or another available port.

### "OpenAI API error"
- Verify API key is correct (no extra spaces)
- Check you have credits at https://platform.openai.com/usage
- Ensure key starts with `sk-`

### "Cannot connect to database"
- Verify DATABASE_URL format: `postgresql://user:pass@host:5432/dbname`
- Check database is running: `psql $DATABASE_URL`
- For Docker: `docker ps` to verify container is running

### Frontend won't load
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Project Structure

```
ai-tool/
├── src/                    # Frontend (React + TypeScript)
│   ├── pages/             # Page components
│   ├── components/        # Reusable UI components
│   ├── services/          # API service layer
│   └── types/             # TypeScript definitions
├── server/                # Backend (Express + Prisma)
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic (AI, etc.)
│   │   └── index.ts      # Server entry point
│   └── prisma/
│       └── schema.prisma # Database schema
└── docs/                  # Documentation
```

## Key Features Implemented

✅ **Effectiveness Criteria** with AI generation and B/H/C categorization
✅ **Principal Risks** register with threat lens tagging
✅ **Material Controls** 6-step workflow with gap analysis
✅ **Process Maturity Assessment** questionnaire
✅ **Standard Controls Library** (32 baseline controls)
✅ **As-Is/To-Be Control Mapping**
✅ **Risk-Control Matrix (RCM)** generation
✅ **AI-powered** criteria generation and control suggestions

## Next Steps

1. ✅ Complete setup above
2. 📝 Create 3-5 principal risks for your organization
3. 🎯 Generate effectiveness criteria tailored to your context
4. 🔄 Walk through Material Controls workflow for one risk
5. 📊 Review generated RCM and implementation roadmap
6. 🚀 Customize standard controls library for your industry

## Getting Help

- 📖 See `IMPLEMENTATION_SUMMARY.md` for technical details
- 🔧 See `SETUP_INSTRUCTIONS.md` for detailed configuration
- 📋 See `MATERIAL_CONTROLS_WORKFLOW.md` for workflow guide
- 🗄️ See `MIGRATION_GUIDE.md` for database schema info

## Production Deployment

For production deployment to Render, Heroku, or similar:

1. Set environment variables in platform dashboard
2. Update `DATABASE_URL` to production database
3. Run migrations: `npx prisma migrate deploy`
4. Build frontend: `npm run build`
5. Start server: `npm start`

See `server/render.yaml` for Render-specific configuration.

---

**Estimated Setup Time**: 5-10 minutes (depending on database choice)

**Ready to go?** Start with Step 1 above! 🚀
