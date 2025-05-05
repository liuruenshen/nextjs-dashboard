import { db } from '@vercel/postgres';
import {
  seedUsers,
  seedCustomers,
  seedInvoices,
  seedRevenue,
} from './seed-functions.js';

async function main() {
  const client = await db.connect();

  await seedUsers(client);
  await seedCustomers(client);
  await seedInvoices(client);
  await seedRevenue(client);

  await client.release();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
