import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, ArrowLeft, CheckCircle, Sparkles, FileText, Download, Star } from 'lucide-react';
import { SEVEN_CRITERIA, STRATEGIC_PRIORITIES, type CompanyProfile, type ContextAnswers, type EffectivenessCriteriaConfig, type WeightingRecommendation } from '@/types/effectiveness';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function EffectivenessCriteriaV2Page() {
  const [currentView, setCurrentView] = useState<'landing' | 'pathway-select' | 'guided-questions' | 'custom-config' | 'recommendation' | 'display'>('landing');
  const [selectedPathway, setSelectedPathway] = useState<'guided' | 'custom' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<ContextAnswers>({});
  const [recommendation, setRecommendation] = useState<WeightingRecommendation | null>(null);
  const [customWeights, setCustomWeights] = useState<any>(null);
  const [savedConfig, setSavedConfig] = useState<EffectivenessCriteriaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBoardDoc, setShowBoardDoc] = useState(false);
  const [boardDocument, setBoardDocument] = useState('');

  useEffect(() => {
    loadExistingConfig();
  }, []);

  const loadExistingConfig = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/effectiveness-criteria-v2/config`);
      if (response.data) {
        setSavedConfig(response.data);
        setCurrentView('display');
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleStartGuided = () => {
    setSelectedPathway('guided');
    setCurrentView('guided-questions');
    setCurrentQuestion(1);
    setAnswers({});
  };

  const handleStartCustom = () => {
    setSelectedPathway('custom');
    setCurrentView('custom-config');
  };

  const handleNextQuestion = () => {
    if (currentQuestion < 7) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generateRecommendation();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const generateRecommendation = async () => {
    setIsLoading(true);
    try {
      const profile: CompanyProfile = {
        stage: answers.stage!,
        ownership: answers.ownership!,
        ownershipOther: answers.ownershipOther,
        regulatory: answers.regulatory!,
        priorities: answers.priorities || [],
        maturity: answers.maturity!,
        riskAppetite: answers.riskAppetite!,
        size: {
          revenue: answers.revenue!,
          employees: answers.employees!,
          geographic: answers.geographic!,
          complexity: answers.complexity!
        }
      };

      const response = await axios.post(`${API_BASE}/api/effectiveness-criteria-v2/generate-recommendation`, {
        profile
      });

      setRecommendation(response.data);
      setCurrentView('recommendation');
    } catch (error) {
      console.error('Error generating recommendation:', error);
      alert('Failed to generate recommendation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRecommendation = async () => {
    if (!recommendation) return;

    setIsLoading(true);
    try {
      const profile: CompanyProfile = {
        stage: answers.stage!,
        ownership: answers.ownership!,
        ownershipOther: answers.ownershipOther,
        regulatory: answers.regulatory!,
        priorities: answers.priorities || [],
        maturity: answers.maturity!,
        riskAppetite: answers.riskAppetite!,
        size: {
          revenue: answers.revenue!,
          employees: answers.employees!,
          geographic: answers.geographic!,
          complexity: answers.complexity!
        }
      };

      const response = await axios.post(`${API_BASE}/api/effectiveness-criteria-v2/save-config`, {
        companyProfile: profile,
        criteria: recommendation.criteriaConfigs,
        overallTarget: recommendation.overallTarget,
        pathway: 'guided'
      });

      setSavedConfig(response.data);
      setCurrentView('display');
      alert('✅ Effectiveness criteria saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBoardDoc = async () => {
    if (!savedConfig) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/effectiveness-criteria-v2/generate-board-document`, {
        configId: savedConfig.id
      });

      setBoardDocument(response.data.document);
      setShowBoardDoc(true);
    } catch (error) {
      console.error('Error generating board document:', error);
      alert('Failed to generate board document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLanding = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Define Effectiveness Criteria</CardTitle>
          <CardDescription>
            Before we identify risks and design controls, let's define what "EFFECTIVE" means for your company.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What You'll Define:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span><strong>7 Standard Criteria</strong> - Universal framework for all companies</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span><strong>Custom Weightings</strong> - Tailored to your company's context</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span><strong>Specific Targets</strong> - What "effective" means for you</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleStartGuided}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Guided (Recommended)</CardTitle>
                </div>
                <CardDescription>Answer 7 questions, AI recommends criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>⏱️ Time: 10 minutes</li>
                  <li>🎯 Expert guidance</li>
                  <li>✨ AI-powered recommendations</li>
                </ul>
                <Button className="w-full mt-4">
                  Start Guided Setup <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleStartCustom}>
              <CardHeader>
                <CardTitle className="text-lg">Custom (Advanced)</CardTitle>
                <CardDescription>Manually configure all criteria and weights</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>⏱️ Time: 30-45 minutes</li>
                  <li>🎛️ Full control</li>
                  <li>👨‍💼 For sophisticated users</li>
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  Start Custom Setup <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGuidedQuestions = () => {
    const totalQuestions = 7;
    const progress = (currentQuestion / totalQuestions) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion} of {totalQuestions}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>QUESTION {currentQuestion} of {totalQuestions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">What stage is your company at?</h3>
                  <RadioGroup value={answers.stage} onValueChange={(value: any) => setAnswers({...answers, stage: value})}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="early" id="early" />
                        <Label htmlFor="early" className="cursor-pointer flex-1">
                          <div className="font-medium">Early Stage / Startup</div>
                          <div className="text-sm text-muted-foreground">0-5 years old, establishing product-market fit, high growth (&gt;50%/year)</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="growth" id="growth" />
                        <Label htmlFor="growth" className="cursor-pointer flex-1">
                          <div className="font-medium">Growth Stage</div>
                          <div className="text-sm text-muted-foreground">5-15 years old, proven model, scaling (15-50% growth/year)</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="mature" id="mature" />
                        <Label htmlFor="mature" className="cursor-pointer flex-1">
                          <div className="font-medium">Mature / Established</div>
                          <div className="text-sm text-muted-foreground">15+ years old, market leader, stable (&lt;15% growth/year)</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="transformation" id="transformation" />
                        <Label htmlFor="transformation" className="cursor-pointer flex-1">
                          <div className="font-medium">Transformation / Turnaround</div>
                          <div className="text-sm text-muted-foreground">Undergoing major change (restructuring, pivot, recovery)</div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {currentQuestion === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">What is your ownership structure?</h3>
                  <RadioGroup value={answers.ownership} onValueChange={(value: any) => setAnswers({...answers, ownership: value})}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public" className="cursor-pointer flex-1">
                          <div className="font-medium">Public Company (Listed)</div>
                          <div className="text-sm text-muted-foreground">AIM, Premium Listed, or other exchange</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="pe" id="pe" />
                        <Label htmlFor="pe" className="cursor-pointer flex-1">
                          <div className="font-medium">Private Equity Owned</div>
                          <div className="text-sm text-muted-foreground">Financial sponsor ownership</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="vc" id="vc" />
                        <Label htmlFor="vc" className="cursor-pointer flex-1">
                          <div className="font-medium">Venture Capital Backed</div>
                          <div className="text-sm text-muted-foreground">VC funding, aiming for exit/IPO</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private" className="cursor-pointer flex-1">
                          <div className="font-medium">Family / Founder Owned</div>
                          <div className="text-sm text-muted-foreground">Private, no external investors</div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {currentQuestion === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">How would you describe your regulatory environment?</h3>
                  <RadioGroup value={answers.regulatory} onValueChange={(value: any) => setAnswers({...answers, regulatory: value})}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="heavy" id="heavy" />
                        <Label htmlFor="heavy" className="cursor-pointer flex-1">
                          <div className="font-medium">Heavily Regulated</div>
                          <div className="text-sm text-muted-foreground">Financial services, pharma, automotive safety, aviation, nuclear</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="moderate" id="moderate" />
                        <Label htmlFor="moderate" className="cursor-pointer flex-1">
                          <div className="font-medium">Moderately Regulated</div>
                          <div className="text-sm text-muted-foreground">Manufacturing, healthcare, food & beverage, construction</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light" className="cursor-pointer flex-1">
                          <div className="font-medium">Lightly Regulated</div>
                          <div className="text-sm text-muted-foreground">SaaS, professional services, consulting, e-commerce</div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {currentQuestion === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">What are your TOP 3 strategic priorities?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Select up to 3</p>
                  <div className="space-y-2">
                    {STRATEGIC_PRIORITIES.map((priority) => (
                      <div key={priority} className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted">
                        <Checkbox
                          id={priority}
                          checked={answers.priorities?.includes(priority)}
                          onCheckedChange={(checked) => {
                            const current = answers.priorities || [];
                            if (checked && current.length < 3) {
                              setAnswers({...answers, priorities: [...current, priority]});
                            } else if (!checked) {
                              setAnswers({...answers, priorities: current.filter(p => p !== priority)});
                            }
                          }}
                          disabled={!answers.priorities?.includes(priority) && (answers.priorities?.length || 0) >= 3}
                        />
                        <Label htmlFor={priority} className="cursor-pointer flex-1">{priority}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Selected: {answers.priorities?.length || 0} / 3
                  </div>
                </div>
              </div>
            )}

            {currentQuestion === 5 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">What is your current material controls maturity?</h3>
                  <RadioGroup value={answers.maturity?.toString()} onValueChange={(value: any) => setAnswers({...answers, maturity: parseInt(value)})}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="1" id="mat1" />
                        <Label htmlFor="mat1" className="cursor-pointer flex-1">
                          <div className="font-medium">Level 1 - No Framework</div>
                          <div className="text-sm text-muted-foreground">Starting from scratch, no formal risk/control framework exists</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="2" id="mat2" />
                        <Label htmlFor="mat2" className="cursor-pointer flex-1">
                          <div className="font-medium">Level 2 - Basic / Developing</div>
                          <div className="text-sm text-muted-foreground">Some controls exist but ad hoc or basic</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="3" id="mat3" />
                        <Label htmlFor="mat3" className="cursor-pointer flex-1">
                          <div className="font-medium">Level 3 - Defined / Systematic</div>
                          <div className="text-sm text-muted-foreground">Formal framework exists, consistently applied</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="4" id="mat4" />
                        <Label htmlFor="mat4" className="cursor-pointer flex-1">
                          <div className="font-medium">Level 4 - Advanced / Optimized</div>
                          <div className="text-sm text-muted-foreground">Mature, technology-enabled, continuously improving</div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {currentQuestion === 6 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">How would you describe your risk appetite?</h3>
                  <RadioGroup value={answers.riskAppetite} onValueChange={(value: any) => setAnswers({...answers, riskAppetite: value})}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="low" id="low" />
                        <Label htmlFor="low" className="cursor-pointer flex-1">
                          <div className="font-medium">Low Risk Appetite</div>
                          <div className="text-sm text-muted-foreground">Conservative, avoid risks, prioritize safety and compliance</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="moderate" id="moderate-risk" />
                        <Label htmlFor="moderate-risk" className="cursor-pointer flex-1">
                          <div className="font-medium">Moderate Risk Appetite</div>
                          <div className="text-sm text-muted-foreground">Balanced approach, managed risk-taking</div>
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="high" id="high" />
                        <Label htmlFor="high" className="cursor-pointer flex-1">
                          <div className="font-medium">High Risk Appetite</div>
                          <div className="text-sm text-muted-foreground">Aggressive growth, willing to take significant risks for returns</div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {currentQuestion === 7 && (
              <div className="space-y-4">
                <h3 className="font-semibold mb-3">What is your company size and complexity?</h3>
                
                <div>
                  <Label>Annual Revenue</Label>
                  <Select value={answers.revenue} onValueChange={(value) => setAnswers({...answers, revenue: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select revenue range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<£10M">&lt;£10M</SelectItem>
                      <SelectItem value="£10-50M">£10-50M</SelectItem>
                      <SelectItem value="£50-100M">£50-100M</SelectItem>
                      <SelectItem value="£100-500M">£100-500M</SelectItem>
                      <SelectItem value=">£500M">&gt;£500M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Number of Employees</Label>
                  <Select value={answers.employees} onValueChange={(value) => setAnswers({...answers, employees: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<50">&lt;50</SelectItem>
                      <SelectItem value="50-250">50-250</SelectItem>
                      <SelectItem value="250-1000">250-1000</SelectItem>
                      <SelectItem value="1000-5000">1000-5000</SelectItem>
                      <SelectItem value=">5000">&gt;5000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Geographic Complexity</Label>
                  <RadioGroup value={answers.geographic} onValueChange={(value: any) => setAnswers({...answers, geographic: value})}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single">Single country</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multi_regional" id="multi" />
                        <Label htmlFor="multi">Multi-country (same region)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="global" id="global" />
                        <Label htmlFor="global">Global (multiple regions)</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Business Complexity</Label>
                  <RadioGroup value={answers.complexity} onValueChange={(value: any) => setAnswers({...answers, complexity: value})}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="simple" id="simple" />
                        <Label htmlFor="simple">Single product/service</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderate" id="moderate-complex" />
                        <Label htmlFor="moderate-complex">Multiple products/services</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="complex" id="complex" />
                        <Label htmlFor="complex">Multiple business units/divisions</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={!isQuestionAnswered(currentQuestion)}
              >
                {currentQuestion === 7 ? (
                  isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Recommendation
                      <Sparkles className="h-4 w-4 ml-2" />
                    </>
                  )
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const isQuestionAnswered = (questionNum: number): boolean => {
    switch (questionNum) {
      case 1: return !!answers.stage;
      case 2: return !!answers.ownership;
      case 3: return !!answers.regulatory;
      case 4: return (answers.priorities?.length || 0) > 0;
      case 5: return !!answers.maturity;
      case 6: return !!answers.riskAppetite;
      case 7: return !!(answers.revenue && answers.employees && answers.geographic && answers.complexity);
      default: return false;
    }
  };

  const renderRecommendation = () => {
    if (!recommendation) return null;

    const criteriaArray = [
      { id: 'riskIdentification', ...SEVEN_CRITERIA[0] },
      { id: 'frameworkDesign', ...SEVEN_CRITERIA[1] },
      { id: 'controlOperating', ...SEVEN_CRITERIA[2] },
      { id: 'issueResponsiveness', ...SEVEN_CRITERIA[3] },
      { id: 'riskOutcome', ...SEVEN_CRITERIA[4] },
      { id: 'governance', ...SEVEN_CRITERIA[5] },
      { id: 'continuousImprovement', ...SEVEN_CRITERIA[6] }
    ];

    const highestWeight = Math.max(...Object.values(recommendation.weights));

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-2xl">Your Recommended Effectiveness Criteria</CardTitle>
            <CardDescription>
              Based on your profile: {answers.stage} stage, {answers.ownership} owned, {answers.regulatory} regulated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {criteriaArray.map((criterion) => {
              const config = recommendation.criteriaConfigs[criterion.id as keyof typeof recommendation.criteriaConfigs];
              const reasoning = recommendation.reasoning[criterion.id as keyof typeof recommendation.reasoning];
              const isHighest = config.weight === highestWeight;

              return (
                <Card key={criterion.id} className={isHighest ? 'border-2 border-yellow-500' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{criterion.name}</CardTitle>
                          <Badge variant={isHighest ? 'default' : 'secondary'} className="text-lg font-bold">
                            {config.weight}%
                          </Badge>
                          {isHighest && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground italic">{criterion.question}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Why this weight:</p>
                      <p className="text-sm text-muted-foreground">{reasoning}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Sub-Criteria for You:</p>
                      <div className="flex flex-wrap gap-2">
                        {config.subCriteria.map((sub, idx) => (
                          <Badge key={idx} variant="outline">{sub}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-medium">Target: </span>
                        <span className="text-muted-foreground">{config.target}%</span>
                      </div>
                      <div className="flex-1">
                        <Progress value={config.target} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card className="bg-primary/5 border-primary">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">OVERALL EFFECTIVENESS TARGET</p>
                  <p className="text-4xl font-bold">{recommendation.overallTarget}%</p>
                  <p className="text-sm text-muted-foreground">
                    Achieve {recommendation.overallTarget}/100 points = Framework EFFECTIVE
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setCurrentView('guided-questions')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Questions
              </Button>
              <Button className="flex-1" onClick={handleAcceptRecommendation} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept AI Recommendation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDisplay = () => {
    if (!savedConfig) return null;

    const criteria = savedConfig.criteriaConfig;
    const profile = savedConfig.companyProfile;

    const criteriaArray = [
      { id: 'riskIdentification', ...SEVEN_CRITERIA[0], config: criteria.riskIdentification },
      { id: 'frameworkDesign', ...SEVEN_CRITERIA[1], config: criteria.frameworkDesign },
      { id: 'controlOperating', ...SEVEN_CRITERIA[2], config: criteria.controlOperating },
      { id: 'issueResponsiveness', ...SEVEN_CRITERIA[3], config: criteria.issueResponsiveness },
      { id: 'riskOutcome', ...SEVEN_CRITERIA[4], config: criteria.riskOutcome },
      { id: 'governance', ...SEVEN_CRITERIA[5], config: criteria.governance },
      { id: 'continuousImprovement', ...SEVEN_CRITERIA[6], config: criteria.continuousImprovement }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Effectiveness Criteria</h1>
            <p className="text-muted-foreground mt-1">
              Board-approved effectiveness framework
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateBoardDoc} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Board Document
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setCurrentView('landing')}>
              Reconfigure
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Stage</p>
                <p className="text-muted-foreground capitalize">{profile.stage}</p>
              </div>
              <div>
                <p className="font-medium">Ownership</p>
                <p className="text-muted-foreground capitalize">{profile.ownership}</p>
              </div>
              <div>
                <p className="font-medium">Regulatory</p>
                <p className="text-muted-foreground capitalize">{profile.regulatory}</p>
              </div>
              <div>
                <p className="font-medium">Maturity</p>
                <p className="text-muted-foreground">Level {profile.maturity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>The 7 Effectiveness Criteria</CardTitle>
            <CardDescription>
              Weighted framework for assessing control effectiveness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {criteriaArray.map((criterion) => (
              <Card key={criterion.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{criterion.name}</CardTitle>
                      <p className="text-sm text-muted-foreground italic">{criterion.question}</p>
                    </div>
                    <Badge className="text-lg font-bold">{criterion.config.weight}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Sub-Criteria:</p>
                    <div className="flex flex-wrap gap-2">
                      {criterion.config.subCriteria.map((sub: string, idx: number) => (
                        <Badge key={idx} variant="outline">{sub}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-medium">Target: </span>
                      <span className="text-muted-foreground">{criterion.config.target}%</span>
                    </div>
                    <div className="flex-1">
                      <Progress value={criterion.config.target} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary">
          <CardHeader>
            <CardTitle>Overall Effectiveness Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-5xl font-bold">{savedConfig.overallTarget}%</p>
              <p className="text-muted-foreground">
                Framework is considered EFFECTIVE when achieving {savedConfig.overallTarget}/100 points
              </p>
              {savedConfig.boardApproved && (
                <Badge variant="success" className="mt-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Board Approved
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basis of Declaration</CardTitle>
            <CardDescription>
              Supporting documentation for board statement on effectiveness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Criteria Selection Rationale
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Board Monitoring & Review Process
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Evidence Supporting Conclusion
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Criteria Gap Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showBoardDoc} onOpenChange={setShowBoardDoc}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Board Approval Document</DialogTitle>
              <DialogDescription>
                Generated board paper for effectiveness criteria approval
              </DialogDescription>
            </DialogHeader>
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: boardDocument.replace(/\n/g, '<br/>') }} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBoardDoc(false)}>Close</Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="p-6">
      {currentView === 'landing' && renderLanding()}
      {currentView === 'guided-questions' && renderGuidedQuestions()}
      {currentView === 'recommendation' && renderRecommendation()}
      {currentView === 'display' && renderDisplay()}
    </div>
  );
}
