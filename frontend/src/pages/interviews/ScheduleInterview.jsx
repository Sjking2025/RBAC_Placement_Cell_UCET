import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { ArrowLeft, Loader2, Calendar, Clock, MapPin, Video, User, Building2 } from 'lucide-react';
import api from '../../api/axios';
import jobsApi from '../../api/jobsApi';
import interviewsApi from '../../api/interviewsApi';
import toast from 'react-hot-toast';

const ScheduleInterview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  
  const [formData, setFormData] = useState({
    jobId: '',
    applicationIds: [],
    interviewType: 'technical',
    interviewMode: 'online',
    scheduledDate: '',
    scheduledTime: '',
    durationMinutes: '60',
    location: '',
    meetingLink: '',
    interviewerNames: '',
    notes: ''
  });

  // Load jobs on mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await jobsApi.getAll({ status: 'active', limit: 100 });
        setJobs(response.data || []);
      } catch (error) {
        console.error('Failed to load jobs:', error);
        toast.error('Failed to load jobs');
      }
    };
    loadJobs();
  }, []);

  // Load applications when job changes
  useEffect(() => {
    if (formData.jobId) {
      const loadApplications = async () => {
        try {
          const response = await jobsApi.getApplications(formData.jobId);
          setApplications(response.data || []);
        } catch (error) {
          console.error('Failed to load applications:', error);
          toast.error('Failed to load applications');
          setApplications([]);
        }
      };
      loadApplications();
    } else {
      setApplications([]);
    }
  }, [formData.jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset application if job changes
      ...(name === 'jobId' && { applicationIds: [] })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        applicationId: formData.applicationIds,
        interviewType: formData.interviewType,
        interviewMode: formData.interviewMode,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        durationMinutes: parseInt(formData.durationMinutes),
        location: formData.location,
        meetingLink: formData.meetingLink,
        interviewerNames: formData.interviewerNames,
        notes: formData.notes
      };

      await interviewsApi.schedule(payload);
      toast.success('Interview scheduled successfully!');
      navigate('/interviews');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to schedule interview';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/interviews')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selection Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jobId">Select Job Posting *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <select
                    id="jobId"
                    name="jobId"
                    value={formData.jobId}
                    onChange={handleChange}
                    className="w-full h-10 pl-9 rounded-md border border-input bg-background px-3 text-sm"
                    required
                  >
                    <option value="">Select a job</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title} - {job.company?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Select Candidates *</Label>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, applicationIds: applications.map(a => a.id) }))}
                      disabled={!formData.jobId || applications.length === 0}
                    >
                      Select All
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, applicationIds: [] }))}
                      disabled={!formData.jobId || formData.applicationIds.length === 0}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                {formData.jobId && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-xs">Min CGPA</Label>
                      <Input 
                        type="number" 
                        step="0.1" 
                        placeholder="0.0" 
                        className="h-8 mt-1"
                        onChange={(e) => {
                          const minCgpa = parseFloat(e.target.value) || 0;
                          const filtered = applications.filter(app => 
                            (parseFloat(app.student?.cgpa) || 0) >= minCgpa
                          );
                          setFormData(prev => ({ ...prev, applicationIds: filtered.map(a => a.id) }));
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Backlogs</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        className="h-8 mt-1"
                        onChange={(e) => {
                          if (e.target.value === '') return;
                          const maxBacklogs = parseInt(e.target.value) || 0;
                          const filtered = applications.filter(app => 
                            (app.student?.active_backlogs || 0) <= maxBacklogs
                          );
                          setFormData(prev => ({ ...prev, applicationIds: filtered.map(a => a.id) }));
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Candidates Table */}
                <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-2 text-left w-10">
                          <input 
                            type="checkbox"
                            checked={applications.length > 0 && formData.applicationIds.length === applications.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, applicationIds: applications.map(a => a.id) }));
                              } else {
                                setFormData(prev => ({ ...prev, applicationIds: [] }));
                              }
                            }}
                            className="rounded border-gray-300"
                            disabled={!formData.jobId || applications.length === 0}
                          />
                        </th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Roll No</th>
                        <th className="p-2 text-center">CGPA</th>
                        <th className="p-2 text-center">Backlogs</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {applications.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-muted-foreground">
                            {formData.jobId ? 'No applications found' : 'Select a job to view candidates'}
                          </td>
                        </tr>
                      ) : (
                        applications.map(app => (
                          <tr key={app.id} className="hover:bg-muted/50">
                            <td className="p-2">
                              <input 
                                type="checkbox"
                                checked={formData.applicationIds.includes(app.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({ ...prev, applicationIds: [...prev.applicationIds, app.id] }));
                                  } else {
                                    setFormData(prev => ({ ...prev, applicationIds: prev.applicationIds.filter(id => id !== app.id) }));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="p-2 font-medium">
                              {app.student?.user?.user_profile?.first_name} {app.student?.user?.user_profile?.last_name}
                            </td>
                            <td className="p-2">{app.student?.roll_number}</td>
                            <td className="p-2 text-center">{app.student?.cgpa || 'N/A'}</td>
                            <td className="p-2 text-center">
                              <span className={app.student?.active_backlogs > 0 ? "text-red-500 font-medium" : "text-green-600"}>
                                {app.student?.active_backlogs || 0}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-secondary">
                                {app.status?.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  Selected: {formData.applicationIds.length} candidate(s)
                </div>
              </div>
            </div>

            <div className="border-t pt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interviewType">Interview Type *</Label>
                <select
                  id="interviewType"
                  name="interviewType"
                  value={formData.interviewType}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="technical">Technical</option>
                  <option value="hr">HR</option>
                  <option value="aptitude">Aptitude</option>
                  <option value="group_discussion">Group Discussion</option>
                  <option value="final">Final</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewMode">Mode *</Label>
                <select
                  id="interviewMode"
                  name="interviewMode"
                  value={formData.interviewMode}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    id="scheduledDate"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className="pl-9"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    id="scheduledTime"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Duration (mins) *</Label>
                <Input
                  type="number"
                  id="durationMinutes"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  min="15"
                  step="15"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={formData.interviewMode === 'online' ? 'meetingLink' : 'location'}>
                {formData.interviewMode === 'online' ? 'Meeting Link *' : 'Location *'}
              </Label>
              <div className="relative">
                {formData.interviewMode === 'online' ? (
                  <Video className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                ) : (
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  id={formData.interviewMode === 'online' ? 'meetingLink' : 'location'}
                  name={formData.interviewMode === 'online' ? 'meetingLink' : 'location'}
                  value={formData.interviewMode === 'online' ? formData.meetingLink : formData.location}
                  onChange={handleChange}
                  placeholder={formData.interviewMode === 'online' ? 'https://meet.google.com/...' : 'e.g., Room 302, Block A'}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewerNames">Interviewer Name(s)</Label>
              <Input
                id="interviewerNames"
                name="interviewerNames"
                value={formData.interviewerNames}
                onChange={handleChange}
                placeholder="e.g., John Doe, Jane Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes/Instructions</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Share any specific instructions for the candidate..."
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/interviews')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || formData.applicationIds.length === 0}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Schedule Interview
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleInterview;
