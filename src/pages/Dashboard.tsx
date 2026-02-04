import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/services/api';
import type { DashboardData } from '@/types';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Shield, FileCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    apiService.getDashboardData().then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  const effectivenessData = [
    { name: 'Met', value: data.effectivenessStatus.met, color: '#22c55e' },
    { name: 'Partially Met', value: data.effectivenessStatus.partially, color: '#f59e0b' },
    { name: 'Not Met', value: data.effectivenessStatus.notMet, color: '#ef4444' },
  ];

  const controlHealthPercent = Math.round((data.controlHealth.effective / data.controlHealth.tested) * 100);
  const testingProgress = Math.round((data.controlHealth.tested / data.controlHealth.totalMaterial) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Risk & Control Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Board-level view of risk management & internal controls effectiveness
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Material Controls</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.controlHealth.totalMaterial}</div>
            <p className="text-xs text-muted-foreground">
              {data.controlHealth.tested} tested this period
            </p>
            <Progress value={testingProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Control Effectiveness</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{controlHealthPercent}%</div>
            <p className="text-xs text-muted-foreground">
              {data.controlHealth.effective} of {data.controlHealth.tested} effective
            </p>
            <Progress value={controlHealthPercent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.issuesByTheme.reduce((acc, item) => acc + item.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {data.issuesByTheme.length} risk themes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criteria Status</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.effectivenessStatus.met}</div>
            <p className="text-xs text-muted-foreground">
              {data.effectivenessStatus.met} met, {data.effectivenessStatus.partially} partial
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Effectiveness Criteria Status</CardTitle>
            <CardDescription>Board-approved effectiveness dimensions</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={effectivenessData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {effectivenessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Theme</CardTitle>
            <CardDescription>Current open issues across risk categories</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.issuesByTheme}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="theme" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Remediation Progress</CardTitle>
          <CardDescription>Monthly trends of issues opened vs closed</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.remediationProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="opened" fill="#ef4444" name="Opened" />
              <Bar dataKey="closed" fill="#22c55e" name="Closed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Control test completed</p>
                <p className="text-xs text-muted-foreground">SoD - Payments, 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">New control gap identified</p>
                <p className="text-xs text-muted-foreground">GDPR guidance, 5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Issue remediation approved</p>
                <p className="text-xs text-muted-foreground">Vendor due diligence, 1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Access Control Testing</p>
                <p className="text-xs text-muted-foreground">Due: Apr 10, 2024</p>
              </div>
              <Badge variant="warning">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">SoD - Payments</p>
                <p className="text-xs text-muted-foreground">Due: Apr 15, 2024</p>
              </div>
              <Badge variant="outline">Scheduled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Data Backup Recovery</p>
                <p className="text-xs text-muted-foreground">Due: Apr 20, 2024</p>
              </div>
              <Badge variant="outline">Scheduled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Decision-Use Criteria</p>
                <p className="text-xs text-muted-foreground">Audit Committee</p>
              </div>
              <Badge variant="warning">Pending</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">3LoD Model</p>
                <p className="text-xs text-muted-foreground">Board</p>
              </div>
              <Badge variant="warning">Pending</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Control Gap - Reconciliation</p>
                <p className="text-xs text-muted-foreground">2nd Line Review</p>
              </div>
              <Badge variant="info">In Review</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
