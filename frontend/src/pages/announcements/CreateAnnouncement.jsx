import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Loader2, Save, FileText, Megaphone, Target, Pin, Calendar } from 'lucide-react';
import announcementsApi from '../../api/announcementsApi';
import toast from 'react-hot-toast';

const CreateAnnouncement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    isPinned: false,
    expiresAt: '',
    targetRoles: ['student', 'coordinator', 'dept_officer', 'admin'], // Default to all roles
    targetDepartments: [],
    targetBatches: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => {
      const currentRoles = prev.targetRoles;
      if (currentRoles.includes(role)) {
        return { ...prev, targetRoles: currentRoles.filter(r => r !== role) };
      } else {
        return { ...prev, targetRoles: [...currentRoles, role] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        isPinned: formData.isPinned,
        expiresAt: formData.expiresAt || null,
        targetRoles: formData.targetRoles,
        // Send empty arrays if not specified to target all
        targetDepartments: [], 
        targetBatches: []
      };

      await announcementsApi.create(payload);
      toast.success('Announcement created successfully!');
      navigate('/announcements');
    } catch (error) {
      console.error('Failed to create announcement:', error);
      const message = error.response?.data?.message || 'Failed to create announcement';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'student', label: 'Students' },
    { value: 'coordinator', label: 'Coordinators' },
    { value: 'dept_officer', label: 'Dept Officers' },
    { value: 'admin', label: 'Admins' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/announcements')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Create Announcement</CardTitle>
              <p className="text-sm text-muted-foreground">Post a new update for students and staff</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="pl-9"
                    placeholder="e.g., Upcoming Campus Drive - Tech Corp"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={6}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  placeholder=" detailed description of the announcement..."
                  required
                />
              </div>
            </div>

            {/* Settings */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="job_posting">Job Posting</option>
                  <option value="event">Event</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-3">
              <Label>Target Audience</Label>
              <div className="flex flex-wrap gap-2">
                {roles.map(role => (
                  <Button
                    key={role.value}
                    type="button"
                    variant={formData.targetRoles.includes(role.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRoleToggle(role.value)}
                    className="gap-2"
                  >
                    {formData.targetRoles.includes(role.value) && <Target className="h-3 w-3" />}
                    {role.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Select user roles to notify</p>
            </div>

            {/* Optional Settings */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expires On (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    id="expiresAt"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleChange}
                    className="pl-9"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="flex items-center h-full pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPinned"
                    checked={formData.isPinned}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    <span className="text-sm font-medium">Pin to top</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/announcements')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Post Announcement
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAnnouncement;
