import Link from 'next/link';
import { useRouter } from 'next/navigation';

type LinkProps = Parameters<typeof Link>[0];

interface ServerRedirectableLinkProps extends LinkProps {
  href: string;
  children: React.ReactNode;
  requestServerRedirect: boolean;
}

export function ServerRedirectableLink({
  requestServerRedirect,
  href,
  children,
  ...props
}: ServerRedirectableLinkProps) {
  const route = useRouter();

  return (
    <Link
      href={requestServerRedirect ? href : ''}
      onClick={(e) => {
        if (!requestServerRedirect) {
          e.preventDefault();
          route.back();
        }
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
