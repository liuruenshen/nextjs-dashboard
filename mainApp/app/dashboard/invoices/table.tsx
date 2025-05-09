import { fetchFilteredInvoices } from '@/app/lib/data';
import { ClientInvoicesTable } from '@/app/ui/invoices/table';

export default async function InvoicesTable({
  query,
  currentPage,
  sortBy,
  sortDirection,
  itemsPerPage,
}: {
  query: string;
  currentPage: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  itemsPerPage: number;
}) {
  const invoices = await fetchFilteredInvoices({
    query,
    currentPage,
    sortBy,
    sortDirection,
    itemsPerPage,
  });

  return <ClientInvoicesTable invoices={invoices} />;
}
