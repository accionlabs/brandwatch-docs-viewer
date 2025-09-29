// Flow ordering and dependency management

// Define the logical order and dependencies for flows within each module
const FLOW_ORDERING = {
  listen: {
    categories: [
      {
        name: "Getting Started",
        description: "Basic setup and search creation",
        flows: ["flow_001", "flow_009", "flow_002", "flow_003"]
      },
      {
        name: "Data Sources Setup",
        description: "Configure content sources and authentication",
        flows: ["flow_004", "flow_012"]
      },
      {
        name: "Data Interaction",
        description: "View, filter, and analyze data",
        flows: ["flow_007", "flow_006", "flow_010", "flow_015"]
      },
      {
        name: "Comparison & Analysis",
        description: "Compare and analyze multiple sources",
        flows: ["flow_011"]
      },
      {
        name: "Export & Sharing",
        description: "Export data and share reports",
        flows: ["flow_008", "flow_013", "flow_014"]
      },
      {
        name: "Alerts & Automation",
        description: "Set up automated notifications",
        flows: ["flow_005"]
      }
    ],
    dependencies: {
      "flow_002": ["flow_001"], // Save search depends on creating search
      "flow_003": ["flow_001"], // Advanced queries depends on basic search
      "flow_005": ["flow_002"], // Email alerts require saved search
      "flow_006": ["flow_001"], // Filtering requires a search
      "flow_007": ["flow_001"], // Viewing mentions requires a search
      "flow_008": ["flow_007"], // Exporting requires viewing mentions
      "flow_010": ["flow_007"], // Tagging requires viewing mentions
      "flow_011": ["flow_004"], // Comparing sources requires setting them up
      "flow_013": ["flow_007"], // Sharing reports requires having data
      "flow_014": ["flow_013"], // Scheduling reports builds on sharing
      "flow_015": ["flow_001"], // Panels require basic search knowledge
    }
  },

  measure: {
    categories: [
      {
        name: "Getting Started",
        description: "Dashboard setup and basics",
        flows: ["flow_1", "flow_10"]
      },
      {
        name: "Widget Management",
        description: "Create and configure widgets",
        flows: ["flow_2", "flow_3", "flow_4", "flow_5"]
      },
      {
        name: "Data & Filters",
        description: "Configure data and filters",
        flows: ["flow_6", "flow_7"]
      },
      {
        name: "Export & Sharing",
        description: "Export and share dashboards",
        flows: ["flow_8", "flow_9"]
      }
    ],
    dependencies: {
      "flow_2": ["flow_1"],
      "flow_3": ["flow_2"],
      "flow_4": ["flow_2"],
      "flow_5": ["flow_2"],
      "flow_6": ["flow_1"],
      "flow_7": ["flow_6"],
      "flow_8": ["flow_1"],
      "flow_9": ["flow_8"],
      "flow_10": ["flow_1"]
    }
  },

  publish: {
    categories: [
      {
        name: "Content Creation",
        description: "Create and compose posts",
        flows: ["BW_PUB_001", "BW_PUB_002", "BW_PUB_003", "BW_PUB_004"]
      },
      {
        name: "Scheduling & Publishing",
        description: "Schedule and publish content",
        flows: ["BW_PUB_005", "BW_PUB_006", "BW_PUB_007", "BW_PUB_008"]
      },
      {
        name: "Calendar Management",
        description: "Manage content calendar",
        flows: ["BW_PUB_009", "BW_PUB_010", "BW_PUB_011"]
      },
      {
        name: "Collaboration",
        description: "Team collaboration features",
        flows: ["BW_PUB_012", "BW_PUB_013", "BW_PUB_014", "BW_PUB_015"]
      },
      {
        name: "Analytics & Optimization",
        description: "Track performance and optimize",
        flows: ["BW_PUB_016", "BW_PUB_017", "BW_PUB_018"]
      },
      {
        name: "Advanced Features",
        description: "Labels, campaigns, and bulk actions",
        flows: ["BW_PUB_019", "BW_PUB_020", "BW_PUB_021", "BW_PUB_022"]
      },
      {
        name: "Settings & Configuration",
        description: "Configure Publish settings",
        flows: ["BW_PUB_023", "BW_PUB_024", "BW_PUB_025"]
      }
    ],
    dependencies: {
      "BW_PUB_002": ["BW_PUB_001"],
      "BW_PUB_003": ["BW_PUB_001"],
      "BW_PUB_004": ["BW_PUB_001"],
      "BW_PUB_005": ["BW_PUB_001"],
      "BW_PUB_006": ["BW_PUB_005"],
      "BW_PUB_007": ["BW_PUB_005"],
      "BW_PUB_008": ["BW_PUB_001"],
      "BW_PUB_009": ["BW_PUB_005"],
      "BW_PUB_010": ["BW_PUB_009"],
      "BW_PUB_011": ["BW_PUB_009"],
      "BW_PUB_012": ["BW_PUB_001"],
      "BW_PUB_013": ["BW_PUB_012"],
      "BW_PUB_014": ["BW_PUB_012"],
      "BW_PUB_015": ["BW_PUB_001"],
      "BW_PUB_016": ["BW_PUB_008"],
      "BW_PUB_017": ["BW_PUB_016"],
      "BW_PUB_018": ["BW_PUB_005"],
      "BW_PUB_019": ["BW_PUB_001"],
      "BW_PUB_020": ["BW_PUB_019"],
      "BW_PUB_021": ["BW_PUB_001"],
      "BW_PUB_022": ["BW_PUB_021"],
      "BW_PUB_023": ["BW_PUB_001"],
      "BW_PUB_024": ["BW_PUB_023"],
      "BW_PUB_025": ["BW_PUB_001"]
    }
  },

  engage: {
    categories: [
      {
        name: "Feed Management",
        description: "View and manage social feeds",
        flows: ["FEED_001", "FEED_002", "SEARCH_001"]
      },
      {
        name: "Engagement Actions",
        description: "Respond to and engage with content",
        flows: ["MSG_001", "DM_001", "SENTIMENT_001", "LABEL_001"]
      },
      {
        name: "Templates & Automation",
        description: "Create templates and automate responses",
        flows: ["TEMP_001", "AUTO_001", "AUTO_002"]
      },
      {
        name: "Case Management",
        description: "Manage customer cases",
        flows: ["CASE_001", "CASE_002"]
      },
      {
        name: "Team Collaboration",
        description: "Work with team members",
        flows: ["TEAM_001", "TEAM_002"]
      },
      {
        name: "Bulk Operations",
        description: "Perform bulk actions",
        flows: ["BULK_001", "BULK_002", "MOD_001"]
      },
      {
        name: "Reporting & Export",
        description: "Generate reports and export data",
        flows: ["REPORT_001", "EXPORT_001"]
      },
      {
        name: "Mobile & Integrations",
        description: "Mobile app and integrations",
        flows: ["MOBILE_001", "INTEGRATION_001", "NOTIFICATION_001", "PROFILE_001"]
      }
    ],
    dependencies: {
      "FEED_002": ["FEED_001"],
      "MSG_001": ["FEED_001"],
      "DM_001": ["FEED_001"],
      "TEMP_001": ["MSG_001"],
      "AUTO_001": ["TEMP_001"],
      "AUTO_002": ["AUTO_001"],
      "CASE_001": ["MSG_001"],
      "CASE_002": ["CASE_001"],
      "TEAM_001": ["FEED_001"],
      "TEAM_002": ["TEAM_001"],
      "BULK_001": ["FEED_001"],
      "BULK_002": ["BULK_001"],
      "MOD_001": ["FEED_001"],
      "SEARCH_001": ["FEED_001"],
      "LABEL_001": ["FEED_001"],
      "SENTIMENT_001": ["MSG_001"],
      "PROFILE_001": ["FEED_001"],
      "INTEGRATION_001": ["FEED_001"],
      "NOTIFICATION_001": ["FEED_001"],
      "EXPORT_001": ["FEED_001"],
      "REPORT_001": ["FEED_001"],
      "MOBILE_001": ["FEED_001"]
    }
  }
};

// Module display order (logical workflow progression)
const MODULE_ORDER = [
  // Discovery & Monitoring
  "listen",           // Start with listening to understand the landscape
  "consumer_research", // Deep dive into consumer insights

  // Analysis & Measurement
  "measure",          // Measure and analyze data
  "benchmark",        // Compare against competitors

  // Content & Engagement
  "publish",          // Create and publish content
  "engage",           // Engage with audience
  "reviews",          // Manage reviews

  // Marketing & Growth
  "advertise",        // Run ad campaigns
  "influence",        // Influencer marketing

  // Advanced Analytics
  "audience",         // Audience segmentation
  "vizia"            // Command center visualization
];

/**
 * Sort flows within a module based on categories and dependencies
 */
function sortFlowsForModule(flows, moduleId) {
  const moduleConfig = FLOW_ORDERING[moduleId];

  if (!moduleConfig) {
    // No ordering defined, return as-is
    return flows;
  }

  const flowMap = new Map(flows.map(f => [f.id || f.flow_id, f]));
  const sortedFlows = [];
  const addedFlows = new Set();

  // Process each category in order
  moduleConfig.categories.forEach(category => {
    category.flows.forEach(flowId => {
      if (flowMap.has(flowId) && !addedFlows.has(flowId)) {
        const flow = flowMap.get(flowId);
        // Add category info to flow
        flow.flowCategory = category.name;
        flow.categoryDescription = category.description;

        // Add dependency info
        const deps = moduleConfig.dependencies[flowId] || [];
        flow.dependencies = deps;
        flow.isPrerequisite = deps.length === 0;

        sortedFlows.push(flow);
        addedFlows.add(flowId);
      }
    });
  });

  // Add any remaining flows not in categories
  flows.forEach(flow => {
    const flowId = flow.id || flow.flow_id;
    if (!addedFlows.has(flowId)) {
      flow.flowCategory = "Other";
      flow.categoryDescription = "Additional flows";
      sortedFlows.push(flow);
    }
  });

  return sortedFlows;
}

/**
 * Get display metadata for a module
 */
function getModuleMetadata(moduleId) {
  const metadata = {
    listen: {
      order: 1,
      group: "Discovery & Monitoring",
      description: "Monitor social conversations and track mentions"
    },
    consumer_research: {
      order: 2,
      group: "Discovery & Monitoring",
      description: "Analyze consumer behavior and insights"
    },
    measure: {
      order: 3,
      group: "Analysis & Measurement",
      description: "Create dashboards and measure performance"
    },
    benchmark: {
      order: 4,
      group: "Analysis & Measurement",
      description: "Compare performance against competitors"
    },
    publish: {
      order: 5,
      group: "Content & Engagement",
      description: "Plan, create, and publish content"
    },
    engage: {
      order: 6,
      group: "Content & Engagement",
      description: "Manage social interactions and responses"
    },
    reviews: {
      order: 7,
      group: "Content & Engagement",
      description: "Monitor and respond to reviews"
    },
    advertise: {
      order: 8,
      group: "Marketing & Growth",
      description: "Create and manage ad campaigns"
    },
    influence: {
      order: 9,
      group: "Marketing & Growth",
      description: "Identify and work with influencers"
    },
    audience: {
      order: 10,
      group: "Advanced Analytics",
      description: "Segment and analyze audiences"
    },
    vizia: {
      order: 11,
      group: "Advanced Analytics",
      description: "Visualize data in command center"
    }
  };

  return metadata[moduleId] || {
    order: 99,
    group: "Other",
    description: ""
  };
}

/**
 * Sort modules in logical order
 */
function sortModules(modules) {
  return modules.sort((a, b) => {
    const aOrder = getModuleMetadata(a.id).order;
    const bOrder = getModuleMetadata(b.id).order;
    return aOrder - bOrder;
  });
}

export {
  sortFlowsForModule,
  sortModules,
  getModuleMetadata,
  FLOW_ORDERING,
  MODULE_ORDER
};