import { Inter, Lusitana, Roboto_Mono } from 'next/font/google';

export const inter = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: '500',
});

export const lusitana = Lusitana({ weight: '700', subsets: ['latin'] });
