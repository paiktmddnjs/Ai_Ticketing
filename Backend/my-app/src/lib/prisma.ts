import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma';

const prismaClientSingleton = () => {
  // DATABASE_URL 파싱
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('DATABASE_URL is not set in production!');
    }
    // Build time check or development fallback
    return new PrismaClient();
  }

  try {
    const dbUrl = new URL(databaseUrl);
    const adapter = new PrismaMariaDb({
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || '3306'),
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1),
    });
    
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error('Failed to parse DATABASE_URL:', error);
    return new PrismaClient();
  }
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
