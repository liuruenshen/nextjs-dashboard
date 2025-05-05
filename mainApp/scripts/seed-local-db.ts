import { Pool } from 'pg';
import type { PoolClient } from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { psql } from '../module/psql.ts';

import {
  seedUsers,
  seedCustomers,
  seedInvoices,
  seedRevenue,
} from './seed-functions.ts';

declare global {
  interface ImportMeta {
    /**
     * https://nodejs.org/docs/latest/api/esm.html#importmetadirname
     */
    dirname: string;
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const dirname = import.meta.dirname;
  const filename = path.join(dirname, '../secret/postgres-password');
  const password = fs.readFileSync(filename, 'utf8');

  let retryCount = 0;
  const maxRetries = 10;
  const pool: Pool = new Pool({
    user: 'postgres',
    password,
    host: 'db',
    port: 5432,
    database: 'next-dashboard',
  });

  let client: PoolClient | null = null;
  while (retryCount < maxRetries) {
    try {
      client = await pool.connect();
      break;
    } catch (error) {
      console.error('Error connecting to PostgreSQL:', error);
      console.log(`Retrying connection (${retryCount + 1}/${maxRetries})...`);
      ++retryCount;
      await sleep(1000);
    }
  }

  if (!client) {
    console.error('Failed to connect to PostgreSQL after multiple attempts');
    return;
  }

  console.log('Connected to PostgreSQL');

  const clientProxy = psql(client);

  await seedUsers(clientProxy);
  await seedCustomers(clientProxy);
  await seedInvoices(clientProxy);
  await seedRevenue(clientProxy);

  clientProxy.release();

  await pool.end();
}

main();
