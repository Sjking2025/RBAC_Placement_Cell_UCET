import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobsApi } from '../../api/jobsApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { 
  formatDate, 
  formatSalaryLPA, 
  formatStatus, 
  isDeadlinePassed,
  cn 
} from '../../utils/helpers';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await jobsApi.getById(id);
      setJob(response.data);
      
      // Check if student has already applied
      if (response.data.applications?.some(app => app.student?.user_id === user?.id)) {
        setHasApplied(true);
      }
    } catch (error) {
      console.error('Failed to load job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await jobsApi.apply(id);
      toast.success('Application submitted successfully!');
      setHasApplied(true);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to apply';
      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Job not found</h2>
        <Link to="/jobs">
          <Button className="mt-4">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  const deadlinePassed = isDeadlinePassed(job.application_deadline);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {job.company?.logo_url ? (
                    <img 
                      src={job.company.logo_url} 
                      alt={job.company.name}
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold">{job.title}</h1>
                      <Link 
                        to={`/companies/${job.company?.id}`}
                        className="text-lg text-muted-foreground hover:text-primary"
                      >
                        {job.company?.name}
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={job.status === 'active' ? 'success' : 'secondary'}>
                        {formatStatus(job.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-muted-foreground">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {formatStatus(job.job_type)}
                    </span>
                    <span className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {formatStatus(job.work_mode)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About the Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          {job.responsibilities && (
            <Card>
              <CardHeader>
                <CardTitle>Key Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{job.responsibilities}</p>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {job.skills_required?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((skill, idx) => (
                    <Badge key={idx} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Perks */}
          {job.perks && (
            <Card>
              <CardHeader>
                <CardTitle>Perks & Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{job.perks}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Salary</span>
                  <span className="font-semibold">
                    {formatSalaryLPA(job.salary_min, job.salary_max)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Positions</span>
                  <span className="font-semibold">{job.positions_available}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className={cn(
                    "font-semibold",
                    deadlinePassed && "text-destructive"
                  )}>
                    {formatDate(job.application_deadline)}
                  </span>
                </div>
                
                <hr />

                {isStudent() && (
                  <>
                    {hasApplied ? (
                      <Button className="w-full" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Already Applied
                      </Button>
                    ) : deadlinePassed ? (
                      <Button className="w-full" disabled variant="secondary">
                        <XCircle className="h-4 w-4 mr-2" />
                        Deadline Passed
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleApply}
                        loading={applying}
                      >
                        Apply Now
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Eligibility Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.required_cgpa && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Minimum CGPA</span>
                  <span>{job.required_cgpa}</span>
                </div>
              )}
              {job.allowed_backlogs !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Backlogs Allowed</span>
                  <span>{job.allowed_backlogs}</span>
                </div>
              )}
              {job.eligible_degrees?.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground block mb-1">Eligible Degrees</span>
                  <div className="flex flex-wrap gap-1">
                    {job.eligible_degrees.map((degree, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{degree}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {job.eligible_batches?.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground block mb-1">Batch</span>
                  <div className="flex flex-wrap gap-1">
                    {job.eligible_batches.map((batch, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{batch}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About {job.company?.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.company?.industry && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Industry:</span>
                  <span className="ml-2">{job.company.industry}</span>
                </div>
              )}
              {job.company?.website && (
                <a 
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  Visit Website
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
              <Link to={`/companies/${job.company?.id}`}>
                <Button variant="outline" className="w-full mt-2">
                  View Company Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Posted Info */}
          <div className="text-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 inline mr-1" />
            Posted on {formatDate(job.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
