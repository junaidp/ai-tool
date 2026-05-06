import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download, Loader2, Eye, BookOpen, FileDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FrameworkRenderer } from '@/components/FrameworkRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';

const API_BASE_RAW = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3001';
const API_BASE = API_BASE_RAW.replace(/\/$/, '');
const API_ROOT = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

interface ClientProfile {
  organisationName: string;
  industry: string;
  organisationType: string;
  employees: number;
  countries: number;
  revenueApproxGbpM: number;
  outsourcing: boolean;
  assuranceModel: string;
  riskPriorities: string[];
  goingConcernSensitive: boolean;
  edition: string;
}

const INDUSTRIES = [
  'Aerospace & Defence',
  'Aerospace & Defence / Manufacturing',
  'Alternative Energy',
  'Automobiles & Parts',
  'Banking',
  'Banking Services',
  'Banks',
  'Basic Resources',
  'Beverages',
  'Building Materials Distribution',
  'Chemicals',
  'Chemicals / Advanced Materials',
  'Chemicals / Industrials',
  'Collective Investments',
  'Construction',
  'Construction & Materials',
  'Construction & Materials / Ventilation',
  'Consumer Digital Services',
  'Consumer Staples / Manufacturing',
  'Electricity / Energy',
  'Electronic & Electrical / Manufacturing',
  'Electronic & Electrical / Precision Engineering',
  'Electronic & Electrical Equipment',
  'Energy',
  'Engineering & Construction',
  'Equity Investments',
  'Financial Services',
  'Food & Drink Manufacturing',
  'Food & Drug Retailers',
  'Food & Drug Retailers / Manufacturing',
  'Food & Tobacco',
  'Food Producers',
  'Food Producers / Ingredients Manufacturing',
  'Food, Beverage & Tobacco',
  'Gas, Water & Multiutilities',
  'General Financial',
  'General Industrials',
  'General Industrials / Manufacturing',
  'Health Care',
  'Health Care Equipment & Services',
  'Hedge Funds',
  'Home Construction',
  'Industrial Engineering',
  'Industrial Materials / Manufacturing',
  'Industrial Metals & Mining',
  'Industrial Support Services',
  'Industrial Transportation',
  'Industrials',
  'Investment Banking & Brokerage',
  'Investment Trusts',
  'Leisure Goods',
  'Life Insurance',
  'Media',
  'Nonlife Insurance',
  'Oil & Gas Producers',
  'Oil, Gas & Coal',
  'Personal Goods',
  'Personal Products / eCommerce',
  'Pharmaceuticals & Biotechnology',
  'Precious Metals & Mining',
  'Real Estate',
  'Real Estate Investment & Services',
  'Real Estate Investment Trusts',
  'Retail',
  'Retailers',
  'Retailers / Automotive',
  'Retailers / Building Materials',
  'Retailers / Food Service',
  'Software & Computer Services',
  'Support Services',
  'Support Services / Facilities Management',
  'Support Services / Financial Markets',
  'Support Services / Fleet Management',
  'Technology',
  'Telecommunications',
  'Travel & Leisure',
];

const ORGANISATION_TYPES = [
  'Listed Company',
  'Large Private',
  'Family-Owned',
  'PE-Backed',
  'Subsidiary of Listed Group',
];

const ASSURANCE_MODELS = [
  'In-house Internal Audit',
  'Co-sourced',
  'Third-party Only',
  'None',
];

const RISK_PRIORITIES = [
  { id: 'supply_chain', label: 'Supply Chain' },
  { id: 'financial_reporting', label: 'Financial Reporting Complexity' },
  { id: 'commercial_fraud', label: 'Commercial Fraud' },
  { id: 'cyber', label: 'Cyber Security' },
  { id: 'regulatory_compliance', label: 'Regulatory Compliance' },
  { id: 'product_safety', label: 'Product Safety' },
  { id: 'esg', label: 'ESG' },
  { id: 'other', label: 'Other' },
];

const EDITIONS = [
  { value: 'summary', label: 'Summary Only' },
  { value: 'detailed', label: 'Detailed Only' },
  { value: 'both', label: 'Both' },
];

export default function P29FrameworkDevelopment() {
  const [profile, setProfile] = useState<ClientProfile>({
    organisationName: '',
    industry: '',
    organisationType: '',
    employees: 0,
    countries: 1,
    revenueApproxGbpM: 0,
    outsourcing: false,
    assuranceModel: '',
    riskPriorities: [],
    goingConcernSensitive: false,
    edition: 'both',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFrameworks, setGeneratedFrameworks] = useState<{
    summary?: string;
    detailed?: string;
  } | null>(null);

  const handleInputChange = (field: keyof ClientProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleRiskPriorityToggle = (priorityId: string) => {
    setProfile(prev => ({
      ...prev,
      riskPriorities: prev.riskPriorities.includes(priorityId)
        ? prev.riskPriorities.filter(p => p !== priorityId)
        : [...prev.riskPriorities, priorityId],
    }));
  };

  const validateProfile = (): boolean => {
    if (!profile.organisationName.trim()) {
      alert('Please enter organisation name');
      return false;
    }
    if (!profile.industry) {
      alert('Please select an industry');
      return false;
    }
    if (!profile.organisationType) {
      alert('Please select organisation type');
      return false;
    }
    if (profile.employees <= 0) {
      alert('Please enter number of employees');
      return false;
    }
    if (!profile.assuranceModel) {
      alert('Please select assurance model');
      return false;
    }
    if (profile.riskPriorities.length === 0) {
      alert('Please select at least one risk priority');
      return false;
    }
    return true;
  };

  const handleGenerateFramework = async () => {
    if (!validateProfile()) {
      return;
    }

    if (!confirm('Generate P29 Framework based on this organisation profile? This may take a few minutes.')) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API_ROOT}/p29-framework/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate framework: ${response.statusText}`);
      }

      const result = await response.json();
      setGeneratedFrameworks(result);
      alert('✅ Framework generated successfully!');
    } catch (error) {
      console.error('Failed to generate framework:', error);
      alert('❌ Failed to generate framework. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadFramework = (type: 'summary' | 'detailed') => {
    const content = type === 'summary' ? generatedFrameworks?.summary : generatedFrameworks?.detailed;
    if (!content) return;

    const blob = new Blob([content], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `P29-Framework-${type}-${profile.organisationName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">P29 Framework Development</h1>
        <p className="text-muted-foreground mt-2">
          Generate bespoke Provision 29 internal control frameworks calibrated to your organisation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organisation Profile</CardTitle>
          <CardDescription>
            Provide your organisation details to generate a customized framework aligned to UK Corporate Governance Code (2024), Provision 29
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organisation Name *</Label>
              <Input
                id="orgName"
                placeholder="e.g., Acme Group plc"
                value={profile.organisationName}
                onChange={(e) => handleInputChange('organisationName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry / Sector *</Label>
              <Select value={profile.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgType">Organisation Type *</Label>
              <Select value={profile.organisationType} onValueChange={(value) => handleInputChange('organisationType', value)}>
                <SelectTrigger id="orgType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ORGANISATION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employees">Number of Employees *</Label>
              <Input
                id="employees"
                type="number"
                placeholder="e.g., 4200"
                value={profile.employees || ''}
                onChange={(e) => handleInputChange('employees', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countries">Number of Countries</Label>
              <Input
                id="countries"
                type="number"
                placeholder="e.g., 12"
                value={profile.countries || ''}
                onChange={(e) => handleInputChange('countries', parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Annual Revenue (£M approx)</Label>
              <Input
                id="revenue"
                type="number"
                placeholder="e.g., 850"
                value={profile.revenueApproxGbpM || ''}
                onChange={(e) => handleInputChange('revenueApproxGbpM', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assurance">Independent Assurance Model *</Label>
              <Select value={profile.assuranceModel} onValueChange={(value) => handleInputChange('assuranceModel', value)}>
                <SelectTrigger id="assurance">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {ASSURANCE_MODELS.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edition">Framework Edition Required *</Label>
              <Select value={profile.edition} onValueChange={(value) => handleInputChange('edition', value)}>
                <SelectTrigger id="edition">
                  <SelectValue placeholder="Select edition" />
                </SelectTrigger>
                <SelectContent>
                  {EDITIONS.map(ed => (
                    <SelectItem key={ed.value} value={ed.value}>{ed.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="outsourcing"
                checked={profile.outsourcing}
                onCheckedChange={(checked) => handleInputChange('outsourcing', checked)}
              />
              <Label htmlFor="outsourcing" className="font-normal">
                Third-party manufacturing or outsourcing
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="goingConcern"
                checked={profile.goingConcernSensitive}
                onCheckedChange={(checked) => handleInputChange('goingConcernSensitive', checked)}
              />
              <Label htmlFor="goingConcern" className="font-normal">
                Going concern sensitivity (non-trivial assessment likely)
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Key Risk Areas (select all that apply) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RISK_PRIORITIES.map(risk => (
                <div key={risk.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={risk.id}
                    checked={profile.riskPriorities.includes(risk.id)}
                    onCheckedChange={() => handleRiskPriorityToggle(risk.id)}
                  />
                  <Label htmlFor={risk.id} className="font-normal">
                    {risk.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleGenerateFramework}
              disabled={isGenerating}
              size="lg"
              className="w-full md:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Framework...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Generate P29 Framework
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedFrameworks && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Frameworks</CardTitle>
            <CardDescription>
              View and download your customized P29 framework documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue={(profile.edition === 'summary' || profile.edition === 'both') ? 'summary' : 'detailed'} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: profile.edition === 'both' ? '1fr 1fr' : '1fr' }}>
                {(profile.edition === 'summary' || profile.edition === 'both') && generatedFrameworks.summary && (
                  <TabsTrigger value="summary">Summary Edition</TabsTrigger>
                )}
                {(profile.edition === 'detailed' || profile.edition === 'both') && generatedFrameworks.detailed && (
                  <TabsTrigger value="detailed">Detailed Edition</TabsTrigger>
                )}
              </TabsList>

              {(profile.edition === 'summary' || profile.edition === 'both') && generatedFrameworks.summary && (
                <TabsContent value="summary" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Summary Edition</h3>
                        <p className="text-sm text-muted-foreground">Board governance document - concise and board-readable</p>
                      </div>
                    </div>
                    <Button onClick={() => handleDownloadFramework('summary')} className="gap-2">
                      <FileDown className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  <Card className="border-2">
                    <ScrollArea className="h-[700px]">
                      <div className="p-8">
                        <FrameworkRenderer content={generatedFrameworks.summary} />
                      </div>
                    </ScrollArea>
                  </Card>
                </TabsContent>
              )}

              {(profile.edition === 'detailed' || profile.edition === 'both') && generatedFrameworks.detailed && (
                <TabsContent value="detailed" className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Detailed Edition</h3>
                        <p className="text-sm text-muted-foreground">Practitioner reference with explanations and examples</p>
                      </div>
                    </div>
                    <Button onClick={() => handleDownloadFramework('detailed')} className="gap-2">
                      <FileDown className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  <Card className="border-2">
                    <ScrollArea className="h-[700px]">
                      <div className="p-8">
                        <FrameworkRenderer content={generatedFrameworks.detailed} />
                      </div>
                    </ScrollArea>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
