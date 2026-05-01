import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Test query execution
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('📊 Database info:', result);
    
    // Test if we can list tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('\n📋 Tables in database:', tables);
    
    console.log('\n✅ All connection tests passed!');
  } catch (error: any) {
    console.error('❌ Connection failed!\n');
    console.error('Error details:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
    
    if (error.message.includes('Tenant or user not found')) {
      console.error('\n💡 This error usually means:');
      console.error('   1. The database password is incorrect');
      console.error('   2. The project reference in the URL is wrong');
      console.error('   3. The database user doesn\'t exist');
      console.error('\n📝 Check your DATABASE_URL in .env file');
      console.error('   Format: postgresql://postgres.{project-ref}:{password}@aws-0-{region}.pooler.supabase.com:5432/postgres');
      console.error('   Or: postgresql://postgres:{password}@db.{project-ref}.supabase.co:5432/postgres');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
