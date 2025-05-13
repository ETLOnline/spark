import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';
import mysql from 'mysql2';

config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connection = mysql.createConnection(dbUrl);

// Initialize Drizzle with the connection
export const db = drizzle(connection, {
  schema,
  mode: 'default'
});