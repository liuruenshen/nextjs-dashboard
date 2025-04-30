import SideNav from '@/app/ui/dashboard/sidenav';
import { Client } from '../ui/client';
import React from 'react';
import { isAuthenticated } from '../ui/isAuthenticated';

export default async function Layout({
  children,
  footer,
  invoiceEdit,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  invoiceEdit: React.ReactNode;
}) {
  const loginFirst = await isAuthenticated();

  if (loginFirst) {
    return loginFirst;
  }

  return (
    <div
      id="DashboardLayout"
      className="flex h-screen flex-col md:flex-row md:overflow-hidden"
    >
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div
        id="DashboardChildContainer"
        className="grid flex-grow grid-rows-[repeat(2,1fr)] p-6 md:overflow-y-auto md:p-12"
      >
        {children}
        {footer}
        {invoiceEdit}
      </div>
      <Client source="Dashboard Layout" />
    </div>
  );
}
