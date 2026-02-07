import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import {
  CheckCircle,
  Loader2,
  FileText,
  Upload,
  AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ApplicationForm = ({ job, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [useExistingResume, setUseExistingResume] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!useExistingResume && !resumeFile) {
      toast.error('Please upload a resume or use your existing one');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('jobId', job.id);
      formData.append('coverLetter', coverLetter);
      formData.append('useExistingResume', useExistingResume);
      
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Application submitted successfully!');
      onSuccess?.();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit application';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Apply to {job?.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{job?.company?.name}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Summary */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <h4 className="font-medium">{job?.title}</h4>
            <div className="flex flex-wrap gap-2">
              <Badge>{job?.job_type}</Badge>
              {job?.location && <Badge variant="outline">{job.location}</Badge>}
              {job?.salary_max && (
                <Badge variant="secondary">
                  Up to ₹{(job.salary_max / 100000).toFixed(1)} LPA
                </Badge>
              )}
            </div>
          </div>

          {/* Resume Selection */}
          <div className="space-y-4">
            <Label>Resume</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/30">
                <input
                  type="radio"
                  checked={useExistingResume}
                  onChange={() => setUseExistingResume(true)}
                  className="accent-primary"
                />
                <div>
                  <span className="font-medium">Use my profile resume</span>
                  <p className="text-xs text-muted-foreground">Apply with the resume in your profile</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/30">
                <input
                  type="radio"
                  checked={!useExistingResume}
                  onChange={() => setUseExistingResume(false)}
                  className="accent-primary"
                />
                <div className="flex-1">
                  <span className="font-medium">Upload new resume</span>
                  <p className="text-xs text-muted-foreground">Upload a different resume for this job</p>
                </div>
              </label>
            </div>

            {!useExistingResume && (
              <div className="ml-6">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/30">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  {resumeFile ? (
                    <span className="font-medium">{resumeFile.name}</span>
                  ) : (
                    <>
                      <span className="font-medium">Click to upload</span>
                      <span className="text-xs text-muted-foreground">PDF format, max 5MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Tell the employer why you're a great fit for this role..."
            />
          </div>

          {/* Eligibility Check */}
          {job?.eligibility_criteria && (
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                Eligibility Requirements
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {job.min_cgpa && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Minimum CGPA: {job.min_cgpa}
                  </li>
                )}
                {job.min_tenth_percentage && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Minimum 10th%: {job.min_tenth_percentage}%
                  </li>
                )}
                {job.min_twelfth_percentage && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Minimum 12th%: {job.min_twelfth_percentage}%
                  </li>
                )}
                {job.max_backlogs === 0 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    No active backlogs
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApplicationForm;
