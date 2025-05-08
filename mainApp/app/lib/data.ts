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
import { unstable_noStore } from 'next/cache';

export async function fetchRevenue() {
  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  unstable_noStore();

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

export async function fetchLatestInvoices() {
  unstable_noStore();

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

export async function fetchCardData() {
  unstable_noStore();

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

interface FetchFilteredInvoicesProps {
  query: string;
  currentPage: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 6;

const SORT_BY_MAP: Record<string, [string, string]> = {
  customer: ['customers', 'name'],
  amount: ['invoices', 'amount'],
  date: ['invoices', 'date'],
  status: ['invoices', 'status'],
  email: ['customers', 'email'],
};

export async function fetchFilteredInvoices({
  query,
  currentPage,
  sortBy,
  sortDirection,
}: FetchFilteredInvoicesProps) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const sortByField = (SORT_BY_MAP[sortBy] || SORT_BY_MAP[0]).map(
    (value) => `${value}/I`,
  ) as [string, string];
  const sortDirectionSql = `${sortDirection === 'asc' ? 'ASC' : 'DESC'}/s`;

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
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  } finally {
    release();
  }
}

export async function fetchInvoicesPages(query: string) {
  unstable_noStore();

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

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  } finally {
    release();
  }
}

export async function getAllInvoiceIds(): Promise<string[]> {
  unstable_noStore();

  const [sqlQuery, release] = await getSqlQuery();
  try {
    const data = await sqlQuery<{ id: string }>`
      SELECT id FROM invoices
    `;
    console.log('🚀 ~ getAllInvoiceIds ~ data:', data);

    return data.rows.map((invoice) => invoice.id);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all invoice IDs.');
  } finally {
    release();
  }
}

export async function fetchInvoiceById(id: string) {
  unstable_noStore();

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

export async function fetchCustomers() {
  unstable_noStore();

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

export async function fetchFilteredCustomers(query: string) {
  unstable_noStore();

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

export async function getUser(email: string) {
  unstable_noStore();

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
