import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Building,
  Calendar,
  Briefcase,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getRelativeTime } from '../../utils/helpers';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, variant: 'warning' },
  shortlisted: { label: 'Shortlisted', icon: CheckCircle, variant: 'success' },
  interview_scheduled: { label: 'Interview Scheduled', icon: Calendar, variant: 'default' },
  selected: { label: 'Selected', icon: CheckCircle, variant: 'success' },
  rejected: { label: 'Rejected', icon: XCircle, variant: 'destructive' },
  withdrawn: { label: 'Withdrawn', icon: XCircle, variant: 'secondary' }
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/applications/my');
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    
    try {
      await api.put(`/applications/${applicationId}/withdraw`);
      toast.success('Application withdrawn');
      loadApplications();
    } catch (error) {
      toast.error('Failed to withdraw application');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job?.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    selected: applications.filter(a => a.status === 'selected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Applications</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.shortlisted}</div>
          <div className="text-sm text-muted-foreground">Shortlisted</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.selected}</div>
          <div className="text-sm text-muted-foreground">Selected</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No applications found</h3>
          <p className="text-muted-foreground">
            {applications.length === 0 
              ? "You haven't applied to any jobs yet."
              : "No applications match your filters."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedId === application.id;

            return (
              <Card key={application.id} className="overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : application.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{application.job?.title}</h3>
                        <Badge variant={statusConfig.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {application.job?.company?.name}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Applied {getRelativeTime(application.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {application.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWithdraw(application.id);
                          }}
                        >
                          Withdraw
                        </Button>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t space-y-4">
                    {/* Job Details */}
                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Job Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Position</span>
                            <span>{application.job?.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span className="capitalize">{application.job?.job_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Location</span>
                            <span>{application.job?.location || 'Not specified'}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Application Timeline</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Applied On</span>
                            <span>{formatDate(application.created_at)}</span>
                          </div>
                          {application.updated_at !== application.created_at && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Updated</span>
                              <span>{formatDate(application.updated_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interview Info (if scheduled) */}
                    {application.interviews?.length > 0 && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Interview Details</h4>
                        {application.interviews.map((interview) => (
                          <div key={interview.id} className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date & Time</span>
                              <span>{formatDate(interview.scheduled_at)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Mode</span>
                              <span className="capitalize">{interview.interview_mode?.replace('_', ' ')}</span>
                            </div>
                            {interview.meeting_link && (
                              <a
                                href={interview.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Join Meeting
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
