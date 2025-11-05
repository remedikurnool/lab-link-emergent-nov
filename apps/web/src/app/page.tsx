export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">
          Lab Link
        </h1>
        <p className="text-xl text-muted-foreground">
          Diagnostic Booking Platform - Phase 1 Setup Complete
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto p-4">
          <RouteCard title="Tests" href="/tests" />
          <RouteCard title="Scans" href="/scans" />
          <RouteCard title="Packages" href="/packages" />
          <RouteCard title="Bookings" href="/bookings" />
          <RouteCard title="My Bookings" href="/my-bookings" />
          <RouteCard title="My Profile" href="/my-profile" />
          <RouteCard title="My Earnings" href="/my-earnings" />
        </div>
      </div>
    </div>
  );
}

function RouteCard({ title, href }: { title: string; href: string }) {
  return (
    <a
      href={href}
      className="block p-6 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
    </a>
  );
}
