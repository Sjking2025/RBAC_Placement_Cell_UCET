import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Video, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';
import { formatDate, cn } from '../../utils/helpers';
import { Badge } from './Badge';
import { Button } from './Button';

const TimelineItem = ({ interview, isLast }) => {
  const getStatusColor = (status, result) => {
    if (result === 'passed' || result === 'selected') return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (result === 'failed' || result === 'rejected') return 'text-red-500 bg-red-500/10 border-red-500/20';
    
    switch (status) {
      case 'completed': return 'text-primary bg-primary/10 border-primary/20';
      case 'scheduled': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'cancelled': 
      case 'no_show': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'rescheduled': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = (status, result) => {
    if (result === 'passed' || result === 'selected') return CheckCircle;
    if (result === 'failed' || result === 'rejected') return XCircle;
    
    switch (status) {
      case 'completed': return CheckCircle;
      case 'scheduled': return Clock;
      case 'cancelled': return XCircle;
      case 'rescheduled': return AlertCircle;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon(interview.status, interview.result);
  const statusColorClass = getStatusColor(interview.status, interview.result);

  return (
    <div className="relative pl-8 pb-8 last:pb-0 group">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-border group-hover:bg-primary/50 transition-colors duration-300" />
      )}

      {/* Status Dot */}
      <div className={cn(
        "absolute left-0 top-0 h-6 w-6 rounded-full border-2 flex items-center justify-center bg-background z-10 transition-all duration-300",
        statusColorClass
      )}>
        <StatusIcon className="h-3 w-3" />
      </div>

      {/* Content */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 rounded-lg border bg-card/50 hover:bg-muted/50 transition-all duration-300 hover:shadow-sm hover:border-primary/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-base">{interview.interview_type}</h4>
            <Badge variant="outline" className="capitalize text-xs">
              {interview.interview_mode?.replace('_', ' ')}
            </Badge>
            {interview.result && (
               <Badge 
                 variant={['passed', 'selected'].includes(interview.result) ? 'success' : 'destructive'}
                 className="capitalize text-xs"
               >
                 {interview.result}
               </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(interview.scheduled_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {new Date(interview.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {interview.location && (
               <span className="flex items-center gap-1.5">
                 <MapPin className="h-3.5 w-3.5" />
                 {interview.location}
               </span>
            )}
          </div>
          
          {interview.notes && (
             <p className="text-sm text-muted-foreground/80 italic border-l-2 pl-2 border-primary/20">
               "{interview.notes}"
             </p>
          )}

          {/* Feedback/Result Message */}
          {interview.feedback && (
            <div className="text-sm mt-2 p-2 bg-muted/50 rounded text-muted-foreground">
              <span className="font-medium text-foreground">Feedback: </span>
              {interview.feedback}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          {interview.meeting_link && interview.status === 'scheduled' && (
            <a 
              href={interview.meeting_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button size="sm" className="gap-2">
                <Video className="h-4 w-4" />
                Join
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const Timeline = ({ items }) => {
  if (!items || items.length === 0) return null;

  // Sort by date (oldest first or newest first? Timeline usually newest on top or logical progression)
  // For interviews, logical progression (Round 1 -> Round 2) is usually chronological.
  const sortedItems = [...items].sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

  return (
    <div className="py-4">
      {sortedItems.map((item, index) => (
        <TimelineItem 
          key={item.id} 
          interview={item} 
          isLast={index === sortedItems.length - 1} 
        />
      ))}
    </div>
  );
};

export default Timeline;
