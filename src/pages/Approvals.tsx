import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import type { ApprovalWorkflow } from '@/types';
import { CheckSquare, Clock, CheckCircle, XCircle, MessageSquare, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function Approvals() {
  const [approvals, setApprovals] = useState<ApprovalWorkflow[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalWorkflow | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    apiService.getApprovals().then(setApprovals);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'in_review':
        return <Badge variant="info">In Review</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in_review':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const inReviewApprovals = approvals.filter((a) => a.status === 'in_review');
  const completedApprovals = approvals.filter((a) => a.status === 'approved' || a.status === 'rejected');

  const handleReview = (approval: ApprovalWorkflow) => {
    setSelectedApproval(approval);
    setIsReviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Governance & Approvals</h1>
          <p className="text-muted-foreground mt-1">
            Human-in-the-loop governance workflow for defensible decision-making
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inReviewApprovals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Under evaluation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvals.filter((a) => a.status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Approval Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.5</div>
            <p className="text-xs text-muted-foreground mt-1">Days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="in_review">In Review ({inReviewApprovals.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="gates">Approval Gates</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Items awaiting your review and approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(approval.status)}
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{approval.itemName}</h3>
                            {getStatusBadge(approval.status)}
                            <Badge variant="outline">{approval.itemType}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Requester:</span>
                        <p className="text-muted-foreground">{approval.requester}</p>
                      </div>
                      <div>
                        <span className="font-medium">Current Approver:</span>
                        <p className="text-muted-foreground">{approval.currentApprover}</p>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <p className="text-muted-foreground">{formatDate(approval.submittedDate)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-yellow-200">
                      <Button size="sm" onClick={() => handleReview(approval)}>
                        Review & Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Request Changes
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingApprovals.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending approvals at this time
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in_review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>In Review</CardTitle>
              <CardDescription>Items currently under evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inReviewApprovals.map((approval) => (
                  <div key={approval.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(approval.status)}
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{approval.itemName}</h3>
                            {getStatusBadge(approval.status)}
                            <Badge variant="outline">{approval.itemType}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Requester:</span>
                        <p className="text-muted-foreground">{approval.requester}</p>
                      </div>
                      <div>
                        <span className="font-medium">Current Approver:</span>
                        <p className="text-muted-foreground">{approval.currentApprover}</p>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <p className="text-muted-foreground">{formatDate(approval.submittedDate)}</p>
                      </div>
                    </div>

                    {approval.comments && (
                      <div className="bg-white rounded p-3 border border-blue-200">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Review Comments:</p>
                            <p className="text-sm text-blue-700 mt-1">{approval.comments}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-blue-200">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline">Add Comment</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Approvals</CardTitle>
              <CardDescription>Historical approval decisions with audit trail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedApprovals.map((approval) => (
                  <div key={approval.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(approval.status)}
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{approval.itemName}</h3>
                            {getStatusBadge(approval.status)}
                            <Badge variant="outline">{approval.itemType}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Requester:</span>
                        <p className="text-muted-foreground">{approval.requester}</p>
                      </div>
                      <div>
                        <span className="font-medium">Approver:</span>
                        <p className="text-muted-foreground">{approval.currentApprover}</p>
                      </div>
                      <div>
                        <span className="font-medium">Decision Date:</span>
                        <p className="text-muted-foreground">{formatDate(approval.submittedDate)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline">View Audit Trail</Button>
                      <Button size="sm" variant="outline">View Version History</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Gates</CardTitle>
              <CardDescription>Configured governance approval requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Effectiveness Criteria Approval</h3>
                    <Badge variant="outline">Audit Committee</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All effectiveness criteria must be approved by Audit Committee before implementation
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Framework Blueprint Approval</h3>
                    <Badge variant="outline">Board</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Framework design requires board ratification after 2nd line review
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Material Controls Scope Approval</h3>
                    <Badge variant="outline">Audit Committee</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Changes to material controls scope require Audit Committee sign-off
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Control Library Finalization</h3>
                    <Badge variant="outline">2nd Line</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Risk/compliance team must review control library before deployment
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Test Plan Approval</h3>
                    <Badge variant="outline">Internal Audit</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Annual test plan requires internal audit approval
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Exception Materiality Classification</h3>
                    <Badge variant="outline">Risk Committee</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Material exceptions must be classified by risk committee
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Remediation Closure Approval</h3>
                    <Badge variant="outline">Control Owner + 2nd Line</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Remediation must be verified before closure
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Board Pack Approval</h3>
                    <Badge variant="outline">Audit Committee Chair</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Final board reporting pack requires committee chair approval
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Audit Trail</CardTitle>
              <CardDescription>Every gate requires: approver, date/time, rationale, version snapshot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Full audit trail maintained for all approvals</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Version snapshots preserved at approval time</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Rationale and comments captured</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Timestamp and approver identity verified</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Approval Request</DialogTitle>
            <DialogDescription>
              {selectedApproval?.itemName} - {selectedApproval?.itemType}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Requester</Label>
              <p className="text-sm text-muted-foreground mt-1">{selectedApproval?.requester}</p>
            </div>
            <div>
              <Label>Submitted Date</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedApproval && formatDate(selectedApproval.submittedDate)}
              </p>
            </div>
            <div>
              <Label>Review Comments</Label>
              <Textarea placeholder="Add your review comments and rationale..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setIsReviewOpen(false)}>
              Reject
            </Button>
            <Button onClick={() => setIsReviewOpen(false)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
