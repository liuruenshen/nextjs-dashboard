'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '../input';
import {
  ITEMS_PER_PAGE,
  MAX_ITEMS_PER_PAGE,
  MIN_ITEMS_PER_PAGE,
} from '@/app/lib/const';
import { clamp, getSafeNumber } from '@/app/lib/utils';
import { useDebouncedCallback } from 'use-debounce';
import { ChangeEvent } from 'react';

interface ItemsPerPageProps {
  itemsPerPage: number;
}

function getItemsPerPage(
  itemsPerPageParam: string | number,
  defaultValue: number,
) {
  return clamp(
    MIN_ITEMS_PER_PAGE,
    getSafeNumber(itemsPerPageParam, defaultValue),
    MAX_ITEMS_PER_PAGE,
  );
}

export function ItemsPerPage({ itemsPerPage }: ItemsPerPageProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const searchParamData = Object.fromEntries(searchParams.entries());
  const itemsNumber = getItemsPerPage(
    searchParamData.itemsPerPage,
    itemsPerPage,
  );
  const route = useRouter();

  const handleQuery = useDebouncedCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams);

      params.set(
        'itemsPerPage',
        String(
          clamp(
            MIN_ITEMS_PER_PAGE,
            getSafeNumber(e.target.value, ITEMS_PER_PAGE),
            MAX_ITEMS_PER_PAGE,
          ),
        ),
      );
      route.replace(`${pathname}?${params.toString()}`);
    },
    300,
  );

  return (
    <div className="w-30 flex h-10 items-center justify-center rounded-md border p-2">
      <Input
        className="mx-1"
        placeholder="Page number"
        type="number"
        min={MIN_ITEMS_PER_PAGE}
        max={MAX_ITEMS_PER_PAGE}
        defaultValue={itemsNumber}
        onChange={handleQuery}
      >
        <span className="material-symbols-outlined absolute left-0 top-2">
          density_small
        </span>
      </Input>
    </div>
  );
}
