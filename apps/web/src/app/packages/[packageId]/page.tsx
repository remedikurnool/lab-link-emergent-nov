export default async function PackageDetailPage(props: {
  params: Promise<{ packageId: string }>;
}) {
  const params = await props.params;
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Package Details</h1>
        <p className="text-muted-foreground">Package ID: {params.packageId}</p>
        <p className="text-muted-foreground mt-2">
          Package details will be implemented in Phase 3
        </p>
      </div>
    </div>
  );
}
