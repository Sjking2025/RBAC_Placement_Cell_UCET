import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Badge } from '../../components/ui/Badge';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Mail,
  Key,
  Palette,
  Globe,
  Save,
  Loader2,
  Moon,
  Sun,
  Monitor,
  Check,
  Chrome,
  Link
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { auth, googleProvider } from '../../config/firebase';

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const { preference: theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailJobPosting: true,
    emailApplication: true,
    emailInterview: true,
    emailAnnouncement: true,
    browserNotifications: false
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Google account linking
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const { linkGoogle } = useAuth();

  const handleLinkGoogle = async () => {
    setLinkingGoogle(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await linkGoogle(idToken);
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.response?.data?.message || 'Failed to link Google account');
      }
    } finally {
      setLinkingGoogle(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    toast.success('Theme updated');
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      await api.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    ...(isAdmin() ? [{ id: 'system', label: 'System', icon: Globe }] : [])
  ];

  const ThemeOption = ({ value, label, icon: Icon, current }) => (
    <button
      onClick={() => handleThemeChange(value)}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
        current === value 
          ? 'border-primary bg-primary/5 shadow-glow-teal' 
          : 'border-border/50 hover:border-primary/30'
      }`}
    >
      <Icon className={`h-6 w-6 mb-2 ${current === value ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className={`text-sm font-medium ${current === value ? 'text-primary' : ''}`}>{label}</span>
      {current === value && (
        <Check className="h-4 w-4 text-primary mt-1" />
      )}
    </button>
  );

  const NotificationToggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span 
          className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="animate-stagger-in">
        <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center">
          <SettingsIcon className="h-7 w-7 mr-3 text-muted-foreground" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-48 flex-shrink-0">
          <nav className="flex md:flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>View your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-display text-lg font-bold">
                    {user?.user_profile?.first_name?.[0]}{user?.user_profile?.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-base">
                      {user?.user_profile?.first_name} {user?.user_profile?.last_name}
                    </h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <Badge className="mt-1">{user?.role?.replace('_', ' ')}</Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input value={user?.role?.replace('_', ' ') || ''} disabled className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Account Status</Label>
                    <Input value={user?.status || ''} disabled className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Email Verified</Label>
                    <Input value={user?.email_verified ? 'Yes' : 'No'} disabled className="mt-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 divide-y divide-border/50">
                  <NotificationToggle
                    label="Job Posting Alerts"
                    description="Get notified when new jobs are posted"
                    checked={notifications.emailJobPosting}
                    onChange={() => handleNotificationChange('emailJobPosting')}
                  />
                  <NotificationToggle
                    label="Application Updates"
                    description="Receive updates about your applications"
                    checked={notifications.emailApplication}
                    onChange={() => handleNotificationChange('emailApplication')}
                  />
                  <NotificationToggle
                    label="Interview Reminders"
                    description="Get reminded about upcoming interviews"
                    checked={notifications.emailInterview}
                    onChange={() => handleNotificationChange('emailInterview')}
                  />
                  <NotificationToggle
                    label="Announcements"
                    description="Stay updated with placement cell announcements"
                    checked={notifications.emailAnnouncement}
                    onChange={() => handleNotificationChange('emailAnnouncement')}
                  />
                  <NotificationToggle
                    label="Browser Notifications"
                    description="Enable desktop notifications"
                    checked={notifications.browserNotifications}
                    onChange={() => handleNotificationChange('browserNotifications')}
                  />
                </div>

                <Button onClick={saveNotificationSettings} className="mt-6" loading={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select your preferred color scheme
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <ThemeOption value="light" label="Light" icon={Sun} current={theme} />
                    <ThemeOption value="dark" label="Dark" icon={Moon} current={theme} />
                    <ThemeOption value="system" label="System" icon={Monitor} current={theme} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="mt-1.5"
                      />
                    </div>
                    <Button type="submit" loading={saving}>
                      <Key className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Linked Accounts */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Linked Accounts</CardTitle>
                  <CardDescription>Connect your accounts for easier sign-in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Chrome className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium">Google</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.auth_provider === 'google'
                            ? user.email
                            : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {user?.auth_provider !== 'google' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLinkGoogle}
                        loading={linkingGoogle}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                    {user?.auth_provider === 'google' && (
                      <Badge variant="success">Connected</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* System Tab (Admin Only) */}
          {activeTab === 'system' && isAdmin() && (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings (Admin only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base">Email Configuration</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure SMTP settings for sending emails
                  </p>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>SMTP Host</Label>
                        <Input placeholder="smtp.gmail.com" className="mt-1" />
                      </div>
                      <div>
                        <Label>SMTP Port</Label>
                        <Input placeholder="587" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label>SMTP User</Label>
                      <Input placeholder="your-email@gmail.com" className="mt-1" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base">Placement Season</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure the current placement season
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Batch Year</Label>
                      <Input type="number" placeholder="2025" className="mt-1" />
                    </div>
                    <div>
                      <Label>Season Status</Label>
                      <select className="w-full h-10 rounded-lg border border-input bg-background/50 px-3 text-sm mt-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save System Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
