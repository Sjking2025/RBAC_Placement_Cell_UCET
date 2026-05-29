import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { DEGREE_TYPES, BATCH_YEARS } from '../../utils/constants';
import { GraduationCap, Chrome } from 'lucide-react';

const CompleteRegistration = () => {
  const { user, completeRegistration } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    departmentId: '',
    phone: '',
    rollNumber: '',
    degree: 'BTech',
    batchYear: new Date().getFullYear() + 1,
    currentSemester: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.role) {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'student' && !formData.rollNumber) {
      setError('Roll number is required for students');
      return;
    }

    setLoading(true);
    const result = await completeRegistration({
      role,
      ...formData,
      departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
      batchYear: formData.batchYear ? parseInt(formData.batchYear) : undefined,
      currentSemester: formData.currentSemester ? parseInt(formData.currentSemester) : undefined,
    });

    if (result.success) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-float" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px] animate-float delay-200" />
      </div>

      <div className="relative w-full max-w-[480px] animate-slide-up">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-md animate-glow-pulse">
                <Chrome className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Complete Registration</h1>
            <p className="text-sm text-muted-foreground">
              You signed in with Google. Tell us a bit more to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                I am a
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    role === 'student'
                      ? 'border-primary bg-primary/5 shadow-glow-teal'
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <GraduationCap className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <span className="block text-sm font-medium">Student</span>
                    <span className="text-xs text-muted-foreground">Apply for jobs</span>
                  </div>
                </label>
                <label
                  className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    role === 'coordinator'
                      ? 'border-primary bg-primary/5 shadow-glow-teal'
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="coordinator"
                    checked={role === 'coordinator'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <GraduationCap className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <span className="block text-sm font-medium">Coordinator</span>
                    <span className="text-xs text-muted-foreground">Manage placements</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Phone (Optional)
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91-9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Student-specific fields */}
            {role === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Roll Number
                  </Label>
                  <Input
                    id="rollNumber"
                    name="rollNumber"
                    placeholder="CSE2025001"
                    value={formData.rollNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="degree" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Degree
                    </Label>
                    <select
                      id="degree"
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                      {DEGREE_TYPES.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batchYear" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Batch Year
                    </Label>
                    <select
                      id="batchYear"
                      name="batchYear"
                      value={formData.batchYear}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring/30"
                    >
                      {BATCH_YEARS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentSemester" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Current Semester
                  </Label>
                  <Input
                    id="currentSemester"
                    name="currentSemester"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.currentSemester}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full h-11 text-sm font-semibold" loading={loading}>
              Complete Registration
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistration;
