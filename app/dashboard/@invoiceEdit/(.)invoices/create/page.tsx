import { fetchCustomers } from '@/app/lib/data';
import Form from '@/app/ui/invoices/create-form';
import { Modal } from '@/app/ui/modal';

export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <Modal>
      <Form customers={customers} requestServerRedirect={false} />
    </Modal>
  );
}
