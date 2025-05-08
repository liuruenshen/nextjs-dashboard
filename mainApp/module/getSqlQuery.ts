import path from 'node:path';
import fs from 'node:fs';
import { psql } from './psql';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { sql } from '@vercel/postgres';
import { Primitive } from './pgSqlTemplate';

let pool: Pool | null = null;

export async function getSqlQuery() {
  async function initLocalSqlQuery() {
    if (!pool) {
      console.log('🚀 ~ initLocalSqlQuery ~ pool: init a pool');
      const url = new URL(import.meta.url);
      const filename = path.join(
        path.dirname(url.pathname),
        '../secret/postgres-password',
      );
      const password = fs.readFileSync(filename, 'utf8');

      pool = new Pool({
        user: 'postgres',
        password,
        host: 'db',
        port: 5432,
        database: 'next-dashboard',
      });
    }

    const client = await pool.connect();
    const proxiedClient = psql(client);
    return [proxiedClient.sql, client.release.bind(client)] as const;
  }

  if (process.env.LOCAL_POSTGRES === 'true') {
    let release: (() => void) | null = null;
    let localSqlQuery:
      | (<O extends QueryResultRow>(
          query: TemplateStringsArray,
          ...values: Primitive[]
        ) => Promise<QueryResult<O>>)
      | null = null;

    [localSqlQuery, release] = await initLocalSqlQuery();
    return [localSqlQuery, release] as const;
  } else {
    return [sql, () => {}] as const;
  }
}
