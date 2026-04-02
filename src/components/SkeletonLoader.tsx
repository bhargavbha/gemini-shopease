const SkeletonCard = () => (
  <div className="space-y-3">
    <div className="aspect-[3/4] rounded-sm shimmer" />
    <div className="space-y-2">
      <div className="h-3 w-16 rounded shimmer" />
      <div className="h-4 w-3/4 rounded shimmer" />
      <div className="h-4 w-20 rounded shimmer" />
    </div>
  </div>
);

export const SkeletonRow = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonBanner = () => (
  <div className="w-full aspect-[21/9] rounded-sm shimmer" />
);

export default SkeletonCard;
