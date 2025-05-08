import type { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { pgFormatTemplate } from './pgSqlTemplate.ts';
import type { Primitive } from './pgSqlTemplate.ts';
import { sql } from '@vercel/postgres';

type ProxiedClient = PoolClient & {
  sql: <O extends QueryResultRow>(
    query: TemplateStringsArray,
    ...values: Primitive[]
  ) => Promise<QueryResult<O>>;
};

export function vercelSqlFormat<O extends QueryResultRow>(
  query: TemplateStringsArray,
  ...values: Primitive[]
) {
  const formattedQuery = pgFormatTemplate(query, ...values);
  /**
   * https://github.com/vercel/storage/issues/495
   */
  return sql.query<O>(formattedQuery);
}

export function psql(client: PoolClient): ProxiedClient {
  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === 'sql') {
        return new Proxy(client.query.bind(client), {
          apply(target, thisArg, args) {
            const query = pgFormatTemplate(args[0], ...args.slice(1));
            return Reflect.apply(target, thisArg, [query]);
          },
        });
      }

      return Reflect.get(target, prop, receiver);
    },
  }) as ProxiedClient;
}
