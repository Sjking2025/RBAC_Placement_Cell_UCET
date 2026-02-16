import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../features/NotificationCenter';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Home,
  Briefcase,
  Users,
  Building2,
  CalendarDays,
  BarChart3,
  MessageSquare,
  ChevronDown,
  GraduationCap
} from 'lucide-react';
import { cn, getInitials } from '../../utils/helpers';
import { ROLE_LABELS } from '../../utils/constants';

const Navbar = () => {
  const { user, logout, isAdmin, isOfficer, isStudent } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['all'] },
    { path: '/jobs', label: 'Jobs', icon: Briefcase, roles: ['all'] },
    { path: '/companies', label: 'Companies', icon: Building2, roles: ['admin', 'dept_officer', 'coordinator'] },
    { path: '/students', label: 'Students', icon: Users, roles: ['admin', 'dept_officer', 'coordinator'] },
    { path: '/interviews', label: 'Interviews', icon: CalendarDays, roles: ['all'] },
    { path: '/announcements', label: 'Announcements', icon: MessageSquare, roles: ['all'] },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'dept_officer'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.roles.includes('all')) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-300">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg hidden sm:block gradient-text">
              Placement Cell
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationCenter />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-muted/50 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold ring-2 ring-primary/20">
                  {getInitials(user?.user_profile?.first_name, user?.user_profile?.last_name)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-tight">
                    {user?.user_profile?.first_name} {user?.user_profile?.last_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
                    {ROLE_LABELS[user?.role]}
                  </p>
                </div>
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 hidden md:block text-muted-foreground transition-transform duration-200",
                  isProfileOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 z-50 glass-card animate-scale-in origin-top-right">
                    <div className="p-1.5">
                      <Link
                        to="/profile"
                        className="flex items-center px-3 py-2.5 rounded-lg text-sm hover:bg-muted/50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2.5 text-muted-foreground" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-3 py-2.5 rounded-lg text-sm hover:bg-muted/50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2.5 text-muted-foreground" />
                        Settings
                      </Link>
                      <div className="my-1.5 border-t border-border/50" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-3 border-t border-border/50 space-y-0.5 animate-slide-in">
            {filteredNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 animate-stagger-in",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
