/**
 * SAP ERP Integration
 * Monitors financial transactions, reconciliations, and approval workflows
 */

import { BaseIntegration, IntegrationSignal, IntegrationException, SyncResult } from './base-integration';

export class SAPERPIntegration extends BaseIntegration {
  /**
   * Test connection to SAP ERP
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const url = new URL('/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner', this.config.endpoint);
      url.searchParams.set('$top', '1');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.apiKey || '').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Successfully connected to SAP ERP',
        };
      }

      return {
        success: false,
        message: `Unexpected response: ${response.status} ${response.statusText}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Connection failed',
      };
    }
  }

  /**
   * Sync data from SAP ERP
   */
  async sync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      signalsReceived: 0,
      exceptionsRaised: 0,
      errors: [],
      lastSync: new Date(),
    };

    try {
      // Fetch various data sources
      const transactions = await this.fetchFinancialTransactions();
      const approvals = await this.fetchApprovalWorkflows();
      const reconciliations = await this.fetchReconciliations();
      const changeRequests = await this.fetchChangeRequests();

      // Combine all data sources
      const allEvents = [...transactions, ...approvals, ...reconciliations, ...changeRequests];

      // Process into signals
      const signals = this.processSignals(allEvents);
      result.signalsReceived = signals.length;

      // Evaluate for exceptions
      const exceptions = this.evaluateExceptions(signals);
      result.exceptionsRaised = exceptions.length;

      // Store signals and exceptions
      await this.storeSignals(signals);
      await this.storeExceptions(exceptions);

      result.success = true;
    } catch (error: any) {
      result.errors = [error.message || 'Sync failed'];
    }

    return result;
  }

  /**
   * Fetch financial transactions
   */
  private async fetchFinancialTransactions(): Promise<any[]> {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const url = new URL('/sap/opu/odata/sap/API_JOURNALENTRY_SRV/A_JournalEntry', this.config.endpoint);
      url.searchParams.set('$filter', `PostingDate ge datetime'${yesterday}'`);
      url.searchParams.set('$top', '1000');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.apiKey || '').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch financial transactions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.d?.results || [];
    } catch (error) {
      console.error('Failed to fetch financial transactions:', error);
      return [];
    }
  }

  /**
   * Fetch approval workflows
   */
  private async fetchApprovalWorkflows(): Promise<any[]> {
    try {
      const url = new URL('/sap/opu/odata/sap/API_WORKFLOW_SRV/WorkflowTaskCollection', this.config.endpoint);
      url.searchParams.set('$filter', `Status eq 'COMPLETED' or Status eq 'READY'`);
      url.searchParams.set('$top', '500');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.apiKey || '').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch approval workflows: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.d?.results || [];
    } catch (error) {
      console.error('Failed to fetch approval workflows:', error);
      return [];
    }
  }

  /**
   * Fetch reconciliations
   */
  private async fetchReconciliations(): Promise<any[]> {
    try {
      const url = new URL('/sap/opu/odata/sap/API_BANK_RECONCILIATION_SRV/BankReconciliation', this.config.endpoint);
      url.searchParams.set('$top', '500');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.apiKey || '').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reconciliations: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.d?.results || [];
    } catch (error) {
      console.error('Failed to fetch reconciliations:', error);
      return [];
    }
  }

  /**
   * Fetch change requests
   */
  private async fetchChangeRequests(): Promise<any[]> {
    try {
      const url = new URL('/sap/opu/odata/sap/API_CHANGE_REQUEST_SRV/ChangeRequest', this.config.endpoint);
      url.searchParams.set('$top', '500');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.apiKey || '').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch change requests: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.d?.results || [];
    } catch (error) {
      console.error('Failed to fetch change requests:', error);
      return [];
    }
  }

  /**
   * Process raw SAP events into control signals
   */
  processSignals(rawData: any[]): IntegrationSignal[] {
    const signals: IntegrationSignal[] = [];

    for (const event of rawData) {
      // Financial transaction signals
      if (event.JournalEntry || event.AccountingDocument) {
        signals.push({
          controlId: 'CTL-001', // Financial Reconciliation control
          eventType: 'financial_transaction',
          timestamp: new Date(event.PostingDate || event.DocumentDate || Date.now()),
          data: event,
          metadata: {
            documentNumber: event.AccountingDocument || event.JournalEntry,
            amount: event.AmountInCompanyCodeCurrency,
            currency: event.CompanyCodeCurrency,
            postingKey: event.PostingKey,
          },
        });
      }

      // Approval workflow signals
      if (event.WorkflowTaskID || event.TaskID) {
        const createdTime = new Date(event.CreatedOn || Date.now());
        const completedTime = event.CompletedOn ? new Date(event.CompletedOn) : null;
        const executionTime = event.ExecutedOn ? new Date(event.ExecutedOn) : null;

        // Calculate approval delay
        let approvalDelay = 0;
        if (completedTime && executionTime) {
          approvalDelay = (completedTime.getTime() - executionTime.getTime()) / (1000 * 60); // minutes
        }

        signals.push({
          controlId: 'CTL-004', // Change Management control
          eventType: 'approval_workflow',
          timestamp: completedTime || createdTime,
          data: event,
          metadata: {
            taskId: event.WorkflowTaskID || event.TaskID,
            status: event.Status,
            approver: event.ActualAgent,
            approvalDelay: approvalDelay,
            isLate: approvalDelay > 15, // Flag if approval took more than 15 minutes
          },
        });
      }

      // Reconciliation signals
      if (event.BankReconciliationID || event.ReconciliationKey) {
        signals.push({
          controlId: 'CTL-001',
          eventType: 'reconciliation',
          timestamp: new Date(event.ReconciliationDate || Date.now()),
          data: event,
          metadata: {
            reconciliationId: event.BankReconciliationID,
            status: event.ReconciliationStatus,
            variance: event.VarianceAmount,
          },
        });
      }

      // Change request signals
      if (event.ChangeRequestID) {
        signals.push({
          controlId: 'CTL-005', // Change request control
          eventType: 'change_request',
          timestamp: new Date(event.CreatedOn || Date.now()),
          data: event,
          metadata: {
            changeId: event.ChangeRequestID,
            status: event.Status,
            priority: event.Priority,
            approvalStatus: event.ApprovalStatus,
          },
        });
      }
    }

    return signals;
  }

  /**
   * Evaluate signals for exceptions
   */
  evaluateExceptions(signals: IntegrationSignal[]): IntegrationException[] {
    const exceptions: IntegrationException[] = [];

    // Check for late approvals
    const approvalSignals = signals.filter(s => s.eventType === 'approval_workflow');
    const lateApprovals = approvalSignals.filter(s => s.metadata?.isLate);

    if (lateApprovals.length > 0) {
      exceptions.push({
        controlId: 'CTL-004',
        severity: 'medium',
        message: 'Late Approval Detected',
        details: `${lateApprovals.length} approval(s) obtained after transaction execution. Expected: Pre-approval within 15 minutes.`,
        timestamp: new Date(),
        data: { 
          count: lateApprovals.length,
          avgDelay: lateApprovals.reduce((sum, s) => sum + (s.metadata?.approvalDelay || 0), 0) / lateApprovals.length,
        },
      });
    }

    // Check for reconciliation variances
    const reconciliationSignals = signals.filter(s => s.eventType === 'reconciliation');
    const varianceReconciliations = reconciliationSignals.filter(s => 
      s.metadata?.variance && Math.abs(parseFloat(s.metadata.variance)) > 100
    );

    if (varianceReconciliations.length > 0) {
      exceptions.push({
        controlId: 'CTL-001',
        severity: 'high',
        message: 'Reconciliation Variance Detected',
        details: `${varianceReconciliations.length} reconciliation(s) with variance exceeding threshold`,
        timestamp: new Date(),
        data: { count: varianceReconciliations.length },
      });
    }

    // Check for high-value transactions without proper approval
    const transactionSignals = signals.filter(s => s.eventType === 'financial_transaction');
    const highValueTransactions = transactionSignals.filter(s => 
      s.metadata?.amount && Math.abs(parseFloat(s.metadata.amount)) > 100000
    );

    // Cross-check with approvals
    const highValueWithoutApproval = highValueTransactions.filter(txn => {
      const hasApproval = approvalSignals.some(approval => 
        Math.abs(approval.timestamp.getTime() - txn.timestamp.getTime()) < 60 * 60 * 1000 // Within 1 hour
      );
      return !hasApproval;
    });

    if (highValueWithoutApproval.length > 0) {
      exceptions.push({
        controlId: 'CTL-001',
        severity: 'critical',
        message: 'High-value transactions without approval',
        details: `${highValueWithoutApproval.length} transaction(s) exceeding $100,000 without documented approval`,
        timestamp: new Date(),
        data: { count: highValueWithoutApproval.length },
      });
    }

    // Check for unapproved change requests
    const changeSignals = signals.filter(s => s.eventType === 'change_request');
    const unapprovedChanges = changeSignals.filter(s => 
      s.metadata?.status === 'COMPLETED' && s.metadata?.approvalStatus !== 'APPROVED'
    );

    if (unapprovedChanges.length > 0) {
      exceptions.push({
        controlId: 'CTL-005',
        severity: 'high',
        message: 'Changes implemented without approval',
        details: `${unapprovedChanges.length} change request(s) completed without proper approval`,
        timestamp: new Date(),
        data: { count: unapprovedChanges.length },
      });
    }

    return exceptions;
  }

  /**
   * Store signals in database
   */
  private async storeSignals(signals: IntegrationSignal[]): Promise<void> {
    const prisma = (await import('../../db')).default;
    
    for (const signal of signals) {
      try {
        await prisma.integrationSignal.create({
          data: {
            integrationId: this.config.id,
            controlId: signal.controlId,
            eventType: signal.eventType,
            timestamp: signal.timestamp,
            data: JSON.stringify(signal.data),
            metadata: signal.metadata ? JSON.stringify(signal.metadata) : null,
          },
        });
      } catch (error) {
        console.error('Failed to store signal:', error);
      }
    }
    
    console.log(`Stored ${signals.length} signals from SAP ERP`);
  }

  /**
   * Store exceptions in database
   */
  private async storeExceptions(exceptions: IntegrationException[]): Promise<void> {
    const prisma = (await import('../../db')).default;
    
    for (const exception of exceptions) {
      try {
        await prisma.integrationException.create({
          data: {
            integrationId: this.config.id,
            controlId: exception.controlId,
            severity: exception.severity,
            message: exception.message,
            details: exception.details,
            timestamp: exception.timestamp,
            data: exception.data ? JSON.stringify(exception.data) : null,
          },
        });
      } catch (error) {
        console.error('Failed to store exception:', error);
      }
    }
    
    console.log(`Stored ${exceptions.length} exceptions from SAP ERP`);
  }
}
