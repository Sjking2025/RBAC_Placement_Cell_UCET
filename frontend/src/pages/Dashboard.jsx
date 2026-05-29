import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SkeletonStats, SkeletonCard, SkeletonList } from '../components/ui/Skeleton';
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
  Bell,
  Sparkles
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
      const [jobsRes, announcementsRes] = await Promise.all([
        api.get('/jobs', { params: { limit: 5, status: 'active' } }),
        api.get('/announcements', { params: { limit: 5 } })
      ]);

      setRecentJobs(jobsRes.data.data || []);
      setAnnouncements(announcementsRes.data.data || []);

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

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCardColors = [
    { bg: 'bg-primary/10', text: 'text-primary', accent: 'from-primary/20 to-primary/5' },
    { bg: 'bg-violet-500/10', text: 'text-violet-500', accent: 'from-violet-500/20 to-violet-500/5' },
    { bg: 'bg-emerald-500/10', text: 'text-emerald-500', accent: 'from-emerald-500/20 to-emerald-500/5' },
    { bg: 'bg-amber-500/10', text: 'text-amber-500', accent: 'from-amber-500/20 to-amber-500/5' },
  ];

  const StatCard = ({ icon: Icon, label, value, trend, colorIdx = 0 }) => {
    const colors = statCardColors[colorIdx % statCardColors.length];
    return (
      <Card className="relative overflow-hidden hover-lift">
        {/* Gradient accent strip */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${colors.accent}`} />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="font-display text-3xl font-bold mt-2">{value}</p>
              {trend && (
                <p className={`text-xs mt-2 flex items-center ${trend > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                  <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(trend)}% from last month
                </p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${colors.bg}`}>
              <Icon className={`h-5 w-5 ${colors.text}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded-lg animate-shimmer" />
          <div className="h-4 w-48 bg-muted rounded-lg animate-shimmer" />
        </div>
        <SkeletonStats count={4} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><SkeletonCard className="h-80" /></div>
          <SkeletonCard className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-stagger-in">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            {getGreeting()}, {user?.user_profile?.first_name || 'User'}
            <Sparkles className="inline-block ml-2 h-6 w-6 text-accent animate-pulse-dot" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening with your placements today
          </p>
        </div>
        {isStudent() && (
          <Link to="/jobs">
            <Button className="group">
              Browse Jobs
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isStudent() ? (
          <>
            <div className="animate-stagger-in delay-100">
              <StatCard icon={Briefcase} label="Applications" value={stats?.applicationStats?.length || 0} colorIdx={0} />
            </div>
            <div className="animate-stagger-in delay-200">
              <StatCard icon={CalendarDays} label="Interviews" value={stats?.upcomingInterviews?.length || 0} colorIdx={1} />
            </div>
            <div className="animate-stagger-in delay-300">
              <StatCard icon={CheckCircle} label="Profile Status" value={stats?.profileCompletion ? 'Complete' : 'Incomplete'} colorIdx={2} />
            </div>
            <div className="animate-stagger-in delay-400">
              <StatCard icon={AlertCircle} label="Placement Status" value={stats?.placementStatus === 'placed' ? 'Placed' : 'Active'} colorIdx={3} />
            </div>
          </>
        ) : (
          <>
            <div className="animate-stagger-in delay-100">
              <StatCard icon={Users} label="Total Students" value={stats?.totalStudents || 0} trend={5} colorIdx={0} />
            </div>
            <div className="animate-stagger-in delay-200">
              <StatCard icon={Building2} label="Companies" value={stats?.totalCompanies || 0} trend={12} colorIdx={1} />
            </div>
            <div className="animate-stagger-in delay-300">
              <StatCard icon={Briefcase} label="Active Jobs" value={stats?.activeJobs || 0} colorIdx={2} />
            </div>
            <div className="animate-stagger-in delay-400">
              <StatCard icon={CheckCircle} label="Placed Students" value={stats?.placedStudents || 0} trend={8} colorIdx={3} />
            </div>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 animate-stagger-in delay-500">
        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Job Openings</CardTitle>
              <Link to="/jobs">
                <Button variant="ghost" size="sm" className="group">
                  View All <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No active job openings</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentJobs.map((job, idx) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="group flex items-start gap-4 p-3.5 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all duration-200 animate-stagger-in"
                      style={{ animationDelay: `${600 + idx * 80}ms` }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                        {job.company?.logo_url ? (
                          <img 
                            src={job.company.logo_url} 
                            alt={job.company.name}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <Building2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{job.title}</h4>
                        <p className="text-xs text-muted-foreground">{job.company?.name}</p>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px]">{job.job_type?.replace('_', ' ')}</Badge>
                          <Badge variant="outline" className="text-[10px]">{job.location}</Badge>
                          {job.salary_max && (
                            <span className="text-[10px] text-muted-foreground">
                              {formatCurrency(job.salary_max)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(job.application_deadline)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent" />
                Announcements
              </CardTitle>
              <Link to="/announcements">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No announcements</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-3 rounded-xl bg-muted/30 border-l-[3px] transition-colors hover:bg-muted/50"
                      style={{
                        borderLeftColor: announcement.priority === 'high' || announcement.priority === 'critical'
                          ? 'hsl(var(--destructive))'
                          : 'hsl(var(--primary))'
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-xs leading-snug">{announcement.title}</h4>
                        {announcement.is_pinned && (
                          <Badge variant="secondary" className="text-[10px] flex-shrink-0">Pinned</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        {announcement.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/profile" className="w-full">
                  <Button variant="outline" className="w-full justify-start text-sm group">
                    <Users className="h-4 w-4 mr-2.5 text-primary" />
                    Complete Profile
                    <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
                <Link to="/applications" className="w-full">
                  <Button variant="outline" className="w-full justify-start text-sm group">
                    <Briefcase className="h-4 w-4 mr-2.5 text-violet-500" />
                    My Applications
                    <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
                <Link to="/interviews" className="w-full">
                  <Button variant="outline" className="w-full justify-start text-sm group">
                    <CalendarDays className="h-4 w-4 mr-2.5 text-emerald-500" />
                    Interviews
                    <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
