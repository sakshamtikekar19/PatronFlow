export default function ReviewNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F2ED] p-4">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Restaurant not found
        </h1>
        <p className="text-neutral-500">
          This review link may be invalid or expired.
        </p>
      </div>
    </div>
  );
}
