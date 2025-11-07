export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📡</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You're Offline
        </h1>
        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Some features may not be available.
        </p>
        <p className="text-sm text-gray-500">
          Your bookings and cart data are saved locally and will sync when you're back online.
        </p>
      </div>
    </div>
  );
}
