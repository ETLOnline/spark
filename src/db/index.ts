import { config } from 'dotenv';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({ path: '.env.local' });

const queryClient = postgres(process.env.DATABASE_URL!, {

});
export const db = drizzle(queryClient, { schema: schema});