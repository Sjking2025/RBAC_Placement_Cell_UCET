import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Briefcase,
  Users,
  Building2,
  CalendarDays,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useState, useEffect } from 'react';

const Sidebar = ({ isMobileOpen = false, onMobileClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    if (isMobileOpen) {
      onMobileClose?.();
    }
  }, [location.pathname]);

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const navItems = [
    { 
      section: 'Main',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['all'] },
        { path: '/jobs', label: 'Jobs', icon: Briefcase, roles: ['all'] },
        { path: '/applications', label: 'My Applications', icon: FileText, roles: ['student'] },
      ]
    },
    {
      section: 'Management',
      items: [
        { path: '/companies', label: 'Companies', icon: Building2, roles: ['admin', 'dept_officer', 'coordinator'] },
        { path: '/students', label: 'Students', icon: Users, roles: ['admin', 'dept_officer', 'coordinator'] },
        { path: '/interviews', label: 'Interviews', icon: CalendarDays, roles: ['all'] },
      ]
    },
    {
      section: 'Communication',
      items: [
        { path: '/announcements', label: 'Announcements', icon: MessageSquare, roles: ['all'] },
      ]
    },
    {
      section: 'Reports',
      items: [
        { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'dept_officer'] },
      ]
    },
    {
      section: 'Account',
      items: [
        { path: '/profile', label: 'Profile', icon: User, roles: ['all'] },
        { path: '/settings', label: 'Settings', icon: Settings, roles: ['all'] },
      ]
    }
  ];

  const filterItems = (items) => items.filter(item => {
    if (item.roles.includes('all')) return true;
    return item.roles.includes(user?.role);
  });

  const sidebarContent = (isMobile = false) => (
    <aside 
      className={cn(
        "flex flex-col border-r border-border/50 transition-all duration-300 relative",
        "bg-card/60 backdrop-blur-xl",
        isMobile 
          ? "w-72 h-full" 
          : cn("hidden lg:flex", collapsed ? "w-[72px]" : "w-64")
      )}
    >
      {/* Brand Logo */}
      <div className={cn(
        "flex items-center h-16 border-b border-border/50 px-4",
        isMobile ? "gap-3 justify-between" : (collapsed ? "justify-center" : "gap-3")
      )}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="animate-fade-in">
              <p className="font-display font-bold text-sm gradient-text">Placement Cell</p>
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">UCET Platform</p>
            </div>
          )}
        </div>
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Toggle button (desktop only) */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute -right-3 top-20 z-10",
            "w-6 h-6 rounded-full",
            "bg-card border border-border/60 shadow-sm",
            "flex items-center justify-center",
            "hover:bg-primary hover:text-primary-foreground hover:border-primary/50",
            "transition-all duration-200"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {navItems.map((section, sectionIdx) => {
          const filteredItems = filterItems(section.items);
          if (filteredItems.length === 0) return null;

          return (
            <div key={sectionIdx} className="mb-2">
              {(!collapsed || isMobile) && (
                <h3 className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
                  {section.section}
                </h3>
              )}
              <ul className="space-y-0.5 px-2">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                                   location.pathname.startsWith(item.path + '/');

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={cn(
                          "group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          !isMobile && collapsed && "justify-center px-2"
                        )}
                        title={!isMobile && collapsed ? item.label : undefined}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary shadow-glow-sm" />
                        )}
                        
                        <Icon className={cn(
                          "h-[18px] w-[18px] transition-all duration-200 flex-shrink-0",
                          (isMobile || !collapsed) && "mr-3",
                          isActive ? "text-primary" : "group-hover:text-foreground"
                        )} />
                        
                        {(isMobile || !collapsed) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User card at bottom */}
      {(isMobile || !collapsed) && (
        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-muted/30">
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
              {user?.user_profile?.first_name?.[0]}{user?.user_profile?.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">
                {user?.user_profile?.first_name} {user?.user_profile?.last_name}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar (inline) */}
      {sidebarContent(false)}

      {/* Mobile sidebar (portal overlay) */}
      {isMobileOpen && createPortal(
        <div className="fixed inset-0 z-[90] lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-[91] animate-slide-in-left">
            {sidebarContent(true)}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Sidebar;

