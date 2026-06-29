export default function SkeletonCard() {
  return (
    <div className="flex gap-4 bg-white border border-border rounded-lg p-4 animate-pulse">
      <div className="flex flex-col items-center gap-2 min-w-[2.5rem]">
        <div className="h-3 w-3 bg-border rounded" />
        <div className="h-4 w-5 bg-border rounded" />
        <div className="h-3 w-3 bg-border rounded" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-border rounded w-3/4" />
        <div className="h-3 bg-border rounded w-full" />
        <div className="h-3 bg-border rounded w-5/6" />
        <div className="flex gap-2 mt-3">
          <div className="h-5 w-16 bg-border rounded-full" />
          <div className="h-5 w-20 bg-border rounded" />
        </div>
      </div>
    </div>
  );
}
