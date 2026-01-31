import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Badge } from '../../components/ui/Badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  Upload,
  Plus,
  X,
  Loader2,
  Save,
  Link as LinkIcon,
  Github,
  Linkedin
} from 'lucide-react';
import { formatDate, cn, getInitials } from '../../utils/helpers';
import { DEGREE_TYPES } from '../../utils/constants';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const profileSchema = z.object({
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

const Profile = () => {
  const { user, isStudent } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(profileSchema)
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data;
      setProfile(userData);
      
      // Set form defaults
      reset({
        firstName: userData.user_profile?.first_name || '',
        lastName: userData.user_profile?.last_name || '',
        phone: userData.user_profile?.phone || '',
        address: userData.user_profile?.address || '',
        city: userData.user_profile?.city || '',
        state: userData.user_profile?.state || '',
        cgpa: userData.student_profile?.cgpa?.toString() || '',
        tenthPercentage: userData.student_profile?.tenth_percentage?.toString() || '',
        twelfthPercentage: userData.student_profile?.twelfth_percentage?.toString() || '',
        linkedinUrl: userData.student_profile?.linkedin_url || '',
        githubUrl: userData.student_profile?.github_url || '',
        portfolioUrl: userData.student_profile?.portfolio_url || ''
      });

      if (userData.student_profile?.skills) {
        setSkills(userData.student_profile.skills.map(s => s.skill_name));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.put('/auth/profile', {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        ...(isStudent() && {
          cgpa: parseFloat(data.cgpa) || null,
          tenthPercentage: parseFloat(data.tenthPercentage) || null,
          twelfthPercentage: parseFloat(data.twelfthPercentage) || null,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          portfolioUrl: data.portfolioUrl
        })
      });
      toast.success('Profile updated successfully');
      loadProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      await api.post('/students/skills', { skillName: newSkill.trim() });
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      toast.success('Skill added');
    } catch (error) {
      toast.error('Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      await api.delete(`/students/skills/${encodeURIComponent(skill)}`);
      setSkills(skills.filter(s => s !== skill));
      toast.success('Skill removed');
    } catch (error) {
      toast.error('Failed to remove skill');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    try {
      await api.post('/students/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Resume uploaded successfully');
      loadProfile();
    } catch (error) {
      toast.error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and settings
        </p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
              {getInitials(profile?.user_profile?.first_name, profile?.user_profile?.last_name)}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold">
                {profile?.user_profile?.first_name} {profile?.user_profile?.last_name}
              </h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge>{profile?.role?.replace('_', ' ')}</Badge>
                {isStudent() && profile?.student_profile && (
                  <>
                    <Badge variant="outline">{profile.student_profile.roll_number}</Badge>
                    <Badge variant="secondary">
                      {profile.student_profile.degree} - Batch {profile.student_profile.batch_year}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            {isStudent() && (
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {profile?.student_profile?.cgpa || 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">CGPA</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register('firstName')} error={errors.firstName} />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register('lastName')} error={errors.lastName} />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...register('phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register('address')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information (Students only) */}
        {isStudent() && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cgpa">CGPA</Label>
                <Input id="cgpa" type="number" step="0.01" min="0" max="10" {...register('cgpa')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenthPercentage">10th Percentage</Label>
                <Input id="tenthPercentage" type="number" step="0.01" min="0" max="100" {...register('tenthPercentage')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twelfthPercentage">12th Percentage</Label>
                <Input id="twelfthPercentage" type="number" step="0.01" min="0" max="100" {...register('twelfthPercentage')} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Links (Students only) */}
        {isStudent() && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LinkIcon className="h-5 w-5 mr-2" />
                Profile Links
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl" className="flex items-center">
                  <Linkedin className="h-4 w-4 mr-1" /> LinkedIn
                </Label>
                <Input id="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." {...register('linkedinUrl')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="flex items-center">
                  <Github className="h-4 w-4 mr-1" /> GitHub
                </Label>
                <Input id="githubUrl" type="url" placeholder="https://github.com/..." {...register('githubUrl')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio</Label>
                <Input id="portfolioUrl" type="url" placeholder="https://your-portfolio.com" {...register('portfolioUrl')} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" loading={saving} disabled={!isDirty}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>

      {/* Skills Section (Students only) */}
      {isStudent() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Skills
            </CardTitle>
            <CardDescription>Add your technical and soft skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="py-1.5 px-3">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {skills.length === 0 && (
                <p className="text-muted-foreground">No skills added yet</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <Button type="button" onClick={handleAddSkill}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume Section (Students only) */}
      {isStudent() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Resume
            </CardTitle>
            <CardDescription>Upload your latest resume (PDF format)</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.student_profile?.resume_url ? (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Resume.pdf</p>
                    <p className="text-sm text-muted-foreground">
                      Updated: {formatDate(profile.student_profile.resume_updated_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={profile.student_profile.resume_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">View</Button>
                  </a>
                  <label>
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-1" />
                        Replace
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                {uploadingResume ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload your resume</p>
                    <p className="text-xs text-muted-foreground">PDF format, max 5MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                />
              </label>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
