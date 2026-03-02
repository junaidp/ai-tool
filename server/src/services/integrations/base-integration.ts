/**
 * Base Integration Service
 * Abstract class for all integration implementations
 */

export interface IntegrationConfig {
  id: string;
  system: string;
  type: string;
  endpoint: string;
  apiKey?: string;
  authMethod?: string;
  syncFrequency?: string;
  config?: any;
}

export interface IntegrationSignal {
  controlId: string;
  eventType: string;
  timestamp: Date;
  data: any;
  metadata?: any;
}

export interface IntegrationException {
  controlId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: string;
  timestamp: Date;
  data?: any;
}

export interface SyncResult {
  success: boolean;
  signalsReceived: number;
  exceptionsRaised: number;
  errors?: string[];
  lastSync: Date;
}

export abstract class BaseIntegration {
  protected config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  /**
   * Test connection to the external system
   */
  abstract testConnection(): Promise<{ success: boolean; message: string }>;

  /**
   * Sync data from the external system
   */
  abstract sync(): Promise<SyncResult>;

  /**
   * Process raw data into signals
   */
  abstract processSignals(rawData: any[]): IntegrationSignal[];

  /**
   * Evaluate signals against control thresholds to detect exceptions
   */
  abstract evaluateExceptions(signals: IntegrationSignal[]): IntegrationException[];

  /**
   * Get the sync frequency in milliseconds
   */
  getSyncFrequencyMs(): number {
    const frequency = this.config.syncFrequency || '15min';
    const frequencies: Record<string, number> = {
      'realtime': 60 * 1000, // 1 minute (closest to realtime we can do)
      '5min': 5 * 60 * 1000,
      '15min': 15 * 60 * 1000,
      '1hour': 60 * 60 * 1000,
      'daily': 24 * 60 * 60 * 1000,
    };
    return frequencies[frequency] || frequencies['15min'];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
