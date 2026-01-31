import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Bell,
  Pin,
  Calendar,
  Plus,
  Loader2,
  Megaphone,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { formatDate, getRelativeTime, cn } from '../../utils/helpers';
import api from '../../api/axios';

const Announcements = () => {
  const { isCoordinator } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAnnouncements();
  }, [filter]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'pinned') params.pinned = true;
      if (filter !== 'all' && filter !== 'pinned') params.type = filter;
      
      const response = await api.get('/announcements', { params });
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <Megaphone className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'high': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'medium': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default: return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
    }
  };

  const typeFilters = [
    { value: 'all', label: 'All' },
    { value: 'pinned', label: 'Pinned' },
    { value: 'general', label: 'General' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'job_posting', label: 'Jobs' },
    { value: 'event', label: 'Events' },
    { value: 'deadline', label: 'Deadlines' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest news and updates
          </p>
        </div>
        {isCoordinator() && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {typeFilters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No announcements</h3>
            <p className="text-muted-foreground">
              There are no announcements to display
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={cn(
                "border-l-4 overflow-hidden",
                getPriorityColor(announcement.priority)
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Priority Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getPriorityIcon(announcement.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          {announcement.is_pinned && (
                            <Pin className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(announcement.created_at)}
                          <span>•</span>
                          <span>{getRelativeTime(announcement.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Badge variant="outline">
                          {announcement.type?.replace('_', ' ')}
                        </Badge>
                        <Badge 
                          variant={
                            announcement.priority === 'critical' ? 'destructive' :
                            announcement.priority === 'high' ? 'warning' :
                            'secondary'
                          }
                        >
                          {announcement.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {announcement.content}
                      </p>
                    </div>

                    {/* Attachment */}
                    {announcement.attachment_url && (
                      <div className="mt-4">
                        <a 
                          href={announcement.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          📎 View Attachment
                        </a>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        Posted by: {announcement.creator?.user_profile?.first_name || 'Admin'}
                      </span>
                      {announcement.expires_at && (
                        <span>
                          Expires: {formatDate(announcement.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
