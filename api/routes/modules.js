const express = require('express');
const router = express.Router();
const { MODULE_FILES, getModuleFlows } = require('../utils/fileUtils');

// Module metadata
const MODULE_METADATA = {
  'advertise': {
    id: 'advertise',
    name: 'Advertise',
    description: 'Social media advertising and campaign management',
    icon: 'megaphone',
    color: '#FF6B6B'
  },
  'audience': {
    id: 'audience',
    name: 'Audience',
    description: 'Audience analysis and segmentation features',
    icon: 'users',
    color: '#4ECDC4'
  },
  'benchmark': {
    id: 'benchmark',
    name: 'Benchmark',
    description: 'Competitive benchmarking tools',
    icon: 'chart-bar',
    color: '#45B7D1'
  },
  'consumer_research': {
    id: 'consumer_research',
    name: 'Consumer Research',
    description: 'Digital consumer intelligence and search capabilities',
    icon: 'search',
    color: '#96CEB4'
  },
  'engage': {
    id: 'engage',
    name: 'Engage',
    description: 'Social media engagement and community management',
    icon: 'message-circle',
    color: '#FFEAA7'
  },
  'influence': {
    id: 'influence',
    name: 'Influence',
    description: 'Influencer identification and tracking',
    icon: 'star',
    color: '#DDA0DD'
  },
  'listen': {
    id: 'listen',
    name: 'Listen',
    description: 'Social listening and monitoring capabilities',
    icon: 'headphones',
    color: '#98D8C8'
  },
  'measure': {
    id: 'measure',
    name: 'Measure',
    description: 'Performance measurement and analytics dashboards',
    icon: 'pie-chart',
    color: '#FFD93D'
  },
  'publish': {
    id: 'publish',
    name: 'Publish',
    description: 'Content publishing and scheduling',
    icon: 'send',
    color: '#A8E6CF'
  },
  'reviews': {
    id: 'reviews',
    name: 'Brandwatch Reviews',
    description: 'Review management and analysis',
    icon: 'star-half',
    color: '#FFB6C1'
  },
  'vizia': {
    id: 'vizia',
    name: 'VIZIA',
    description: 'Data visualization and command center features',
    icon: 'tv',
    color: '#C7CEEA'
  }
};

// GET /api/modules - List all modules
router.get('/', async (req, res, next) => {
  try {
    const modules = [];

    for (const [moduleId, metadata] of Object.entries(MODULE_METADATA)) {
      try {
        const flows = await getModuleFlows(moduleId);
        modules.push({
          ...metadata,
          flowCount: flows.length
        });
      } catch (error) {
        // Module file might not exist
        modules.push({
          ...metadata,
          flowCount: 0,
          error: 'Unable to load flows'
        });
      }
    }

    res.json({
      count: modules.length,
      modules: modules
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/modules/:moduleId - Get module details
router.get('/:moduleId', async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const metadata = MODULE_METADATA[moduleId];
    if (!metadata) {
      return res.status(404).json({
        error: 'Module not found',
        moduleId: moduleId
      });
    }

    const flows = await getModuleFlows(moduleId);

    // Group flows by category
    const flowsByCategory = {};
    for (const flow of flows) {
      const category = flow.flowCategory || 'Other';
      if (!flowsByCategory[category]) {
        flowsByCategory[category] = {
          name: category,
          description: flow.categoryDescription || '',
          flows: []
        };
      }
      flowsByCategory[category].flows.push({
        flow_id: flow.flow_id,
        flow_name: flow.flow_name,
        description: flow.description,
        isPrerequisite: flow.isPrerequisite || false,
        dependencies: flow.dependencies || [],
        source_documents: (flow.source_documents || []).length
      });
    }

    res.json({
      module: {
        ...metadata,
        flowCount: flows.length,
        categories: Object.values(flowsByCategory)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/modules/:moduleId/stats - Get module statistics
router.get('/:moduleId/stats', async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const metadata = MODULE_METADATA[moduleId];
    if (!metadata) {
      return res.status(404).json({
        error: 'Module not found',
        moduleId: moduleId
      });
    }

    const flows = await getModuleFlows(moduleId);

    // Calculate statistics
    const stats = {
      totalFlows: flows.length,
      totalSteps: 0,
      averageStepsPerFlow: 0,
      prerequisiteFlows: 0,
      flowsWithDependencies: 0,
      flowsWithDocumentation: 0,
      categories: {},
      recentlyUpdated: []
    };

    for (const flow of flows) {
      // Count steps
      if (flow.steps) {
        stats.totalSteps += flow.steps.length;
      }

      // Count prerequisites
      if (flow.isPrerequisite) {
        stats.prerequisiteFlows++;
      }

      // Count dependencies
      if (flow.dependencies && flow.dependencies.length > 0) {
        stats.flowsWithDependencies++;
      }

      // Count documentation
      if (flow.source_documents && flow.source_documents.length > 0) {
        stats.flowsWithDocumentation++;
      }

      // Count by category
      const category = flow.flowCategory || 'Other';
      stats.categories[category] = (stats.categories[category] || 0) + 1;

      // Track recently updated
      if (flow.updated_at) {
        stats.recentlyUpdated.push({
          flow_id: flow.flow_id,
          flow_name: flow.flow_name,
          updated_at: flow.updated_at
        });
      }
    }

    // Calculate average
    stats.averageStepsPerFlow = stats.totalFlows > 0
      ? Math.round(stats.totalSteps / stats.totalFlows * 10) / 10
      : 0;

    // Sort recently updated
    stats.recentlyUpdated.sort((a, b) =>
      new Date(b.updated_at) - new Date(a.updated_at)
    );
    stats.recentlyUpdated = stats.recentlyUpdated.slice(0, 5);

    res.json({
      module: metadata,
      statistics: stats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;