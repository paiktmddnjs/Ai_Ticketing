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
    const requiresSsl = dbUrl.searchParams.get('ssl-mode')?.toUpperCase() === 'REQUIRED';
    const caCertificate = process.env.DATABASE_CA_CERT || process.env.AIVEN_CA_CERT;
    const adapter = new PrismaMariaDb({
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || '3306'),
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.substring(1),
      connectTimeout: 10000,
      acquireTimeout: 20000,
      initializationTimeout: 20000,
      ssl: requiresSsl
        ? caCertificate
          ? { ca: caCertificate.replace(/\\n/g, '\n'), rejectUnauthorized: true }
          : { rejectUnauthorized: false }
        : undefined,
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
