import EditMain from '@/app/ui/invoices/edit-main';
import { isAuthenticated } from '@/app/ui/isAuthenticated';
import { Modal } from '@/app/ui/modal';

interface EditProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: EditProps) {
  const loginFirst = await isAuthenticated();

  if (loginFirst) {
    return loginFirst;
  }

  const { id } = await params;

  return (
    <Modal>
      <EditMain id={id} requestServerRedirect={false} />
    </Modal>
  );
}
