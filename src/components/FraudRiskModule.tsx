import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { fraudRiskFlows } from '@/data/riskIdentificationFlows';
import type { FraudRisk, FraudCategory } from '@/types';
import { ShieldAlert, ChevronRight, ChevronLeft, Sparkles, AlertTriangle, Lock } from 'lucide-react';

interface FraudRiskModuleProps {
  onRisksIdentified: (risks: FraudRisk[]) => void;
}

export default function FraudRiskModule({ onRisksIdentified }: FraudRiskModuleProps) {
  const [currentCategory, setCurrentCategory] = useState<FraudCategory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [identifiedRisks, setIdentifiedRisks] = useState<FraudRisk[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [completedCategories, setCompletedCategories] = useState<Set<FraudCategory>>(new Set());
  const [categoryAnswers, setCategoryAnswers] = useState<Record<FraudCategory, Record<string, string | string[] | number>>>({});

  useEffect(() => {
    const savedRisks = localStorage.getItem('fraudRisks');
    const savedCompletedCategories = localStorage.getItem('fraudCompletedCategories');
    const savedCategoryAnswers = localStorage.getItem('fraudCategoryAnswers');
    
    if (savedRisks) {
      try {
        const risks = JSON.parse(savedRisks);
        setIdentifiedRisks(risks);
      } catch (e) {
        console.error('Failed to parse saved fraud risks:', e);
      }
    }
    
    if (savedCompletedCategories) {
      try {
        const categories = JSON.parse(savedCompletedCategories);
        setCompletedCategories(new Set(categories));
      } catch (e) {
        console.error('Failed to parse saved completed categories:', e);
      }
    }
    
    if (savedCategoryAnswers) {
      try {
        const answers = JSON.parse(savedCategoryAnswers);
        setCategoryAnswers(answers);
      } catch (e) {
        console.error('Failed to parse saved category answers:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fraudRisks', JSON.stringify(identifiedRisks));
  }, [identifiedRisks]);

  useEffect(() => {
    localStorage.setItem('fraudCompletedCategories', JSON.stringify(Array.from(completedCategories)));
  }, [completedCategories]);

  useEffect(() => {
    localStorage.setItem('fraudCategoryAnswers', JSON.stringify(categoryAnswers));
  }, [categoryAnswers]);

  const categories: { value: FraudCategory; label: string; description: string }[] = [
    { value: 'asset_misappropriation', label: 'Asset Misappropriation', description: 'Theft of cash, inventory, or other assets' },
    { value: 'financial_reporting_fraud', label: 'Financial Reporting Fraud', description: 'Intentional misstatement of financial results' },
    { value: 'procurement_fraud', label: 'Procurement Fraud', description: 'Vendor schemes, kickbacks, bid rigging' },
    { value: 'payroll_fraud', label: 'Payroll Fraud', description: 'Ghost employees, timesheet manipulation' },
    { value: 'cyber_enabled_fraud', label: 'Cyber-Enabled Fraud', description: 'BEC, payment diversion, phishing' },
    { value: 'bribery_corruption', label: 'Bribery & Corruption', description: 'Improper payments, conflicts of interest' },
  ];

  const handleCategorySelect = (category: FraudCategory) => {
    setCurrentCategory(category);
    setCurrentQuestionIndex(0);
    const savedAnswers = categoryAnswers[category] || {};
    setAnswers(savedAnswers);
  };

  const getCurrentFlow = () => {
    if (!currentCategory) return null;
    return fraudRiskFlows.find(f => f.category === currentCategory);
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
      setCurrentCategory(null);
    }
  };

  const evaluateRisks = () => {
    const flow = getCurrentFlow();
    if (!flow) return;

    const newRisks: FraudRisk[] = [];

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
          id: `fraud-${currentCategory}-${Date.now()}-${Math.random()}`,
          category: currentCategory!,
          riskTitle: logic.riskTitle,
          riskDescription: logic.riskDescription,
          fraudScheme: logic.fraudScheme,
          perpetratorProfile: ['Internal employees', 'Management'],
          redFlags: logic.redFlags,
          likelihoodScore: logic.likelihoodScore,
          impactScore: logic.impactScore,
          inherentRiskScore: logic.likelihoodScore * logic.impactScore,
          controlEnvironment: 'adequate',
          identifiedControls: logic.suggestedControls,
          confidential: true,
          aiSuggested: true,
          createdAt: new Date().toISOString(),
        });
      }
    });

    setIdentifiedRisks(prev => [...prev, ...newRisks]);
    
    if (currentCategory) {
      setCompletedCategories(prev => new Set([...prev, currentCategory]));
      setCategoryAnswers(prev => ({ ...prev, [currentCategory]: answers }));
    }
    
    setCurrentCategory(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleComplete = () => {
    setIsComplete(true);
    onRisksIdentified(identifiedRisks);
    localStorage.removeItem('fraudRisks');
    localStorage.removeItem('fraudCompletedCategories');
    localStorage.removeItem('fraudCategoryAnswers');
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
            <ShieldAlert className="h-5 w-5" />
            Fraud Risk Assessment - Complete
          </CardTitle>
          <CardDescription>
            {identifiedRisks.length} fraud risks identified (Confidential)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <Lock className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800">
              This fraud risk assessment is confidential. Access is restricted to authorized personnel only.
            </p>
          </div>
          <div className="space-y-4">
            {identifiedRisks.map(risk => (
              <div key={risk.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskColor(risk.inherentRiskScore)}>
                      Risk Score: {risk.inherentRiskScore}/25
                    </Badge>
                    <Badge variant="outline">{risk.category.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <h4 className="font-semibold mb-2">{risk.riskTitle}</h4>
                <p className="text-sm text-muted-foreground mb-3">{risk.riskDescription}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Fraud Scheme:</span>
                    <p className="text-muted-foreground">{risk.fraudScheme}</p>
                  </div>
                  <div>
                    <span className="font-medium">Red Flags:</span>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {risk.redFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
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
            Assess More Categories
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentCategory) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">Confidential Assessment</h4>
                <p className="text-sm text-amber-800">
                  This fraud risk assessment is confidential. Information collected will be stored securely and accessible only to authorized personnel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Fraud Risk Assessment
            </CardTitle>
            <CardDescription>
              Select fraud categories to assess organizational vulnerabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(category => {
                const isCompleted = completedCategories.has(category.value);
                return (
                  <Card
                    key={category.value}
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      isCompleted ? 'border-green-500 bg-green-50' : ''
                    }`}
                    onClick={() => handleCategorySelect(category.value)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{category.label}</CardTitle>
                          <CardDescription className="text-sm">{category.description}</CardDescription>
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
                      <Badge variant="outline" className="text-xs">{risk.category.replace('_', ' ')}</Badge>
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
              <ShieldAlert className="h-5 w-5" />
              {categories.find(c => c.value === currentCategory)?.label}
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
        {currentQuestion.confidentialityNote && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
            <Lock className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800">{currentQuestion.confidentialityNote}</p>
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
            disabled={answers[currentQuestion.id] === undefined || answers[currentQuestion.id] === null || (typeof answers[currentQuestion.id] === 'string' && answers[currentQuestion.id] === '')}
          >
            {currentQuestionIndex < visibleQuestions.length - 1 ? 'Next' : 'Complete Category'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
