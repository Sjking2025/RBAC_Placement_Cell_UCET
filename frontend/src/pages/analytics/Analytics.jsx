import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ExportAnalyticsButton } from '../../components/ui/ExportButton';
import { SkeletonStats } from '../../components/ui/Skeleton';
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
  GraduationCap,
  DollarSign,
  Loader2,
  BarChart3,
  PieChart
} from 'lucide-react';
import { formatCurrency, formatStatus } from '../../utils/helpers';
import api from '../../api/axios';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('current_year');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analytics/overview', { params: { period } });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, subValue, color }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subValue && (
              <p className="text-sm text-muted-foreground mt-1">{subValue}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">Loading placement statistics...</p>
          </div>
        </div>
        <SkeletonStats count={4} />
        <SkeletonStats count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Placement statistics and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="current_year">Current Year</option>
            <option value="last_year">Last Year</option>
            <option value="all_time">All Time</option>
          </select>
          <ExportAnalyticsButton />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats?.totalStudents || 0}
          subValue="Registered"
          color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
        />
        <StatCard
          icon={CheckCircle}
          label="Placed Students"
          value={stats?.placedStudents || 0}
          subValue={`${stats?.placementRate || 0}% placement rate`}
          color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
        />
        <StatCard
          icon={Building2}
          label="Partner Companies"
          value={stats?.totalCompanies || 0}
          subValue="Active partners"
          color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
        />
        <StatCard
          icon={DollarSign}
          label="Average Package"
          value={formatCurrency(stats?.averagePackage || 0)}
          subValue={`Highest: ${formatCurrency(stats?.highestPackage || 0)}`}
          color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Job Openings"
          value={stats?.activeJobs || 0}
          subValue="Currently active"
          color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
        />
        <StatCard
          icon={Clock}
          label="Pending Applications"
          value={stats?.pendingApplications || 0}
          subValue="Awaiting review"
          color="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
        />
        <StatCard
          icon={GraduationCap}
          label="Total Offers"
          value={stats?.totalOffers || 0}
          subValue="Made this season"
          color="bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Applications"
          value={stats?.avgApplicationsPerStudent || 0}
          subValue="Per student"
          color="bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department-wise Placements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Department-wise Placements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.departmentStats || []).map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{dept.name}</span>
                    <span>{dept.placed}/{dept.total} ({Math.round(dept.placed/dept.total*100)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(dept.placed/dept.total)*100}%` }}
                    />
                  </div>
                </div>
              ))}
              {(!stats?.departmentStats || stats.departmentStats.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No department data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Recruiters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Top Recruiters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.topRecruiters || []).map((company, idx) => (
                <div key={company.name} className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{company.hires} students</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(company.averagePackage)} avg
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.topRecruiters || stats.topRecruiters.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No recruiter data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Application Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(stats?.applicationStatusBreakdown || {}).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'selected' ? 'bg-green-500' :
                    status === 'rejected' ? 'bg-red-500' :
                    status === 'pending' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{formatStatus(status)}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                </div>
              ))}
              {Object.keys(stats?.applicationStatusBreakdown || {}).length === 0 && (
                <p className="col-span-2 text-center text-muted-foreground py-8">
                  No application data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Package Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Package Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.packageDistribution || []).map((range) => (
                <div key={range.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{range.label}</span>
                    <span>{range.count} students</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(range.count / (stats?.placedStudents || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {(!stats?.packageDistribution || stats.packageDistribution.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No package data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
