import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Info } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

// Types
interface DataField {
  type: 'ratio' | 'boolean' | 'count';
  label: string;
  value1?: number | null;
  value2?: number | null;
  boolValue?: boolean | null;
  countValue?: number | null;
  thresholds: {
    effective: number;
    partial: number;
  };
  inverted?: boolean;
}

interface CriterionData {
  id: string;
  name: string;
  capabilityLevel: number;
  dataFields: DataField[];
  boardReview?: {
    override?: number | null;
    commentary: string;
  };
}

interface EffectivenessState {
  yearMode: 1 | 2;
  criteria: CriterionData[];
}

// Constants
const CRITERIA_NAMES = [
  'Design',
  'Implementation', 
  'Operation',
  'Decision-Use',
  'Assurance',
  'Outcomes'
];

const MATURITY_DESCRIPTORS = [
  'Initial',
  'Developing',
  'Defined',
  'Managed',
  'Optimized'
];

// Auto-rating logic
function rateDataField(field: DataField): number | null {
  if (field.type === 'ratio') {
    if (field.value1 === null || field.value1 === undefined || 
        field.value2 === null || field.value2 === undefined || field.value2 === 0) {
      return null;
    }
    const percentage = (field.value1 / field.value2) * 100;
    if (percentage >= field.thresholds.effective) return 1.0;
    if (percentage >= field.thresholds.partial) return 0.5;
    return 0.0;
  } else if (field.type === 'boolean') {
    if (field.boolValue === null || field.boolValue === undefined) return null;
    return field.boolValue ? 1.0 : 0.0;
  } else if (field.type === 'count') {
    if (field.countValue === null || field.countValue === undefined) return null;
    const value = field.countValue;
    if (field.inverted) {
      if (value <= field.thresholds.effective) return 1.0;
      if (value <= field.thresholds.partial) return 0.5;
      return 0.0;
    } else {
      if (value >= field.thresholds.effective) return 1.0;
      if (value >= field.thresholds.partial) return 0.5;
      return 0.0;
    }
  }
  return null;
}

function computeConfirmedMaturity(
  capabilityLevel: number,
  scores: (number | null)[],
  yearMode: 1 | 2
): number | null {
  // Check if any score is null
  if (scores.some(s => s === null)) {
    return null;
  }

  const validScores = scores.filter(s => s !== null) as number[];
  const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;

  let confirmed: number;
  if (avg === 1.0) {
    confirmed = capabilityLevel + 1;
  } else if (avg >= 0.67) {
    confirmed = capabilityLevel;
  } else if (avg >= 0.34) {
    confirmed = capabilityLevel - 1;
  } else {
    confirmed = capabilityLevel - 2;
  }

  // Floor and ceiling
  confirmed = Math.max(1, Math.min(5, confirmed));

  // Year 1 cap
  if (yearMode === 1) {
    confirmed = Math.min(3, confirmed);
  }

  return confirmed;
}

export default function EffectivenessAssessment() {
  const [state, setState] = useState<EffectivenessState>({
    yearMode: 1,
    criteria: CRITERIA_NAMES.map((name, idx) => ({
      id: `C${idx + 1}`,
      name,
      capabilityLevel: 2, // Default from onboarding
      dataFields: [
        {
          type: 'ratio',
          label: 'Controls tested vs total',
          value1: null,
          value2: null,
          thresholds: { effective: 90, partial: 70 }
        },
        {
          type: 'boolean',
          label: 'Documentation complete',
          boolValue: null,
          thresholds: { effective: 100, partial: 50 }
        },
        {
          type: 'count',
          label: 'Exceptions identified',
          countValue: null,
          thresholds: { effective: 2, partial: 5 },
          inverted: true
        }
      ],
      boardReview: {
        override: null,
        commentary: ''
      }
    }))
  });

  // Calculate metrics
  const avgCapability = state.criteria.reduce((sum, c) => sum + c.capabilityLevel, 0) / 6;
  
  const confirmedCriteria = state.criteria.filter(c => {
    return c.dataFields.every(f => {
      if (f.type === 'ratio') return f.value1 !== null && f.value2 !== null;
      if (f.type === 'boolean') return f.boolValue !== null;
      if (f.type === 'count') return f.countValue !== null;
      return false;
    });
  });

  const confirmedCount = confirmedCriteria.length;
  
  const confirmedMaturityValues = confirmedCriteria.map(c => {
    const scores = c.dataFields.map(f => rateDataField(f));
    const override = c.boardReview?.override;
    if (override !== null && override !== undefined) {
      return override;
    }
    return computeConfirmedMaturity(c.capabilityLevel, scores, state.yearMode);
  }).filter(v => v !== null) as number[];

  const avgConfirmed = confirmedMaturityValues.length > 0
    ? confirmedMaturityValues.reduce((a, b) => a + b, 0) / confirmedMaturityValues.length
    : null;

  const statementReadyCount = confirmedCriteria.filter(c => {
    const scores = c.dataFields.map(f => rateDataField(f));
    const override = c.boardReview?.override;
    const confirmed = override !== null && override !== undefined
      ? override
      : computeConfirmedMaturity(c.capabilityLevel, scores, state.yearMode);
    return confirmed !== null && confirmed >= 3;
  }).length;

  const statementReadiness = confirmedCount === 6
    ? Math.round((statementReadyCount / 6) * 100)
    : null;

  // Radar chart data
  const radarData = state.criteria.map((c, idx) => {
    const scores = c.dataFields.map(f => rateDataField(f));
    const override = c.boardReview?.override;
    let confirmed = override !== null && override !== undefined
      ? override
      : computeConfirmedMaturity(c.capabilityLevel, scores, state.yearMode);
    
    // Fallback to capability if not confirmed
    if (confirmed === null) {
      confirmed = c.capabilityLevel;
    }

    return {
      criterion: c.id,
      capability: c.capabilityLevel,
      confirmed: confirmed
    };
  });

  const updateCriterion = (criterionId: string, updates: Partial<CriterionData>) => {
    setState(prev => ({
      ...prev,
      criteria: prev.criteria.map(c =>
        c.id === criterionId ? { ...c, ...updates } : c
      )
    }));
  };

  const updateDataField = (criterionId: string, fieldIdx: number, updates: Partial<DataField>) => {
    setState(prev => ({
      ...prev,
      criteria: prev.criteria.map(c =>
        c.id === criterionId
          ? {
              ...c,
              dataFields: c.dataFields.map((f, idx) =>
                idx === fieldIdx ? { ...f, ...updates } : f
              )
            }
          : c
      )
    }));
  };

  return (
    <div className="space-y-6">
      {/* Year Mode Toggle */}
      <div className="flex items-center gap-4">
        <Label>Assessment Year:</Label>
        <div className="flex gap-2">
          <Button
            variant={state.yearMode === 1 ? 'default' : 'outline'}
            onClick={() => setState(prev => ({ ...prev, yearMode: 1 }))}
          >
            Year 1
          </Button>
          <Button
            variant={state.yearMode === 2 ? 'default' : 'outline'}
            onClick={() => setState(prev => ({ ...prev, yearMode: 2 }))}
          >
            Year 2+
          </Button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{avgCapability.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Average capability</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {avgConfirmed !== null ? avgConfirmed.toFixed(1) : '—'}
              </div>
              <div className="text-sm text-muted-foreground">Average confirmed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{confirmedCount} / 6</div>
              <div className="text-sm text-muted-foreground">Criteria confirmed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className={`text-2xl font-bold ${
                statementReadiness === null ? 'text-gray-400' :
                statementReadiness === 100 ? 'text-green-600' :
                statementReadiness >= 67 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {statementReadiness !== null ? `${statementReadiness}%` : '—'}
              </div>
              <div className="text-sm text-muted-foreground">Statement readiness</div>
            </CardContent>
          </Card>
        </div>

        {/* Statement Readiness Bar */}
        <div className="space-y-2">
          <Progress 
            value={confirmedCount === 6 ? statementReadiness || 0 : (confirmedCount / 6) * 100} 
            className={`h-2 ${
              confirmedCount === 6 
                ? statementReadiness === 100 ? 'bg-green-600' :
                  statementReadiness && statementReadiness >= 67 ? 'bg-amber-600' : 'bg-red-600'
                : ''
            }`}
          />
          <div className="text-sm text-muted-foreground text-right">
            {confirmedCount < 6 
              ? `Complete ${6 - confirmedCount} remaining assessments to unlock`
              : `${statementReadyCount} of 6 criteria confirmed at level ≥ 3`
            }
          </div>
        </div>

        {/* Year 1 Banner */}
        {state.yearMode === 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-900">
              <strong>Year 1 Mode Active:</strong> Confirmed maturity is capped at Level 3. 
              Levels 4 and 5 are not available for selection or auto-rating in the first year of assessment.
            </div>
          </div>
        )}

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Capability vs Confirmed Maturity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="criterion" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar
                  name="Capability (baseline)"
                  dataKey="capability"
                  stroke="#3B8BD4"
                  fill="#3B8BD4"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Confirmed maturity"
                  dataKey="confirmed"
                  stroke="#EF9F27"
                  fill="#EF9F27"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Criterion Cards */}
      <div className="grid grid-cols-2 gap-6">
        {state.criteria.map((criterion, criterionIdx) => {
          const scores = criterion.dataFields.map(f => rateDataField(f));
          const allDataComplete = scores.every(s => s !== null);
          const avgScore = allDataComplete 
            ? (scores as number[]).reduce((a, b) => a + b, 0) / scores.length
            : null;
          
          const override = criterion.boardReview?.override;
          const confirmedLevel = override !== null && override !== undefined
            ? override
            : computeConfirmedMaturity(criterion.capabilityLevel, scores, state.yearMode);

          const isElevated = confirmedLevel !== null && confirmedLevel > criterion.capabilityLevel;
          const isDegraded = confirmedLevel !== null && confirmedLevel < criterion.capabilityLevel;
          const isSameLevel = confirmedLevel !== null && confirmedLevel === criterion.capabilityLevel;

          return (
            <Card 
              key={criterion.id}
              className={allDataComplete ? 'border-2 border-blue-600' : ''}
            >
              <CardHeader>
                <CardTitle className="text-lg">{criterion.name} (C{criterionIdx + 1})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Layer 1 - Capability Pills */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Layer 1 — Capability Level</Label>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map(level => (
                      <button
                        key={level}
                        onClick={() => updateCriterion(criterion.id, { capabilityLevel: level })}
                        disabled={state.yearMode === 1 && level > 3}
                        className={`w-10 h-10 rounded-full font-medium transition-colors ${
                          criterion.capabilityLevel === level
                            ? 'bg-amber-500 text-white'
                            : state.yearMode === 1 && level > 3
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-30'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {MATURITY_DESCRIPTORS[criterion.capabilityLevel - 1]}
                  </div>
                </div>

                {/* Layer 2 - GRC System Data Panel */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-blue-900">From GRC system</div>
                    <div className="text-xs text-blue-700">Edit to reflect actual period-end data</div>
                  </div>

                  {criterion.dataFields.map((field, fieldIdx) => {
                    const score = rateDataField(field);
                    const ratingLabel = score === null ? 'No data' :
                      score === 1.0 ? 'Effective' :
                      score === 0.5 ? 'Partial' : 'Ineffective';
                    const ratingColor = score === null ? 'bg-gray-300' :
                      score === 1.0 ? 'bg-green-500' :
                      score === 0.5 ? 'bg-amber-500' : 'bg-red-500';

                    return (
                      <div key={fieldIdx} className="space-y-2">
                        <Label className="text-sm">{field.label}</Label>
                        {field.type === 'ratio' && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="n"
                              value={field.value1 ?? ''}
                              onChange={(e) => updateDataField(criterion.id, fieldIdx, {
                                value1: e.target.value ? parseInt(e.target.value) : null
                              })}
                              className="w-20"
                            />
                            <span className="text-sm">of</span>
                            <Input
                              type="number"
                              placeholder="total"
                              value={field.value2 ?? ''}
                              onChange={(e) => updateDataField(criterion.id, fieldIdx, {
                                value2: e.target.value ? parseInt(e.target.value) : null
                              })}
                              className="w-20"
                            />
                            {field.value1 !== null && field.value2 !== null && field.value2 > 0 && (
                              <span className="text-sm font-medium">
                                ({Math.round((field.value1 / field.value2) * 100)}%)
                              </span>
                            )}
                          </div>
                        )}
                        {field.type === 'boolean' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={field.boolValue === true ? 'default' : 'outline'}
                              onClick={() => updateDataField(criterion.id, fieldIdx, { boolValue: true })}
                            >
                              Yes
                            </Button>
                            <Button
                              size="sm"
                              variant={field.boolValue === false ? 'default' : 'outline'}
                              onClick={() => updateDataField(criterion.id, fieldIdx, { boolValue: false })}
                            >
                              No
                            </Button>
                          </div>
                        )}
                        {field.type === 'count' && (
                          <Input
                            type="number"
                            placeholder="Count"
                            value={field.countValue ?? ''}
                            onChange={(e) => updateDataField(criterion.id, fieldIdx, {
                              countValue: e.target.value ? parseInt(e.target.value) : null
                            })}
                            className="w-32"
                          />
                        )}
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${ratingColor} transition-all`} style={{ width: '100%' }} />
                        </div>
                        <div className="text-xs text-muted-foreground">{ratingLabel}</div>
                      </div>
                    );
                  })}

                  {/* Overall auto-rating */}
                  {allDataComplete && (
                    <div className={`mt-3 pt-3 border-t border-blue-300 text-sm font-medium ${
                      avgScore === 1.0 ? 'text-green-700' :
                      avgScore! >= 0.67 ? 'text-blue-700' :
                      avgScore! >= 0.34 ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      Auto-rating: {
                        avgScore === 1.0 ? 'Effective' :
                        avgScore! >= 0.67 ? 'Partially effective' :
                        'Ineffective'
                      }
                    </div>
                  )}
                </div>

                {/* Board Review Row */}
                {allDataComplete && (
                  <div className="space-y-3 pt-3 border-t">
                    <Label className="text-sm font-medium">Board review:</Label>
                    <div className="space-y-2">
                      <Select
                        value={override?.toString() ?? 'auto'}
                        onValueChange={(value) => {
                          updateCriterion(criterion.id, {
                            boardReview: {
                              ...criterion.boardReview,
                              override: value === 'auto' ? null : parseInt(value)
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Accept auto-rating or override" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Accept auto-rating</SelectItem>
                          {[1, 2, 3, ...(state.yearMode === 2 ? [4, 5] : [])].map(level => (
                            <SelectItem key={level} value={level.toString()}>
                              Override to Level {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder={override !== null && override !== undefined ? "Justification for override (required)" : "Commentary (optional)"}
                        value={criterion.boardReview?.commentary ?? ''}
                        onChange={(e) => {
                          updateCriterion(criterion.id, {
                            boardReview: {
                              ...criterion.boardReview,
                              commentary: e.target.value
                            }
                          });
                        }}
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {/* Confirmed Maturity Badge */}
                <div className="pt-3 border-t">
                  <Badge
                    variant="outline"
                    className={`${
                      confirmedLevel === null ? 'bg-gray-100 text-gray-600' :
                      isElevated ? 'bg-green-100 text-green-800 border-green-300' :
                      isDegraded ? 'bg-red-100 text-red-800 border-red-300' :
                      isSameLevel ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {confirmedLevel === null ? 'Awaiting data' :
                      `Level ${confirmedLevel} — ${
                        isElevated ? 'Confirmed and elevated' :
                        isDegraded ? `Degraded by ${criterion.capabilityLevel - confirmedLevel} level${criterion.capabilityLevel - confirmedLevel > 1 ? 's' : ''}` :
                        'Confirmed'
                      }${override !== null && override !== undefined ? ' (board override)' : ''}`
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
