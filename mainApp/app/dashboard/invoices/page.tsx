import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/dashboard/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton, PaginationSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';
import { Metadata } from 'next';
import { isAuthenticated } from '@/app/ui/isAuthenticated';
import { ItemsPerPage } from '@/app/ui/invoices/itemsPerPage';
import {
  ITEMS_PER_PAGE,
  MAX_ITEMS_PER_PAGE,
  MIN_ITEMS_PER_PAGE,
} from '@/app/lib/const';
import { clamp, getSafeNumber } from '@/app/lib/utils';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Invoices',
};

interface InvoicesPageProps {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    itemsPerPage?: string;
  }>;
}

interface PaginationWrapperProps {
  query: string;
  itemsPerPageParam: number;
}

async function PaginationWrapper({
  query,
  itemsPerPageParam,
}: PaginationWrapperProps) {
  if (process.env.DEBUG_LOG) {
    console.log('calling fetchInvoicesPages in PaginationWrapper');
  }

  const { totalPages, itemsPerPage } = await fetchInvoicesPages(
    query,
    itemsPerPageParam,
  );
  return (
    <>
      <Pagination totalPages={totalPages} />
      <ItemsPerPage itemsPerPage={itemsPerPage} />
    </>
  );
}

export default async function Page({ searchParams }: InvoicesPageProps) {
  const loginFirst = await isAuthenticated();

  if (loginFirst) {
    return loginFirst;
  }

  const params = await searchParams;
  const query = params?.query || '';
  const currentPage = getSafeNumber(params?.page, 1);
  const sortBy = params?.sortBy || 'customer';
  const sortDirection = params?.sortDirection || 'asc';
  const itemsPerPage = clamp(
    MIN_ITEMS_PER_PAGE,
    getSafeNumber(params?.itemsPerPage, ITEMS_PER_PAGE),
    MAX_ITEMS_PER_PAGE,
  );

  if (process.env.DEBUG_LOG) {
    console.log('calling fetchInvoicesPages in /dashboard/invoices/page.tsx');
  }
  const { totalPages } = await fetchInvoicesPages(query, itemsPerPage);
  if (currentPage > totalPages) {
    const urlParams = new URLSearchParams({ ...params, page: '1' });
    redirect(`/dashboard/invoices?${urlParams.toString()}`);
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table
          query={query}
          currentPage={currentPage}
          sortBy={sortBy}
          sortDirection={sortDirection}
          itemsPerPage={itemsPerPage}
        />
      </Suspense>
      <div className="mt-5 flex w-full justify-center gap-3">
        <Suspense fallback={<PaginationSkeleton />}>
          <PaginationWrapper query={query} itemsPerPageParam={itemsPerPage} />
        </Suspense>
      </div>
    </div>
  );
}
