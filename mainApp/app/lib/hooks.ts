import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface UseRouteBackProps {
  isPending: boolean;
  requestServerRedirect: boolean;
}

export function useRouteBack({
  isPending,
  requestServerRedirect,
}: UseRouteBackProps) {
  const pendingRef = useRef(isPending);
  const route = useRouter();
  const routeRef = useRef(route);
  routeRef.current = route;

  useEffect(() => {
    if (requestServerRedirect) {
      return;
    }

    if (!pendingRef.current && isPending) {
      pendingRef.current = isPending;
      return;
    }

    if (pendingRef.current && !isPending) {
      pendingRef.current = isPending;
      routeRef.current.back();
    }
  }, [requestServerRedirect, isPending]);

  return { route };
}
