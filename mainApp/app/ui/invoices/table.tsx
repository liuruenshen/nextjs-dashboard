'use client';

import Image from 'next/image';
import { UpdateInvoice, DeleteInvoice } from '@/app/ui/invoices/buttons';
import InvoiceStatus from '@/app/ui/invoices/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { InvoicesTable } from '@/app/lib/definitions';
import { useRouter, useSearchParams } from 'next/navigation';

type ColumnId = 'customer' | 'email' | 'amount' | 'date' | 'status';

interface SortingIndicatorProps {
  columnId: ColumnId;
  activeColumnId: string;
  direction: 'asc' | 'desc';
  onClick: (direction: SortingIndicatorProps['direction']) => void;
}

function SortingIndicator({
  columnId,
  activeColumnId,
  direction,
  onClick,
}: SortingIndicatorProps) {
  if (columnId !== activeColumnId) {
    return (
      <div
        className="flex cursor-pointer flex-col"
        onClick={() => onClick('asc')}
      >
        <span className="material-symbols-outlined [&.material-symbols-outlined]:text-4xl [&.material-symbols-outlined]:text-gray-500 [&.material-symbols-outlined]:[line-height:0.6rem]">
          arrow_drop_up
        </span>
        <span className="material-symbols-outlined [&.material-symbols-outlined]:text-4xl [&.material-symbols-outlined]:text-gray-500 [&.material-symbols-outlined]:[line-height:0.6rem]">
          arrow_drop_down
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex cursor-pointer flex-col [&[data-order=desc]]:rotate-180"
      onClick={() => onClick(direction === 'asc' ? 'desc' : 'asc')}
      data-order={direction}
    >
      <span className="material-symbols-outlined [&.material-symbols-outlined]:text-5xl [&.material-symbols-outlined]:[line-height:1rem]">
        arrow_drop_up
      </span>
    </div>
  );
}

interface InvoicesTableProps {
  invoices: InvoicesTable[];
}

function getSortingDirection(value: string | null): 'asc' | 'desc' {
  return value !== 'asc' && value !== 'desc' ? 'asc' : value;
}

function getSortBy(value: string | null): ColumnId {
  if (value === 'customer') return value;
  if (value === 'email') return value;
  if (value === 'amount') return value;
  if (value === 'date') return value;
  if (value === 'status') return value;

  return 'customer';
}

export function ClientInvoicesTable({ invoices }: InvoicesTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortingActiveColumnId = getSortBy(searchParams.get('sortBy'));
  const sortingDirection = getSortingDirection(
    searchParams.get('sortDirection'),
  );

  function sorting(activeColumnId: string, direction: 'asc' | 'desc') {
    const searchParamsData = Object.fromEntries(searchParams.entries());

    searchParamsData.sortBy = activeColumnId;
    searchParamsData.sortDirection = direction;

    const searchParamsString = new URLSearchParams(searchParamsData).toString();
    router.replace(`/dashboard/invoices?${searchParamsString}`);
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {invoices?.map((invoice) => (
              <div
                key={invoice.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={invoice.image_url}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${invoice.name}'s profile picture`}
                      />
                      <p>{invoice.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{invoice.email}</p>
                  </div>
                  <InvoiceStatus status={invoice.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <p>{formatDateToLocal(invoice.date)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden w-full min-w-full table-fixed text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th
                  scope="col"
                  className="w-[24%] items-center gap-1 px-4 py-5 font-medium sm:pl-6"
                >
                  <div className="flex items-center gap-1">
                    <span>Customer</span>
                    <SortingIndicator
                      columnId="customer"
                      activeColumnId={sortingActiveColumnId}
                      direction={sortingDirection}
                      onClick={(direction) => {
                        sorting('customer', direction);
                      }}
                    />
                  </div>
                </th>
                <th scope="col" className="w-[24%] px-3 py-5 font-medium">
                  <div className="flex items-center gap-1">
                    <span>Email</span>
                    <SortingIndicator
                      columnId="email"
                      activeColumnId={sortingActiveColumnId}
                      direction={sortingDirection}
                      onClick={(direction) => {
                        sorting('email', direction);
                      }}
                    />
                  </div>
                </th>
                <th scope="col" className="w-[15%] px-3 py-5 font-medium">
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    <SortingIndicator
                      columnId="amount"
                      activeColumnId={sortingActiveColumnId}
                      direction={sortingDirection}
                      onClick={(direction) => {
                        sorting('amount', direction);
                      }}
                    />
                  </div>
                </th>
                <th scope="col" className="w-[15%] px-3 py-5 font-medium">
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <SortingIndicator
                      columnId="date"
                      activeColumnId={sortingActiveColumnId}
                      direction={sortingDirection}
                      onClick={(direction) => {
                        sorting('date', direction);
                      }}
                    />
                  </div>
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <SortingIndicator
                      columnId="status"
                      activeColumnId={sortingActiveColumnId}
                      direction={sortingDirection}
                      onClick={(direction) => {
                        sorting('status', direction);
                      }}
                    />
                  </div>
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoices?.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={invoice.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${invoice.name}'s profile picture`}
                      />
                      <p className="overflow-hidden overflow-ellipsis">
                        {invoice.name}
                      </p>
                    </div>
                  </td>
                  <td className="overflow-hidden overflow-ellipsis whitespace-nowrap px-3 py-3">
                    {invoice.email}
                  </td>
                  <td className="overflow-hidden overflow-ellipsis whitespace-nowrap px-3 py-3">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(invoice.date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus status={invoice.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInvoice id={invoice.id} />
                      <DeleteInvoice id={invoice.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
