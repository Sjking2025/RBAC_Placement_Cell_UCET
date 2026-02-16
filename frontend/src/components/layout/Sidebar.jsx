import { Link, useLocation } from 'react-router-dom';
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
  GraduationCap
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useState } from 'react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col border-r border-border/50 transition-all duration-300 relative",
        "bg-card/60 backdrop-blur-xl",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand Logo */}
      <div className={cn(
        "flex items-center h-16 border-b border-border/50 px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="font-display font-bold text-sm gradient-text">Placement Cell</p>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">UCET Platform</p>
          </div>
        )}
      </div>

      {/* Toggle button */}
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {navItems.map((section, sectionIdx) => {
          const filteredItems = filterItems(section.items);
          if (filteredItems.length === 0) return null;

          return (
            <div key={sectionIdx} className="mb-2">
              {!collapsed && (
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
                          collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary shadow-glow-sm" />
                        )}
                        
                        <Icon className={cn(
                          "h-[18px] w-[18px] transition-all duration-200 flex-shrink-0",
                          !collapsed && "mr-3",
                          isActive ? "text-primary" : "group-hover:text-foreground"
                        )} />
                        
                        {!collapsed && (
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
      {!collapsed && (
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
};

export default Sidebar;
