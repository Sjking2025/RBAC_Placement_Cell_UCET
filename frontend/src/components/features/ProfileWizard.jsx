import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Badge } from '../ui/Badge';
import {
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  Link2,
  Briefcase,
  CheckCircle,
  Loader2,
  Upload
} from 'lucide-react';
import { DEGREE_TYPES } from '../../utils/constants';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Academic', icon: GraduationCap },
  { id: 3, title: 'Links & Skills', icon: Link2 },
  { id: 4, title: 'Resume', icon: Briefcase }
];

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  cgpa: z.string().optional(),
  tenthPercentage: z.string().optional(),
  twelfthPercentage: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal(''))
});

const ProfileWizard = ({ onComplete, initialData }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {}
  });

  const nextStep = async () => {
    let fields = [];
    if (currentStep === 1) fields = ['firstName', 'lastName', 'phone'];
    if (currentStep === 2) fields = ['cgpa', 'tenthPercentage', 'twelfthPercentage'];
    if (currentStep === 3) fields = ['linkedinUrl', 'githubUrl', 'portfolioUrl'];

    const isValid = await trigger(fields);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Update profile
      await api.put('/auth/profile', {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        cgpa: parseFloat(data.cgpa) || null,
        tenthPercentage: parseFloat(data.tenthPercentage) || null,
        twelfthPercentage: parseFloat(data.twelfthPercentage) || null,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl
      });

      // Add skills
      for (const skill of skills) {
        try {
          await api.post('/students/skills', { skillName: skill });
        } catch (e) {
          // Skip if skill already exists
        }
      }

      // Upload resume if selected
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        await api.post('/students/resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Profile setup complete!');
      onComplete?.();
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isComplete
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 rounded ${
                      isComplete ? 'bg-primary' : 'bg-muted'
                    }`}
                    style={{ width: '60px' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Personal Information'}
              {currentStep === 2 && 'Academic Details'}
              {currentStep === 3 && 'Links & Skills'}
              {currentStep === 4 && 'Upload Resume'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Tell us about yourself'}
              {currentStep === 2 && 'Add your academic information'}
              {currentStep === 3 && 'Add your professional links and skills'}
              {currentStep === 4 && 'Upload your resume to complete your profile'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 " {...register('phone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register('address')} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register('city')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...register('state')} />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Academic */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cgpa">Current CGPA</Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g., 8.50"
                    {...register('cgpa')}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tenthPercentage">10th Percentage</Label>
                    <Input
                      id="tenthPercentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="e.g., 92.50"
                      {...register('tenthPercentage')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twelfthPercentage">12th Percentage</Label>
                    <Input
                      id="twelfthPercentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="e.g., 88.00"
                      {...register('twelfthPercentage')}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  * Your degree and batch information is already set from your registration.
                </p>
              </>
            )}

            {/* Step 3: Links & Skills */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    {...register('linkedinUrl')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    placeholder="https://github.com/yourusername"
                    {...register('githubUrl')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    placeholder="https://yourportfolio.com"
                    {...register('portfolioUrl')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={addSkill}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="py-1 px-2">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Resume */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  {resumeFile ? (
                    <>
                      <p className="font-medium">{resumeFile.name}</p>
                      <p className="text-sm text-muted-foreground">Click to change</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Click to upload your resume</p>
                      <p className="text-sm text-muted-foreground">PDF format, max 5MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />
                </label>
                <p className="text-sm text-muted-foreground text-center">
                  You can skip this step and upload later from your profile.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ProfileWizard;
