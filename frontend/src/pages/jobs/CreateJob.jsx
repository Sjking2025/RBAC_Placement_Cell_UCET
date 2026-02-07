import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  GraduationCap,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { JOB_TYPES, DEGREE_TYPES } from '../../utils/constants';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  company_id: z.string().min(1, 'Please select a company'),
  job_type: z.string().min(1, 'Please select job type'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  ctc_lpa: z.string().min(1, 'CTC is required'),
  stipend_monthly: z.string().optional(),
  openings: z.string().min(1, 'Number of openings is required'),
  deadline: z.string().min(1, 'Application deadline is required'),
  min_cgpa: z.string().optional(),
  max_backlogs: z.string().optional(),
  eligible_degrees: z.array(z.string()).min(1, 'Select at least one eligible degree'),
  skills_required: z.string().optional(),
});

const CreateJob = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      company_id: '',
      job_type: 'full_time',
      description: '',
      requirements: '',
      responsibilities: '',
      location: '',
      ctc_lpa: '',
      stipend_monthly: '',
      openings: '1',
      deadline: '',
      min_cgpa: '',
      max_backlogs: '0',
      eligible_degrees: [],
      skills_required: ''
    }
  });

  const selectedDegrees = watch('eligible_degrees') || [];

  // Load companies on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await api.get('/companies', { params: { limit: 100 } });
        setCompanies(response.data.data || []);
      } catch (error) {
        console.error('Failed to load companies:', error);
        toast.error('Failed to load companies');
      }
    };
    loadCompanies();
  }, []);

  const handleDegreeToggle = (degree) => {
    const current = selectedDegrees;
    if (current.includes(degree)) {
      setValue('eligible_degrees', current.filter(d => d !== degree));
    } else {
      setValue('eligible_degrees', [...current, degree]);
    }
  };

  const nextStep = async () => {
    // Validate current step
    let fieldsToValidate = [];
    if (step === 1) fieldsToValidate = ['title', 'company_id', 'job_type', 'location'];
    if (step === 2) fieldsToValidate = ['description'];
    if (step === 3) fieldsToValidate = ['ctc_lpa', 'openings', 'deadline'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        companyId: parseInt(data.company_id),
        title: data.title,
        description: data.description,
        jobType: data.job_type,
        location: data.location,
        workMode: 'onsite',
        salaryMin: parseFloat(data.ctc_lpa) * 100000, // Convert LPA to yearly
        salaryMax: parseFloat(data.ctc_lpa) * 100000,
        positionsAvailable: parseInt(data.openings),
        requiredCgpa: data.min_cgpa ? parseFloat(data.min_cgpa) : null,
        allowedBacklogs: data.max_backlogs ? parseInt(data.max_backlogs) : 0,
        eligibleDegrees: data.eligible_degrees || [],
        skillsRequired: data.skills_required ? data.skills_required.split(',').map(s => s.trim()) : [],
        requirements: data.requirements || '',
        responsibilities: data.responsibilities || '',
        applicationDeadline: data.deadline
      };

      await api.post('/jobs', payload);
      toast.success('Job posting created successfully!');
      navigate('/jobs');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create job posting';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
              s < step
                ? 'bg-primary text-primary-foreground'
                : s === step
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {s < step ? <CheckCircle className="h-5 w-5" /> : s}
          </div>
          {s < 4 && (
            <div
              className={`w-16 h-1 mx-2 rounded ${
                s < step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Job Posting</CardTitle>
          <p className="text-muted-foreground">
            Step {step} of 4: {
              step === 1 ? 'Basic Information' :
              step === 2 ? 'Job Details' :
              step === 3 ? 'Compensation & Deadline' :
              'Eligibility Criteria'
            }
          </p>
        </CardHeader>

        <CardContent>
          <StepIndicator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="title"
                      placeholder="e.g., Software Engineer"
                      className="pl-10"
                      {...register('title')}
                    />
                  </div>
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_id">Company *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      id="company_id"
                      className="w-full h-10 rounded-md border border-input bg-background pl-10 pr-3 text-sm"
                      {...register('company_id')}
                    >
                      <option value="">Select a company</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.company_id && <p className="text-sm text-destructive">{errors.company_id.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type *</Label>
                    <select
                      id="job_type"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      {...register('job_type')}
                    >
                      {JOB_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="e.g., Bangalore, KA"
                        className="pl-10"
                        {...register('location')}
                      />
                    </div>
                    {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Job Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <textarea
                    id="description"
                    rows={6}
                    placeholder="Describe the job role, responsibilities, and what makes this opportunity exciting..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    {...register('description')}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <textarea
                    id="requirements"
                    rows={4}
                    placeholder="List the required skills, qualifications, and experience..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    {...register('requirements')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Key Responsibilities</Label>
                  <textarea
                    id="responsibilities"
                    rows={4}
                    placeholder="List the main responsibilities of this role..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    {...register('responsibilities')}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Compensation */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctc_lpa">CTC (LPA) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="ctc_lpa"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 12.5"
                        className="pl-10"
                        {...register('ctc_lpa')}
                      />
                    </div>
                    {errors.ctc_lpa && <p className="text-sm text-destructive">{errors.ctc_lpa.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stipend_monthly">Stipend/Month (for internships)</Label>
                    <Input
                      id="stipend_monthly"
                      type="number"
                      placeholder="e.g., 50000"
                      {...register('stipend_monthly')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openings">Number of Openings *</Label>
                    <Input
                      id="openings"
                      type="number"
                      min="1"
                      {...register('openings')}
                    />
                    {errors.openings && <p className="text-sm text-destructive">{errors.openings.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      {...register('deadline')}
                    />
                    {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills_required">Required Skills (comma separated)</Label>
                  <Input
                    id="skills_required"
                    placeholder="e.g., JavaScript, React, Node.js, SQL"
                    {...register('skills_required')}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Eligibility */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_cgpa">Minimum CGPA</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="min_cgpa"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        placeholder="e.g., 7.0"
                        className="pl-10"
                        {...register('min_cgpa')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_backlogs">Maximum Backlogs Allowed</Label>
                    <Input
                      id="max_backlogs"
                      type="number"
                      min="0"
                      placeholder="e.g., 0"
                      {...register('max_backlogs')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Eligible Degrees *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DEGREE_TYPES.map((degree) => (
                      <button
                        key={degree.value}
                        type="button"
                        onClick={() => handleDegreeToggle(degree.value)}
                        className={`p-2 text-sm rounded-md border transition-colors ${
                          selectedDegrees.includes(degree.value)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-input hover:bg-muted'
                        }`}
                      >
                        {degree.label}
                      </button>
                    ))}
                  </div>
                  {errors.eligible_degrees && (
                    <p className="text-sm text-destructive">{errors.eligible_degrees.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Job Posting
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateJob;
