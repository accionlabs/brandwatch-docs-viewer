const express = require('express');
const router = express.Router();
const path = require('path');
const {
  readJsonFile,
  writeJsonFile,
  getCrossModuleWorkflows,
  DATA_PATH,
  CROSS_MODULE_FILES
} = require('../utils/fileUtils');
const { validateCrossModuleWorkflow } = require('../utils/validation');

// GET /api/cross-module - Get all cross-module workflows
router.get('/', async (req, res, next) => {
  try {
    const workflows = await getCrossModuleWorkflows();

    res.json({
      count: workflows.length,
      workflows: workflows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cross-module/:workflowId - Get specific workflow
router.get('/:workflowId', async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const workflows = await getCrossModuleWorkflows();

    const workflow = workflows.find(w =>
      w.workflow_id === workflowId ||
      (w.workflow_name && w.workflow_name.toLowerCase().replace(/\s+/g, '_') === workflowId)
    );

    if (!workflow) {
      return res.status(404).json({
        error: 'Cross-module workflow not found',
        workflowId: workflowId
      });
    }

    res.json({
      workflow: workflow
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/cross-module - Create new cross-module workflow
router.post('/', async (req, res, next) => {
  try {
    const workflowData = req.body;

    // Validate workflow structure
    const validation = validateCrossModuleWorkflow(workflowData);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid workflow data',
        details: validation.errors
      });
    }

    // Generate workflow ID if not provided
    if (!workflowData.workflow_id) {
      workflowData.workflow_id = `CROSS_${Date.now().toString(36).toUpperCase()}`;
    }

    // Add metadata
    workflowData.created_at = new Date().toISOString();
    workflowData.updated_at = new Date().toISOString();

    // Create new file for this workflow
    const fileName = `cross_module_${workflowData.workflow_id.toLowerCase()}.json`;
    const filePath = path.join(DATA_PATH, fileName);

    // Check if file already exists
    const existingWorkflows = await getCrossModuleWorkflows();
    const existing = existingWorkflows.find(w => w.workflow_id === workflowData.workflow_id);
    if (existing) {
      return res.status(409).json({
        error: 'Workflow with this ID already exists',
        workflowId: workflowData.workflow_id
      });
    }

    // Write new workflow file
    await writeJsonFile(filePath, workflowData);

    // Update the list of cross-module files
    if (!CROSS_MODULE_FILES.includes(fileName)) {
      CROSS_MODULE_FILES.push(fileName);
    }

    res.status(201).json({
      message: 'Cross-module workflow created successfully',
      workflow: workflowData
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/cross-module/:workflowId - Update cross-module workflow
router.put('/:workflowId', async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const updateData = req.body;

    // Validate workflow structure
    const validation = validateCrossModuleWorkflow(updateData);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid workflow data',
        details: validation.errors
      });
    }

    // Find the file containing this workflow
    let workflowFile = null;
    let existingWorkflow = null;

    for (const fileName of CROSS_MODULE_FILES) {
      const filePath = path.join(DATA_PATH, fileName);
      const data = await readJsonFile(filePath);

      if (data.workflow_id === workflowId ||
          (data.workflow_name && data.workflow_name.toLowerCase().replace(/\s+/g, '_') === workflowId)) {
        workflowFile = fileName;
        existingWorkflow = data;
        break;
      }
    }

    if (!workflowFile) {
      return res.status(404).json({
        error: 'Cross-module workflow not found',
        workflowId: workflowId
      });
    }

    // Preserve original creation date and ID
    updateData.workflow_id = existingWorkflow.workflow_id;
    updateData.created_at = existingWorkflow.created_at;
    updateData.updated_at = new Date().toISOString();

    // Write updated workflow
    const filePath = path.join(DATA_PATH, workflowFile);
    await writeJsonFile(filePath, updateData);

    res.json({
      message: 'Cross-module workflow updated successfully',
      workflow: updateData
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cross-module/:workflowId - Delete cross-module workflow
router.delete('/:workflowId', async (req, res, next) => {
  try {
    const { workflowId } = req.params;

    // Find the file containing this workflow
    let workflowFile = null;
    let existingWorkflow = null;

    for (const fileName of CROSS_MODULE_FILES) {
      const filePath = path.join(DATA_PATH, fileName);
      const data = await readJsonFile(filePath);

      if (data.workflow_id === workflowId ||
          (data.workflow_name && data.workflow_name.toLowerCase().replace(/\s+/g, '_') === workflowId)) {
        workflowFile = fileName;
        existingWorkflow = data;
        break;
      }
    }

    if (!workflowFile) {
      return res.status(404).json({
        error: 'Cross-module workflow not found',
        workflowId: workflowId
      });
    }

    // Create backup before deleting
    const backupName = `deleted_${workflowFile}_${Date.now()}.json`;
    const backupPath = path.join(__dirname, '../backups', backupName);
    const filePath = path.join(DATA_PATH, workflowFile);

    await require('fs-extra').copy(filePath, backupPath);
    await require('fs-extra').remove(filePath);

    // Remove from list
    const index = CROSS_MODULE_FILES.indexOf(workflowFile);
    if (index > -1) {
      CROSS_MODULE_FILES.splice(index, 1);
    }

    res.json({
      message: 'Cross-module workflow deleted successfully',
      deletedWorkflow: existingWorkflow,
      backup: backupPath
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cross-module/:workflowId/validate - Validate workflow references
router.get('/:workflowId/validate', async (req, res, next) => {
  try {
    const { workflowId } = req.params;
    const workflows = await getCrossModuleWorkflows();

    const workflow = workflows.find(w =>
      w.workflow_id === workflowId ||
      (w.workflow_name && w.workflow_name.toLowerCase().replace(/\s+/g, '_') === workflowId)
    );

    if (!workflow) {
      return res.status(404).json({
        error: 'Cross-module workflow not found',
        workflowId: workflowId
      });
    }

    // Validate all flow references
    const validationResults = [];
    const { getFlow } = require('../utils/fileUtils');

    for (const step of workflow.workflow_steps || []) {
      if (step.module_flow_reference) {
        try {
          const flow = await getFlow(step.module, step.module_flow_reference.flow_id);
          validationResults.push({
            step: step.step_id,
            module: step.module,
            flow_id: step.module_flow_reference.flow_id,
            valid: !!flow,
            found: flow ? {
              flow_name: flow.flow_name,
              description: flow.description
            } : null
          });
        } catch (error) {
          validationResults.push({
            step: step.step_id,
            module: step.module,
            flow_id: step.module_flow_reference.flow_id,
            valid: false,
            error: error.message
          });
        }
      }
    }

    const isValid = validationResults.every(r => r.valid);

    res.json({
      workflow_id: workflow.workflow_id,
      workflow_name: workflow.workflow_name,
      valid: isValid,
      validation: validationResults
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;