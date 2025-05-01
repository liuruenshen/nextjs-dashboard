export default async function Page({
  searchParams,
}: {
  searchParams: Promise<unknown>;
}) {
  const params = await searchParams;
  console.log('🚀 ~ params:', params);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="Failed to login rounded-lg bg-gray-200 p-4">
        Failed to Authenticate
      </div>
    </div>
  );
}
