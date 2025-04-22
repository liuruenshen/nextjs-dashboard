import { Client } from '../ui/client';

export default function Template({ children }: { children: any }) {
  console.log('🚀 ~ Template ~ Template: /dashboard:template');
  return (
    <div id="dashboard-template">
      {children}
      <Client />
    </div>
  );
}
