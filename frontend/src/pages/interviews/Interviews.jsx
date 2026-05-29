import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Plus,

} from 'lucide-react';
import { formatDate, formatStatus, cn } from '../../utils/helpers';
import api from '../../api/axios';

const Interviews = () => {
  const navigate = useNavigate();
  const { isStudent, isCoordinator } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('upcoming'); // upcoming, past, all
  const [groupBy, setGroupBy] = useState('date'); // date, job

  useEffect(() => {
    loadInterviews();
  }, [view]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const params = { view };
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

  // Group interviews
  const groupedInterviews = interviews.reduce((acc, interview) => {
    if (groupBy === 'date') {
        const date = new Date(interview.scheduled_date).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(interview);
    } else {
        const key = `${interview.application?.job?.company?.name} - ${interview.application?.job?.title}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(interview);
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-stagger-in">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Interviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isStudent() ? 'View your scheduled interviews' : 'Manage interview schedules'}
          </p>
        </div>
        {isCoordinator() && (
          <Button onClick={() => navigate('/interviews/schedule')}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        )}
      </div>

      {/* View Toggle */}


      {/* View Options */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
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

        <div className="flex gap-2 bg-muted/30 p-1 rounded-lg">
          <Button
            variant={groupBy === 'date' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setGroupBy('date')}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-2" />
            By Date
          </Button>
          <Button
            variant={groupBy === 'job' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setGroupBy('job')}
            className="text-xs"
          >
            <Building2 className="h-3 w-3 mr-2" />
            By Job
          </Button>
        </div>
      </div>

      {/* Interviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : Object.keys(groupedInterviews).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-base font-medium">No interviews scheduled</h3>
            <p className="text-muted-foreground">
              {view === 'upcoming' 
                ? 'You have no upcoming interviews' 
                : 'No interview records found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedInterviews).map(([groupKey, groupInterviews]) => (
            <div key={groupKey}>
              {/* Group Header */}
              <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
                {groupBy === 'date' ? (
                    <Calendar className="h-5 w-5 text-primary" />
                ) : (
                    <Building2 className="h-5 w-5 text-primary" />
                )}
                <h3 className="font-display font-semibold text-sm">
                  {groupBy === 'date' 
                    ? new Date(groupKey).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : groupKey
                  }
                </h3>
                <Badge variant="secondary">{groupInterviews.length}</Badge>
              </div>

              {/* Interviews for this group */}
              <div className="space-y-3">
                {groupInterviews.map((interview) => (
                  <Card key={interview.id} className="hover-lift transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Time */}
                        <div className="flex items-center gap-2 font-display text-base font-semibold w-24 flex-shrink-0">
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
