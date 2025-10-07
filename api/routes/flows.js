const express = require('express');
const router = express.Router();
const {
  getModuleFlows,
  getFlow,
  updateModuleFlows,
  generateFlowId
} = require('../utils/fileUtils');
const { validateFlow } = require('../utils/validation');

// GET /api/flows/:module - Get all flows for a module
router.get('/:module', async (req, res, next) => {
  try {
    const { module } = req.params;
    const flows = await getModuleFlows(module);

    res.json({
      module: module,
      count: flows.length,
      flows: flows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/flows/:module/:flowId - Get specific flow
router.get('/:module/:flowId', async (req, res, next) => {
  try {
    const { module, flowId } = req.params;
    const flow = await getFlow(module, flowId);

    if (!flow) {
      return res.status(404).json({
        error: 'Flow not found',
        module: module,
        flowId: flowId
      });
    }

    res.json({
      module: module,
      flow: flow
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/flows/:module - Create new flow
router.post('/:module', async (req, res, next) => {
  try {
    const { module } = req.params;
    const flowData = req.body;

    // Validate flow structure
    const validation = validateFlow(flowData);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid flow data',
        details: validation.errors
      });
    }

    // Generate flow ID if not provided
    if (!flowData.flow_id) {
      flowData.flow_id = generateFlowId(module);
    }

    // Add metadata
    flowData.created_at = new Date().toISOString();
    flowData.updated_at = new Date().toISOString();
    flowData.version = '1.0.0';

    // Get existing flows
    const flows = await getModuleFlows(module);

    // Check for duplicate
    const existing = flows.find(f => f.flow_id === flowData.flow_id);
    if (existing) {
      return res.status(409).json({
        error: 'Flow with this ID already exists',
        flowId: flowData.flow_id
      });
    }

    // Add new flow
    flows.push(flowData);

    // Save updated flows
    await updateModuleFlows(module, flows);

    res.status(201).json({
      message: 'Flow created successfully',
      module: module,
      flow: flowData
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/flows/:module/:flowId - Update existing flow
router.put('/:module/:flowId', async (req, res, next) => {
  try {
    const { module, flowId } = req.params;
    const updateData = req.body;

    // Validate flow structure
    const validation = validateFlow(updateData);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid flow data',
        details: validation.errors
      });
    }

    // Get existing flows
    const flows = await getModuleFlows(module);

    // Find flow to update
    const flowIndex = flows.findIndex(f =>
      f.flow_id === flowId ||
      f.id === flowId ||
      (f.flow_name && f.flow_name.toLowerCase().replace(/\s+/g, '_') === flowId)
    );

    if (flowIndex === -1) {
      return res.status(404).json({
        error: 'Flow not found',
        module: module,
        flowId: flowId
      });
    }

    // Preserve original creation date and ID
    const originalFlow = flows[flowIndex];
    updateData.flow_id = originalFlow.flow_id || flowId;
    updateData.created_at = originalFlow.created_at || originalFlow.created_date;
    updateData.updated_at = new Date().toISOString();

    // Update version
    const currentVersion = originalFlow.version || '1.0.0';
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    updateData.version = `${major}.${minor}.${patch + 1}`;

    // Add to change log
    if (!updateData.change_log) {
      updateData.change_log = originalFlow.change_log || [];
    }
    updateData.change_log.push({
      version: updateData.version,
      date: new Date().toISOString(),
      changes: ['Flow updated via API'],
      source: 'API'
    });

    // Replace flow
    flows[flowIndex] = updateData;

    // Save updated flows
    await updateModuleFlows(module, flows);

    res.json({
      message: 'Flow updated successfully',
      module: module,
      flow: updateData
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/flows/:module/:flowId - Delete flow
router.delete('/:module/:flowId', async (req, res, next) => {
  try {
    const { module, flowId } = req.params;

    // Get existing flows
    const flows = await getModuleFlows(module);

    // Find flow to delete
    const flowIndex = flows.findIndex(f =>
      f.flow_id === flowId ||
      f.id === flowId ||
      (f.flow_name && f.flow_name.toLowerCase().replace(/\s+/g, '_') === flowId)
    );

    if (flowIndex === -1) {
      return res.status(404).json({
        error: 'Flow not found',
        module: module,
        flowId: flowId
      });
    }

    // Remove flow
    const deletedFlow = flows.splice(flowIndex, 1)[0];

    // Save updated flows
    await updateModuleFlows(module, flows);

    res.json({
      message: 'Flow deleted successfully',
      module: module,
      deletedFlow: deletedFlow
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/flows/:module/:flowId - Partial update
router.patch('/:module/:flowId', async (req, res, next) => {
  try {
    const { module, flowId } = req.params;
    const patchData = req.body;

    // Get existing flows
    const flows = await getModuleFlows(module);

    // Find flow to update
    const flowIndex = flows.findIndex(f =>
      f.flow_id === flowId ||
      f.id === flowId ||
      (f.flow_name && f.flow_name.toLowerCase().replace(/\s+/g, '_') === flowId)
    );

    if (flowIndex === -1) {
      return res.status(404).json({
        error: 'Flow not found',
        module: module,
        flowId: flowId
      });
    }

    // Merge patch data with existing flow
    const updatedFlow = {
      ...flows[flowIndex],
      ...patchData,
      updated_at: new Date().toISOString()
    };

    // Validate merged flow
    const validation = validateFlow(updatedFlow);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid flow data after patch',
        details: validation.errors
      });
    }

    // Replace flow
    flows[flowIndex] = updatedFlow;

    // Save updated flows
    await updateModuleFlows(module, flows);

    res.json({
      message: 'Flow patched successfully',
      module: module,
      flow: updatedFlow
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;