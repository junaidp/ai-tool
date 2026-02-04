# Backend & Database Setup Guide

## Quick Start

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Create database and push schema
npm run db:push

# Seed with initial data
npm run db:seed
```

### 3. Start Backend Server

```bash
npm run dev
```

Backend runs on: `http://localhost:3001`

### 4. Start Frontend (in new terminal)

```bash
cd ..  # Back to root
npm run dev
```

Frontend runs on: `http://localhost:5174`

## What's Included

### Database (SQLite)
- **14 tables** with proper relationships
- **Prisma ORM** for type-safe database access
- **Automatic migrations** and version control
- **Seed data** matching your frontend mock data

### API Endpoints
All endpoints available at `http://localhost:3001/api/`:

- ✅ `/auth/login`, `/auth/register`, `/auth/me`
- ✅ `/effectiveness-criteria` (GET, POST, PATCH, DELETE)
- ✅ `/framework-components` (GET, POST, PATCH)
- ✅ `/material-controls` (GET, POST, PATCH)
- ✅ `/risks` (GET, POST)
- ✅ `/controls` (GET, POST)
- ✅ `/test-plans` (GET, POST, PATCH)
- ✅ `/issues` (GET, POST, PATCH)
- ✅ `/integrations` (GET, POST, PATCH)
- ✅ `/control-gaps` (GET, POST, PATCH)
- ✅ `/approvals` (GET, POST, PATCH)
- ✅ `/dashboard` (GET - aggregated data)

### Features Implemented
- 🔐 **JWT Authentication** - Secure login/register
- 🗄️ **SQLite Database** - Easy dev setup, no external DB needed
- 📊 **Prisma ORM** - Type-safe database queries
- 🔗 **CORS Enabled** - Frontend can connect
- 📝 **Audit Trail** - AuditLog table for tracking changes
- 👥 **User Management** - Role-based users

## Default Login

After seeding, login with:
- **Email**: `john.doe@example.com`
- **Password**: `admin123`

## Frontend Integration

The frontend is already configured to use the backend API! 

Just ensure both servers are running:
1. Backend on port 3001
2. Frontend on port 5174

The frontend will automatically use the backend instead of mock data.

## Database Management

### View Database in Browser
```bash
cd server
npm run db:studio
```
Opens at `http://localhost:5555` - GUI to browse/edit all data

### Reset Database
```bash
cd server
rm dev.db  # Delete database
npm run db:push  # Recreate
npm run db:seed  # Reseed data
```

## Testing the API

### Using curl:
```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"admin123"}'

# Get material controls (use token from login)
curl http://localhost:3001/api/material-controls \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using the Frontend:
Just use the app normally - it now saves to the real database!

## Project Structure

```
risk-control-system/
├── src/                    # Frontend (React)
│   └── services/
│       ├── mockApi.ts      # Old mock data (kept for reference)
│       └── api.ts          # NEW - Real API service
│
└── server/                 # Backend (Express + Prisma)
    ├── prisma/
    │   └── schema.prisma   # Database schema (14 tables)
    ├── src/
    │   ├── routes/         # 11 API route files
    │   ├── index.ts        # Express server
    │   ├── db.ts           # Prisma client
    │   └── seed.ts         # Database seeder
    └── dev.db              # SQLite database file (created after setup)
```

## Switching Between Mock and Real Data

The app now uses **real backend by default**.

To switch back to mock data temporarily:
1. Stop the backend server
2. Frontend will fall back to mock data (or show errors)

Or update `src/services/mockApi.ts` imports in pages to use the old mock service.

## Production Notes

For production deployment:

1. **Switch to PostgreSQL**:
   - Update `server/.env`: `DATABASE_URL="postgresql://..."`
   - Update `server/prisma/schema.prisma`: `provider = "postgresql"`
   - Run migrations: `npm run db:migrate`

2. **Environment Variables**:
   - Set secure `JWT_SECRET`
   - Configure production `DATABASE_URL`
   - Set proper CORS origins

3. **Security**:
   - Enable HTTPS
   - Add rate limiting
   - Implement RBAC middleware
   - Add input validation with Zod

## Troubleshooting

**Port 3001 already in use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database errors:**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

**Frontend can't connect:**
- Check backend is running on port 3001
- Check frontend `.env` has `VITE_API_URL=http://localhost:3001/api`
- Check browser console for CORS errors

## Next Steps

1. ✅ Backend and database are ready
2. ✅ API endpoints implemented
3. ✅ Frontend connected to backend
4. 🔄 Add authentication middleware to protect routes
5. 🔄 Implement role-based access control
6. 🔄 Add comprehensive error handling
7. 🔄 Implement audit logging for all changes
8. 🔄 Add file upload for evidence attachments

Enjoy your full-stack Risk & Control Management System! 🚀
