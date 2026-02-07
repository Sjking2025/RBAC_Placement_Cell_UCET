import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentsApi } from '../../api/studentsApi';
import api from '../../api/axios';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ExportStudentsButton } from '../../components/ui/ExportButton';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyStateNoStudents } from '../../components/ui/EmptyState';
import { Select } from '../../components/ui/Select';
import { DeleteConfirmDialog } from '../../components/ui/ConfirmDialog';
import AddStudentModal from '../../components/students/AddStudentModal';
import { formatStatus, getInitials, cn } from '../../utils/helpers';
import { BATCH_YEARS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { 
  Search, Filter, User, GraduationCap, Mail, Phone, 
  ChevronLeft, ChevronRight, FileText, Plus, Edit, 
  Trash2, Download, Loader2 
} from 'lucide-react';

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

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/students/${deleteId}`);
      toast.success('Student deleted successfully'); // Requires toast import, verifying logic
      loadStudents(); 
      setIsDeleteOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to delete student');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

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
        <div className="flex gap-2">
            {(user?.role === 'admin' || user?.role === 'dept_officer') && (
                <AddStudentModal 
                    departments={departments}
                    onSuccess={loadStudents}
                    trigger={
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Student
                        </Button>
                    }
                />
            )}
            <ExportStudentsButton 
              params={{ departmentId: department, batchYear: batch }}
            />
        </div>
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
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Year of Study Filter - New */}
                <div>
                   <label className="text-sm font-medium mb-1 block">Year of Study</label>
                   <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onChange={(e) => {
                          const year = parseInt(e.target.value);
                          if (year) {
                              const currentYear = new Date().getFullYear();
                              // Logic: IV Year (4) -> Batch 2026 (if current is 2026)
                              // Batch = CurrentYear + (4 - Year)
                              // If Year 4 (Final), Batch = 2026 + 0 = 2026
                              // If Year 1 (First), Batch = 2026 + 3 = 2029
                              const targetBatch = currentYear + (4 - year);
                              handleFilterChange('batch', targetBatch.toString());
                          } else {
                              handleFilterChange('batch', '');
                          }
                      }}
                      value={batch ? (4 - (parseInt(batch) - new Date().getFullYear())).toString() : ''}
                   >
                      <option value="">All Years</option>
                      <option value="4">IV Year (Final)</option>
                      <option value="3">III Year</option>
                      <option value="2">II Year</option>
                      <option value="1">I Year</option>
                   </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Department</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={searchParams.get('department') || ''}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Batch Year (Direct)</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={searchParams.get('batch') || ''}
                     onChange={(e) => handleFilterChange('batch', e.target.value)}
                  >
                    <option value="">All Batches</option>
                    {BATCH_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-end mt-4">
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
        <SkeletonTable rows={5} cols={4} />
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-0">
            <EmptyStateNoStudents 
              onAction={() => {
                setSearch('');
                setDepartment('');
                setBatch('');
                setSearchParams(new URLSearchParams());
              }}
            />
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

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
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
                      
                     {(user?.role === 'admin' || user?.role === 'dept_officer') && (
                        <div className="flex flex-col gap-2 w-full">
                          <div onClick={(e) => e.preventDefault()} className="w-full">
                            <AddStudentModal
                              departments={departments}
                              onSuccess={loadStudents}
                              mode="edit"
                              initialData={student}
                              trigger={
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              }
                            />
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDeleteId(student.id);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
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

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName="this student"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Students;
