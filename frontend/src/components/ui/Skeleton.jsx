import { cn } from '../../utils/helpers';

/**
 * Skeleton component for loading states
 */
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
};

/**
 * Skeleton for a card with title and content
 */
const SkeletonCard = ({ lines = 3 }) => (
  <div className="bg-background border rounded-lg p-6 space-y-4">
    <Skeleton className="h-5 w-1/3" />
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-4" 
          style={{ width: `${100 - (i * 15)}%` }}
        />
      ))}
    </div>
  </div>
);

/**
 * Skeleton for table rows
 */
const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="border rounded-lg overflow-hidden">
    {/* Header */}
    <div className="bg-muted/50 p-4 flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="p-4 flex gap-4 border-t">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            className="h-4 flex-1" 
            style={{ opacity: 1 - (rowIndex * 0.1) }}
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Skeleton for stat cards
 */
const SkeletonStats = ({ count = 4 }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-background border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-20 mt-2" />
      </div>
    ))}
  </div>
);

/**
 * Skeleton for job cards
 */
const SkeletonJobCard = () => (
  <div className="bg-background border rounded-lg p-6 space-y-4">
    <div className="flex items-start gap-4">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

/**
 * Skeleton for profile
 */
const SkeletonProfile = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonStats,
  SkeletonJobCard,
  SkeletonProfile
};

export default Skeleton;
