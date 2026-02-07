import { useState } from 'react';
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
  Calendar,
  Clock,
  MapPin,
  Video,
  Loader2,
  User
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  applicationId: z.string().min(1, 'Application is required'),
  scheduledAt: z.string().min(1, 'Date and time is required'),
  interviewMode: z.enum(['in_person', 'virtual', 'phone']),
  venue: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  interviewerName: z.string().optional(),
  interviewerEmail: z.string().email().optional().or(z.literal('')),
  duration: z.string().optional(),
  notes: z.string().optional()
});

const ScheduleInterview = ({ applicationId, jobTitle, companyName, studentName, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      applicationId: applicationId || '',
      scheduledAt: '',
      interviewMode: 'virtual',
      venue: '',
      meetingLink: '',
      interviewerName: '',
      interviewerEmail: '',
      duration: '60',
      notes: ''
    }
  });

  const interviewMode = watch('interviewMode');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/interviews', {
        applicationId: parseInt(data.applicationId),
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        interviewMode: data.interviewMode,
        venue: data.interviewMode === 'in_person' ? data.venue : null,
        meetingLink: data.interviewMode === 'virtual' ? data.meetingLink : null,
        interviewerName: data.interviewerName,
        interviewerEmail: data.interviewerEmail,
        duration: parseInt(data.duration) || 60,
        notes: data.notes
      });

      toast.success('Interview scheduled successfully!');
      onSuccess?.();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to schedule interview';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Schedule Interview
        </CardTitle>
        {jobTitle && (
          <p className="text-sm text-muted-foreground mt-1">
            {jobTitle} at {companyName} • Candidate: {studentName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Date and Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & Time *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                {...register('scheduledAt')}
              />
              {errors.scheduledAt && (
                <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <select
                id="duration"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                {...register('duration')}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>

          {/* Interview Mode */}
          <div className="space-y-2">
            <Label>Interview Mode *</Label>
            <div className="flex gap-4">
              {[
                { value: 'virtual', label: 'Virtual', icon: Video },
                { value: 'in_person', label: 'In Person', icon: MapPin },
                { value: 'phone', label: 'Phone', icon: Clock }
              ].map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                    interviewMode === value
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    value={value}
                    {...register('interviewMode')}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <Icon className={`h-6 w-6 mb-2 ${interviewMode === value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Venue or Meeting Link */}
          {interviewMode === 'in_person' && (
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                placeholder="e.g., Conference Room A, Building 2"
                {...register('venue')}
              />
            </div>
          )}
          {interviewMode === 'virtual' && (
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                type="url"
                placeholder="https://meet.google.com/..."
                {...register('meetingLink')}
              />
            </div>
          )}

          {/* Interviewer Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interviewerName">Interviewer Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="interviewerName"
                  className="pl-10"
                  placeholder="Name of interviewer"
                  {...register('interviewerName')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewerEmail">Interviewer Email</Label>
              <Input
                id="interviewerEmail"
                type="email"
                placeholder="email@company.com"
                {...register('interviewerEmail')}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <textarea
              id="notes"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Any special instructions or topics to cover..."
              {...register('notes')}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Schedule Interview
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ScheduleInterview;
