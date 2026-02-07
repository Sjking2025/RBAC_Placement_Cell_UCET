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
  MessageSquare,
  Users,
  Calendar,
  Pin,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  targetAudience: z.enum(['all', 'students', 'staff', 'department']),
  departmentId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  expiresAt: z.string().optional(),
  isPinned: z.boolean().optional()
});

const CreateAnnouncement = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      targetAudience: 'all',
      departmentId: '',
      priority: 'medium',
      expiresAt: '',
      isPinned: false
    }
  });

  const targetAudience = watch('targetAudience');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/announcements', {
        title: data.title,
        content: data.content,
        targetAudience: data.targetAudience,
        departmentId: data.targetAudience === 'department' ? parseInt(data.departmentId) : null,
        priority: data.priority,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        isPinned: data.isPinned
      });

      toast.success('Announcement published!');
      onSuccess?.();
      if (!onSuccess) navigate('/announcements');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create announcement';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Create Announcement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Announcement title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <textarea
              id="content"
              rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Write your announcement content here..."
              {...register('content')}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label>Target Audience *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'all', label: 'Everyone' },
                { value: 'students', label: 'Students' },
                { value: 'staff', label: 'Staff Only' },
                { value: 'department', label: 'Department' }
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                    targetAudience === value
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    value={value}
                    {...register('targetAudience')}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority and Expiry */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                {...register('priority')}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires On (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                {...register('expiresAt')}
              />
            </div>
          </div>

          {/* Pin Option */}
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <input
              type="checkbox"
              id="isPinned"
              {...register('isPinned')}
              className="rounded border-input"
            />
            <div>
              <Label htmlFor="isPinned" className="flex items-center gap-2 cursor-pointer">
                <Pin className="h-4 w-4" />
                Pin this announcement
              </Label>
              <p className="text-xs text-muted-foreground">
                Pinned announcements appear at the top of the list
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel || (() => navigate('/announcements'))}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Publish Announcement
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateAnnouncement;
