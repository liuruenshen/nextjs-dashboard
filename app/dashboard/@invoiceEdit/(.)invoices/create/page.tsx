import { fetchCustomers } from '@/app/lib/data';
import Form from '@/app/ui/invoices/create-form';
import { isAuthenticated } from '@/app/ui/isAuthenticated';
import { Modal } from '@/app/ui/modal';

export default async function Page() {
  const loginFirst = await isAuthenticated();

  if (loginFirst) {
    return loginFirst;
  }

  const customers = await fetchCustomers();

  return (
    <Modal>
      <Form customers={customers} requestServerRedirect={false} />
    </Modal>
  );
}
