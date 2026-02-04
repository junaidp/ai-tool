import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/api';
import type { IntegrationStatus } from '@/types';
import { Plug, CheckCircle, XCircle, AlertCircle, Plus, Settings, Activity, Database } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function Integrations() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

  useEffect(() => {
    apiService.getIntegrations().then(setIntegrations);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Plug className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="outline">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;
  const totalSignals = integrations.reduce((acc, i) => acc + i.signalsReceived, 0);
  const totalExceptions = integrations.reduce((acc, i) => acc + i.exceptionsRaised, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect to enterprise systems for continuous control monitoring
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Connected Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">of {integrations.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Signals Received (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSignals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all systems</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Exceptions Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalExceptions}</div>
            <p className="text-xs text-muted-foreground mt-1">Requiring investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((connectedCount / integrations.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Systems</CardTitle>
          <CardDescription>Real-time integration status and monitoring statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integration.status)}
                    <div>
                      <h3 className="font-semibold">{integration.system}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last sync: {formatDateTime(integration.lastSync)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Signals Received</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {integration.signalsReceived.toLocaleString()}
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Last 24 hours</p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">Exceptions Raised</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{integration.exceptionsRaised}</div>
                    <p className="text-xs text-yellow-600 mt-1">Requiring review</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    View Signals
                  </Button>
                  <Button size="sm" variant="outline">View Exceptions</Button>
                  {integration.status === 'error' && (
                    <Button size="sm" variant="destructive">Reconnect</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Integrations</CardTitle>
            <CardDescription>Pre-built connectors for common enterprise systems</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Oracle ERP</p>
                  <p className="text-xs text-muted-foreground">Financial controls monitoring</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Connect</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Okta</p>
                  <p className="text-xs text-muted-foreground">Identity and access management</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Connect</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Jira</p>
                  <p className="text-xs text-muted-foreground">Issue and remediation tracking</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Connect</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Continuous Monitoring Configuration</CardTitle>
            <CardDescription>Configure control signals and thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Control Signals</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Define events and metrics to monitor for each control
              </p>
              <Button variant="outline" className="w-full">Configure Signals</Button>
            </div>
            <div>
              <h4 className="font-medium mb-2">Alert Thresholds</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Set thresholds that trigger exception workflows
              </p>
              <Button variant="outline" className="w-full">Configure Thresholds</Button>
            </div>
            <div>
              <h4 className="font-medium mb-2">Exception Workflows</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Owner notification, investigation, and remediation flows
              </p>
              <Button variant="outline" className="w-full">Configure Workflows</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evidence Auto-Capture</CardTitle>
          <CardDescription>Automated evidence collection with audit trail</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Evidence Immutability</p>
                <p className="text-sm text-green-700">All evidence timestamped and version-controlled</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Audit Trail</p>
                <p className="text-sm text-blue-700">Complete who/when/what changed history</p>
              </div>
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium text-purple-900">Data Retention</p>
                <p className="text-sm text-purple-700">Configurable retention policies and access controls</p>
              </div>
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
