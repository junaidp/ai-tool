import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { 
  Shield, Users, FileText, CheckCircle, AlertTriangle, 
  Clock, TrendingUp, Activity, Bell, Calendar 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-tool-9o3q.onrender.com/api';

export default function RoleDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch role-specific data
      const endpoints = getRoleEndpoints(user!.role);
      const responses = await Promise.all(
        endpoints.map(endpoint => 
          fetch(`${API_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(r => r.json())
        )
      );

      // Process data based on role
      processRoleData(user!.role, responses);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleEndpoints = (role: UserRole): string[] => {
    switch (role) {
      case UserRole.SYSTEM_ADMIN:
        return ['/users', '/audit'];
      case UserRole.FRAMEWORK_OWNER:
        return ['/workflow', '/principal-risks', '/control-testing/summary/2025'];
      case UserRole.CONTROLS_MANAGER:
        return ['/principal-risks', '/control-testing/my-assignments'];
      case UserRole.CONTROL_OWNER:
        return ['/control-testing/my-assignments', '/notifications'];
      case UserRole.REVIEWER:
        return ['/workflow', '/comments'];
      case UserRole.BOARD_MEMBER:
        return ['/audit', '/dashboard'];
      default:
        return [];
    }
  };

  const processRoleData = (role: UserRole, responses: any[]) => {
    // Process responses based on role
    setStats({
      total: responses[0]?.length || 0,
      pending: responses[1]?.length || 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {user?.role === UserRole.SYSTEM_ADMIN && <SystemAdminDashboard />}
        {user?.role === UserRole.FRAMEWORK_OWNER && <FrameworkOwnerDashboard />}
        {user?.role === UserRole.CONTROLS_MANAGER && <ControlsManagerDashboard />}
        {user?.role === UserRole.CONTROL_OWNER && <ControlOwnerDashboard />}
        {user?.role === UserRole.REVIEWER && <ReviewerDashboard />}
        {user?.role === UserRole.BOARD_MEMBER && <BoardMemberDashboard />}
      </div>
    </div>
  );
}

function SystemAdminDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Administration</h1>
        <p className="text-gray-600">Manage users, roles, and system configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard
          title="Total Users"
          value="0"
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <DashboardCard
          title="Active Users"
          value="0"
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
        />
        <DashboardCard
          title="Audit Logs"
          value="0"
          icon={<FileText className="h-6 w-6" />}
          color="purple"
        />
        <DashboardCard
          title="System Health"
          value="Good"
          icon={<Activity className="h-6 w-6" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionsCard
          title="Quick Actions"
          actions={[
            { label: 'Manage Users', href: '/users', icon: <Users className="h-4 w-4" /> },
            { label: 'View Audit Trail', href: '/audit', icon: <FileText className="h-4 w-4" /> },
            { label: 'System Settings', href: '/settings', icon: <Shield className="h-4 w-4" /> },
          ]}
        />
        <RecentActivityCard />
      </div>
    </div>
  );
}

function FrameworkOwnerDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Framework Overview</h1>
        <p className="text-gray-600">Monitor and manage the entire risk & control framework</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard
          title="Principal Risks"
          value="13"
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
        <DashboardCard
          title="Material Controls"
          value="58"
          icon={<Shield className="h-6 w-6" />}
          color="blue"
        />
        <DashboardCard
          title="Pending Approvals"
          value="5"
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
        />
        <DashboardCard
          title="Framework Score"
          value="85%"
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionsCard
          title="Quick Actions"
          actions={[
            { label: 'Review Pending Items', href: '/approvals', icon: <CheckCircle className="h-4 w-4" /> },
            { label: 'View Principal Risks', href: '/principal-risks', icon: <AlertTriangle className="h-4 w-4" /> },
            { label: 'Control Testing', href: '/control-testing', icon: <FileText className="h-4 w-4" /> },
            { label: 'Board Reporting', href: '/board-reports', icon: <FileText className="h-4 w-4" /> },
          ]}
        />
        <TaskListCard />
      </div>
    </div>
  );
}

function ControlsManagerDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Controls Management</h1>
        <p className="text-gray-600">Manage risks, controls, and testing activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard
          title="My Risks"
          value="8"
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
        <DashboardCard
          title="My Controls"
          value="32"
          icon={<Shield className="h-6 w-6" />}
          color="blue"
        />
        <DashboardCard
          title="Testing Due"
          value="12"
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
        />
        <DashboardCard
          title="Deficiencies"
          value="3"
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionsCard
          title="Quick Actions"
          actions={[
            { label: 'Document Controls', href: '/material-controls', icon: <FileText className="h-4 w-4" /> },
            { label: 'Assign Testing', href: '/control-testing', icon: <CheckCircle className="h-4 w-4" /> },
            { label: 'Review Gaps', href: '/gaps', icon: <AlertTriangle className="h-4 w-4" /> },
          ]}
        />
        <TaskListCard />
      </div>
    </div>
  );
}

function ControlOwnerDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Controls</h1>
        <p className="text-gray-600">View and update your assigned controls</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard
          title="Assigned Controls"
          value="5"
          icon={<Shield className="h-6 w-6" />}
          color="blue"
        />
        <DashboardCard
          title="Testing Pending"
          value="2"
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
        />
        <DashboardCard
          title="Evidence Due"
          value="1"
          icon={<FileText className="h-6 w-6" />}
          color="orange"
        />
        <DashboardCard
          title="Completed"
          value="3"
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskListCard />
        <RecentActivityCard />
      </div>
    </div>
  );
}

function ReviewerDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Dashboard</h1>
        <p className="text-gray-600">Review and approve framework content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard
          title="Pending Reviews"
          value="7"
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
        />
        <DashboardCard
          title="Open Comments"
          value="12"
          icon={<FileText className="h-6 w-6" />}
          color="blue"
        />
        <DashboardCard
          title="Approved Today"
          value="4"
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
        />
        <DashboardCard
          title="Changes Requested"
          value="2"
          icon={<AlertTriangle className="h-6 w-6" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskListCard />
        <RecentActivityCard />
      </div>
    </div>
  );
}

function BoardMemberDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Board Dashboard</h1>
        <p className="text-gray-600">View framework effectiveness and governance reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard
          title="Framework Score"
          value="85%"
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <DashboardCard
          title="Principal Risks"
          value="13"
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
        <DashboardCard
          title="Deficiencies"
          value="3"
          icon={<AlertTriangle className="h-6 w-6" />}
          color="yellow"
        />
        <DashboardCard
          title="Last Review"
          value="Q4 2024"
          icon={<Calendar className="h-6 w-6" />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionsCard
          title="Reports"
          actions={[
            { label: 'Effectiveness Report', href: '/reports/effectiveness', icon: <FileText className="h-4 w-4" /> },
            { label: 'Board Pack', href: '/reports/board-pack', icon: <FileText className="h-4 w-4" /> },
            { label: 'Audit Trail', href: '/audit', icon: <FileText className="h-4 w-4" /> },
          ]}
        />
        <RecentActivityCard />
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
}

function DashboardCard({ title, value, icon, color }: DashboardCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface QuickActionsCardProps {
  title: string;
  actions: Array<{ label: string; href: string; icon: React.ReactNode }>;
}

function QuickActionsCard({ title, actions }: QuickActionsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.href}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-blue-600">{action.icon}</div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TaskListCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Tasks</h3>
      <div className="space-y-3">
        <TaskItem
          title="Complete control testing for Risk #3"
          dueDate="Due in 3 days"
          priority="high"
        />
        <TaskItem
          title="Review suggested controls for Risk #7"
          dueDate="Due in 5 days"
          priority="medium"
        />
        <TaskItem
          title="Upload evidence for Control #12"
          dueDate="Due in 2 weeks"
          priority="low"
        />
      </div>
    </div>
  );
}

interface TaskItemProps {
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

function TaskItem({ title, dueDate, priority }: TaskItemProps) {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
      <input type="checkbox" className="mt-1" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{dueDate}</p>
      </div>
      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[priority]}`}>
        {priority}
      </span>
    </div>
  );
}

function RecentActivityCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        <ActivityItem
          action="Risk #3 approved"
          user="Jane Smith"
          time="2 hours ago"
        />
        <ActivityItem
          action="Control testing completed"
          user="John Doe"
          time="5 hours ago"
        />
        <ActivityItem
          action="Evidence uploaded"
          user="Sarah Johnson"
          time="1 day ago"
        />
      </div>
    </div>
  );
}

interface ActivityItemProps {
  action: string;
  user: string;
  time: string;
}

function ActivityItem({ action, user, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200">
      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-medium text-blue-600">
          {user.charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{action}</p>
        <p className="text-xs text-gray-500 mt-1">
          {user} • {time}
        </p>
      </div>
    </div>
  );
}
