const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');

// Update flow source documents
router.post('/', async (req, res) => {
  try {
    const { module, flowId, sourceDocs } = req.body;

    if (!module || !flowId) {
      return res.status(400).json({ error: 'Module and flowId are required' });
    }

    // Construct the path to the JSON file
    const moduleName = module.toLowerCase().replace(/\s+/g, '_');
    const jsonPath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'data',
      `${moduleName}_user_flows_with_citations.json`
    );

    // Read the current JSON file
    if (!await fs.pathExists(jsonPath)) {
      return res.status(404).json({ error: 'Module file not found' });
    }

    const jsonData = await fs.readJson(jsonPath);

    // Find and update the specific flow
    let flowFound = false;

    // Check if data has user_flows array
    if (jsonData.user_flows && Array.isArray(jsonData.user_flows)) {
      for (let flow of jsonData.user_flows) {
        if (flow.flow_name === flowId || flow.name === flowId) {
          flow.source_documents = sourceDocs;
          flowFound = true;
          break;
        }
      }
    }

    // Check for nested structure (some modules have different structure)
    const moduleKey = Object.keys(jsonData).find(key =>
      key.includes('user_flows') || key.includes('workflows')
    );

    if (!flowFound && moduleKey && jsonData[moduleKey]) {
      if (jsonData[moduleKey].user_flows) {
        for (let flow of jsonData[moduleKey].user_flows) {
          if (flow.flow_name === flowId || flow.name === flowId) {
            flow.source_documents = sourceDocs;
            flowFound = true;
            break;
          }
        }
      }
      if (jsonData[moduleKey].workflows) {
        for (let flow of jsonData[moduleKey].workflows) {
          if (flow.flow_name === flowId || flow.name === flowId) {
            flow.source_documents = sourceDocs;
            flowFound = true;
            break;
          }
        }
      }
    }

    if (!flowFound) {
      return res.status(404).json({ error: 'Flow not found in module' });
    }

    // Write the updated JSON back to file
    await fs.writeJson(jsonPath, jsonData, { spaces: 4 });

    // Also create a backup
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    await fs.ensureDir(backupDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${moduleName}_${timestamp}.json`);
    await fs.copy(jsonPath, backupPath);

    res.json({
      success: true,
      message: 'Source documents updated successfully',
      backup: backupPath
    });

  } catch (error) {
    console.error('Error updating flow:', error);
    res.status(500).json({
      error: 'Failed to update flow',
      details: error.message
    });
  }
});

module.exports = router;