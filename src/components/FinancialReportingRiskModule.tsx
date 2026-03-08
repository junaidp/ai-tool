import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { financialReportingFlows } from '@/data/riskIdentificationFlows';
import type { FinancialReportingRisk, FinancialReportingArea } from '@/types';
import { FileText, ChevronRight, ChevronLeft, Sparkles, AlertCircle } from 'lucide-react';

interface FinancialReportingRiskModuleProps {
  onRisksIdentified: (risks: FinancialReportingRisk[]) => void;
}

export default function FinancialReportingRiskModule({ onRisksIdentified }: FinancialReportingRiskModuleProps) {
  const [currentArea, setCurrentArea] = useState<FinancialReportingArea | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [identifiedRisks, setIdentifiedRisks] = useState<FinancialReportingRisk[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const areas: { value: FinancialReportingArea; label: string; description: string }[] = [
    { value: 'revenue_recognition', label: 'Revenue Recognition', description: 'Sales, deferred revenue, contract accounting' },
    { value: 'inventory', label: 'Inventory', description: 'Valuation, existence, obsolescence' },
    { value: 'fixed_assets', label: 'Fixed Assets', description: 'Capitalization, depreciation, impairment' },
    { value: 'payroll', label: 'Payroll', description: 'Compensation, benefits, accruals' },
    { value: 'treasury', label: 'Treasury', description: 'Cash, investments, debt' },
    { value: 'financial_close', label: 'Financial Close', description: 'Period-end processes, reconciliations' },
  ];

  const handleAreaSelect = (area: FinancialReportingArea) => {
    setCurrentArea(area);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const getCurrentFlow = () => {
    if (!currentArea) return null;
    return financialReportingFlows.find(f => f.area === currentArea);
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

  const handleAnswer = (questionId: string, answer: string | string[]) => {
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
      setCurrentArea(null);
    }
  };

  const evaluateRisks = () => {
    const flow = getCurrentFlow();
    if (!flow) return;

    const newRisks: FinancialReportingRisk[] = [];

    flow.riskLogic.forEach(logic => {
      const conditionsMet = logic.conditions.every(cond => {
        const answer = answers[cond.questionId];
        if (Array.isArray(cond.answer)) {
          return cond.answer.includes(answer as string);
        }
        return answer === cond.answer;
      });

      if (conditionsMet) {
        newRisks.push({
          id: `fr-${currentArea}-${Date.now()}-${Math.random()}`,
          area: currentArea!,
          riskTitle: logic.riskTitle,
          riskDescription: logic.riskDescription,
          accountsAffected: [],
          materialityLevel: logic.materialityLevel,
          complexity: 'medium',
          volume: 'medium',
          judgmentRequired: 'medium',
          regulatoryRequirements: [],
          identifiedControls: logic.suggestedControls,
          aiSuggested: true,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // Add new risks to the list
    setIdentifiedRisks(prev => [...prev, ...newRisks]);
    
    // Reset to area selection to allow assessing more areas
    setCurrentArea(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleComplete = () => {
    setIsComplete(true);
    onRisksIdentified(identifiedRisks);
  };

  if (isComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Financial Reporting Risks - Assessment Complete
          </CardTitle>
          <CardDescription>
            {identifiedRisks.length} financial reporting risks identified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {identifiedRisks.map(risk => (
              <div key={risk.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={risk.materialityLevel === 'high' ? 'destructive' : 'secondary'}>
                        {risk.materialityLevel} materiality
                      </Badge>
                      <Badge variant="outline">{risk.area.replace('_', ' ')}</Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{risk.riskTitle}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{risk.riskDescription}</p>
                    <div className="text-sm">
                      <span className="font-medium">Suggested Controls:</span>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground">
                        {risk.identifiedControls.map((control, idx) => (
                          <li key={idx}>{control}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={() => setIsComplete(false)} variant="outline" className="mt-4">
            Assess More Areas
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentArea) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Financial Reporting Risk Assessment
            </CardTitle>
            <CardDescription>
              Select financial reporting areas to assess for material risks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {areas.map(area => (
                <Card
                  key={area.value}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleAreaSelect(area.value)}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{area.label}</CardTitle>
                    <CardDescription className="text-sm">{area.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
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
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">{risk.riskTitle}</span>
                      <Badge variant="outline" className="text-xs">{risk.area.replace('_', ' ')}</Badge>
                    </div>
                    <Badge variant={risk.materialityLevel === 'high' ? 'destructive' : 'secondary'}>
                      {risk.materialityLevel}
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
              <FileText className="h-5 w-5" />
              {areas.find(a => a.value === currentArea)?.label}
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
            {currentQuestionIndex < visibleQuestions.length - 1 ? 'Next' : 'Complete Area'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
