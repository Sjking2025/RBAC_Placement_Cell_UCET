import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import {
  BarChart3,
  Building2,
  Users,
  TrendingUp,
  Download,
  Printer,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PlacementReports = () => {
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);

  useEffect(() => {
    loadReports();
  }, [yearFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [overallRes, deptRes, companyRes] = await Promise.all([
        api.get(`/analytics/placement?year=${yearFilter}`),
        api.get(`/analytics/departments?year=${yearFilter}`),
        api.get(`/analytics/companies?year=${yearFilter}`)
      ]);
      setStats(overallRes.data.data);
      setDepartmentStats(deptRes.data.data || []);
      setCompanyStats(companyRes.data.data || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/analytics/export?year=${yearFilter}&format=${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `placement_report_${yearFilter}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded');
    } catch (error) {
      toast.error('Failed to export report');
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Placement Reports</h1>
          <p className="text-muted-foreground">Comprehensive placement statistics and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(parseInt(e.target.value))}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {[0, 1, 2, 3, 4].map((offset) => {
              const year = new Date().getFullYear() - offset;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
          <Button variant="outline" onClick={() => handleExport('xlsx')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Printer className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold">{stats?.totalStudents || 0}</p>
            </div>
            <Users className="h-10 w-10 text-primary/20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Placed</p>
              <p className="text-3xl font-bold text-green-600">{stats?.placedStudents || 0}</p>
              <p className="text-xs text-muted-foreground">{stats?.placementRate || 0}% rate</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600/20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Companies Visited</p>
              <p className="text-3xl font-bold">{stats?.companiesVisited || 0}</p>
            </div>
            <Building2 className="h-10 w-10 text-primary/20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Package</p>
              <p className="text-3xl font-bold">{formatCurrency(stats?.avgPackage || 0)}</p>
              <p className="text-xs text-muted-foreground">Max: {formatCurrency(stats?.maxPackage || 0)}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-primary/20" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department-wise Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Placement</CardTitle>
            <CardDescription>Placement statistics by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              ) : (
                departmentStats.map((dept) => (
                  <div key={dept.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{dept.name}</span>
                      <span className="text-muted-foreground">
                        {dept.placedCount}/{dept.totalCount} ({dept.placementRate}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${dept.placementRate}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Top Recruiting Companies</CardTitle>
            <CardDescription>Companies with most hires this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              ) : (
                companyStats.slice(0, 10).map((company, index) => (
                  <div key={company.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm w-6">{index + 1}.</span>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.industry}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{company.hiresCount} hires</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg: {formatCurrency(company.avgPackage)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Package Distribution</CardTitle>
          <CardDescription>Distribution of salary packages offered</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { range: '< 5 LPA', count: stats?.packageDist?.below5 || 0, color: 'bg-gray-500' },
              { range: '5-10 LPA', count: stats?.packageDist?.range5to10 || 0, color: 'bg-blue-500' },
              { range: '10-15 LPA', count: stats?.packageDist?.range10to15 || 0, color: 'bg-green-500' },
              { range: '15-25 LPA', count: stats?.packageDist?.range15to25 || 0, color: 'bg-yellow-500' },
              { range: '> 25 LPA', count: stats?.packageDist?.above25 || 0, color: 'bg-purple-500' }
            ].map((item) => (
              <div key={item.range} className="text-center p-4 border rounded-lg">
                <div className={`w-4 h-4 rounded-full ${item.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-sm text-muted-foreground">{item.range}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlacementReports;
