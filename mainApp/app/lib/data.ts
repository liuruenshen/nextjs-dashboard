import { cache } from 'react';
import { getSqlQuery } from '../../module/getSqlQuery';

import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

async function _fetchRevenue() {
  const [sqlQuery, release] = await getSqlQuery();
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    const data = await sqlQuery<Revenue>`SELECT * FROM revenue`;

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  } finally {
    release();
  }
}

/**
 * https://nextjs.org/docs/app/deep-dive/caching#react-cache-function
 * https://react.dev/reference/react/cache
 */
export const fetchRevenue = cache(_fetchRevenue);

async function _fetchLatestInvoices() {
  const [sqlQuery, release] = await getSqlQuery();
  try {
    const data = await sqlQuery<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  } finally {
    release();
  }
}

export const fetchLatestInvoices = cache(_fetchLatestInvoices);

async function _fetchCardData() {
  const [sqlQuery, release] = await getSqlQuery();

  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    /*     const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`; */

    const data = await sqlQuery`
    SELECT invoices_num, customers_num, paid_invoices_num, pending_invoices_num FROM 
      ( SELECT count(*) as invoices_num FROM "invoices" ),
      ( SELECT count(*) as customers_num FROM "customers" ),
      ( SELECT SUM(CASE WHEN "status" = 'paid' THEN "amount" ELSE 0 END) as paid_invoices_num FROM "invoices"),
      ( SELECT SUM(CASE WHEN "status" = 'pending' THEN "amount" ELSE 0 END) as pending_invoices_num FROM "invoices" )
    `;

    const numberOfInvoices = Number(data.rows[0].invoices_num ?? '0');
    const numberOfCustomers = Number(data.rows[0].customers_num ?? '0');
    const totalPaidInvoices = formatCurrency(
      data.rows[0].paid_invoices_num ?? '0',
    );
    const totalPendingInvoices = formatCurrency(
      data.rows[0].pending_invoices_num ?? '0',
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  } finally {
    release();
  }
}

export const fetchCardData = cache(_fetchCardData);

interface FetchFilteredInvoicesProps {
  query: string;
  currentPage: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  itemsPerPage: number;
}

const SORT_BY_MAP: Record<string, [string, string]> = {
  customer: ['customers', 'name'],
  amount: ['invoices', 'amount'],
  date: ['invoices', 'date'],
  status: ['invoices', 'status'],
  email: ['customers', 'email'],
};

async function _fetchFilteredInvoices({
  query,
  currentPage,
  sortBy,
  sortDirection,
  itemsPerPage,
}: FetchFilteredInvoicesProps) {
  const sortByField = (SORT_BY_MAP[sortBy] || SORT_BY_MAP[0]).map(
    (value) => `${value}/I`,
  ) as [string, string];
  const sortDirectionSql = `${sortDirection === 'asc' ? 'ASC' : 'DESC'}/s`;

  const offset = (currentPage - 1) * itemsPerPage;

  const [sqlQuery, release] = await getSqlQuery();
  try {
    const invoices = await sqlQuery<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY ${sortByField[0]}.${sortByField[1]} ${sortDirectionSql}
      LIMIT ${itemsPerPage} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  } finally {
    release();
  }
}

export const fetchFilteredInvoices = cache(_fetchFilteredInvoices);

async function _fetchInvoicesPages(query: string, itemsPerPage: number) {
  if (process.env.DEBUG_LOG) {
    console.log('🚀 ~ _fetchInvoicesPages ~ query:', query, itemsPerPage);
  }

  const [sqlQuery, release] = await getSqlQuery();
  try {
    const count = await sqlQuery`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
    return { totalPages, itemsPerPage };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  } finally {
    release();
  }
}

export const fetchInvoicesPages = cache(_fetchInvoicesPages);

async function _getAllInvoiceIds(): Promise<string[]> {
  const [sqlQuery, release] = await getSqlQuery();
  try {
    const data = await sqlQuery<{ id: string }>`
      SELECT id FROM invoices
    `;

    return data.rows.map((invoice) => invoice.id);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all invoice IDs.');
  } finally {
    release();
  }
}

export const getAllInvoiceIds = cache(_getAllInvoiceIds);

async function _fetchInvoiceById(id: string) {
  /**
   * Uncomment this line to test the 404 not-found error handling
   */
  //return undefined;

  const [sqlQuery, release] = await getSqlQuery();
  try {
    const data = await sqlQuery<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  } finally {
    release();
  }
}

export const fetchInvoiceById = cache(_fetchInvoiceById);

async function _fetchCustomers() {
  const [sqlQuery, release] = await getSqlQuery();
  try {
    const data = await sqlQuery<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  } finally {
    release();
  }
}

export const fetchCustomers = cache(_fetchCustomers);

async function _fetchFilteredCustomers(query: string) {
  const [sqlQuery, release] = await getSqlQuery();
  try {
    const data = await sqlQuery<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  } finally {
    release();
  }
}

export const fetchFilteredCustomers = cache(_fetchFilteredCustomers);

async function _getUser(email: string) {
  const [sqlQuery, release] = await getSqlQuery();
  try {
    const user = await sqlQuery`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  } finally {
    release();
  }
}

export const getUser = cache(_getUser);
