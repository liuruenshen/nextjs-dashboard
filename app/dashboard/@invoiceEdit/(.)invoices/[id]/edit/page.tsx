import EditMain from '@/app/ui/invoices/edit-main';
import { Modal } from '@/app/ui/modal';

interface EditProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: EditProps) {
  const { id } = await params;

  return (
    <Modal>
      <EditMain id={id} requestServerRedirect={false} />
    </Modal>
  );
}
