export default function ScanDetailPage({
  params,
}: {
  params: { scanId: string };
}) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Scan Details</h1>
        <p className="text-muted-foreground">Scan ID: {params.scanId}</p>
        <p className="text-muted-foreground mt-2">
          Scan details will be implemented in Phase 3
        </p>
      </div>
    </div>
  );
}
