import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus
} from 'lucide-react';
import { formatDate, formatStatus, cn } from '../../utils/helpers';
import api from '../../api/axios';

const Interviews = () => {
  const { isStudent, isCoordinator } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('upcoming'); // upcoming, past, all

  useEffect(() => {
    loadInterviews();
  }, [view]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const params = {};
      if (view === 'upcoming') {
        params.date = new Date().toISOString().split('T')[0];
      }
      const response = await api.get('/interviews', { params });
      setInterviews(response.data.data || []);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: 'info',
      rescheduled: 'warning',
      completed: 'success',
      cancelled: 'destructive',
      no_show: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{formatStatus(status)}</Badge>;
  };

  const getModeIcon = (mode) => {
    return mode === 'online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />;
  };

  // Group interviews by date
  const groupedInterviews = interviews.reduce((acc, interview) => {
    const date = new Date(interview.scheduled_date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(interview);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Interviews</h1>
          <p className="text-muted-foreground">
            {isStudent() ? 'View your scheduled interviews' : 'Manage interview schedules'}
          </p>
        </div>
        {isCoordinator() && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={view === 'past' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('past')}
        >
          Past
        </Button>
        <Button
          variant={view === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('all')}
        >
          All
        </Button>
      </div>

      {/* Interviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : Object.keys(groupedInterviews).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No interviews scheduled</h3>
            <p className="text-muted-foreground">
              {view === 'upcoming' 
                ? 'You have no upcoming interviews' 
                : 'No interview records found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedInterviews).map(([date, dateInterviews]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <Badge variant="secondary">{dateInterviews.length}</Badge>
              </div>

              {/* Interviews for this date */}
              <div className="space-y-3">
                {dateInterviews.map((interview) => (
                  <Card key={interview.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Time */}
                        <div className="flex items-center gap-2 text-lg font-semibold w-24 flex-shrink-0">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          {interview.scheduled_time?.substring(0, 5) || '---'}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-medium">
                                {interview.application?.job?.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {interview.application?.job?.company?.name}
                              </p>
                            </div>
                            {getStatusBadge(interview.status)}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {formatStatus(interview.interview_type)}
                              </Badge>
                            </span>
                            <span className="flex items-center">
                              {getModeIcon(interview.interview_mode)}
                              <span className="ml-1">{formatStatus(interview.interview_mode)}</span>
                            </span>
                            {interview.location && (
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {interview.location}
                              </span>
                            )}
                            <span>Duration: {interview.duration_minutes || 60} mins</span>
                          </div>

                          {/* Student info (for non-students) */}
                          {!isStudent() && interview.application?.student && (
                            <div className="mt-2 text-sm flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {interview.application.student.user?.user_profile?.first_name}{' '}
                              {interview.application.student.user?.user_profile?.last_name}
                              ({interview.application.student.roll_number})
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                          {interview.meeting_link && interview.status === 'scheduled' && (
                            <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                              <Button size="sm">
                                <Video className="h-4 w-4 mr-1" />
                                Join
                              </Button>
                            </a>
                          )}
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Interviews;
