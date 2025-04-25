'use client';

import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(
    searchParams.get('query')?.toString() ?? '',
  );
  const { replace } = useRouter();

  const urlQuery = searchParams.get('query') ?? '';
  const isLoading = urlQuery !== query;

  const handleSearch = useDebouncedCallback(() => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('query', query);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0 flex-row items-center gap-2">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="flex w-full items-center rounded-md border border-gray-200 px-3">
        <input
          className="peer block grow border-none py-[9px] pl-10 text-sm placeholder:text-gray-500 focus:[box-shadow:none]"
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch();
          }}
          value={query}
        />
        <ArrowPathIcon
          className={clsx('h-[24px] w-[24px] animate-spin', {
            hidden: !isLoading,
          })}
        />
      </div>

      <MagnifyingGlassIcon className=" absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
