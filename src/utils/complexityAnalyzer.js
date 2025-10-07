// Complexity Analyzer for Brandwatch UI Workflows
// This analyzes the complexity of user workflows to demonstrate the need for AI simplification

class ComplexityAnalyzer {
  constructor() {
    this.modules = [
      'advertise',
      'audience',
      'benchmark',
      'consumer_research',
      'engage',
      'influence',
      'listen',
      'measure',
      'publish',
      'brandwatch_reviews',
      'vizia'
    ];
  }

  // Load all module data
  async loadAllModuleData() {
    const allData = {};

    for (const module of this.modules) {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/${module}_user_flows_with_citations.json`);
        if (response.ok) {
          const data = await response.json();
          allData[module] = this.normalizeModuleData(data);
        }
      } catch (error) {
        console.error(`Error loading ${module}:`, error);
      }
    }

    return allData;
  }

  // Normalize data structure across different modules
  normalizeModuleData(data) {
    let flows = [];
    let moduleName = 'Unknown';

    // Handle different data structures
    if (data.user_flows) {
      flows = data.user_flows;
      moduleName = data.module || data.product || 'Unknown';
    } else if (data.workflows) {
      flows = data.workflows;
      moduleName = data.module || data.product || 'Unknown';
    } else {
      // Check for nested structure (like brandwatch_publish_user_flows)
      const key = Object.keys(data).find(k =>
        k.includes('user_flows') || k.includes('workflows')
      );
      if (key && data[key]) {
        const nestedData = data[key];
        // The nested structure might have user_flows, workflows, or flows inside it
        if (nestedData.user_flows) {
          flows = nestedData.user_flows;
          moduleName = nestedData.module || nestedData.product || key.replace(/_user_flows|_workflows/, '').replace(/_/g, ' ');
        } else if (nestedData.workflows) {
          flows = nestedData.workflows;
          moduleName = nestedData.module || nestedData.product || key.replace(/_user_flows|_workflows/, '').replace(/_/g, ' ');
        } else if (nestedData.flows) {
          // Handle 'flows' key (like in publish and measure)
          flows = nestedData.flows;
          moduleName = nestedData.metadata?.module || nestedData.module || key.replace(/_user_flows|_workflows/, '').replace(/_/g, ' ');
        } else if (Array.isArray(nestedData)) {
          // Sometimes the nested key directly contains the array of flows
          flows = nestedData;
          moduleName = key.replace(/_user_flows|_workflows/, '').replace(/_/g, ' ');
        }
      }
    }

    return {
      module: moduleName,
      flows: flows.map(flow => ({
        name: flow.flow_name || flow.name || 'Unnamed Flow',
        steps: flow.steps || [],
        source_documents: flow.source_documents || []
      }))
    };
  }

  // Calculate complexity metrics for a single flow
  analyzeFlow(flow) {
    const steps = flow.steps || [];
    let totalSteps = 0;
    let decisionPoints = 0;
    let maxDepth = 0;
    let userActions = 0;
    let systemActions = 0;
    let loops = 0;
    let branches = 0;

    const analyzeStep = (step, depth = 0) => {
      totalSteps++;
      maxDepth = Math.max(maxDepth, depth);

      // Count user vs system actions
      if (step.description?.toLowerCase().includes('user') ||
          step.description?.toLowerCase().includes('click') ||
          step.description?.toLowerCase().includes('select') ||
          step.description?.toLowerCase().includes('enter') ||
          step.description?.toLowerCase().includes('upload')) {
        userActions++;
      } else {
        systemActions++;
      }

      // Check for decision points
      if (step.type === 'decision' || step.description?.includes('?')) {
        decisionPoints++;
      }

      // Check for loops
      if (step.description?.toLowerCase().includes('repeat') ||
          step.description?.toLowerCase().includes('loop')) {
        loops++;
      }

      // Analyze sub-steps
      if (step.options) {
        branches += step.options.length;
        step.options.forEach(option => {
          if (option.next_steps) {
            option.next_steps.forEach(subStep =>
              analyzeStep(subStep, depth + 1)
            );
          }
        });
      }

      if (step.next_steps) {
        step.next_steps.forEach(subStep =>
          analyzeStep(subStep, depth + 1)
        );
      }
    };

    steps.forEach(step => analyzeStep(step));

    // Calculate complexity score (weighted formula)
    const complexityScore =
      (totalSteps * 1.0) +
      (decisionPoints * 2.0) +
      (maxDepth * 1.5) +
      (branches * 1.5) +
      (loops * 2.0);

    return {
      name: flow.name,
      totalSteps,
      userActions,
      systemActions,
      decisionPoints,
      maxDepth,
      branches,
      loops,
      complexityScore: Math.round(complexityScore),
      estimatedTime: Math.max(Math.round(userActions * 15), totalSteps * 10), // At least 10 seconds per step, 15 per user action
      sourceDocs: flow.source_documents?.length || 0
    };
  }

  // Analyze all modules
  async analyzeAllModules() {
    const moduleData = await this.loadAllModuleData();
    const analysis = {};

    Object.entries(moduleData).forEach(([moduleName, module]) => {
      const flowAnalyses = module.flows.map(flow => this.analyzeFlow(flow));

      analysis[moduleName] = {
        moduleName: module.module,
        totalFlows: flowAnalyses.length,
        flows: flowAnalyses,
        summary: this.calculateModuleSummary(flowAnalyses)
      };
    });

    return analysis;
  }

  // Calculate summary statistics for a module
  calculateModuleSummary(flowAnalyses) {
    if (flowAnalyses.length === 0) {
      return {
        avgComplexity: 0,
        maxComplexity: 0,
        minComplexity: 0,
        totalSteps: 0,
        avgStepsPerFlow: 0,
        totalUserActions: 0,
        totalDecisionPoints: 0,
        estimatedTotalTime: 0
      };
    }

    const complexities = flowAnalyses.map(f => f.complexityScore);
    const totalSteps = flowAnalyses.reduce((sum, f) => sum + f.totalSteps, 0);
    const totalUserActions = flowAnalyses.reduce((sum, f) => sum + f.userActions, 0);
    const totalDecisionPoints = flowAnalyses.reduce((sum, f) => sum + f.decisionPoints, 0);
    const estimatedTotalTime = flowAnalyses.reduce((sum, f) => sum + f.estimatedTime, 0);

    return {
      avgComplexity: Math.round(complexities.reduce((a, b) => a + b, 0) / complexities.length),
      maxComplexity: Math.max(...complexities),
      minComplexity: Math.min(...complexities),
      totalSteps,
      avgStepsPerFlow: Math.round(totalSteps / flowAnalyses.length),
      totalUserActions,
      totalDecisionPoints,
      estimatedTotalTime,
      mostComplexFlow: flowAnalyses.reduce((max, f) =>
        f.complexityScore > max.complexityScore ? f : max, flowAnalyses[0]
      ),
      leastComplexFlow: flowAnalyses.reduce((min, f) =>
        f.complexityScore < min.complexityScore ? f : min, flowAnalyses[0]
      )
    };
  }

  // Generate AI simplification scenarios
  generateAIScenarios(analysis) {
    const scenarios = [];

    Object.entries(analysis).forEach(([moduleName, moduleData]) => {
      moduleData.flows.forEach(flow => {
        if (flow.complexityScore > 15) { // Focus on complex flows
          scenarios.push({
            module: moduleName,
            workflow: flow.name,
            current: {
              steps: flow.totalSteps,
              userActions: flow.userActions,
              decisionPoints: flow.decisionPoints,
              estimatedTime: flow.estimatedTime
            },
            aiPowered: {
              steps: 1, // Single AI command
              userActions: 1, // One natural language input
              decisionPoints: 0, // AI handles all decisions
              estimatedTime: 30, // 30 seconds for AI processing
              example: this.generateAIExample(flow.name)
            },
            improvement: {
              stepsReduction: Math.round(((flow.totalSteps - 1) / flow.totalSteps) * 100),
              timeReduction: Math.round(((flow.estimatedTime - 30) / flow.estimatedTime) * 100),
              complexityReduction: Math.round(((flow.complexityScore - 5) / flow.complexityScore) * 100)
            }
          });
        }
      });
    });

    return scenarios;
  }

  // Generate example AI commands
  generateAIExample(flowName) {
    const examples = {
      'Create a Query': 'AI: "Monitor mentions of our brand with positive sentiment in tech news"',
      'Set Up Alert': 'AI: "Alert me when competitor launches a new product"',
      'Create Dashboard': 'AI: "Build a dashboard showing social media engagement trends"',
      'Export Data': 'AI: "Export last month\'s Twitter mentions to Excel"',
      'Schedule Post': 'AI: "Schedule our product announcement for next Tuesday at 2 PM on all channels"',
      'Generate Report': 'AI: "Create a weekly performance report for the marketing team"',
      'Analyze Sentiment': 'AI: "Show me sentiment trends for our latest campaign"',
      'Find Influencers': 'AI: "Find tech influencers with >10K followers who mentioned AI this week"'
    };

    // Try to match flow name to example
    for (const [key, value] of Object.entries(examples)) {
      if (flowName.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
        return value;
      }
    }

    // Default example
    return `AI: "Help me ${flowName.toLowerCase()}"`;
  }

  // Calculate overall statistics
  calculateOverallStats(analysis) {
    const modules = Object.values(analysis);
    const allFlows = modules.flatMap(m => m.flows);

    const totalFlows = allFlows.length;
    const totalSteps = allFlows.reduce((sum, f) => sum + f.totalSteps, 0);
    const totalUserActions = allFlows.reduce((sum, f) => sum + f.userActions, 0);
    const totalTime = allFlows.reduce((sum, f) => sum + f.estimatedTime, 0);
    const avgComplexity = Math.round(
      allFlows.reduce((sum, f) => sum + f.complexityScore, 0) / totalFlows
    );

    return {
      totalModules: modules.length,
      totalFlows,
      totalSteps,
      totalUserActions,
      avgStepsPerFlow: Math.round(totalSteps / totalFlows),
      avgComplexity,
      estimatedTotalTime: totalTime,
      estimatedTimeHours: Math.round(totalTime / 3600),
      potentialAIReduction: {
        steps: Math.round(((totalSteps - totalFlows) / totalSteps) * 100),
        time: Math.round(((totalTime - (totalFlows * 30)) / totalTime) * 100),
        userActions: Math.round(((totalUserActions - totalFlows) / totalUserActions) * 100)
      }
    };
  }
}

export default ComplexityAnalyzer;