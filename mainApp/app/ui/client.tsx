'use client';

import { useEffect } from 'react';

interface ClientProps {
  source: string;
}

export function Client({ source }: ClientProps) {
  useEffect(() => {
    // console.log(`Client mounted with source: ${source}`);
    return () => {
      // console.log(`Client unmounted with source: ${source}`);
    };
  }, []);
  return <div></div>;
}
