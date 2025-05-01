import { getAllInvoiceIds } from '@/app/lib/data';
import EditMain from '@/app/ui/invoices/edit-main';
import { isAuthenticated } from '@/app/ui/isAuthenticated';

interface EditProps {
  params: Promise<{ id: string }>;
}

/* export async function generateStaticParams() {
  return await getAllInvoiceIds();
} */

export default async function Page({ params }: EditProps) {
  const loginFirst = await isAuthenticated();

  if (loginFirst) {
    return loginFirst;
  }

  const { id } = await params;
  return <EditMain id={id} requestServerRedirect={true} />;
}
