import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import {
  fetchCustomers,
  fetchInvoiceById,
  getAllInvoiceIds,
} from '@/app/lib/data';
import { notFound } from 'next/navigation';

interface EditProps {
  params: { id: string };
}

export async function generateStaticParams() {
  return await getAllInvoiceIds();
}

export default async function Page({ params: { id } }: EditProps) {
  const [customers, invoice] = await Promise.all([
    fetchCustomers(),
    fetchInvoiceById(id),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
