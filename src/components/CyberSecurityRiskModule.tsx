import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cyberSecurityFlows } from '@/data/riskIdentificationFlows';
import type { CyberSecurityRisk, CyberSecurityDomain } from '@/types';
import { Lock, ChevronRight, ChevronLeft, Sparkles, AlertTriangle, Shield, Trash2 } from 'lucide-react';

interface CyberSecurityRiskModuleProps {
  onRisksIdentified: (risks: CyberSecurityRisk[]) => void;
}

export default function CyberSecurityRiskModule({ onRisksIdentified }: CyberSecurityRiskModuleProps) {
  const [currentDomain, setCurrentDomain] = useState<CyberSecurityDomain | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [identifiedRisks, setIdentifiedRisks] = useState<CyberSecurityRisk[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [completedDomains, setCompletedDomains] = useState<Set<CyberSecurityDomain>>(new Set());
  const [domainAnswers, setDomainAnswers] = useState<Record<CyberSecurityDomain, Record<string, string | string[] | number>>>({});

  useEffect(() => {
    const savedRisks = localStorage.getItem('cyberSecurityRisks');
    const savedCompletedDomains = localStorage.getItem('cyberCompletedDomains');
    const savedDomainAnswers = localStorage.getItem('cyberDomainAnswers');
    const savedIsComplete = localStorage.getItem('cyberIsComplete');
    
    if (savedRisks) {
      try {
        const risks = JSON.parse(savedRisks);
        setIdentifiedRisks(risks);
      } catch (e) {
        console.error('Failed to parse saved cyber risks:', e);
      }
    }
    
    if (savedCompletedDomains) {
      try {
        const domains = JSON.parse(savedCompletedDomains);
        setCompletedDomains(new Set(domains));
      } catch (e) {
        console.error('Failed to parse saved completed domains:', e);
      }
    }
    
    if (savedDomainAnswers) {
      try {
        const answers = JSON.parse(savedDomainAnswers);
        setDomainAnswers(answers);
      } catch (e) {
        console.error('Failed to parse saved domain answers:', e);
      }
    }
    
    if (savedIsComplete) {
      try {
        const isComplete = JSON.parse(savedIsComplete);
        setIsComplete(isComplete);
      } catch (e) {
        console.error('Failed to parse saved isComplete:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cyberSecurityRisks', JSON.stringify(identifiedRisks));
  }, [identifiedRisks]);

  useEffect(() => {
    localStorage.setItem('cyberCompletedDomains', JSON.stringify(Array.from(completedDomains)));
  }, [completedDomains]);

  useEffect(() => {
    localStorage.setItem('cyberDomainAnswers', JSON.stringify(domainAnswers));
  }, [domainAnswers]);

  useEffect(() => {
    localStorage.setItem('cyberIsComplete', JSON.stringify(isComplete));
  }, [isComplete]);

  const domains: { value: CyberSecurityDomain; label: string; description: string }[] = [
    { value: 'ransomware', label: 'Ransomware Protection', description: 'Backup, recovery, endpoint security' },
    { value: 'phishing_social_engineering', label: 'Phishing & Social Engineering', description: 'Email security, user awareness' },
    { value: 'identity_access_management', label: 'Identity & Access Management', description: 'MFA, access controls, privileged accounts' },
    { value: 'data_protection', label: 'Data Protection', description: 'Encryption, DLP, data classification' },
    { value: 'third_party_vendor', label: 'Third-Party & Vendor Risk', description: 'Vendor assessments, supply chain security' },
    { value: 'ot_security', label: 'OT Security', description: 'Industrial controls, SCADA, IoT devices' },
    { value: 'cloud_security', label: 'Cloud Security', description: 'Cloud configuration, SaaS security' },
  ];

  const handleDomainSelect = (domain: CyberSecurityDomain) => {
    setCurrentDomain(domain);
    setCurrentQuestionIndex(0);
    // Only load saved answers if the domain is already completed
    const savedAnswers = completedDomains.has(domain) ? (domainAnswers[domain] || {}) : {};
    setAnswers(savedAnswers);
  };

  const getCurrentFlow = () => {
    if (!currentDomain) return null;
    return cyberSecurityFlows.find(f => f.domain === currentDomain);
  };

  const getVisibleQuestions = () => {
    const flow = getCurrentFlow();
    if (!flow) return [];
    
    return flow.questions.filter(q => {
      if (!q.conditionalOn) return true;
      const condAnswer = answers[q.conditionalOn.questionId];
      if (Array.isArray(q.conditionalOn.answer)) {
        return q.conditionalOn.answer.includes(condAnswer as string);
      }
      return condAnswer === q.conditionalOn.answer;
    });
  };

  const handleAnswer = (questionId: string, answer: string | string[] | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    const visibleQuestions = getVisibleQuestions();
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      evaluateRisks();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setCurrentDomain(null);
    }
  };

  const evaluateRisks = () => {
    const flow = getCurrentFlow();
    if (!flow) return;

    const newRisks: CyberSecurityRisk[] = [];

    flow.riskLogic.forEach(logic => {
      const conditionsMet = logic.conditions.every(cond => {
        const answer = answers[cond.questionId];
        if (Array.isArray(cond.answer)) {
          return cond.answer.includes(answer as string);
        }
        if (typeof cond.answer === 'number') {
          return answer === cond.answer;
        }
        return answer === cond.answer;
      });

      if (conditionsMet) {
        newRisks.push({
          id: `cyber-${currentDomain}-${Date.now()}-${Math.random()}`,
          domain: currentDomain!,
          riskTitle: logic.riskTitle,
          riskDescription: logic.riskDescription,
          threatVector: logic.threatVector,
          assetsCritical: [],
          regulatoryRequirements: logic.regulatoryRequirements,
          likelihoodScore: logic.likelihoodScore,
          impactScore: logic.impactScore,
          inherentRiskScore: logic.likelihoodScore * logic.impactScore,
          currentMaturity: 'developing',
          identifiedControls: logic.suggestedControls,
          aiSuggested: true,
          createdAt: new Date().toISOString(),
        });
      }
    });

    setIdentifiedRisks(prev => [...prev, ...newRisks]);
    
    if (currentDomain) {
      setCompletedDomains(prev => new Set([...prev, currentDomain]));
      setDomainAnswers(prev => ({ ...prev, [currentDomain]: answers }));
    }
    
    setCurrentDomain(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleComplete = () => {
    setIsComplete(true);
    onRisksIdentified(identifiedRisks);
     // Keep localStorage data so risks persist when returning to this page
  };

  const handleDeleteRisk = (riskId: string) => {
    if (confirm('Are you sure you want to delete this risk?')) {
      setIdentifiedRisks(prev => prev.filter(r => r.id !== riskId));
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 15) return 'destructive';
    if (score >= 9) return 'default';
    return 'secondary';
  };

  if (isComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Cyber Security Risk Assessment - Complete
          </CardTitle>
          <CardDescription>
            {identifiedRisks.length} cyber security risks identified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {identifiedRisks.map(risk => (
              <div key={risk.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskColor(risk.inherentRiskScore)}>
                      Risk Score: {risk.inherentRiskScore}/25
                    </Badge>
                    <Badge variant="outline">{risk.domain.replace('_', ' ')}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRisk(risk.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <h4 className="font-semibold mb-2">{risk.riskTitle}</h4>
                <p className="text-sm text-muted-foreground mb-3">{risk.riskDescription}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Threat Vectors:</span>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {risk.threatVector.map((vector, idx) => (
                        <li key={idx}>{vector}</li>
                      ))}
                    </ul>
                  </div>
                  {risk.regulatoryRequirements.length > 0 && (
                    <div>
                      <span className="font-medium">Regulatory Requirements:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {risk.regulatoryRequirements.map((req, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{req}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Suggested Controls:</span>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {risk.identifiedControls.map((control, idx) => (
                        <li key={idx}>{control}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={() => setIsComplete(false)} variant="outline" className="mt-4">
            Assess More Domains
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentDomain) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Cyber Security Risk Assessment
            </CardTitle>
            <CardDescription>
              Select cyber security domains to assess organizational vulnerabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {domains.map(domain => {
                const isCompleted = completedDomains.has(domain.value);
                return (
                  <Card
                    key={domain.value}
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      isCompleted ? 'border-green-500 bg-green-50' : ''
                    }`}
                    onClick={() => handleDomainSelect(domain.value)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {domain.label}
                          </CardTitle>
                          <CardDescription className="text-sm">{domain.description}</CardDescription>
                        </div>
                        {isCompleted && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                            Assessed
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {identifiedRisks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Identified Risks ({identifiedRisks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {identifiedRisks.map(risk => (
                  <div key={risk.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium">{risk.riskTitle}</span>
                      <Badge variant="outline" className="text-xs">{risk.domain.replace('_', ' ')}</Badge>
                    </div>
                    <Badge variant={getRiskColor(risk.inherentRiskScore)}>
                      {risk.inherentRiskScore}/25
                    </Badge>
                  </div>
                ))}
              </div>
              <Button onClick={handleComplete} className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Complete Assessment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentQuestionIndex];

  if (!currentQuestion) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {domains.find(d => d.value === currentDomain)?.label}
            </CardTitle>
            <CardDescription>
              Question {currentQuestionIndex + 1} of {visibleQuestions.length}
            </CardDescription>
          </div>
          <Badge variant="outline">
            {Math.round(((currentQuestionIndex + 1) / visibleQuestions.length) * 100)}% Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentQuestion.technicalNote && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-800">{currentQuestion.technicalNote}</p>
          </div>
        )}

        <div>
          <Label className="text-base font-medium mb-4 block">{currentQuestion.text}</Label>
          
          {currentQuestion.type === 'yes_no' && (
            <RadioGroup
              value={answers[currentQuestion.id] as string}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            >
              <div className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer">
                <RadioGroupItem value="yes" id={`${currentQuestion.id}-yes`} />
                <Label htmlFor={`${currentQuestion.id}-yes`} className="cursor-pointer flex-1">Yes</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer">
                <RadioGroupItem value="no" id={`${currentQuestion.id}-no`} />
                <Label htmlFor={`${currentQuestion.id}-no`} className="cursor-pointer flex-1">No</Label>
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <RadioGroup
              value={answers[currentQuestion.id] as string}
              onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
            >
              {currentQuestion.options.map(option => (
                <div key={option} className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer">
                  <RadioGroupItem value={option} id={`${currentQuestion.id}-${option}`} />
                  <Label htmlFor={`${currentQuestion.id}-${option}`} className="cursor-pointer flex-1">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'text' && (
            <Textarea
              value={answers[currentQuestion.id] as string || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              placeholder="Enter your answer..."
              rows={4}
            />
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
          >
            {currentQuestionIndex < visibleQuestions.length - 1 ? 'Next' : 'Complete Domain'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
