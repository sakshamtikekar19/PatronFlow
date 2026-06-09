export default function EventNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F2ED] p-4">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Event not found
        </h1>
        <p className="text-neutral-500">
          This event may be unpublished or no longer available.
        </p>
      </div>
    </div>
  );
}
