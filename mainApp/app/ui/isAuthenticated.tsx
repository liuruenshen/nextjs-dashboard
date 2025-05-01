import { auth } from '@/auth';

export async function isAuthenticated() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="rounded-lg bg-gray-200 p-4">Please login first</div>
      </div>
    );
  }

  return null;
}
