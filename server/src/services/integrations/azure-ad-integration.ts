/**
 * Azure Active Directory Integration
 * Monitors user access, authentication events, and permission changes
 */

import { BaseIntegration, IntegrationSignal, IntegrationException, SyncResult } from './base-integration';

export class AzureADIntegration extends BaseIntegration {
  /**
   * Test connection to Azure AD
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const url = new URL('/v1.0/users', this.config.endpoint);
      url.searchParams.set('$top', '1');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Successfully connected to Azure AD',
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
   * Sync data from Azure AD
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
      // Fetch audit logs from the last sync period
      const auditLogs = await this.fetchAuditLogs();
      const signInLogs = await this.fetchSignInLogs();
      const directoryChanges = await this.fetchDirectoryChanges();

      // Combine all data sources
      const allEvents = [...auditLogs, ...signInLogs, ...directoryChanges];

      // Process into signals
      const signals = this.processSignals(allEvents);
      result.signalsReceived = signals.length;

      // Evaluate for exceptions
      const exceptions = this.evaluateExceptions(signals);
      result.exceptionsRaised = exceptions.length;

      // Store signals and exceptions in database
      await this.storeSignals(signals);
      await this.storeExceptions(exceptions);

      result.success = true;
    } catch (error: any) {
      result.errors = [error.message || 'Sync failed'];
    }

    return result;
  }

  /**
   * Fetch audit logs from Azure AD
   */
  private async fetchAuditLogs(): Promise<any[]> {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const url = new URL('/v1.0/auditLogs/directoryAudits', this.config.endpoint);
      url.searchParams.set('$filter', `activityDateTime ge ${yesterday}`);
      url.searchParams.set('$top', '1000');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }

  /**
   * Fetch sign-in logs from Azure AD
   */
  private async fetchSignInLogs(): Promise<any[]> {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const url = new URL('/v1.0/auditLogs/signIns', this.config.endpoint);
      url.searchParams.set('$filter', `createdDateTime ge ${yesterday}`);
      url.searchParams.set('$top', '1000');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sign-in logs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Failed to fetch sign-in logs:', error);
      return [];
    }
  }

  /**
   * Fetch directory changes (user/group modifications)
   */
  private async fetchDirectoryChanges(): Promise<any[]> {
    try {
      const url = new URL('/v1.0/users/delta', this.config.endpoint);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch directory changes: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Failed to fetch directory changes:', error);
      return [];
    }
  }

  /**
   * Process raw Azure AD events into control signals
   */
  processSignals(rawData: any[]): IntegrationSignal[] {
    const signals: IntegrationSignal[] = [];

    for (const event of rawData) {
      // Map Azure AD events to control signals based on activity type
      const activityType = event.activityDisplayName || event.activity || event.userPrincipalName;

      if (!activityType) continue;

      // User Access Review signals
      if (this.isAccessControlEvent(activityType)) {
        signals.push({
          controlId: 'CTL-002', // User Access Review control
          eventType: 'access_control_event',
          timestamp: new Date(event.activityDateTime || event.createdDateTime || Date.now()),
          data: event,
          metadata: {
            activity: activityType,
            user: event.userPrincipalName || event.initiatedBy?.user?.userPrincipalName,
            result: event.result || event.status?.errorCode === 0 ? 'success' : 'failure',
          },
        });
      }

      // Authentication events
      if (this.isAuthenticationEvent(event)) {
        signals.push({
          controlId: 'CTL-006', // Authentication control
          eventType: 'authentication_event',
          timestamp: new Date(event.createdDateTime || Date.now()),
          data: event,
          metadata: {
            user: event.userPrincipalName,
            location: event.location?.city,
            deviceDetail: event.deviceDetail,
            riskLevel: event.riskLevelDuringSignIn,
          },
        });
      }

      // Permission changes
      if (this.isPermissionChange(activityType)) {
        signals.push({
          controlId: 'CTL-002',
          eventType: 'permission_change',
          timestamp: new Date(event.activityDateTime || Date.now()),
          data: event,
          metadata: {
            activity: activityType,
            targetUser: event.targetResources?.[0]?.userPrincipalName,
            initiatedBy: event.initiatedBy?.user?.userPrincipalName,
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

    // Group signals by control
    const signalsByControl = new Map<string, IntegrationSignal[]>();
    for (const signal of signals) {
      if (!signalsByControl.has(signal.controlId)) {
        signalsByControl.set(signal.controlId, []);
      }
      signalsByControl.get(signal.controlId)!.push(signal);
    }

    // Check for failed authentication attempts
    const authSignals = signals.filter(s => s.eventType === 'authentication_event');
    const failedAuths = authSignals.filter(s => s.metadata?.result === 'failure');
    
    if (failedAuths.length > 10) {
      exceptions.push({
        controlId: 'CTL-006',
        severity: 'medium',
        message: 'High number of failed authentication attempts',
        details: `${failedAuths.length} failed authentication attempts detected in the last 24 hours`,
        timestamp: new Date(),
        data: { count: failedAuths.length },
      });
    }

    // Check for risky sign-ins
    const riskySignIns = authSignals.filter(s => 
      s.metadata?.riskLevel && ['medium', 'high'].includes(s.metadata.riskLevel)
    );
    
    if (riskySignIns.length > 0) {
      exceptions.push({
        controlId: 'CTL-006',
        severity: 'high',
        message: 'Risky sign-in attempts detected',
        details: `${riskySignIns.length} sign-ins flagged as risky by Azure AD`,
        timestamp: new Date(),
        data: { count: riskySignIns.length },
      });
    }

    // Check for unauthorized permission changes
    const permissionChanges = signals.filter(s => s.eventType === 'permission_change');
    const afterHoursChanges = permissionChanges.filter(s => {
      const hour = s.timestamp.getHours();
      return hour < 6 || hour > 20; // Outside 6 AM - 8 PM
    });

    if (afterHoursChanges.length > 0) {
      exceptions.push({
        controlId: 'CTL-002',
        severity: 'medium',
        message: 'Permission changes outside business hours',
        details: `${afterHoursChanges.length} permission changes made outside normal business hours`,
        timestamp: new Date(),
        data: { count: afterHoursChanges.length },
      });
    }

    return exceptions;
  }

  /**
   * Helper: Check if event is access control related
   */
  private isAccessControlEvent(activity: string): boolean {
    const accessControlKeywords = [
      'add member',
      'remove member',
      'update role',
      'assign role',
      'remove role',
      'update user',
      'update group',
    ];
    return accessControlKeywords.some(keyword => 
      activity.toLowerCase().includes(keyword)
    );
  }

  /**
   * Helper: Check if event is authentication related
   */
  private isAuthenticationEvent(event: any): boolean {
    return event.createdDateTime && event.userPrincipalName && event.status;
  }

  /**
   * Helper: Check if event is permission change
   */
  private isPermissionChange(activity: string): boolean {
    const permissionKeywords = [
      'add role',
      'remove role',
      'update role',
      'assign',
      'permission',
    ];
    return permissionKeywords.some(keyword => 
      activity.toLowerCase().includes(keyword)
    );
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
    
    console.log(`Stored ${signals.length} signals from Azure AD`);
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
    
    console.log(`Stored ${exceptions.length} exceptions from Azure AD`);
  }
}
