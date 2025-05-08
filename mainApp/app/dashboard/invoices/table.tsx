import { fetchFilteredInvoices } from '@/app/lib/data';
import { ClientInvoicesTable } from '@/app/ui/invoices/table';

export default async function InvoicesTable({
  query,
  currentPage,
  sortBy,
  sortDirection,
}: {
  query: string;
  currentPage: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}) {
  const invoices = await fetchFilteredInvoices({
    query,
    currentPage,
    sortBy,
    sortDirection,
  });

  return <ClientInvoicesTable invoices={invoices} />;
}
