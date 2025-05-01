import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut, auth } from '@/auth';
import Image from 'next/image';
import { JSX } from 'react';
import { REMOTE_PATTERN } from '@/app/next.config.shared';
import { hasRemoteMatch } from 'next/dist/shared/lib/match-remote-pattern';

interface SafeImageProps {
  src: string;
}

function SafeImage({ src }: SafeImageProps) {
  /**
   * We have to check in advance to see if the external image is allowed to be loaded. Otherwise,
   * the 500 error will be thrown by the server.
   */
  const canLoad = hasRemoteMatch([], REMOTE_PATTERN, new URL(src));

  return canLoad ? (
    <Image
      className="h-7 w-7 rounded-full md:h-10 md:w-10"
      width={40}
      height={40}
      alt=""
      src={src}
    />
  ) : null;
}

async function Welcome() {
  const session = await auth();
  const welcome = `Hi, ${session?.user?.name}`;

  let avatar: JSX.Element | null = null;
  try {
    avatar = session?.user?.image ? (
      <SafeImage src={session?.user?.image} />
    ) : null;
  } catch (e) {}

  return (
    <div className="flex w-full flex-row items-center justify-start gap-2 rounded-md bg-sky-200 px-3 py-2">
      {avatar}
      <div>{welcome}</div>
    </div>
  );
}

export default function SideNav() {
  return (
    <div className="flex h-full flex-col gap-2 px-3 py-4 md:px-2">
      <Link
        className="flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <AcmeLogo />
        </div>
      </Link>
      <Welcome />
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
