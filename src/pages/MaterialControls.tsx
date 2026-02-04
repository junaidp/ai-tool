import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/services/api';
import type { MaterialControl } from '@/types';
import { Shield, Search, Plus, Download, Sparkles, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function MaterialControls() {
  const [controls, setControls] = useState<MaterialControl[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiService.getMaterialControls().then(setControls);
  }, []);

  const filteredControls = controls.filter(
    (control) =>
      control.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'effective':
        return 'text-green-600';
      case 'partially_effective':
        return 'text-yellow-600';
      case 'not_effective':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getEffectivenessBadge = (effectiveness: string) => {
    switch (effectiveness) {
      case 'effective':
        return <Badge variant="success">Effective</Badge>;
      case 'partially_effective':
        return <Badge variant="warning">Partially Effective</Badge>;
      case 'not_effective':
        return <Badge variant="destructive">Not Effective</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  const getEffectivenessIcon = (effectiveness: string) => {
    switch (effectiveness) {
      case 'effective':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partially_effective':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'not_effective':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Material Controls Register</h1>
          <p className="text-muted-foreground mt-1">
            Board-approved scope of material controls with rationale and evidence
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Materiality Scoring
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Register
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Control
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Material Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{controls.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved by Audit Committee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Effective</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {controls.filter((c) => c.effectiveness === 'effective').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Operating as designed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Partially Effective</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {controls.filter((c) => c.effectiveness === 'partially_effective').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires remediation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Materiality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(controls.reduce((acc, c) => acc + c.materialityScore, 0) / controls.length)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Material Controls</CardTitle>
              <CardDescription>Controls identified as material based on AI-powered scoring engine</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search controls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredControls.map((control) => (
              <div key={control.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getEffectivenessIcon(control.effectiveness)}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{control.name}</h3>
                        {getEffectivenessBadge(control.effectiveness)}
                      </div>
                      <p className="text-sm text-muted-foreground">{control.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{control.materialityScore}</div>
                    <p className="text-xs text-muted-foreground">Materiality Score</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Materiality Rationale:</span>
                    <p className="text-sm text-muted-foreground mt-1">{control.rationale}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Owner:</span>
                    <p className="text-muted-foreground">{control.owner}</p>
                  </div>
                  <div>
                    <span className="font-medium">Evidence Source:</span>
                    <p className="text-muted-foreground">{control.evidenceSource}</p>
                  </div>
                  <div>
                    <span className="font-medium">Testing Frequency:</span>
                    <p className="text-muted-foreground">{control.testingFrequency}</p>
                  </div>
                  <div>
                    <span className="font-medium">Last Tested:</span>
                    <p className="text-muted-foreground">
                      {control.lastTested ? new Date(control.lastTested).toLocaleDateString() : 'Not tested'}
                    </p>
                  </div>
                </div>

                {control.dependencies.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">System Dependencies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {control.dependencies.map((dep, idx) => (
                        <Badge key={idx} variant="outline">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="outline">View Evidence</Button>
                  <Button size="sm" variant="outline">Test History</Button>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Materiality Scoring Engine</CardTitle>
          <CardDescription>AI-powered, configurable, and auditable scoring model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Impact Severity</span>
              <span className="text-sm text-muted-foreground">Weight: 25%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Likelihood / Vulnerability</span>
              <span className="text-sm text-muted-foreground">Weight: 20%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Velocity (Time to Impact)</span>
              <span className="text-sm text-muted-foreground">Weight: 15%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Regulatory Sensitivity</span>
              <span className="text-sm text-muted-foreground">Weight: 20%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Single Point of Failure</span>
              <span className="text-sm text-muted-foreground">Weight: 10%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Historical Issues</span>
              <span className="text-sm text-muted-foreground">Weight: 10%</span>
            </div>
            <Button variant="outline" className="w-full mt-4">Configure Scoring Model</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
