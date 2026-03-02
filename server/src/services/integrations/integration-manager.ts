/**
 * Integration Manager
 * Manages all system integrations, sync jobs, and signal processing
 */

import prisma from '../../db';
import { BaseIntegration, IntegrationConfig } from './base-integration';
import { AzureADIntegration } from './azure-ad-integration';
import { SAPERPIntegration } from './sap-erp-integration';

export class IntegrationManager {
  private integrations: Map<string, BaseIntegration> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Initialize integration manager and load all active integrations
   */
  async initialize(): Promise<void> {
    console.log('Initializing Integration Manager...');
    
    const integrations = await prisma.integrationStatus.findMany({
      where: { status: 'connected' },
    });

    for (const integration of integrations) {
      await this.loadIntegration(integration);
    }

    console.log(`Integration Manager initialized with ${integrations.length} active integrations`);
  }

  /**
   * Load and start an integration
   */
  async loadIntegration(integrationData: any): Promise<void> {
    const config: IntegrationConfig = {
      id: integrationData.id,
      system: integrationData.system,
      type: integrationData.type,
      endpoint: integrationData.endpoint,
      apiKey: integrationData.apiKey,
      authMethod: integrationData.authMethod,
      syncFrequency: integrationData.syncFrequency,
      config: integrationData.config,
    };

    const integration = this.createIntegration(config);
    if (!integration) {
      console.error(`Failed to create integration for ${config.system}`);
      return;
    }

    this.integrations.set(config.id, integration);

    // Start sync job if integration is connected
    if (integrationData.status === 'connected') {
      this.startSyncJob(config.id);
    }
  }

  /**
   * Create integration instance based on type
   */
  private createIntegration(config: IntegrationConfig): BaseIntegration | null {
    switch (config.type.toLowerCase()) {
      case 'identity':
        return new AzureADIntegration(config);
      case 'erp':
        return new SAPERPIntegration(config);
      default:
        console.warn(`Unknown integration type: ${config.type}`);
        return null;
    }
  }

  /**
   * Test connection for an integration
   */
  async testConnection(integrationId: string): Promise<{ success: boolean; message: string }> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      // Try to load from database
      const integrationData = await prisma.integrationStatus.findUnique({
        where: { id: integrationId },
      });

      if (!integrationData) {
        return { success: false, message: 'Integration not found' };
      }

      const config: IntegrationConfig = {
        id: integrationData.id,
        system: integrationData.system,
        type: integrationData.type,
        endpoint: integrationData.endpoint,
        apiKey: integrationData.apiKey,
        authMethod: integrationData.authMethod,
        syncFrequency: integrationData.syncFrequency,
        config: integrationData.config,
      };

      const tempIntegration = this.createIntegration(config);
      if (!tempIntegration) {
        return { success: false, message: 'Failed to create integration instance' };
      }

      return await tempIntegration.testConnection();
    }

    return await integration.testConnection();
  }

  /**
   * Manually trigger sync for an integration
   */
  async syncIntegration(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    console.log(`Starting manual sync for integration ${integrationId}`);
    const result = await integration.sync();

    // Update integration status in database
    await prisma.integrationStatus.update({
      where: { id: integrationId },
      data: {
        signalsReceived: { increment: result.signalsReceived },
        exceptionsRaised: { increment: result.exceptionsRaised },
        lastSync: result.lastSync,
        status: result.success ? 'connected' : 'error',
      },
    });

    console.log(`Sync completed for ${integrationId}:`, result);
  }

  /**
   * Start scheduled sync job for an integration
   */
  startSyncJob(integrationId: string): void {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      console.error(`Cannot start sync job: Integration ${integrationId} not found`);
      return;
    }

    // Clear existing interval if any
    this.stopSyncJob(integrationId);

    const syncFrequency = integration.getSyncFrequencyMs();
    console.log(`Starting sync job for ${integrationId} with frequency ${syncFrequency}ms`);

    const interval = setInterval(async () => {
      try {
        await this.syncIntegration(integrationId);
      } catch (error) {
        console.error(`Sync job failed for ${integrationId}:`, error);
      }
    }, syncFrequency);

    this.syncIntervals.set(integrationId, interval);

    // Run initial sync immediately
    this.syncIntegration(integrationId).catch(error => {
      console.error(`Initial sync failed for ${integrationId}:`, error);
    });
  }

  /**
   * Stop sync job for an integration
   */
  stopSyncJob(integrationId: string): void {
    const interval = this.syncIntervals.get(integrationId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(integrationId);
      console.log(`Stopped sync job for ${integrationId}`);
    }
  }

  /**
   * Update integration configuration
   */
  async updateIntegration(integrationId: string, updates: Partial<IntegrationConfig>): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (integration) {
      integration.updateConfig(updates);
    }

    // Update in database
    await prisma.integrationStatus.update({
      where: { id: integrationId },
      data: {
        endpoint: updates.endpoint,
        apiKey: updates.apiKey,
        authMethod: updates.authMethod,
        syncFrequency: updates.syncFrequency,
      },
    });

    // Restart sync job with new configuration
    if (integration) {
      this.startSyncJob(integrationId);
    }
  }

  /**
   * Connect an integration (enable it)
   */
  async connectIntegration(integrationId: string): Promise<void> {
    // Test connection first
    const testResult = await this.testConnection(integrationId);
    if (!testResult.success) {
      throw new Error(`Connection test failed: ${testResult.message}`);
    }

    // Update status to connected
    await prisma.integrationStatus.update({
      where: { id: integrationId },
      data: { status: 'connected' },
    });

    // Load and start the integration
    const integrationData = await prisma.integrationStatus.findUnique({
      where: { id: integrationId },
    });

    if (integrationData) {
      await this.loadIntegration(integrationData);
    }
  }

  /**
   * Disconnect an integration (disable it)
   */
  async disconnectIntegration(integrationId: string): Promise<void> {
    this.stopSyncJob(integrationId);
    this.integrations.delete(integrationId);

    await prisma.integrationStatus.update({
      where: { id: integrationId },
      data: { status: 'disconnected' },
    });
  }

  /**
   * Get all active integrations
   */
  getActiveIntegrations(): string[] {
    return Array.from(this.integrations.keys());
  }

  /**
   * Shutdown all integrations
   */
  shutdown(): void {
    console.log('Shutting down Integration Manager...');
    for (const integrationId of this.syncIntervals.keys()) {
      this.stopSyncJob(integrationId);
    }
    this.integrations.clear();
    console.log('Integration Manager shutdown complete');
  }
}

// Singleton instance
export const integrationManager = new IntegrationManager();
