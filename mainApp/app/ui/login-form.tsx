'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button, ButtonProps } from './button';
import { authenticate, authenticateViaGitHub } from '../lib/actions';
import { useActionState } from 'react';
import Image from 'next/image';

function DefaultLoginForm() {
  const [errorMessage, dispatch, pending] = useActionState(authenticate, '');
  return (
    <form action={dispatch} className="w-full">
      <h1 className={`${lusitana.className} mb-3 text-2xl`}>
        Please log in to continue.
      </h1>
      <div className="w-full">
        <div>
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>
        <div className="mt-4">
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              required
              minLength={6}
            />
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>
      </div>
      <LoginButton pending={pending} />
      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && (
          <>
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">{errorMessage}</p>
          </>
        )}
      </div>
    </form>
  );
}

function GitHubLoginForm() {
  return (
    <form action={authenticateViaGitHub} className="w-full">
      <div className="flex flex-col items-center justify-center">
        <div className={`p-2 ${lusitana.className} text-2xl`}>
          <Image
            src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
            width="560"
            height="560"
            alt="GitHub Logo"
            className="h-20 w-20 rounded-xl"
          />
        </div>
        <LoginButton pending={false} className="bg-gray-500">
          Sign in with GitHub
        </LoginButton>
      </div>
    </form>
  );
}

export default function LoginForm() {
  return (
    <div className="flex flex-1 flex-col items-center justify-normal gap-2 rounded-lg bg-gray-50 p-6">
      <DefaultLoginForm />
      <hr className="h-0.5 w-full bg-zinc-400" />
      <GitHubLoginForm />
    </div>
  );
}

interface LoginButtonProps extends Omit<ButtonProps, 'children'> {
  pending?: boolean;
  children?: React.ReactNode;
}

function LoginButton({
  pending,
  className,
  children = 'Log in',
  ...props
}: LoginButtonProps) {
  return (
    <Button
      className={`mt-4 w-full ${className}`}
      aria-disabled={pending}
      {...props}
    >
      {children} <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}
