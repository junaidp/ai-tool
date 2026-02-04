# Backend API Server

Express + TypeScript + Prisma backend for the Risk & Control Management System.

## Database Schema

The database uses **SQLite** for development (easy setup, no separate DB server needed) and can be switched to **PostgreSQL** for production.

### Core Tables

- **User** - Authentication and user management
- **EffectivenessCriteria** - Board-approved effectiveness framework
- **FrameworkComponent** - Governance, risk taxonomy, controls, etc.
- **MaterialControl** - Material controls register with materiality scoring
- **Risk** - Risk library with inherent/residual levels
- **Control** - Control library (preventive/detective/corrective)
- **TestPlan** - Testing schedule and results
- **Issue** - Issues and remediation tracking
- **IntegrationStatus** - System integration monitoring
- **ControlGap** - Identified control gaps
- **ApprovalWorkflow** - Governance approval workflows
- **AuditLog** - Complete audit trail

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates SQLite file)
npm run db:push

# Seed initial data
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user

### Core Modules
- `GET/POST/PATCH/DELETE /api/effectiveness-criteria`
- `GET/POST/PATCH /api/framework-components`
- `GET/POST/PATCH /api/material-controls`
- `GET/POST /api/risks`
- `GET/POST /api/controls`
- `GET/POST/PATCH /api/test-plans`
- `GET/POST/PATCH /api/issues`
- `GET/POST/PATCH /api/integrations`
- `GET/POST/PATCH /api/control-gaps`
- `GET/POST/PATCH /api/approvals`
- `GET /api/dashboard` - Aggregated dashboard data

### Health Check
- `GET /api/health` - Server health status

## Default Credentials

After seeding:
- **Email**: john.doe@example.com
- **Password**: admin123

## Database Management

### View Database (Prisma Studio)
```bash
npm run db:studio
```

Opens a web UI at `http://localhost:5555` to browse and edit data.

### Reset Database
```bash
# Delete the database file
rm dev.db

# Recreate and seed
npm run db:push
npm run db:seed
```

### Migrations (for production)
```bash
npm run db:migrate
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="file:./dev.db"  # SQLite for dev
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV=development
```

### For PostgreSQL (Production)

Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/risk_control_db"
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  # Change from sqlite
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npm run db:migrate
npm run db:seed
```

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── routes/                # API route handlers
│   │   ├── auth.ts
│   │   ├── effectivenessCriteria.ts
│   │   ├── materialControls.ts
│   │   └── ...
│   ├── db.ts                  # Prisma client
│   ├── index.ts               # Express server
│   └── seed.ts                # Database seeding
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for secure password storage
- **CORS** - Configured for frontend origin
- **Input Validation** - Using Zod (can be extended)
- **Audit Logging** - All changes tracked in AuditLog table

## Next Steps

1. **Add authentication middleware** to protect routes
2. **Implement role-based access control (RBAC)**
3. **Add input validation** with Zod schemas
4. **Implement audit logging** for all mutations
5. **Add file upload** for evidence attachments
6. **Implement real-time updates** with WebSockets
7. **Add email notifications** for approvals/issues
8. **Implement data export** (PDF/Excel generation)

## Production Deployment

1. Switch to PostgreSQL database
2. Set secure JWT_SECRET
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up database backups
6. Implement rate limiting
7. Add monitoring (e.g., Sentry, DataDog)
8. Use environment-specific configs
