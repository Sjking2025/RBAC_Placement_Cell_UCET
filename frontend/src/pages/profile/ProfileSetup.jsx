import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileWizard from '../../components/features/ProfileWizard';
import api from '../../api/axios';
import { Loader2 } from 'lucide-react';

const ProfileSetup = () => {
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    // Redirect non-students
    if (!isStudent()) {
      navigate('/dashboard');
      return;
    }

    // Load current profile data
    const loadProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data.data;
        setInitialData({
          firstName: userData.user_profile?.first_name || '',
          lastName: userData.user_profile?.last_name || '',
          phone: userData.user_profile?.phone || '',
          address: userData.user_profile?.address || '',
          city: userData.user_profile?.city || '',
          state: userData.user_profile?.state || '',
          cgpa: userData.student_profile?.cgpa?.toString() || '',
          tenthPercentage: userData.student_profile?.tenth_percentage?.toString() || '',
          twelfthPercentage: userData.student_profile?.twelfth_percentage?.toString() || '',
          linkedinUrl: userData.student_profile?.linkedin_url || '',
          githubUrl: userData.student_profile?.github_url || '',
          portfolioUrl: userData.student_profile?.portfolio_url || ''
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isStudent, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Let's set up your profile to help you find the best opportunities
          </p>
        </div>
        <ProfileWizard 
          initialData={initialData}
          onComplete={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
};

export default ProfileSetup;
