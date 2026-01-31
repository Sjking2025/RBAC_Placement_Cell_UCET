import { cn } from '../../utils/helpers';
import { 
  Inbox, 
  Search, 
  FileX, 
  Users, 
  Briefcase, 
  Building2, 
  Bell,
  Calendar
} from 'lucide-react';
import { Button } from './Button';

const icons = {
  default: Inbox,
  search: Search,
  file: FileX,
  users: Users,
  jobs: Briefcase,
  companies: Building2,
  notifications: Bell,
  calendar: Calendar
};

/**
 * EmptyState component for displaying when no data is available
 */
const EmptyState = ({
  icon = 'default',
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  action,
  actionLabel,
  className
}) => {
  const IconComponent = icons[icon] || icons.default;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center",
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && actionLabel && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
};

/**
 * Specific empty states for common scenarios
 */
const EmptyStateNoJobs = ({ onAction }) => (
  <EmptyState
    icon="jobs"
    title="No jobs available"
    description="There are no job postings at the moment. Check back later for new opportunities."
    action={onAction}
    actionLabel={onAction ? "Refresh" : undefined}
  />
);

const EmptyStateNoStudents = ({ onAction }) => (
  <EmptyState
    icon="users"
    title="No students found"
    description="There are no students matching your criteria. Try adjusting your filters."
    action={onAction}
    actionLabel={onAction ? "Clear Filters" : undefined}
  />
);

const EmptyStateNoCompanies = ({ onAction }) => (
  <EmptyState
    icon="companies"
    title="No companies available"
    description="No companies have been registered yet. Add a company to get started."
    action={onAction}
    actionLabel={onAction ? "Add Company" : undefined}
  />
);

const EmptyStateNoApplications = ({ onAction }) => (
  <EmptyState
    icon="file"
    title="No applications yet"
    description="You haven't applied to any jobs yet. Browse available positions and apply to get started."
    action={onAction}
    actionLabel={onAction ? "Browse Jobs" : undefined}
  />
);

const EmptyStateNoInterviews = ({ onAction }) => (
  <EmptyState
    icon="calendar"
    title="No interviews scheduled"
    description="There are no upcoming interviews at the moment."
    action={onAction}
    actionLabel={onAction ? "View Applications" : undefined}
  />
);

const EmptyStateNoNotifications = () => (
  <EmptyState
    icon="notifications"
    title="All caught up!"
    description="You don't have any new notifications."
  />
);

const EmptyStateSearchResults = ({ query, onClear }) => (
  <EmptyState
    icon="search"
    title="No results found"
    description={`No items match your search "${query}". Try using different keywords.`}
    action={onClear}
    actionLabel="Clear Search"
  />
);

export {
  EmptyState,
  EmptyStateNoJobs,
  EmptyStateNoStudents,
  EmptyStateNoCompanies,
  EmptyStateNoApplications,
  EmptyStateNoInterviews,
  EmptyStateNoNotifications,
  EmptyStateSearchResults
};

export default EmptyState;
