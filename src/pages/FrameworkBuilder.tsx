import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api';
import type { EffectivenessCriteria } from '@/types';
import { 
  FileText, Download, Pencil, Save, CheckCircle, Target, 
  Shield, Users, TrendingUp, AlertTriangle, BookOpen,
  Network, Settings, BarChart, Eye, Workflow
} from 'lucide-react';

interface FrameworkSection {
  id: string;
  title: string;
  icon: any;
  content: string;
  editable: boolean;
}

const defaultFrameworkSections: FrameworkSection[] = [
  {
    id: 'purpose-scope',
    title: 'Purpose & Scope',
    icon: Target,
    content: `This Internal Control Framework establishes a systematic approach to managing risk and ensuring the achievement of organizational objectives. 

**Purpose:**
• Provide reasonable assurance regarding achievement of strategic, operational, reporting, and compliance objectives
• Enable proactive risk identification and management across all business activities
• Foster a culture of accountability and continuous improvement
• Support informed decision-making at all organizational levels

**Scope:**
This framework applies to all business units, processes, and activities across the organization, including:
• Strategic planning and execution
• Financial and operational processes
• Technology and information systems
• Third-party relationships and outsourced activities
• Regulatory and compliance obligations`,
    editable: true
  },
  {
    id: 'organizational-benefit',
    title: 'How Framework Helps Organization',
    icon: TrendingUp,
    content: `This framework enables the organization to:

**Strategic Value:**
• Align risk management with strategic priorities and business objectives
• Enhance board and management confidence in control environment
• Support sustainable growth through proactive risk mitigation
• Improve resource allocation by focusing on principal risks

**Operational Excellence:**
• Standardize control activities across all business units
• Reduce duplication and inefficiencies in control execution
• Enable early detection and remediation of control deficiencies
• Facilitate integration of controls into business-as-usual activities

**Decision Support:**
• Provide timely, accurate information for critical decisions
• Enable risk-informed choices in new initiatives and changes
• Support evidence-based prioritization of remediation efforts`,
    editable: true
  },
  {
    id: 'effectiveness-assessment',
    title: 'Effectiveness Assessment',
    icon: CheckCircle,
    content: `Framework effectiveness is assessed using board-approved criteria across five dimensions:

**1. Risk Coverage**
The framework consistently identifies and maintains a clear view of principal risks that could prevent achievement of objectives. Effectiveness is demonstrated through complete risk-objective mapping, active governance review, and timely risk reassessment.

**2. Control Definition**
For principal risks, material controls are clearly defined with proportionate design, clear ownership, documented frequency, and specified evidence requirements. Three lines of defence accountabilities are explicit.

**3. Monitoring & Escalation**
Controls operate as intended with continuous monitoring, exception detection, and defined escalation routes ensuring significant issues promptly reach management and the Audit Committee/Board as appropriate.

**4. Remediation & Retesting**
Issues are triaged, assigned to owners, remediated through time-bound action plans, and validated through retesting. Root cause analysis prevents recurrence of control failures.

**5. Integration & Adaptation**
The framework is embedded in key decisions and change activities, ensuring risk/control impacts are considered upfront. It adapts through defined triggers and periodic reviews to remain fit for purpose.

**Assessment Frequency:** Quarterly reviews with annual board assessment`,
    editable: true
  },
  {
    id: 'governance',
    title: 'Governance Structure',
    icon: Users,
    content: `**Board of Directors:**
• Ultimate accountability for framework effectiveness
• Approves risk appetite, material risk decisions, and framework changes
• Reviews effectiveness quarterly through Audit Committee
• Receives attestation on internal control effectiveness

**Audit Committee:**
• Oversees framework design and operation
• Reviews principal risks and material control deficiencies
• Monitors remediation of significant issues
• Assesses adequacy of assurance activities

**Executive Risk Committee:**
• Owns day-to-day framework operation
• Reviews risk profile, control status, and emerging issues monthly
• Approves changes to risk taxonomy and control design
• Escalates matters requiring board attention

**Management Committees:**
• Business unit risk review forums
• Operational control monitoring
• Issue escalation and remediation tracking
• Integration with business planning`,
    editable: true
  },
  {
    id: 'integration',
    title: 'Operations, Reporting & Compliance Integration',
    icon: Network,
    content: `**Operational Integration:**
• Controls are embedded within business processes, not standalone activities
• Control execution is part of role responsibilities and performance expectations
• Technology-enabled controls where feasible to reduce manual effort
• Controls leverage operational data and systems

**Reporting Integration:**
• Control status feeds into management dashboards and board reporting
• Risk information supports business performance reviews
• Exception reporting triggers investigations and remediation
• Financial close incorporates control attestation

**Compliance Integration:**
• Regulatory requirements mapped to specific controls
• Compliance obligations tracked within risk taxonomy
• Control changes triggered by regulatory updates
• Evidence management supports regulatory examinations

**Change Management:**
• New products, services, and initiatives assessed for risk/control impact
• System implementations include control design requirements
• Organizational changes trigger control owner reassignment
• Outsourcing arrangements include control specifications`,
    editable: true
  },
  {
    id: 'control-building-blocks',
    title: 'Building Blocks of Internal Control',
    icon: Shield,
    content: `**Control Environment:**
• Tone at the top and ethical culture
• Organizational structure and authority assignment
• Competence and capability development
• Performance management and accountability

**Risk Assessment:**
• Objective setting across all organizational levels
• Risk identification through multiple sources
• Risk analysis considering likelihood and impact
• Principal risk determination based on residual exposure

**Control Activities:**
• Preventive controls - stop issues before occurrence
• Detective controls - identify issues that have occurred
• Corrective controls - remedy identified issues
• Technology controls - automated enforcement and monitoring

**Information & Communication:**
• Timely risk and control information to relevant parties
• Clear escalation channels and thresholds
• Stakeholder communication on framework changes
• External reporting on control effectiveness

**Monitoring:**
• Ongoing operational monitoring embedded in processes
• Periodic evaluations through testing and assessment
• Independent assurance through internal audit
• Management self-assessment and attestation`,
    editable: true
  },
  {
    id: 'controls-objectives',
    title: 'Controls Serving Business Objectives',
    icon: Target,
    content: `**Strategic Objectives:**
Controls ensure strategic initiatives are executed within acceptable risk parameters, resource allocations align with priorities, and strategic risks are identified and managed proactively.

**Operational Objectives:**
Controls promote operational efficiency, prevent disruptions to critical processes, ensure product/service quality, and optimize resource utilization.

**Reporting Objectives:**
Controls ensure accuracy and completeness of internal and external reports, timeliness of information for decision-making, and compliance with accounting standards and disclosure requirements.

**Compliance Objectives:**
Controls ensure adherence to laws and regulations, meet license/permit conditions, fulfill contractual obligations, and maintain industry standards.

**Objective-Control Linkage:**
• Each principal risk is mapped to strategic or operational objectives it threatens
• Material controls are explicitly linked to the risks they mitigate
• Control effectiveness is assessed against objective achievement
• Control gaps are prioritized based on objective criticality`,
    editable: true
  },
  {
    id: 'risk-identification',
    title: 'Risk Identification Through Objectives',
    icon: AlertTriangle,
    content: `**Objective-Driven Risk Identification:**

**Step 1: Define Objectives**
Establish clear, measurable objectives at strategic, operational, reporting, and compliance levels across all business units and functions.

**Step 2: Identify Threats**
For each objective, identify what could prevent achievement:
• Internal factors (process failures, resource constraints, capability gaps)
• External factors (market changes, regulatory shifts, technology disruption)
• Known risks (historical losses, peer incidents, audit findings)
• Emerging risks (trends, leading indicators, scenario analysis)

**Step 3: Assess Impact**
Evaluate how each threat would affect objective achievement:
• Strategic impact - mission/vision compromise
• Financial impact - earnings, capital, liquidity
• Operational impact - service disruption, quality degradation
• Reputational impact - stakeholder confidence, brand damage

**Step 4: Determine Principal Risks**
Identify risks that pose the greatest threat to objectives based on inherent exposure, considering likelihood and impact across multiple dimensions.

**Risk Sources:**
• Strategic planning and review sessions
• Operational incident analysis and near-miss reporting
• Regulatory developments and compliance assessments
• Stakeholder feedback (customers, employees, regulators)
• Industry intelligence and peer analysis
• Internal audit findings and management self-assessment`,
    editable: true
  },
  {
    id: 'effective-control',
    title: 'What is an Effective Control',
    icon: Shield,
    content: `An effective control is one that:

**Design Effectiveness:**
• Addresses the specific risk it is intended to mitigate
• Operates at the right frequency relative to risk velocity
• Is proportionate to the risk severity and organizational context
• Has clear control objective and expected outcome
• Specifies who performs it and what evidence is retained

**Implementation Effectiveness:**
• Is consistently executed as designed
• Is performed by competent individuals with appropriate authority
• Produces reliable, timely evidence of execution
• Is supported by adequate documentation and training
• Functions reliably through normal business variations

**Operating Effectiveness:**
• Prevents or detects control failures within acceptable timeframes
• Operates throughout the assessment period, not just at period end
• Maintains effectiveness despite personnel changes or process updates
• Identifies exceptions and triggers remediation
• Generates data that informs continuous improvement

**Integration Effectiveness:**
• Aligns with other controls in a coherent control structure
• Avoids unnecessary duplication while ensuring no gaps
• Leverages technology where appropriate
• Is sustainable without excessive resource burden
• Supports, rather than hinders, business objectives`,
    editable: true
  },
  {
    id: 'control-criteria',
    title: 'Control Sufficiency Criteria',
    icon: Settings,
    content: `A sufficient control framework demonstrates:

**Coverage:**
• All principal risks have at least one material control
• High and critical risks have both preventive and detective controls
• Control gaps are identified, assessed, and remediated
• Third-party and outsourced activities are controlled

**Precision:**
• Controls directly address the specific risk event or condition
• Control precision matches risk velocity and impact
• Automated controls are preferred where feasible and cost-effective
• Manual controls have appropriate review and supervision

**Reliability:**
• Controls operate consistently throughout the period
• Control failures are exceptions, not norms
• Control owners have necessary competence and authority
• Evidence of execution is retained and reviewable

**Timeliness:**
• Preventive controls operate before risk events occur
• Detective controls identify issues promptly
• Exception escalation meets risk response timeframes
• Remediation is completed within acceptable windows

**Efficiency:**
• Controls achieve objectives without excessive cost or effort
• Technology enablement where appropriate
• Elimination of redundant or ineffective controls
• Balanced distribution across three lines of defence`,
    editable: true
  },
  {
    id: 'monitoring',
    title: 'Effective Control Monitoring',
    icon: Eye,
    content: `**Ongoing Monitoring (First Line):**
• Real-time dashboards showing control execution status
• Automated exception alerts for control failures or threshold breaches
• Management review of control metrics in business performance meetings
• Process owner walkthroughs and observations

**Periodic Testing (Second Line):**
• Risk-based control testing program covering all material controls
• Sample testing of manual controls using statistical methods
• Automated control validation through data analytics
• Control owner self-assessment and attestation

**Independent Assurance (Third Line):**
• Internal audit reviews using risk-based audit planning
• Deep-dive assessments of control design and operating effectiveness
• Follow-up on remediation of audit findings
• Coordination with external auditors

**Monitoring Outputs:**
• Control effectiveness dashboards with heat maps
• Exception reports requiring management attention
• Trend analysis identifying emerging weaknesses
• Recommendations for control optimization

**Escalation Triggers:**
• Critical control failures requiring immediate action
• Repeat deficiencies indicating systemic issues
• Aggregation of deficiencies affecting the same objective
• Changes in risk profile requiring control enhancement

**Continuous Improvement:**
• Lessons learned from control failures inform design improvements
• Benchmarking against industry practices
• Technology adoption to automate or enhance controls
• Simplification to remove unnecessary complexity`,
    editable: true
  }
];

export default function FrameworkBuilder() {
  const [sections, setSections] = useState<FrameworkSection[]>(defaultFrameworkSections);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [criteria, setCriteria] = useState<EffectivenessCriteria[]>([]);
  const [activeTab, setActiveTab] = useState('document');

  useEffect(() => {
    loadCriteria();
  }, []);

  const loadCriteria = async () => {
    try {
      const data = await apiService.getEffectivenessCriteria();
      setCriteria(data);
    } catch (error) {
      console.error('Failed to load criteria:', error);
    }
  };

  const handleEdit = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setEditContent(section.content);
      setEditingSection(sectionId);
    }
  };

  const handleSave = () => {
    if (editingSection) {
      setSections(sections.map(s => 
        s.id === editingSection ? { ...s, content: editContent } : s
      ));
      setEditingSection(null);
      setEditContent('');
    }
  };

  const handleExport = () => {
    const doc = `# INTERNAL CONTROL FRAMEWORK

**Organization:** [Your Organization Name]
**Effective Date:** ${new Date().toLocaleDateString()}
**Version:** 1.0

---

${sections.map(section => `
## ${section.title}

${section.content}

---
`).join('\n')}

## Board Summary

This Internal Control Framework provides the board with assurance that:

1. **Principal risks** that could prevent achievement of strategic objectives are identified, owned, and actively managed through a clear governance structure.

2. **Material controls** are defined for all principal risks with clear design, ownership, operating frequency, and evidence requirements.

3. **Monitoring processes** ensure controls operate as intended, with timely escalation of significant exceptions to management and the Audit Committee.

4. **Remediation processes** address identified deficiencies through time-bound action plans, with retesting and root cause analysis to prevent recurrence.

5. **Integration mechanisms** ensure the framework adapts to business changes and informs key decisions across strategy, operations, reporting, and compliance.

**Board Attestation:**
Based on quarterly reviews and annual assessment, the Board concludes that the internal control framework is operating effectively and provides reasonable assurance regarding achievement of organizational objectives.

---

**Effectiveness Criteria:**
${criteria.map(c => `
**${c.dimension}:** ${c.criteria}
`).join('\n')}

---

*This document is confidential and proprietary*
*Generated: ${new Date().toLocaleString()}*
`;

    const blob = new Blob([doc], { type: 'text/markdown' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `internal-control-framework-${new Date().toISOString().split('T')[0]}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('✅ Framework document exported successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Framework Builder</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive internal control framework - business-friendly and editable
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Framework
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="document">Framework Document</TabsTrigger>
          <TabsTrigger value="board-summary">Board Summary</TabsTrigger>
          <TabsTrigger value="criteria">Linked Criteria</TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="space-y-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Internal Control Framework
              </CardTitle>
              <CardDescription>
                A comprehensive, business-friendly framework covering purpose, governance, risk, controls, and monitoring.
                Click <Pencil className="h-3 w-3 inline" /> on any section to edit.
              </CardDescription>
            </CardHeader>
          </Card>

          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle>{section.title}</CardTitle>
                    </div>
                    {section.editable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(section.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {section.content.split('\n').map((line, idx) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <h3 key={idx} className="font-semibold text-base mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                      } else if (line.startsWith('•')) {
                        return <li key={idx} className="ml-4">{line.substring(1).trim()}</li>;
                      } else if (line.trim() === '') {
                        return <div key={idx} className="h-2" />;
                      } else {
                        return <p key={idx} className="text-muted-foreground mb-2">{line}</p>;
                      }
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="board-summary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Board Summary
              </CardTitle>
              <CardDescription>
                Executive summary for board review and attestation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-4">Internal Control Framework - Board Attestation</h3>
                
                <p className="text-muted-foreground mb-4">
                  Based on quarterly reviews and annual assessment, the Board has evaluated the design and operating 
                  effectiveness of the internal control framework and concludes that it provides reasonable assurance 
                  regarding achievement of organizational objectives.
                </p>

                <div className="grid gap-4">
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold mb-1">✓ Risk Coverage</h4>
                    <p className="text-sm text-muted-foreground">
                      Principal risks that could prevent achievement of strategic objectives are identified, owned, 
                      and actively managed through a clear governance structure.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold mb-1">✓ Control Definition</h4>
                    <p className="text-sm text-muted-foreground">
                      Material controls are defined for all principal risks with clear design, ownership, 
                      operating frequency, and evidence requirements across the three lines of defence.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold mb-1">✓ Monitoring & Escalation</h4>
                    <p className="text-sm text-muted-foreground">
                      Controls operate as intended with continuous monitoring and timely escalation of significant 
                      exceptions to management and the Audit Committee.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold mb-1">✓ Remediation & Testing</h4>
                    <p className="text-sm text-muted-foreground">
                      Identified deficiencies are remediated through time-bound action plans, with retesting 
                      and root cause analysis to prevent recurrence.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold mb-1">✓ Integration & Adaptation</h4>
                    <p className="text-sm text-muted-foreground">
                      The framework is embedded in key decisions and adapts through defined triggers to remain 
                      fit for purpose as business conditions change.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-2">Attestation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    The Board of Directors, through the Audit Committee, has reviewed the design and operating 
                    effectiveness of the internal control framework as of {new Date().toLocaleDateString()}.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Chair, Audit Committee</p>
                      <p className="text-muted-foreground">_______________________</p>
                    </div>
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">_______________________</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criteria">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Effectiveness Criteria Linkage
              </CardTitle>
              <CardDescription>
                Framework sections mapped to board-approved effectiveness criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteria.map((criterion) => (
                <div key={criterion.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{criterion.dimension}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{criterion.criteria}</p>
                    </div>
                    <Badge variant="success">Linked</Badge>
                  </div>
                  <div className="mt-3 text-sm">
                    <span className="font-medium">Framework Coverage: </span>
                    <span className="text-muted-foreground">
                      {criterion.dimension === 'Risk Coverage' && 'Purpose & Scope, Risk Identification'}
                      {criterion.dimension === 'Control Definition' && 'Building Blocks, Control Criteria'}
                      {criterion.dimension === 'Monitoring' && 'Effective Monitoring, Governance'}
                      {criterion.dimension === 'Remediation' && 'Effective Monitoring, Integration'}
                      {criterion.dimension === 'Integration' && 'Integration, Controls Serving Objectives'}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editingSection !== null} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit: {sections.find(s => s.id === editingSection)?.title}
            </DialogTitle>
            <DialogDescription>
              Update the content below. Use ** for bold headings and • for bullet points.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Enter framework content..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSection(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
