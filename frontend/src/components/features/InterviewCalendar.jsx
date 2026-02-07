import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Building2
} from 'lucide-react';
import { formatTime } from '../../utils/helpers';
import api from '../../api/axios';
import { cn } from '../../utils/helpers';

const InterviewCalendar = ({ userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interviews, setInterviews] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, [currentDate]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get('/interviews', {
        params: { year, month }
      });
      setInterviews(response.data.data || []);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getInterviewsForDate = (day) => {
    return interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduled_at);
      return (
        interviewDate.getDate() === day &&
        interviewDate.getMonth() === currentDate.getMonth() &&
        interviewDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const selectedInterviews = selectedDate
    ? getInterviewsForDate(selectedDate)
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Interview Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {formatMonth(currentDate)}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty days */}
            {emptyDays.map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 bg-muted/30 rounded-lg" />
            ))}

            {/* Days with potential interviews */}
            {days.map((day) => {
              const dayInterviews = getInterviewsForDate(day);
              const hasInterviews = dayInterviews.length > 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "h-20 p-1 rounded-lg border transition-colors text-left flex flex-col",
                    isToday(day) && "border-primary bg-primary/5",
                    selectedDate === day && "ring-2 ring-primary",
                    !isToday(day) && !selectedDate && "border-transparent hover:bg-muted/50"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    isToday(day) && "text-primary"
                  )}>
                    {day}
                  </span>
                  {hasInterviews && (
                    <div className="mt-auto">
                      {dayInterviews.slice(0, 2).map((interview, idx) => (
                        <div
                          key={interview.id}
                          className="text-xs truncate px-1 py-0.5 rounded bg-primary/10 text-primary mb-0.5"
                        >
                          {formatTime(interview.scheduled_at)}
                        </div>
                      ))}
                      {dayInterviews.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{dayInterviews.length - 2} more
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate
              ? `Interviews on ${selectedDate} ${formatMonth(currentDate)}`
              : 'Select a date'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <p className="text-center text-muted-foreground py-8">
              Click on a date to see interviews
            </p>
          ) : selectedInterviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No interviews scheduled
            </p>
          ) : (
            <div className="space-y-4">
              {selectedInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{interview.job_posting?.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Building2 className="h-3 w-3 mr-1" />
                        {interview.job_posting?.company?.name}
                      </p>
                    </div>
                    <Badge variant={
                      interview.status === 'scheduled' ? 'default' :
                      interview.status === 'completed' ? 'success' :
                      'secondary'
                    }>
                      {interview.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(interview.scheduled_at)}
                    </span>
                    <span className="flex items-center">
                      {interview.interview_mode === 'virtual' ? (
                        <Video className="h-3 w-3 mr-1" />
                      ) : (
                        <MapPin className="h-3 w-3 mr-1" />
                      )}
                      {interview.interview_mode === 'virtual' ? 'Virtual' : interview.venue}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {interview.application?.student?.user?.user_profile?.first_name}{' '}
                      {interview.application?.student?.user?.user_profile?.last_name}
                    </span>
                  </div>

                  {interview.meeting_link && (
                    <Button size="sm" className="w-full" asChild>
                      <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewCalendar;
