import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Search,
  Check,
  X,
  Filter,
  Users,
  Loader2,
  ChevronRight,
  Mail,
  Calendar
} from 'lucide-react';
import { Input } from '../ui/Input';
import { formatDate, getRelativeTime } from '../../utils/helpers';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ShortlistingInterface = ({ jobId, jobTitle, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (jobId) loadApplications();
  }, [jobId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/jobs/${jobId}/applications`);
      setApplications(response.data.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    setProcessing(applicationId);
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      toast.success(`Application ${status === 'shortlisted' ? 'shortlisted' : 'rejected'}`);
      loadApplications();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkShortlist = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      await Promise.all(
        selectedIds.map(id => 
          api.put(`/applications/${id}/status`, { status: 'shortlisted' })
        )
      );
      toast.success(`${selectedIds.length} applications shortlisted`);
      setSelectedIds([]);
      loadApplications();
    } catch (error) {
      toast.error('Failed to shortlist applications');
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const pendingApps = applications.filter(a => a.status === 'pending');
    if (selectedIds.length === pendingApps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingApps.map(a => a.id));
    }
  };

  const filteredApplications = applications.filter(app => {
    const studentName = `${app.student?.user?.user_profile?.first_name || ''} ${app.student?.user?.user_profile?.last_name || ''}`;
    return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           app.student?.roll_number?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Shortlist Candidates</h2>
          {jobTitle && <p className="text-muted-foreground">{jobTitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{pendingCount} Pending</Badge>
          <Badge variant="success">{shortlistedCount} Shortlisted</Badge>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedIds.length > 0 && (
              <Button onClick={handleBulkShortlist}>
                <Check className="h-4 w-4 mr-2" />
                Shortlist Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b bg-muted/30">
            <input
              type="checkbox"
              checked={selectedIds.length === pendingCount && pendingCount > 0}
              onChange={toggleAll}
              className="rounded border-input"
            />
            <span className="text-sm font-medium">Select All Pending</span>
          </div>

          {/* Applications */}
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No applications found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredApplications.map((application) => {
                const profile = application.student?.user?.user_profile;
                const studentProfile = application.student;
                const isPending = application.status === 'pending';
                const isSelected = selectedIds.includes(application.id);

                return (
                  <div
                    key={application.id}
                    className={`p-4 hover:bg-muted/30 transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {isPending && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(application.id)}
                          className="rounded border-input"
                        />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">
                            {profile?.first_name} {profile?.last_name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {studentProfile?.roll_number}
                          </Badge>
                          <Badge
                            variant={
                              application.status === 'shortlisted'
                                ? 'success'
                                : application.status === 'rejected'
                                ? 'destructive'
                                : 'warning'
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{studentProfile?.degree}</span>
                          <span>CGPA: {studentProfile?.cgpa || 'N/A'}</span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Applied {getRelativeTime(application.created_at)}
                          </span>
                        </div>
                        {studentProfile?.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {studentProfile.skills.slice(0, 5).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill.skill_name}
                              </Badge>
                            ))}
                            {studentProfile.skills.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{studentProfile.skills.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                              disabled={processing === application.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(application.id, 'shortlisted')}
                              disabled={processing === application.id}
                            >
                              {processing === application.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShortlistingInterface;
