import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentsApi } from '../../api/studentsApi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  Search,
  Filter,
  User,
  GraduationCap,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Download
} from 'lucide-react';
import { formatStatus, getInitials, cn } from '../../utils/helpers';
import { DEGREE_TYPES, BATCH_YEARS } from '../../utils/constants';
import api from '../../api/axios';

const Students = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [batch, setBatch] = useState(searchParams.get('batch') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [searchParams]);

  const loadDepartments = async () => {
    try {
      const response = await api.get('/users/departments');
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page: searchParams.get('page') || 1,
        limit: 10,
        search: searchParams.get('search') || undefined,
        departmentId: searchParams.get('department') || undefined,
        batch: searchParams.get('batch') || undefined
      };

      const response = await studentsApi.getAll(params);
      setStudents(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 10, total: 0 });
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage and view student profiles
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export List
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or roll number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <select
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    handleFilterChange('department', e.target.value);
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Batch Year</label>
                <select
                  value={batch}
                  onChange={(e) => {
                    setBatch(e.target.value);
                    handleFilterChange('batch', e.target.value);
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All Batches</option>
                  {BATCH_YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSearch('');
                    setDepartment('');
                    setBatch('');
                    setSearchParams(new URLSearchParams());
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No students found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <Link key={student.id} to={`/students/${student.id}`}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg flex-shrink-0">
                      {getInitials(student.user?.user_profile?.first_name, student.user?.user_profile?.last_name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">
                            {student.user?.user_profile?.first_name} {student.user?.user_profile?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{student.roll_number}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Badge variant={student.profile_completed ? 'success' : 'warning'}>
                            {student.profile_completed ? 'Complete' : 'Incomplete'}
                          </Badge>
                          <Badge variant={student.placement_status === 'placed' ? 'default' : 'secondary'}>
                            {formatStatus(student.placement_status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          {student.degree} - {student.department?.code}
                        </span>
                        <span>Batch: {student.batch_year}</span>
                        <span>CGPA: {student.cgpa || 'N/A'}</span>
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {student.user?.email}
                        </span>
                      </div>

                      {/* Skills */}
                      {student.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {student.skills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill.skill_name}
                            </Badge>
                          ))}
                          {student.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{student.skills.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Resume */}
                    {student.resume_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(student.resume_url, '_blank');
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {pagination.page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Students;
