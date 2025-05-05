import type { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { pgSqlTemplate } from './pgSqlTemplate.ts';
import type { Primitive } from './pgSqlTemplate.ts';

type ProxiedClient = PoolClient & {
  sql: <O extends QueryResultRow>(
    query: TemplateStringsArray,
    ...values: Primitive[]
  ) => Promise<QueryResult<O>>;
};

export function psql(client: PoolClient): ProxiedClient {
  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === 'sql') {
        return new Proxy(client.query.bind(client), {
          apply(target, thisArg, args) {
            const [query, values] = pgSqlTemplate(args[0], ...args.slice(1));
            return Reflect.apply(target, thisArg, [query, values]);
          },
        });
      }

      return Reflect.get(target, prop, receiver);
    },
  }) as ProxiedClient;
}
