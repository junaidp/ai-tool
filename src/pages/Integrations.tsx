import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api';
import type { IntegrationStatus } from '@/types';
import { Plug, CheckCircle, XCircle, AlertCircle, Plus, Settings, Activity, Database } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function Integrations() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [isAddIntegrationOpen, setIsAddIntegrationOpen] = useState(false);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [isViewSignalsOpen, setIsViewSignalsOpen] = useState(false);
  const [isViewExceptionsOpen, setIsViewExceptionsOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationStatus | null>(null);
  const [integrationFormData, setIntegrationFormData] = useState({
    system: '',
    type: 'erp',
    endpoint: '',
    apiKey: ''
  });

  useEffect(() => {
    apiService.getIntegrations().then(setIntegrations);
  }, []);

  const loadIntegrations = async () => {
    const data = await apiService.getIntegrations();
    setIntegrations(data);
  };

  const handleAddIntegration = () => {
    setIntegrationFormData({
      system: '',
      type: 'erp',
      endpoint: '',
      apiKey: ''
    });
    setIsAddIntegrationOpen(true);
  };

  const handleAddIntegrationSubmit = async () => {
    if (!integrationFormData.system || !integrationFormData.endpoint) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await apiService.createIntegration({
        ...integrationFormData,
        status: 'disconnected',
        signalsReceived: 0,
        exceptionsRaised: 0,
        lastSync: new Date().toISOString()
      });
      setIsAddIntegrationOpen(false);
      await loadIntegrations();
      alert('✅ Integration added successfully!');
    } catch (error) {
      console.error('Failed to add integration:', error);
      alert('Failed to add integration. Please try again.');
    }
  };

  const handleConfigure = (integration: IntegrationStatus) => {
    setSelectedIntegration(integration);
    setIsConfigureOpen(true);
  };

  const handleViewSignals = (integration: IntegrationStatus) => {
    setSelectedIntegration(integration);
    setIsViewSignalsOpen(true);
  };

  const handleViewExceptions = (integration: IntegrationStatus) => {
    setSelectedIntegration(integration);
    setIsViewExceptionsOpen(true);
  };

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
        <Button onClick={handleAddIntegration}>
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
                  <Button size="sm" variant="outline" onClick={() => handleConfigure(integration)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleViewSignals(integration)}>
                    <Activity className="h-4 w-4 mr-2" />
                    View Signals
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleViewExceptions(integration)}>View Exceptions</Button>
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

      {/* Add Integration Dialog */}
      <Dialog open={isAddIntegrationOpen} onOpenChange={setIsAddIntegrationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add System Integration</DialogTitle>
            <DialogDescription>
              Connect a new enterprise system for continuous monitoring
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>System Name *</Label>
              <Input 
                placeholder="e.g., SAP ERP Production"
                value={integrationFormData.system}
                onChange={(e) => setIntegrationFormData({...integrationFormData, system: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Integration Type *</Label>
              <Select value={integrationFormData.type} onValueChange={(value) => setIntegrationFormData({...integrationFormData, type: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="erp">ERP System</SelectItem>
                  <SelectItem value="identity">Identity & Access Management</SelectItem>
                  <SelectItem value="ticketing">Issue Tracking</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="cloud">Cloud Platform</SelectItem>
                  <SelectItem value="custom">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>API Endpoint *</Label>
              <Input 
                placeholder="https://api.system.com/v1"
                value={integrationFormData.endpoint}
                onChange={(e) => setIntegrationFormData({...integrationFormData, endpoint: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>API Key / Token</Label>
              <Input 
                type="password"
                placeholder="Enter API key or authentication token"
                value={integrationFormData.apiKey}
                onChange={(e) => setIntegrationFormData({...integrationFormData, apiKey: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-900">
                <strong>Note:</strong> The integration will be created in 'Disconnected' status. Use Configure to set up control signals and test the connection.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddIntegrationOpen(false)}>Cancel</Button>
            <Button onClick={handleAddIntegrationSubmit}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Dialog */}
      <Dialog open={isConfigureOpen} onOpenChange={setIsConfigureOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configure: {selectedIntegration?.system}</DialogTitle>
            <DialogDescription>
              Configure connection settings and control signal mappings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-3">Connection Settings</h4>
              <div className="space-y-3">
                <div>
                  <Label>API Endpoint</Label>
                  <Input 
                    defaultValue="https://api.system.com/v1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Authentication Method</Label>
                  <Select defaultValue="api_key">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="token">Bearer Token</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sync Frequency</Label>
                  <Select defaultValue="15min">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="5min">Every 5 minutes</SelectItem>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="1hour">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Control Signal Mappings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>Access Control Events → User Access Review</span>
                  <Badge variant="success">Mapped</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>Financial Transactions → Reconciliation Control</span>
                  <Badge variant="success">Mapped</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>Change Approvals → Change Management Control</span>
                  <Badge variant="outline">Not Mapped</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3">
                <Settings className="h-4 w-4 mr-2" />
                Configure Mappings
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Test Connection</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Verify connectivity and authentication before saving
              </p>
              <Button variant="outline">Test Connection</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigureOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setIsConfigureOpen(false);
              alert('✅ Configuration saved successfully!');
            }}>
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Signals Dialog */}
      <Dialog open={isViewSignalsOpen} onOpenChange={setIsViewSignalsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Control Signals: {selectedIntegration?.system}</DialogTitle>
            <DialogDescription>
              Recent signals and monitoring events (Last 24 hours)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="border rounded-lg p-3 bg-blue-50">
                <p className="text-sm font-medium text-blue-900">Total Signals</p>
                <p className="text-2xl font-bold text-blue-600">{selectedIntegration?.signalsReceived.toLocaleString()}</p>
              </div>
              <div className="border rounded-lg p-3 bg-green-50">
                <p className="text-sm font-medium text-green-900">Processed</p>
                <p className="text-2xl font-bold text-green-600">{selectedIntegration ? selectedIntegration.signalsReceived - selectedIntegration.exceptionsRaised : 0}</p>
              </div>
              <div className="border rounded-lg p-3 bg-yellow-50">
                <p className="text-sm font-medium text-yellow-900">Exceptions</p>
                <p className="text-2xl font-bold text-yellow-600">{selectedIntegration?.exceptionsRaised}</p>
              </div>
            </div>

            <div className="border rounded-lg">
              <div className="bg-gray-50 border-b px-4 py-2 font-medium text-sm">
                Recent Signals
              </div>
              <div className="divide-y">
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">User Access Review - Completed</span>
                    <Badge variant="success">Processed</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Control: CTL-002 | {new Date().toLocaleString()}</p>
                </div>
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Financial Reconciliation - Executed</span>
                    <Badge variant="success">Processed</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Control: CTL-001 | {new Date(Date.now() - 3600000).toLocaleString()}</p>
                </div>
                <div className="p-3 hover:bg-gray-50 bg-yellow-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Approval Workflow - Late Approval</span>
                    <Badge variant="warning">Exception</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Control: CTL-004 | {new Date(Date.now() - 7200000).toLocaleString()}</p>
                </div>
                <div className="p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Change Request - Approved</span>
                    <Badge variant="success">Processed</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Control: CTL-005 | {new Date(Date.now() - 10800000).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Activity className="h-4 w-4 mr-2" />
                Export Signals
              </Button>
              <Button variant="outline" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Configure Filters
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewSignalsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Exceptions Dialog */}
      <Dialog open={isViewExceptionsOpen} onOpenChange={setIsViewExceptionsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Control Exceptions: {selectedIntegration?.system}</DialogTitle>
            <DialogDescription>
              Exceptions requiring investigation and remediation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="border rounded-lg p-3 bg-red-50">
                <p className="text-sm font-medium text-red-900">Critical</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <div className="border rounded-lg p-3 bg-yellow-50">
                <p className="text-sm font-medium text-yellow-900">Medium</p>
                <p className="text-2xl font-bold text-yellow-600">{selectedIntegration?.exceptionsRaised || 0}</p>
              </div>
              <div className="border rounded-lg p-3 bg-blue-50">
                <p className="text-sm font-medium text-blue-900">Low</p>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
            </div>

            {selectedIntegration && selectedIntegration.exceptionsRaised > 0 ? (
              <div className="space-y-3">
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="font-semibold">Late Approval Detected</h4>
                        <p className="text-xs text-muted-foreground">Control: CTL-004 - Change Management</p>
                      </div>
                    </div>
                    <Badge variant="warning">Medium</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Approval obtained 45 minutes after transaction execution. Expected: Pre-approval within 15 minutes.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                    <div>
                      <span className="font-medium">Detected:</span> {new Date(Date.now() - 7200000).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> <Badge variant="outline">Open</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Investigate</Button>
                    <Button size="sm" variant="outline">Assign</Button>
                    <Button size="sm" variant="outline">Close</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="font-semibold">Missing Documentation</h4>
                        <p className="text-xs text-muted-foreground">Control: CTL-003 - Vendor Due Diligence</p>
                      </div>
                    </div>
                    <Badge variant="warning">Medium</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Vendor onboarding completed without required financial statements. Documentation threshold not met.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                    <div>
                      <span className="font-medium">Detected:</span> {new Date(Date.now() - 14400000).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> <Badge variant="outline">In Progress</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Investigate</Button>
                    <Button size="sm" variant="outline">Assign</Button>
                    <Button size="sm" variant="outline">Close</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="font-medium">No exceptions detected</p>
                <p className="text-sm text-muted-foreground mt-1">All control signals within expected parameters</p>
              </div>
            )}

            <div className="border-t pt-3">
              <Button variant="outline" className="w-full">
                View All Exceptions
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewExceptionsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
