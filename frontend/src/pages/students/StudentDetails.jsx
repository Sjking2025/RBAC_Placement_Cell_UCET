import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonProfile } from '../../components/ui/Skeleton';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  FileText,
  ExternalLink,
  Github,
  Linkedin,
  Award,
  FolderGit2,
  Building,
  Edit
} from 'lucide-react';
import { formatDate, getInitials } from '../../utils/helpers';
import { ROLE_LABELS } from '../../utils/constants';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/students/${id}`);
      setStudent(response.data.data);
    } catch (error) {
      console.error('Failed to load student:', error);
      toast.error('Failed to load student details');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <SkeletonProfile />
      </div>
    );
  }

  if (!student) return null;

  const profile = student.user?.user_profile;
  const studentProfile = student;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                {getInitials(profile?.first_name, profile?.last_name)}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile?.first_name} {profile?.last_name}
                  </h1>
                  <p className="text-muted-foreground">{student.user?.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge>{studentProfile.degree}</Badge>
                    <Badge variant="outline">{studentProfile.roll_number}</Badge>
                    <Badge variant="secondary">Batch {studentProfile.batch_year}</Badge>
                    <Badge variant={studentProfile.placement_status === 'placed' ? 'success' : 'outline'}>
                      {studentProfile.placement_status}
                    </Badge>
                  </div>
                </div>

                {/* CGPA */}
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-3xl font-bold text-primary">{studentProfile.cgpa || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">CGPA</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{studentProfile.tenth_percentage || 'N/A'}%</p>
                  <p className="text-xs text-muted-foreground">10th</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{studentProfile.twelfth_percentage || 'N/A'}%</p>
                  <p className="text-xs text-muted-foreground">12th</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{studentProfile.backlogs || 0}</p>
                  <p className="text-xs text-muted-foreground">Backlogs</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{studentProfile._count?.applications || 0}</p>
                  <p className="text-xs text-muted-foreground">Applications</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          {studentProfile.skills?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {studentProfile.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="py-1.5 px-3">
                      {skill.skill_name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {studentProfile.projects?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderGit2 className="h-5 w-5 mr-2" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentProfile.projects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <h4 className="font-semibold">{project.title}</h4>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    )}
                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.tech_stack.map((tech, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{tech}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {project.project_url && (
                        <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-foreground">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Live Demo
                        </a>
                      )}
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-foreground">
                          <Github className="h-3 w-3 mr-1" />
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Internships */}
          {studentProfile.internships?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Internships
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentProfile.internships.map((internship) => (
                  <div key={internship.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{internship.role}</h4>
                      {internship.is_current && <Badge variant="success">Current</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{internship.company_name}</p>
                    {internship.description && (
                      <p className="text-sm text-muted-foreground mt-1">{internship.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(internship.start_date)} - {internship.is_current ? 'Present' : formatDate(internship.end_date)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {studentProfile.certifications?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentProfile.certifications.map((cert) => (
                  <div key={cert.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">{cert.name}</h4>
                    </div>
                    {cert.issuing_organization && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Issued by {cert.issuing_organization}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {cert.issue_date && (
                        <span>Issued: {formatDate(cert.issue_date)}</span>
                      )}
                      {cert.credential_url && (
                        <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-foreground">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Credential
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{student.user?.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {(profile?.city || profile?.state) && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Links */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studentProfile.linkedin_url && (
                <a
                  href={studentProfile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
              {studentProfile.github_url && (
                <a
                  href={studentProfile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
              {studentProfile.portfolio_url && (
                <a
                  href={studentProfile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Portfolio</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
            </CardContent>
          </Card>

          {/* Resume */}
          {studentProfile.resume_url && (
            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={studentProfile.resume_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Resume
                  </Button>
                </a>
                {studentProfile.resume_updated_at && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Updated: {formatDate(studentProfile.resume_updated_at)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Department */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span>{studentProfile.department?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Degree</span>
                <span>{studentProfile.degree}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batch</span>
                <span>{studentProfile.batch_year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Section</span>
                <span>{studentProfile.section || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
