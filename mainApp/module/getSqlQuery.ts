import path from 'node:path';
import fs from 'node:fs';
import { psql } from './psql';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { sql } from '@vercel/postgres';
import { Primitive } from './pgSqlTemplate';

export async function getSqlQuery() {
  let localSqlQuery:
    | (<O extends QueryResultRow>(
        query: TemplateStringsArray,
        ...values: Primitive[]
      ) => Promise<QueryResult<O>>)
    | null = null;

  async function initLocalSqlQuery() {
    const url = new URL(import.meta.url);
    const filename = path.join(
      path.dirname(url.pathname),
      '../secret/postgres-password',
    );
    const password = fs.readFileSync(filename, 'utf8');

    const pool: Pool = new Pool({
      user: 'postgres',
      password,
      host: 'db',
      port: 5432,
      database: 'next-dashboard',
    });

    const client = await pool.connect();
    const proxiedClient = psql(client);
    return proxiedClient.sql;
  }

  if (process.env.LOCAL_POSTGRES === 'true') {
    if (!localSqlQuery) {
      localSqlQuery = await initLocalSqlQuery();
    }

    return localSqlQuery;
  } else {
    return sql;
  }
}
