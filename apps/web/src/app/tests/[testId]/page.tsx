export default function TestDetailPage({
  params,
}: {
  params: { testId: string };
}) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Test Details</h1>
        <p className="text-muted-foreground">Test ID: {params.testId}</p>
        <p className="text-muted-foreground mt-2">
          Test details will be implemented in Phase 3
        </p>
      </div>
    </div>
  );
}
