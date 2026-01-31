import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatStatus, getStatusColor, cn } from '../../utils/helpers';
import api from '../../api/axios';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/applications', { params });
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'selected':
      case 'offer_accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
      case 'withdrawn':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'interview_scheduled':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview_scheduled', label: 'Interview' },
    { value: 'selected', label: 'Selected' },
    { value: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications
        </p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No applications found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? "You haven't applied to any jobs yet" 
                : `No applications with status: ${formatStatus(filter)}`}
            </p>
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <div className="flex">
                {/* Status Bar */}
                <div className={cn(
                  "w-1.5 flex-shrink-0",
                  application.status === 'selected' || application.status === 'offer_accepted' 
                    ? 'bg-green-500'
                    : application.status === 'rejected' || application.status === 'withdrawn'
                    ? 'bg-red-500'
                    : application.status === 'interview_scheduled'
                    ? 'bg-purple-500'
                    : 'bg-yellow-500'
                )} />
                
                <CardContent className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Company Logo */}
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {application.job?.company?.logo_url ? (
                        <img 
                          src={application.job.company.logo_url} 
                          alt={application.job.company.name}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <Building2 className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link 
                            to={`/jobs/${application.job?.id}`}
                            className="font-semibold hover:text-primary transition-colors"
                          >
                            {application.job?.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {application.job?.company?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(application.status)}
                          <Badge className={getStatusColor(application.status)}>
                            {formatStatus(application.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Applied: {formatDate(application.applied_at)}
                        </span>
                        {application.reviewed_at && (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Reviewed: {formatDate(application.reviewed_at)}
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      {application.notes && (
                        <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                          <span className="font-medium">Feedback:</span> {application.notes}
                        </div>
                      )}

                      {/* Upcoming Interview */}
                      {application.interviews?.length > 0 && (
                        <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                          <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                            Upcoming Interview
                          </p>
                          <p className="text-sm text-purple-600 dark:text-purple-300">
                            {formatDate(application.interviews[0].scheduled_date)} at{' '}
                            {application.interviews[0].scheduled_time}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Link to={`/applications/${application.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
