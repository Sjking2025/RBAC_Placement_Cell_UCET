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
  ChevronRight
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
        "hidden lg:flex flex-col bg-card border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-background border rounded-full p-1 shadow-sm hover:bg-muted z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((section, sectionIdx) => {
          const filteredItems = filterItems(section.items);
          if (filteredItems.length === 0) return null;

          return (
            <div key={sectionIdx} className="mb-4">
              {!collapsed && (
                <h3 className="px-4 mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  {section.section}
                </h3>
              )}
              <ul className="space-y-1 px-2">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                                   location.pathname.startsWith(item.path + '/');

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                          collapsed && "justify-center"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                        {!collapsed && item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
