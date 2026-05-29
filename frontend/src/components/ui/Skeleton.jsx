import { cn } from '../../utils/helpers';

// Base Skeleton with shimmer wave animation
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-muted animate-shimmer',
        className
      )}
      {...props}
    />
  );
};

// Card Skeleton
const SkeletonCard = ({ className }) => (
  <div className={cn('p-6 border border-border/50 rounded-xl space-y-4', className)}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
  </div>
);

// Table Row Skeleton
const SkeletonTableRow = ({ cols = 5 }) => (
  <div className="flex items-center gap-4 p-4 border-b border-border/50">
    {Array.from({ length: cols }).map((_, i) => (
      <Skeleton key={i} className="h-4 flex-1" />
    ))}
  </div>
);

// Profile Skeleton
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
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

// List Skeleton
const SkeletonList = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border border-border/50 rounded-xl">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    ))}
  </div>
);

// Stats Grid Skeleton
const SkeletonStats = ({ count = 4 }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-6 border border-border/50 rounded-xl">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-16" />
      </div>
    ))}
  </div>
);

// Form Skeleton
const SkeletonForm = () => (
  <div className="space-y-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    ))}
    <div className="flex justify-end gap-3">
      <Skeleton className="h-10 w-24 rounded-lg" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  </div>
);

// Job Card Skeleton
const SkeletonJobCard = () => (
  <div className="p-6 border border-border/50 rounded-xl space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
    <Skeleton className="h-16 w-full" />
    <div className="flex justify-end gap-2">
      <Skeleton className="h-9 w-24 rounded-lg" />
      <Skeleton className="h-9 w-20 rounded-lg" />
    </div>
  </div>
);

// Dashboard Skeleton
const SkeletonDashboard = () => (
  <div className="space-y-6">
    <SkeletonStats count={4} />
    <div className="grid gap-6 lg:grid-cols-2">
      <SkeletonCard className="h-64" />
      <SkeletonCard className="h-64" />
    </div>
    <SkeletonList count={3} />
  </div>
);

// Text Skeleton
const SkeletonText = ({ lines = 3, className }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')}
      />
    ))}
  </div>
);

// Button Skeleton
const SkeletonButton = ({ className }) => (
  <Skeleton className={cn('h-10 w-24 rounded-lg', className)} />
);

// Avatar Skeleton
const SkeletonAvatar = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };
  return <Skeleton className={cn('rounded-full', sizes[size], className)} />;
};

// Badge Skeleton
const SkeletonBadge = ({ count = 3, className }) => (
  <div className={cn('flex gap-2', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-6 w-16 rounded-full" />
    ))}
  </div>
);

// Table Skeleton
const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="border border-border/50 rounded-xl overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-4 p-4 bg-muted/30 border-b border-border/50">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-border/50 last:border-0">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export {
  Skeleton,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonProfile,
  SkeletonList,
  SkeletonStats,
  SkeletonForm,
  SkeletonJobCard,
  SkeletonDashboard,
  SkeletonText,
  SkeletonButton,
  SkeletonAvatar,
  SkeletonBadge
};
