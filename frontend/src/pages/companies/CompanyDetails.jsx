import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonProfile } from '../../components/ui/Skeleton';
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Users,
  Briefcase,
  Calendar,
  Edit,
  ExternalLink,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyDetails();
  }, [id]);

  const loadCompanyDetails = async () => {
    setLoading(true);
    try {
      const [companyRes, jobsRes] = await Promise.all([
        api.get(`/companies/${id}`),
        api.get('/jobs', { params: { companyId: id, limit: 10 } })
      ]);
      setCompany(companyRes.data.data);
      setJobs(jobsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load company:', error);
      toast.error('Failed to load company details');
      navigate('/companies');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.patch(`/companies/${id}/status`, { status: 'active' });
      toast.success('Company approved');
      loadCompanyDetails();
    } catch (error) {
      toast.error('Failed to approve company');
    }
  };

  const handleReject = async () => {
    try {
      await api.patch(`/companies/${id}/status`, { status: 'rejected' });
      toast.success('Company rejected');
      loadCompanyDetails();
    } catch (error) {
      toast.error('Failed to reject company');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/companies')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        <SkeletonProfile />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p>Company not found</p>
        <Link to="/companies">
          <Button className="mt-4">Back to Companies</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/companies')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Company Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-24 h-24 rounded-lg object-contain bg-muted"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{company.name}</h1>
                  <p className="text-muted-foreground">{company.industry}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <Badge variant={company.status === 'active' ? 'success' : 'secondary'}>
                      {company.status === 'active' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {company.status}
                    </Badge>
                    {company.company_type && (
                      <Badge variant="outline">{company.company_type}</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {company.status === 'pending' && (
                    <>
                      <Button onClick={handleApprove}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button variant="destructive" onClick={handleReject}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Briefcase className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-2xl font-bold">{jobs.length}</p>
                  <p className="text-xs text-muted-foreground">Active Jobs</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-2xl font-bold">{company._count?.placement_records || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Hires</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-2xl font-bold">{formatCurrency(company.highest_package || 0)}</p>
                  <p className="text-xs text-muted-foreground">Highest Package</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm font-medium">{formatDate(company.created_at)}</p>
                  <p className="text-xs text-muted-foreground">Registered</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Company Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {company.description || 'No description available.'}
              </p>
            </CardContent>
          </Card>

          {/* Active Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Job Postings</CardTitle>
              <Link to={`/jobs?company=${id}`}>
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active job postings
                </p>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 5).map((job) => (
                    <Link key={job.id} to={`/jobs/${job.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{job.job_type}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(job.ctc_lpa)} LPA</p>
                          <p className="text-xs text-muted-foreground">
                            {job._count?.applications || 0} applications
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  <span className="truncate">{company.website}</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
              {(company.city || company.state) && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{[company.city, company.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {company.address && (
                <p className="text-sm text-muted-foreground pl-7">
                  {company.address}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Primary Contact */}
          {company.contacts?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Primary Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.contacts.filter(c => c.is_primary).map((contact) => (
                  <div key={contact.id}>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.designation}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${contact.email}`} className="hover:text-foreground">
                        {contact.email}
                      </a>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${contact.phone}`} className="hover:text-foreground">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {company.established_year && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Established</span>
                  <span>{company.established_year}</span>
                </div>
              )}
              {company.employee_count && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employees</span>
                  <span>{company.employee_count}</span>
                </div>
              )}
              {company.headquarters && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Headquarters</span>
                  <span>{company.headquarters}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
