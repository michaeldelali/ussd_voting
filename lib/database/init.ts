import { prisma } from './prisma';

export async function initDatabase() {
  try {
    await prisma.$connect();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

export { prisma };