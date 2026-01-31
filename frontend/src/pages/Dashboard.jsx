import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Briefcase, 
  Users, 
  Building2, 
  CalendarDays,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Bell
} from 'lucide-react';
import { formatDate, formatCurrency, getRelativeTime } from '../utils/helpers';
import api from '../api/axios';

const Dashboard = () => {
  const { user, isStudent, isAdmin, isOfficer } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load different data based on role
      const [jobsRes, announcementsRes] = await Promise.all([
        api.get('/jobs', { params: { limit: 5, status: 'active' } }),
        api.get('/announcements', { params: { limit: 5 } })
      ]);

      setRecentJobs(jobsRes.data.data || []);
      setAnnouncements(announcementsRes.data.data || []);

      // Load analytics for admins/officers
      if (isAdmin() || isOfficer()) {
        const analyticsRes = await api.get('/analytics/overview');
        setStats(analyticsRes.data.data);
      } else if (isStudent()) {
        const myStatsRes = await api.get('/analytics/me');
        setStats(myStatsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && (
              <p className={`text-sm mt-1 flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.user_profile?.first_name || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your placements
          </p>
        </div>
        {isStudent() && (
          <Link to="/jobs">
            <Button>
              Browse Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isStudent() ? (
          <>
            <StatCard
              icon={Briefcase}
              label="Applications"
              value={stats?.applicationStats?.length || 0}
              color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            />
            <StatCard
              icon={CalendarDays}
              label="Interviews"
              value={stats?.upcomingInterviews?.length || 0}
              color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
            />
            <StatCard
              icon={CheckCircle}
              label="Profile Status"
              value={stats?.profileCompletion ? 'Complete' : 'Incomplete'}
              color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
            />
            <StatCard
              icon={AlertCircle}
              label="Placement Status"
              value={stats?.placementStatus === 'placed' ? 'Placed' : 'Active'}
              color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Total Students"
              value={stats?.totalStudents || 0}
              trend={5}
              color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            />
            <StatCard
              icon={Building2}
              label="Companies"
              value={stats?.totalCompanies || 0}
              trend={12}
              color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
            />
            <StatCard
              icon={Briefcase}
              label="Active Jobs"
              value={stats?.activeJobs || 0}
              color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
            />
            <StatCard
              icon={CheckCircle}
              label="Placed Students"
              value={stats?.placedStudents || 0}
              trend={8}
              color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Job Openings</CardTitle>
              <Link to="/jobs">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active job openings at the moment
                </p>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {job.company?.logo_url ? (
                          <img 
                            src={job.company.logo_url} 
                            alt={job.company.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">{job.company?.name}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="secondary">{job.job_type?.replace('_', ' ')}</Badge>
                          <Badge variant="outline">{job.location}</Badge>
                          {job.salary_max && (
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(job.salary_max)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Deadline: {formatDate(job.application_deadline)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Announcements
              </CardTitle>
              <Link to="/announcements">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No announcements
                </p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-3 rounded-lg border-l-4 bg-muted/30"
                      style={{
                        borderLeftColor: announcement.priority === 'high' || announcement.priority === 'critical'
                          ? 'hsl(var(--destructive))'
                          : 'hsl(var(--primary))'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{announcement.title}</h4>
                        {announcement.is_pinned && (
                          <Badge variant="secondary" className="text-xs">Pinned</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {getRelativeTime(announcement.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions for Students */}
          {isStudent() && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/profile" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Complete Profile
                  </Button>
                </Link>
                <Link to="/applications" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    My Applications
                  </Button>
                </Link>
                <Link to="/interviews" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Interviews
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
