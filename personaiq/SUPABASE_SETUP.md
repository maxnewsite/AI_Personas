# Supabase Setup Guide for PersonaIQ

This guide will help you set up Supabase as the database backend for PersonaIQ.

## Prerequisites

- A Supabase account (free tier works great)
- Node.js and npm installed
- PersonaIQ repository cloned

## Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in/up
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `PersonaIQ` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
   - **Pricing Plan**: Free tier is perfect for development

4. Click **"Create new project"**
5. Wait ~2 minutes for your database to be provisioned

### 2. Get Your Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **"Connection string"**
3. Select **"URI"** tab
4. Copy the connection string - it looks like:
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
5. **Important**: Replace `[YOUR-PASSWORD]` with the database password you created in step 1

### 3. Configure Your Local Environment

1. In the `personaiq` directory, update your `.env` file:

```bash
# Supabase Database Connection
DATABASE_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Direct Connection (for migrations)
DIRECT_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true"

# NextAuth
NEXTAUTH_SECRET="development-secret-key-change-in-production-abc123"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
APP_NAME="PersonaIQ"
APP_URL="http://localhost:3000"
```

2. Replace `[project-ref]` and `[YOUR-PASSWORD]` with your actual values

### 4. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create the database schema
npx prisma db push

# Seed the database with demo data
npm run db:seed
```

### 5. Verify the Setup

1. Open Supabase Studio:
   - Go to your project → **Table Editor**
   - You should see all 13 tables created

2. Check the data:
   - Click on the **"User"** table
   - You should see 8 demo users
   - Check **"Campaign"** table - should have 1 demo campaign

3. Test the connection:
```bash
npx prisma studio
```
This opens a GUI at http://localhost:5555 where you can browse your data

### 6. Start the Application

```bash
npm run dev
```

Visit http://localhost:3000 and log in with:
- **Admin**: `admin@personaiq.com` / `admin123`
- **Coach**: `coach@personaiq.com` / `coach123`
- **Employee**: `employee@personaiq.com` / `emp123`

## Database Tables Created

Your Supabase database will have these 13 tables:

1. **User** - Authentication and user profiles
2. **Employee** - Employee profiles and persona data
3. **Coach** - Coach profiles and specializations
4. **Campaign** - Assessment campaigns
5. **AssessmentResponse** - Completed assessments
6. **PersonaHistory** - Persona evolution tracking
7. **PersonaProfile** - Persona definitions
8. **WinnerCriteria** - Performance thresholds
9. **CoachingNote** - Coaching session notes
10. **Resource** - Learning resources
11. **AuditLog** - System audit trail
12. **Notification** - User notifications
13. **_prisma_migrations** - Migration history

## Supabase Features You Can Use

### Built-in Features:

1. **Database Backups** (Settings → Database → Backups)
   - Automatic daily backups on free tier
   - Manual backups anytime

2. **SQL Editor** (SQL Editor tab)
   - Run custom queries
   - Create functions and triggers

3. **Real-time** (optional for future features)
   - Subscribe to database changes
   - Perfect for notifications

4. **Storage** (optional for future features)
   - Store assessment exports
   - User profile images

5. **Auth Integration** (optional)
   - Can replace NextAuth.js
   - Built-in OAuth providers

## Troubleshooting

### Connection Issues

**Problem**: `Can't reach database server`
- **Solution**: Check your connection string has the correct password
- **Solution**: Ensure your Supabase project is running (not paused)

**Problem**: `SSL connection required`
- **Solution**: Add `?sslmode=require` to your connection string

**Problem**: `Too many connections`
- **Solution**: Use connection pooling (already included in the default connection string)

### Migration Issues

**Problem**: `Schema already exists`
- **Solution**: Your database already has tables. Either:
  1. Drop all tables in Supabase SQL Editor:
     ```sql
     DROP SCHEMA public CASCADE;
     CREATE SCHEMA public;
     ```
  2. Or use `npx prisma migrate reset` (this will delete all data)

**Problem**: `Permission denied`
- **Solution**: Make sure you're using the correct database password

## Production Deployment

When deploying to production:

1. **Use Environment Variables**
   - Never commit your connection string
   - Use Vercel/Railway environment variables

2. **Enable Connection Pooling**
   - Already included in default Supabase connection string
   - Uses PgBouncer for efficient connections

3. **Set up Row Level Security (RLS)** (optional but recommended)
   - Go to Authentication → Policies
   - Add policies for your tables

4. **Monitor Usage**
   - Supabase Dashboard → Reports
   - Watch database size and API calls

## Cost Estimates

**Free Tier** (Perfect for development):
- 500 MB database space
- 2 GB bandwidth
- 50,000 monthly active users
- 7 days of backups

**Pro Tier** ($25/month):
- 8 GB database space
- 50 GB bandwidth
- 100,000 monthly active users
- Daily backups

For PersonaIQ in production with 100-500 users, the Free tier should work great!

## Support

- Supabase Docs: https://supabase.com/docs
- Prisma + Supabase Guide: https://supabase.com/docs/guides/integrations/prisma
- PersonaIQ Issues: https://github.com/your-repo/issues

## Next Steps

Once your Supabase database is set up:

1. ✅ Test all dashboards (Admin, Coach, Manager, Employee)
2. ✅ Complete an assessment end-to-end
3. ✅ Create a new campaign
4. ✅ Add coaching notes
5. Deploy to production!
