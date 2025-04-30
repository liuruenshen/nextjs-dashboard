import { RemotePattern } from 'next/dist/shared/lib/image-config';

export const REMOTE_PATTERN: (RemotePattern | URL)[] = [
  new URL('https://github.githubassets.com/assets/**'),
  {
    protocol: 'https',
    hostname: 'avatars.githubusercontent.com',
    port: '',
    pathname: '/**',
  },
];
