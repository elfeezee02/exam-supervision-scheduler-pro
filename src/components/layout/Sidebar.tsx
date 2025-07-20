import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Settings, 
  BarChart3,
  UserCheck,
  GraduationCap,
  Bell
} from 'lucide-react';
import { useESSS } from '@/context/ESSContext';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { currentUser } = useESSS();

  const adminNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/exams', icon: Calendar, label: 'Exams' },
    { to: '/supervisors', icon: Users, label: 'Supervisors' },
    { to: '/venues', icon: MapPin, label: 'Venues' },
    { to: '/schedules', icon: Clock, label: 'Schedules' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const supervisorNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-assignments', icon: UserCheck, label: 'My Assignments' },
    { to: '/availability', icon: Clock, label: 'Availability' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile', icon: Settings, label: 'Profile' },
  ];

  const navItems = currentUser?.role === 'admin' ? adminNavItems : supervisorNavItems;

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">ESSS</h2>
            <p className="text-xs text-muted-foreground">Exam Supervision</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-muted hover:text-primary",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {currentUser?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentUser?.username}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser?.role === 'admin' ? 'Administrator' : 'Supervisor'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;