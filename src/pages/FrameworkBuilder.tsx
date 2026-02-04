import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockApiService } from '@/services/mockApi';
import type { FrameworkComponent } from '@/types';
import { Building2, Users, Target, Shield, FileText, TrendingUp, Plus, Download } from 'lucide-react';

const componentIcons = {
  governance: Users,
  risk_taxonomy: Target,
  risk_appetite: TrendingUp,
  control_model: Shield,
  three_lines: Building2,
  policy: FileText,
  reporting: TrendingUp,
};

export default function FrameworkBuilder() {
  const [components, setComponents] = useState<FrameworkComponent[]>([]);

  useEffect(() => {
    mockApiService.getFrameworkComponents().then(setComponents);
  }, []);

  const groupedComponents = components.reduce((acc, component) => {
    if (!acc[component.type]) acc[component.type] = [];
    acc[component.type].push(component);
    return acc;
  }, {} as Record<string, FrameworkComponent[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Framework Builder</h1>
          <p className="text-muted-foreground mt-1">
            Design and configure your risk management & internal controls framework
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Blueprint
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle>Guided Framework Builder</CardTitle>
          <CardDescription>
            Step-by-step wizard to capture organizational context and build your framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Launch Framework Wizard</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Components</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="control">Control</TabsTrigger>
          <TabsTrigger value="assurance">Assurance</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {components.map((component) => {
              const Icon = componentIcons[component.type];
              return (
                <Card key={component.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{component.name}</CardTitle>
                      </div>
                      <Badge variant={component.status === 'approved' ? 'success' : 'warning'}>
                        {component.status === 'approved' ? 'Approved' : 'In Review'}
                      </Badge>
                    </div>
                    <CardDescription>{component.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Owner:</span>
                        <span className="font-medium">{component.owner}</span>
                      </div>
                      {component.lastReviewed && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Reviewed:</span>
                          <span>{new Date(component.lastReviewed).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                      <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="governance">
          <Card>
            <CardHeader>
              <CardTitle>Governance Operating Model</CardTitle>
              <CardDescription>Committee structures, decision rights, and escalation routes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedComponents.governance?.map((component) => (
                <div key={component.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{component.name}</h3>
                    <Badge variant={component.status === 'approved' ? 'success' : 'warning'}>
                      {component.status === 'approved' ? 'Approved' : 'In Review'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">Owner: </span>
                    <span className="font-medium">{component.owner}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Taxonomy</CardTitle>
                <CardDescription>Enterprise risk categories and objective mapping</CardDescription>
              </CardHeader>
              <CardContent>
                {groupedComponents.risk_taxonomy?.map((component) => (
                  <div key={component.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{component.name}</h3>
                      <Badge variant="success">Approved</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Appetite Framework</CardTitle>
                <CardDescription>Appetite statements, tolerances, and triggers</CardDescription>
              </CardHeader>
              <CardContent>
                {groupedComponents.risk_appetite?.map((component) => (
                  <div key={component.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{component.name}</h3>
                      <Badge variant="success">Approved</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="control">
          <Card>
            <CardHeader>
              <CardTitle>Control Model</CardTitle>
              <CardDescription>Preventive, detective, and corrective controls with dependencies</CardDescription>
            </CardHeader>
            <CardContent>
              {groupedComponents.control_model?.map((component) => (
                <div key={component.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{component.name}</h3>
                    <Badge variant="success">Approved</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assurance">
          <Card>
            <CardHeader>
              <CardTitle>Three Lines of Defence</CardTitle>
              <CardDescription>RACI matrix and assurance mapping</CardDescription>
            </CardHeader>
            <CardContent>
              {groupedComponents.three_lines?.map((component) => (
                <div key={component.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{component.name}</h3>
                    <Badge variant="warning">In Review</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Framework Outputs</CardTitle>
          <CardDescription>Generated documentation and artifacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <div className="font-medium">Framework Blueprint Document</div>
                <div className="text-xs text-muted-foreground">Complete framework design documentation</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <div className="font-medium">RACI Matrix</div>
                <div className="text-xs text-muted-foreground">Roles and responsibilities mapping</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <div className="font-medium">Workflow Diagrams</div>
                <div className="text-xs text-muted-foreground">Process flows and escalation routes</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <div className="font-medium">Effectiveness Mapping</div>
                <div className="text-xs text-muted-foreground">Framework linkage to criteria</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
