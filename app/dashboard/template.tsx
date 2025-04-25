import { Client } from '../ui/client';

export default function Template({ children }: { children: any }) {
  // console.log('🚀 ~ Template ~ Template: /dashboard:template');
  return (
    <div data-id="dashboard-template" className="h-full w-full">
      {children}
      <Client source="Dashboard Template" />
    </div>
  );
}
