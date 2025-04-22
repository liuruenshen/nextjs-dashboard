'use client';

import { useEffect } from 'react';

export function Client() {
  useEffect(() => {
    console.log('Client mounted');
    return () => {
      console.log('Client unmount');
    };
  }, []);
  return <div></div>;
}
