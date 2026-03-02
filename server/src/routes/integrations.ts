import { Router } from 'express';
import prisma from '../db';
import { integrationManager } from '../services/integrations/integration-manager';

export const integrationsRouter = Router();

// Get all integrations
integrationsRouter.get('/', async (req, res) => {
  try {
    const integrations = await prisma.integrationStatus.findMany({
      orderBy: { system: 'asc' },
    });
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Create new integration
integrationsRouter.post('/', async (req, res) => {
  try {
    const data = req.body;
    const integration = await prisma.integrationStatus.create({
      data: {
        ...data,
        lastSync: new Date(data.lastSync),
      },
    });
    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

// Update integration configuration
integrationsRouter.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updateData: any = { ...data };
    if (data.lastSync) {
      updateData.lastSync = new Date(data.lastSync);
    }
    
    const integration = await prisma.integrationStatus.update({
      where: { id },
      data: updateData,
    });

    // Update in integration manager if it's loaded
    if (data.endpoint || data.apiKey || data.authMethod || data.syncFrequency) {
      await integrationManager.updateIntegration(id, {
        endpoint: data.endpoint,
        apiKey: data.apiKey,
        authMethod: data.authMethod,
        syncFrequency: data.syncFrequency,
      });
    }
    
    res.json(integration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

// Test connection
integrationsRouter.post('/:id/test-connection', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await integrationManager.testConnection(id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to test connection' 
    });
  }
});

// Manually trigger sync
integrationsRouter.post('/:id/sync', async (req, res) => {
  try {
    const { id } = req.params;
    await integrationManager.syncIntegration(id);
    
    // Get updated integration data
    const integration = await prisma.integrationStatus.findUnique({
      where: { id },
    });
    
    res.json({ 
      success: true, 
      message: 'Sync completed successfully',
      integration 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to sync integration' 
    });
  }
});

// Connect integration (enable and start syncing)
integrationsRouter.post('/:id/connect', async (req, res) => {
  try {
    const { id } = req.params;
    await integrationManager.connectIntegration(id);
    
    const integration = await prisma.integrationStatus.findUnique({
      where: { id },
    });
    
    res.json({ 
      success: true, 
      message: 'Integration connected successfully',
      integration 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to connect integration' 
    });
  }
});

// Disconnect integration (disable syncing)
integrationsRouter.post('/:id/disconnect', async (req, res) => {
  try {
    const { id } = req.params;
    await integrationManager.disconnectIntegration(id);
    
    const integration = await prisma.integrationStatus.findUnique({
      where: { id },
    });
    
    res.json({ 
      success: true, 
      message: 'Integration disconnected successfully',
      integration 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to disconnect integration' 
    });
  }
});

// Get integration signals
integrationsRouter.get('/:id/signals', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const signals = await prisma.integrationSignal.findMany({
      where: { integrationId: id },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

// Get integration exceptions
integrationsRouter.get('/:id/exceptions', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const exceptions = await prisma.integrationException.findMany({
      where: { integrationId: id },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    
    res.json(exceptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exceptions' });
  }
});
