const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// Base path to data files
const DATA_PATH = path.join(__dirname, '../../public/data');
const BACKUP_PATH = path.join(__dirname, '../backups');

// Ensure backup directory exists
fs.ensureDirSync(BACKUP_PATH);

// Module mapping
const MODULE_FILES = {
  'advertise': 'advertise_user_flows_with_citations.json',
  'audience': 'audience_user_flows_with_citations.json',
  'benchmark': 'benchmark_user_flows_with_citations.json',
  'consumer_research': 'consumer_research_user_flows_with_citations.json',
  'engage': 'engage_user_flows_with_citations.json',
  'influence': 'influence_user_flows_with_citations.json',
  'listen': 'listen_user_flows_with_citations.json',
  'measure': 'measure_user_flows_with_citations.json',
  'publish': 'publish_user_flows_with_citations.json',
  'reviews': 'reviews_user_flows_with_citations.json',
  'vizia': 'vizia_user_flows_with_citations.json'
};

const CROSS_MODULE_FILES = [
  'cross_module_crisis_management.json',
  'cross_module_content_strategy.json',
  'cross_module_influencer_campaign.json'
];

// Read JSON file
async function readJsonFile(filePath) {
  try {
    const data = await fs.readJson(filePath);
    return data;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

// Write JSON file with backup
async function writeJsonFile(filePath, data) {
  try {
    // Create backup first
    const backupName = `${path.basename(filePath, '.json')}_${Date.now()}.json`;
    const backupPath = path.join(BACKUP_PATH, backupName);

    // If file exists, back it up
    if (await fs.pathExists(filePath)) {
      await fs.copy(filePath, backupPath);
    }

    // Write new data
    await fs.writeJson(filePath, data, { spaces: 2 });

    return { success: true, backup: backupPath };
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}

// Get all flows for a module
async function getModuleFlows(moduleId) {
  const fileName = MODULE_FILES[moduleId];
  if (!fileName) {
    throw new Error(`Invalid module: ${moduleId}`);
  }

  const filePath = path.join(DATA_PATH, fileName);
  const data = await readJsonFile(filePath);

  // Extract flows from different possible structures
  if (data.user_flows) return data.user_flows;
  if (data.flows) return data.flows;
  if (Array.isArray(data)) return data;

  // Check for nested structure
  for (const key of Object.keys(data)) {
    if (data[key].user_flows) return data[key].user_flows;
    if (data[key].flows) return data[key].flows;
  }

  return [];
}

// Get a specific flow
async function getFlow(moduleId, flowId) {
  const flows = await getModuleFlows(moduleId);
  return flows.find(f =>
    f.flow_id === flowId ||
    f.id === flowId ||
    (f.flow_name && f.flow_name.toLowerCase().replace(/\s+/g, '_') === flowId)
  );
}

// Update flows for a module
async function updateModuleFlows(moduleId, flows) {
  const fileName = MODULE_FILES[moduleId];
  if (!fileName) {
    throw new Error(`Invalid module: ${moduleId}`);
  }

  const filePath = path.join(DATA_PATH, fileName);
  const currentData = await readJsonFile(filePath);

  // Maintain the original structure
  let updatedData = { ...currentData };

  if (currentData.user_flows !== undefined) {
    updatedData.user_flows = flows;
  } else if (currentData.flows !== undefined) {
    updatedData.flows = flows;
  } else if (Array.isArray(currentData)) {
    updatedData = flows;
  } else {
    // Handle nested structure
    for (const key of Object.keys(currentData)) {
      if (currentData[key].user_flows !== undefined) {
        updatedData[key].user_flows = flows;
        break;
      } else if (currentData[key].flows !== undefined) {
        updatedData[key].flows = flows;
        break;
      }
    }
  }

  return await writeJsonFile(filePath, updatedData);
}

// Search across all flows
async function searchFlows(query, options = {}) {
  const results = [];
  const searchTerm = query.toLowerCase();

  // Search in module flows
  for (const [moduleId, fileName] of Object.entries(MODULE_FILES)) {
    if (options.module && options.module !== moduleId) continue;

    try {
      const flows = await getModuleFlows(moduleId);

      for (const flow of flows) {
        let match = false;
        let matchedFields = [];

        // Search in flow name
        if (flow.flow_name && flow.flow_name.toLowerCase().includes(searchTerm)) {
          match = true;
          matchedFields.push('flow_name');
        }

        // Search in description
        if (flow.description && flow.description.toLowerCase().includes(searchTerm)) {
          match = true;
          matchedFields.push('description');
        }

        // Search in steps
        if (flow.steps && Array.isArray(flow.steps)) {
          for (const step of flow.steps) {
            if (typeof step === 'string' && step.toLowerCase().includes(searchTerm)) {
              match = true;
              matchedFields.push('steps');
              break;
            } else if (step.description && step.description.toLowerCase().includes(searchTerm)) {
              match = true;
              matchedFields.push('steps');
              break;
            }
          }
        }

        if (match) {
          results.push({
            module: moduleId,
            flow: flow,
            matchedFields: matchedFields,
            score: matchedFields.includes('flow_name') ? 2 : 1
          });
        }
      }
    } catch (error) {
      console.error(`Error searching in module ${moduleId}:`, error);
    }
  }

  // Sort by relevance score
  results.sort((a, b) => b.score - a.score);

  return results;
}

// Get all cross-module workflows
async function getCrossModuleWorkflows() {
  const workflows = [];

  for (const fileName of CROSS_MODULE_FILES) {
    try {
      const filePath = path.join(DATA_PATH, fileName);
      const data = await readJsonFile(filePath);
      workflows.push(data);
    } catch (error) {
      console.error(`Error reading cross-module file ${fileName}:`, error);
    }
  }

  return workflows;
}

// Generate new flow ID
function generateFlowId(modulePrefix) {
  const prefixMap = {
    'advertise': 'ADV',
    'audience': 'AUD',
    'benchmark': 'BEN',
    'consumer_research': 'CR',
    'engage': 'ENG',
    'influence': 'INF',
    'listen': 'LST',
    'measure': 'MEA',
    'publish': 'PUB',
    'reviews': 'REV',
    'vizia': 'VIZ'
  };

  const prefix = prefixMap[modulePrefix] || 'FLW';
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}_${timestamp}`;
}

module.exports = {
  readJsonFile,
  writeJsonFile,
  getModuleFlows,
  getFlow,
  updateModuleFlows,
  searchFlows,
  getCrossModuleWorkflows,
  generateFlowId,
  DATA_PATH,
  MODULE_FILES,
  CROSS_MODULE_FILES
};