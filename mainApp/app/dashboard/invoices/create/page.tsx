import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
import { isAuthenticated } from '@/app/ui/isAuthenticated';

export default async function Page() {
  const loginFirst = await isAuthenticated();

  if (loginFirst) {
    return loginFirst;
  }

  const customers = await fetchCustomers();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} requestServerRedirect={true} />
    </main>
  );
}
