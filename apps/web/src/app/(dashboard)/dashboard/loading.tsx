import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-lg" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Skeleton className="h-[280px] rounded-lg" />
        <Skeleton className="h-[280px] rounded-lg" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Skeleton className="h-[220px] rounded-lg" />
        <Skeleton className="h-[220px] rounded-lg" />
        <Skeleton className="h-[220px] rounded-lg" />
      </div>
    </div>
  );
}
