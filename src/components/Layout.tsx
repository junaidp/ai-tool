import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Building2,
  Shield,
  Library,
  Plug,
  AlertTriangle,
  FlaskConical,
  CheckSquare,
  FileText,
  Menu,
  X,
  LogOut,
  ClipboardCheck,
  UserCheck,
  Users,
  FileCheck,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import NotificationCenter from './NotificationCenter';
import { ROLE_DISPLAY_NAMES } from '@/types/roles';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Effectiveness Criteria', href: '/effectiveness-criteria', icon: Target, hidden: true },
  { name: 'Framework Builder', href: '/framework-builder', icon: Building2 },
  { name: 'Framework Development', href: '/p29-framework', icon: FileCheck },
  { name: 'Risk Identification', href: '/principal-risks', icon: AlertTriangle },
  { name: 'Material Controls', href: '/material-controls', icon: Shield },
  { name: 'Risk-Control Library', href: '/risk-control-library', icon: Library },
  { name: 'System Integrations', href: '/integrations', icon: Plug },
  { name: 'Control Gap Radar', href: '/control-gaps', icon: AlertTriangle },
  { name: 'Testing Coordination', href: '/testing', icon: FlaskConical },
  { name: 'Control Testing', href: '/control-testing', icon: ClipboardCheck },
  { name: 'Testing Assignment', href: '/control-testing-assignment', icon: UserCheck },
  { name: 'Approvals', href: '/approvals', icon: CheckSquare },
  { name: 'Board Reporting', href: '/board-reporting', icon: FileText },
  { name: 'User Management', href: '/user-management', icon: Users, adminOnly: true },
];

const getRoleDisplay = (role: string) => {
  return ROLE_DISPLAY_NAMES[role as keyof typeof ROLE_DISPLAY_NAMES] || role;
};

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">RiskControl</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-5 border-b">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-xl">RiskControl</h1>
              <p className="text-xs text-muted-foreground">Enterprise GRC</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {navigation.map((item) => {
                // Hide admin-only items from non-admin users
                if (item.adminOnly && user?.role !== 'SYSTEM_ADMIN' && user?.role !== 'FRAMEWORK_OWNER') {
                  return null;
                }
                
                // Hide items marked as hidden
                if (item.hidden) {
                  return null;
                }
                
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user && getRoleDisplay(user.role)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
