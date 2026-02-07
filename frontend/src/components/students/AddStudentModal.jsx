import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEGREE_TYPES, BATCH_YEARS } from '../../utils/constants';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const manualSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  rollNumber: z.string().min(3, 'Roll number is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  departmentId: z.string().min(1, 'Department is required'),
  batchYear: z.string().min(4, 'Batch year is required'),
  gender: z.enum(['male', 'female', 'other'])
});

const AddStudentModal = ({ departments, onSuccess, trigger, mode = 'add', initialData = null }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkProgress, setBulkProgress] = useState(null);

  const isEdit = mode === 'edit';

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(manualSchema),
    defaultValues: {
      firstName: initialData?.user?.user_profile?.first_name || '',
      lastName: initialData?.user?.user_profile?.last_name || '',
      email: initialData?.user?.email || '',
      phone: initialData?.user?.user_profile?.phone || '',
      rollNumber: initialData?.roll_number || '',
      departmentId: initialData?.department_id?.toString() || user?.user_profile?.department_id?.toString() || '',
      batchYear: initialData?.batch_year?.toString() || new Date().getFullYear().toString(),
      currentSemester: initialData?.current_semester?.toString() || '1',
      cgpa: initialData?.cgpa?.toString() || '',
      gender: initialData?.gender || 'male',
      collegeCode: initialData?.college_code || '',
      collegeName: initialData?.college_name || ''
    }
  });

  // Reset form when modal opens or initialData changes
  // useEffect to handle this if initialData changes while mounted?
  // For now, simple reset on open might be enough if component remounts or we key it.

  const onManualSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/students/${initialData.id}`, data);
        toast.success('Student updated successfully');
      } else {
        await api.post('/students', data);
        toast.success('Student added successfully');
      }
      setOpen(false);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} student`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setBulkFile(file);
    }
  };

  const processBulkUpload = async () => {
    if (!bulkFile) return;
    setLoading(true);
    
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      try {
        const csv = target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const students = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const student = {};
          
          headers.forEach((header, index) => {
            const value = values[index]?.trim();
            // Map CSV headers to API fields
            if (header === 'First Name') student.firstName = value;
            if (header === 'Last Name') student.lastName = value;
            if (header === 'Email') student.email = value;
            if (header === 'Phone') student.phone = value;
            if (header === 'Roll No') student.rollNumber = value;
            if (header === 'Batch') student.batch = value; // "2022 - 2026"
            if (header === 'Gender') student.gender = value?.toLowerCase();
            if (header === 'College Code') student.collegeCode = value;
            if (header === 'College Name') student.collegeName = value;
            if (header === 'Department') student.department = value; // "BE CSE"
            if (header === 'Current Semester') student.currentSemester = value;
            if (header === 'CGPA') student.cgpa = value;
            
            // Legacy/Fallback for department ID if provided directly
            // student.departmentId = user?.user_profile?.department_id;
          });
          
          // Basic check
          if (student.email && student.rollNumber) {
             // Fallback to officer's dept if Department is not in CSV??? 
             // Logic changed: CSV "Department" string is preferred. 
            students.push(student);
          }
        }

        if (students.length === 0) {
            toast.error("No valid students found in CSV");
            setLoading(false);
            return;
        }

        const response = await api.post('/students/bulk', { students });
        setBulkProgress(response.data.data);
        toast.success(`Processed ${response.data.data.success} students`);
        if (response.data.data.success > 0) {
            onSuccess?.();
            // Do not close modal automatically on bulk upload to show results
        }
      } catch (error) {
        toast.error('Failed to process CSV');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(bulkFile);
  };

  const downloadTemplate = () => {
    const headers = "First Name,Last Name,Email,Phone,Roll No,Batch,Gender,Department,College Code,College Name,Current Semester,CGPA";
    const sample = "John,Doe,john@example.com,9876543210,422422104049,2022 - 2026,male,BE CSE,4224,My College,1,8.5";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + sample;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Student' : 'Add Students'}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {!isEdit && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="manual" className="space-y-4 py-4">
            <form onSubmit={handleSubmit(onManualSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input {...register('firstName')} placeholder="John" />
                  {errors.firstName && <span className="text-xs text-destructive">{errors.firstName.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input {...register('lastName')} placeholder="Doe" />
                  {errors.lastName && <span className="text-xs text-destructive">{errors.lastName.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input {...register('email')} type="email" placeholder="john@college.edu" />
                  {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...register('phone')} placeholder="9876543210" />
                  {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input {...register('rollNumber')} placeholder="CSE001" />
                  {errors.rollNumber && <span className="text-xs text-destructive">{errors.rollNumber.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select 
                    {...register('gender')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>College Code</Label>
                  <Input {...register('collegeCode')} placeholder="4224" />
                </div>
                <div className="space-y-2">
                  <Label>College Name</Label>
                  <Input {...register('collegeName')} placeholder="College Name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <select 
                     {...register('departmentId')}
                     disabled={user?.role === 'dept_officer' && !isEdit} // Allow officer to edit? Maybe strict to own dept still.
                     className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Dept</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.departmentId && <span className="text-xs text-destructive">{errors.departmentId.message}</span>}
                </div>
                 <div className="space-y-2">
                  <Label>Batch Year</Label>
                  <select 
                     {...register('batchYear')}
                     className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {BATCH_YEARS.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label>Current Semester</Label>
                  <select 
                     {...register('currentSemester')}
                     className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                 <div className="space-y-2">
                  <Label>CGPA (till Last Sem)</Label>
                  <Input 
                    {...register('cgpa')} 
                    placeholder="e.g. 8.5" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    max="10" 
                  />
                  {errors.cgpa && <span className="text-xs text-destructive">{errors.cgpa.message}</span>}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? 'Update Student' : 'Add Student'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 space-y-4">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Upload CSV File</p>
                <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
              </div>
              <Input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="max-w-xs" 
              />
            </div>

            <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={downloadTemplate} type="button">
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                </Button>
                <Button onClick={processBulkUpload} disabled={!bulkFile || loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Import Students
                </Button>
            </div>

            {bulkProgress && (
                <div className="rounded-md bg-muted p-4 space-y-2">
                    <div className="flex items-center text-green-600">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span className="text-sm font-medium">Successfully added: {bulkProgress.success}</span>
                    </div>
                     <div className="flex items-center text-destructive">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        <span className="text-sm font-medium">Failed: {bulkProgress.failed}</span>
                    </div>
                    {bulkProgress.errors.length > 0 && (
                        <div className="mt-2 max-h-32 overflow-y-auto text-xs text-destructive">
                            {bulkProgress.errors.map((err, i) => (
                                <p key={i}>{err.email}: {err.error}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;
