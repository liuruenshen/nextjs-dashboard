'use client';

import { CustomerField } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { CreateInvoiceErrorState, createInvoice } from '@/app/lib/actions';
import { useActionState, useEffect, useRef } from 'react';
import { useRouteBack } from '@/app/lib/hooks';
import { ServerRedirectableLink } from '../ServerRedirectableLink';

function useGetCreateInvoiceError(
  state: CreateInvoiceErrorState,
  key: keyof Required<NonNullable<CreateInvoiceErrorState['error']>>,
) {
  const keyErrors = state.error?.[key];

  const htmlId = `${key}-error`;

  const jsx = (
    <div id={htmlId} aria-live="polite" aria-atomic="true">
      {keyErrors?.map((error: string) => (
        <p className="mt-2 text-sm text-red-500" key={error}>
          {error}
        </p>
      ))}
    </div>
  );

  return [htmlId, jsx] as const;
}

export interface FormProps {
  customers: CustomerField[];
  requestServerRedirect: boolean;
}

const initialState = { message: null, errors: {} };

export default function Form({ customers, requestServerRedirect }: FormProps) {
  const createInvoiceWithRedirect = createInvoice.bind(
    null,
    requestServerRedirect,
  );

  /**
   * https://stackoverflow.com/questions/77828579/useformstate-vs-useform-in-nextjs-v14
   */
  const [state, dispatch, isPending] = useActionState(
    createInvoiceWithRedirect,
    initialState,
  );
  const [customerErrorHintId, customerErrorElement] = useGetCreateInvoiceError(
    state,
    'customerId',
  );

  const [amountErrorHintId, amountErrorElement] = useGetCreateInvoiceError(
    state,
    'amount',
  );

  const [statusErrorHintId, statusErrorElement] = useGetCreateInvoiceError(
    state,
    'status',
  );

  const { route } = useRouteBack({ isPending, requestServerRedirect });

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>
          <div className="relative">
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby={customerErrorHintId}
              required
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          {customerErrorElement}
        </div>

        {/* Invoice Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Enter USD amount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby={amountErrorHintId}
                required
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            {amountErrorElement}
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby={statusErrorHintId}
                  required
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby={statusErrorHintId}
                  required
                />
                <label
                  htmlFor="paid"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
            {statusErrorElement}
          </div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <ServerRedirectableLink
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          requestServerRedirect={requestServerRedirect}
        >
          Cancel
        </ServerRedirectableLink>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
}
