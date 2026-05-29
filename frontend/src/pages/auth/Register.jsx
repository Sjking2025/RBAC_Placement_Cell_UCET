import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Eye, EyeOff, Briefcase, Chrome } from 'lucide-react';
import { USER_ROLES, DEGREE_TYPES, BATCH_YEARS } from '../../utils/constants';
import { auth, googleProvider } from '../../config/firebase';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['student', 'coordinator']),
  // Student specific
  rollNumber: z.string().optional(),
  degree: z.string().optional(),
  batchYear: z.number().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register: authRegister, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const authResult = await googleLogin(idToken);
      if (authResult.success) {
        if (authResult.needsRole) {
          navigate('/auth/complete-registration');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Google sign-up error:', error);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'student',
      rollNumber: '',
      degree: 'BTech',
      batchYear: new Date().getFullYear() + 1
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    const result = await authRegister(data);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <Card className="w-full max-w-lg relative z-10 glass-card border-border/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-xl gradient-primary animate-glow-pulse">
              <Briefcase className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="font-display text-2xl">Create Account</CardTitle>
          <CardDescription className="text-sm">
            Register for the Placement Cell Portal
          </CardDescription>
        </CardHeader>

        {/* Google Sign-Up */}
        <CardContent className="pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 text-sm font-semibold"
            onClick={handleGoogleSignUp}
            loading={googleLoading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">or register with email</span>
            </div>
          </div>
        </CardContent>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>Register as</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedRole === 'student' ? 'border-primary bg-primary/5 shadow-glow-teal' : 'border-border/50 hover:border-primary/30'}`}>
                      <input
                        type="radio"
                        value="student"
                        {...register('role')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <span className="block text-sm font-medium">Student</span>
                        <span className="text-xs text-muted-foreground">Apply for jobs</span>
                      </div>
                    </label>
                    <label className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedRole === 'coordinator' ? 'border-primary bg-primary/5 shadow-glow-teal' : 'border-border/50 hover:border-primary/30'}`}>
                      <input
                        type="radio"
                        value="coordinator"
                        {...register('role')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <span className="block text-sm font-medium">Coordinator</span>
                        <span className="text-xs text-muted-foreground">Manage placements</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      error={errors.firstName}
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      error={errors.lastName}
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.email}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91-9876543210"
                    {...register('phone')}
                  />
                </div>

                <Button 
                  type="button" 
                  className="w-full" 
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                {/* Student Fields */}
                {selectedRole === 'student' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input
                        id="rollNumber"
                        placeholder="CSE2025001"
                        {...register('rollNumber')}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="degree">Degree</Label>
                        <select
                          id="degree"
                          className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                          {...register('degree')}
                        >
                          {DEGREE_TYPES.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batchYear">Batch Year</Label>
                        <select
                          id="batchYear"
                          className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                          {...register('batchYear', { valueAsNumber: true })}
                        >
                          {BATCH_YEARS.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      error={errors.password}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    error={errors.confirmPassword}
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1" 
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" loading={isSubmitting}>
                    Create Account
                  </Button>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter>
            <p className="text-sm text-center text-muted-foreground w-full">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
