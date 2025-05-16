import { config } from 'dotenv';
import * as schema from './schema';
// import { drizzle } from 'drizzle-orm/libsql';
// import { createClient } from '@libsql/client';
// import { drizzle } from 'drizzle-orm/node-postgres';
// import { pgSchema } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({ path: '.env.local' });

// const client = createClient({
//   url: process.env.TURSO_DATABASE_URL!,
//   authToken: process.env.TURSO_AUTH_TOKEN!,
// });

// export const db = drizzle(client , {schema });

// const client = pgSchema

// export const db = drizzle(process.env.DATABASE_URL!);

const queryClient = postgres(process.env.DATABASE_URL!, {

});
export const db = drizzle(queryClient, { schema: schema});