#!/usr/bin/env node

const API_BASE = 'http://localhost:3001/api';

// Helper function for making API calls
async function apiCall(method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();

    return {
      status: response.status,
      ok: response.ok,
      data: result
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Test suite
async function runTests() {
  console.log('🧪 Testing Brandwatch API Endpoints\n');
  console.log('=' .repeat(50));

  // Test 1: Health Check
  console.log('\n📋 Test 1: Health Check');
  const health = await apiCall('GET', '/health');
  console.log(`   Status: ${health.status} ${health.ok ? '✅' : '❌'}`);
  console.log(`   Response:`, health.data);

  // Test 2: List all modules
  console.log('\n📋 Test 2: List All Modules');
  const modules = await apiCall('GET', '/modules');
  console.log(`   Status: ${modules.status} ${modules.ok ? '✅' : '❌'}`);
  console.log(`   Found ${modules.data.count} modules`);
  if (modules.data.modules) {
    modules.data.modules.slice(0, 3).forEach(m => {
      console.log(`   - ${m.name}: ${m.flowCount} flows`);
    });
  }

  // Test 3: Get specific module details
  console.log('\n📋 Test 3: Get Module Details (Listen)');
  const listenModule = await apiCall('GET', '/modules/listen');
  console.log(`   Status: ${listenModule.status} ${listenModule.ok ? '✅' : '❌'}`);
  if (listenModule.data.module) {
    console.log(`   Module: ${listenModule.data.module.name}`);
    console.log(`   Flows: ${listenModule.data.module.flowCount}`);
    console.log(`   Categories: ${Object.keys(listenModule.data.module.categories || {}).length}`);
  }

  // Test 4: Get all flows for a module
  console.log('\n📋 Test 4: Get Flows for Listen Module');
  const listenFlows = await apiCall('GET', '/flows/listen');
  console.log(`   Status: ${listenFlows.status} ${listenFlows.ok ? '✅' : '❌'}`);
  console.log(`   Total flows: ${listenFlows.data.count}`);
  if (listenFlows.data.flows && listenFlows.data.flows.length > 0) {
    const firstFlow = listenFlows.data.flows[0];
    console.log(`   First flow: ${firstFlow.flow_name} (${firstFlow.flow_id})`);
  }

  // Test 5: Get specific flow
  console.log('\n📋 Test 5: Get Specific Flow');
  const specificFlow = await apiCall('GET', '/flows/listen/flow_001');
  console.log(`   Status: ${specificFlow.status} ${specificFlow.ok ? '✅' : '❌'}`);
  if (specificFlow.data.flow) {
    console.log(`   Flow: ${specificFlow.data.flow.flow_name}`);
    console.log(`   Steps: ${specificFlow.data.flow.steps ? specificFlow.data.flow.steps.length : 0}`);
  }

  // Test 6: Search flows
  console.log('\n📋 Test 6: Search Flows');
  const searchResults = await apiCall('GET', '/search?q=alert');
  console.log(`   Status: ${searchResults.status} ${searchResults.ok ? '✅' : '❌'}`);
  console.log(`   Results found: ${searchResults.data.total}`);
  if (searchResults.data.results && searchResults.data.results.length > 0) {
    const firstResult = searchResults.data.results[0];
    console.log(`   First match: ${firstResult.flow.flow_name} in ${firstResult.module}`);
    console.log(`   Matched fields: ${firstResult.matchedFields.join(', ')}`);
  }

  // Test 7: Get cross-module workflows
  console.log('\n📋 Test 7: Get Cross-Module Workflows');
  const crossModule = await apiCall('GET', '/cross-module');
  console.log(`   Status: ${crossModule.status} ${crossModule.ok ? '✅' : '❌'}`);
  console.log(`   Workflows found: ${crossModule.data.count}`);
  if (crossModule.data.workflows && crossModule.data.workflows.length > 0) {
    crossModule.data.workflows.forEach(w => {
      console.log(`   - ${w.workflow_name}: ${w.modules_involved.join(', ')}`);
    });
  }

  // Test 8: Create a new test flow
  console.log('\n📋 Test 8: Create New Flow');
  const newFlow = {
    flow_name: 'API Test Flow',
    description: 'Test flow created via API',
    flowCategory: 'Testing',
    steps: [
      'Step 1: Initialize test',
      'Step 2: Execute test',
      'Step 3: Verify results'
    ],
    source_documents: ['Test Document 1', 'Test Document 2']
  };

  const createResult = await apiCall('POST', '/flows/listen', newFlow);
  console.log(`   Status: ${createResult.status} ${createResult.ok ? '✅' : '❌'}`);
  if (createResult.data.flow) {
    console.log(`   Created flow: ${createResult.data.flow.flow_name}`);
    console.log(`   Flow ID: ${createResult.data.flow.flow_id}`);

    // Store the flow ID for update and delete tests
    const testFlowId = createResult.data.flow.flow_id;

    // Test 9: Update the flow
    console.log('\n📋 Test 9: Update Flow');
    const updateData = {
      ...newFlow,
      flow_name: 'Updated API Test Flow',
      description: 'Updated test flow via API',
      steps: [
        ...newFlow.steps,
        'Step 4: Additional verification'
      ]
    };

    const updateResult = await apiCall('PUT', `/flows/listen/${testFlowId}`, updateData);
    console.log(`   Status: ${updateResult.status} ${updateResult.ok ? '✅' : '❌'}`);
    if (updateResult.data.flow) {
      console.log(`   Updated flow: ${updateResult.data.flow.flow_name}`);
      console.log(`   Version: ${updateResult.data.flow.version}`);
    }

    // Test 10: Delete the test flow
    console.log('\n📋 Test 10: Delete Flow');
    const deleteResult = await apiCall('DELETE', `/flows/listen/${testFlowId}`);
    console.log(`   Status: ${deleteResult.status} ${deleteResult.ok ? '✅' : '❌'}`);
    if (deleteResult.data.deletedFlow) {
      console.log(`   Deleted flow: ${deleteResult.data.deletedFlow.flow_name}`);
    }
  }

  // Test 11: Module statistics
  console.log('\n📋 Test 11: Module Statistics');
  const stats = await apiCall('GET', '/modules/listen/stats');
  console.log(`   Status: ${stats.status} ${stats.ok ? '✅' : '❌'}`);
  if (stats.data.statistics) {
    console.log(`   Total flows: ${stats.data.statistics.totalFlows}`);
    console.log(`   Total steps: ${stats.data.statistics.totalSteps}`);
    console.log(`   Avg steps/flow: ${stats.data.statistics.averageStepsPerFlow}`);
    console.log(`   Prerequisite flows: ${stats.data.statistics.prerequisiteFlows}`);
  }

  // Test 12: Advanced search
  console.log('\n📋 Test 12: Advanced Search');
  const advancedSearch = await apiCall('POST', '/search/advanced', {
    query: 'data',
    modules: ['listen', 'measure'],
    hasDocumentation: true,
    limit: 5
  });
  console.log(`   Status: ${advancedSearch.status} ${advancedSearch.ok ? '✅' : '❌'}`);
  console.log(`   Results found: ${advancedSearch.data.total}`);

  // Test 13: Validate cross-module workflow
  console.log('\n📋 Test 13: Validate Cross-Module Workflow');
  const validation = await apiCall('GET', '/cross-module/crisis_management/validate');
  console.log(`   Status: ${validation.status} ${validation.ok ? '✅' : '❌'}`);
  if (validation.data) {
    console.log(`   Workflow valid: ${validation.data.valid ? '✅' : '❌'}`);
    if (validation.data.validation) {
      const validCount = validation.data.validation.filter(v => v.valid).length;
      console.log(`   Valid references: ${validCount}/${validation.data.validation.length}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✨ API Testing Complete!\n');
}

// Run tests
runTests().catch(console.error);