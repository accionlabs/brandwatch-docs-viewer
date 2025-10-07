#!/usr/bin/env node

/**
 * Brandwatch Documentation MCP Server
 * Provides tools for querying and managing Brandwatch documentation flows
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const fs = require("fs").promises;
const path = require("path");

// Base path to data files
const DATA_PATH = path.join(__dirname, "../public/data");
const API_BASE = "http://localhost:3001/api";

// Module mapping
const MODULE_FILES = {
  advertise: "advertise_user_flows_with_citations.json",
  audience: "audience_user_flows_with_citations.json",
  benchmark: "benchmark_user_flows_with_citations.json",
  consumer_research: "consumer_research_user_flows_with_citations.json",
  engage: "engage_user_flows_with_citations.json",
  influence: "influence_user_flows_with_citations.json",
  listen: "listen_user_flows_with_citations.json",
  measure: "measure_user_flows_with_citations.json",
  publish: "publish_user_flows_with_citations.json",
  reviews: "reviews_user_flows_with_citations.json",
  vizia: "vizia_user_flows_with_citations.json",
};

const CROSS_MODULE_FILES = [
  "cross_module_crisis_management.json",
  "cross_module_content_strategy.json",
  "cross_module_influencer_campaign.json",
];

class BrandwatchMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "brandwatch-docs-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "search_flows",
          description:
            "Search for flows across all Brandwatch modules. Returns flows that match the search query.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search term to find in flow names, descriptions, or steps",
              },
              module: {
                type: "string",
                description:
                  "Optional: Filter by specific module (e.g., 'listen', 'measure', 'engage')",
              },
              limit: {
                type: "number",
                description: "Maximum number of results to return (default: 10)",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "get_flow",
          description:
            "Get detailed information about a specific flow in a module",
          inputSchema: {
            type: "object",
            properties: {
              module: {
                type: "string",
                description:
                  "Module name (e.g., 'listen', 'measure', 'engage')",
              },
              flow_id: {
                type: "string",
                description: "Flow ID (e.g., 'flow_001')",
              },
            },
            required: ["module", "flow_id"],
          },
        },
        {
          name: "list_flows",
          description: "List all flows for a specific module",
          inputSchema: {
            type: "object",
            properties: {
              module: {
                type: "string",
                description:
                  "Module name (e.g., 'listen', 'measure', 'engage')",
              },
              category: {
                type: "string",
                description:
                  "Optional: Filter by flow category",
              },
            },
            required: ["module"],
          },
        },
        {
          name: "get_cross_module_workflow",
          description: "Get a cross-module workflow by name",
          inputSchema: {
            type: "object",
            properties: {
              workflow_name: {
                type: "string",
                description:
                  "Workflow name: 'crisis_management', 'content_strategy', or 'influencer_campaign'",
              },
            },
            required: ["workflow_name"],
          },
        },
        {
          name: "find_flows_by_topic",
          description:
            "Find flows related to a specific topic or use case",
          inputSchema: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description:
                  "Topic to search for (e.g., 'alerts', 'dashboard', 'reporting', 'social media')",
              },
            },
            required: ["topic"],
          },
        },
        {
          name: "get_module_info",
          description:
            "Get information about a specific Brandwatch module",
          inputSchema: {
            type: "object",
            properties: {
              module: {
                type: "string",
                description:
                  "Module name (e.g., 'listen', 'measure', 'engage')",
              },
            },
            required: ["module"],
          },
        },
        {
          name: "list_all_modules",
          description:
            "List all available Brandwatch modules with their descriptions",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        const { name, arguments: args } = request.params;

        try {
          switch (name) {
            case "search_flows":
              return await this.searchFlows(args);
            case "get_flow":
              return await this.getFlow(args);
            case "list_flows":
              return await this.listFlows(args);
            case "get_cross_module_workflow":
              return await this.getCrossModuleWorkflow(args);
            case "find_flows_by_topic":
              return await this.findFlowsByTopic(args);
            case "get_module_info":
              return await this.getModuleInfo(args);
            case "list_all_modules":
              return await this.listAllModules();
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${error.message}`,
              },
            ],
          };
        }
      }
    );
  }

  // Tool implementations
  async searchFlows({ query, module, limit = 10 }) {
    try {
      const results = [];
      const searchTerm = query.toLowerCase();

      // Search in module flows
      for (const [moduleId, fileName] of Object.entries(MODULE_FILES)) {
        if (module && module !== moduleId) continue;

        const filePath = path.join(DATA_PATH, fileName);
        const data = await fs.readFile(filePath, "utf8");
        const parsed = JSON.parse(data);

        // Extract flows from different possible structures
        let flows = parsed.user_flows || parsed.flows || parsed;
        if (!Array.isArray(flows)) {
          for (const key of Object.keys(parsed)) {
            if (parsed[key].user_flows) {
              flows = parsed[key].user_flows;
              break;
            }
            if (parsed[key].flows) {
              flows = parsed[key].flows;
              break;
            }
          }
        }

        // Search in flows
        for (const flow of flows) {
          let match = false;
          let matchedIn = [];

          // Search in flow name
          const flowName = flow.flow_name || flow.name || "";
          if (flowName.toLowerCase().includes(searchTerm)) {
            match = true;
            matchedIn.push("name");
          }

          // Search in description
          if (
            flow.description &&
            flow.description.toLowerCase().includes(searchTerm)
          ) {
            match = true;
            matchedIn.push("description");
          }

          // Search in steps
          if (flow.steps && Array.isArray(flow.steps)) {
            for (const step of flow.steps) {
              const stepText =
                typeof step === "string" ? step : step.description || "";
              if (stepText.toLowerCase().includes(searchTerm)) {
                match = true;
                matchedIn.push("steps");
                break;
              }
            }
          }

          if (match) {
            results.push({
              module: moduleId,
              flow_id: flow.flow_id || flow.id,
              flow_name: flowName,
              description: flow.description,
              matched_in: matchedIn,
              category: flow.flowCategory,
            });

            if (results.length >= limit) break;
          }
        }

        if (results.length >= limit) break;
      }

      return {
        content: [
          {
            type: "text",
            text: `Found ${results.length} flows matching "${query}":\n\n${results
              .map(
                (r) =>
                  `📋 **${r.flow_name}** (${r.module}/${r.flow_id})\n   ${
                    r.description || "No description"
                  }\n   Matched in: ${r.matched_in.join(", ")}`
              )
              .join("\n\n")}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching flows: ${error.message}`,
          },
        ],
      };
    }
  }

  async getFlow({ module, flow_id }) {
    try {
      const fileName = MODULE_FILES[module];
      if (!fileName) {
        throw new Error(`Unknown module: ${module}`);
      }

      const filePath = path.join(DATA_PATH, fileName);
      const data = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(data);

      // Extract flows
      let flows = parsed.user_flows || parsed.flows || parsed;
      if (!Array.isArray(flows)) {
        for (const key of Object.keys(parsed)) {
          if (parsed[key].user_flows) {
            flows = parsed[key].user_flows;
            break;
          }
          if (parsed[key].flows) {
            flows = parsed[key].flows;
            break;
          }
        }
      }

      // Find the specific flow
      const flow = flows.find(
        (f) =>
          f.flow_id === flow_id ||
          f.id === flow_id ||
          (f.flow_name &&
            f.flow_name.toLowerCase().replace(/\s+/g, "_") === flow_id)
      );

      if (!flow) {
        return {
          content: [
            {
              type: "text",
              text: `Flow ${flow_id} not found in module ${module}`,
            },
          ],
        };
      }

      // Format flow details
      const flowName = flow.flow_name || flow.name || "Unnamed Flow";
      const steps = flow.steps || [];
      const stepText = steps
        .map((s, i) => {
          const stepDesc = typeof s === "string" ? s : s.description || "";
          return `   ${i + 1}. ${stepDesc}`;
        })
        .join("\n");

      const dependencies = flow.dependencies || [];
      const prerequisites = flow.prerequisites || [];
      const sourceDocs = flow.source_documents || [];

      return {
        content: [
          {
            type: "text",
            text: `## ${flowName}
**Module**: ${module}
**ID**: ${flow.flow_id || flow.id}
**Category**: ${flow.flowCategory || "General"}

**Description**: ${flow.description || "No description available"}

**Steps** (${steps.length}):
${stepText}

${
  prerequisites.length > 0
    ? `**Prerequisites**: ${prerequisites.join(", ")}\n`
    : ""
}${
  dependencies.length > 0
    ? `**Dependencies**: ${dependencies.join(", ")}\n`
    : ""
}${
  sourceDocs.length > 0
    ? `**Source Documents**: \n${sourceDocs
        .map((d) => `   - ${d}`)
        .join("\n")}`
    : ""
}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting flow: ${error.message}`,
          },
        ],
      };
    }
  }

  async listFlows({ module, category }) {
    try {
      const fileName = MODULE_FILES[module];
      if (!fileName) {
        throw new Error(`Unknown module: ${module}`);
      }

      const filePath = path.join(DATA_PATH, fileName);
      const data = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(data);

      // Extract flows
      let flows = parsed.user_flows || parsed.flows || parsed;
      if (!Array.isArray(flows)) {
        for (const key of Object.keys(parsed)) {
          if (parsed[key].user_flows) {
            flows = parsed[key].user_flows;
            break;
          }
          if (parsed[key].flows) {
            flows = parsed[key].flows;
            break;
          }
        }
      }

      // Filter by category if specified
      if (category) {
        flows = flows.filter((f) => f.flowCategory === category);
      }

      // Group by category
      const flowsByCategory = {};
      for (const flow of flows) {
        const cat = flow.flowCategory || "Other";
        if (!flowsByCategory[cat]) {
          flowsByCategory[cat] = [];
        }
        flowsByCategory[cat].push({
          id: flow.flow_id || flow.id,
          name: flow.flow_name || flow.name || "Unnamed",
          description: flow.description || "",
        });
      }

      // Format output
      let output = `## Flows in ${module.toUpperCase()} module (${
        flows.length
      } total)\n\n`;
      for (const [cat, catFlows] of Object.entries(flowsByCategory)) {
        output += `### ${cat} (${catFlows.length} flows)\n`;
        for (const flow of catFlows) {
          output += `- **${flow.name}** (${flow.id})\n  ${flow.description}\n`;
        }
        output += "\n";
      }

      return {
        content: [
          {
            type: "text",
            text: output,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing flows: ${error.message}`,
          },
        ],
      };
    }
  }

  async getCrossModuleWorkflow({ workflow_name }) {
    try {
      const fileName = `cross_module_${workflow_name}.json`;
      const filePath = path.join(DATA_PATH, fileName);
      const data = await fs.readFile(filePath, "utf8");
      const workflow = JSON.parse(data);

      const steps = workflow.workflow_steps || [];
      const stepText = steps
        .map((s) => {
          const moduleFlow = s.module_flow_reference
            ? ` → ${s.module_flow_reference.flow_name} (${s.module_flow_reference.flow_id})`
            : "";
          return `**Step ${s.step_id}** (${s.module}): ${s.step_description}${moduleFlow}`;
        })
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `## ${workflow.workflow_name}

**Description**: ${workflow.description}

**Modules Involved**: ${workflow.modules_involved.join(", ")}

**Business Value**: ${workflow.business_value}

**Workflow Steps**:
${stepText}

**Prerequisites**: ${
              workflow.prerequisites
                ? workflow.prerequisites.join(", ")
                : "None"
            }`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting cross-module workflow: ${error.message}`,
          },
        ],
      };
    }
  }

  async findFlowsByTopic({ topic }) {
    // This is similar to search but with predefined topic mappings
    const topicKeywords = {
      alerts: ["alert", "notification", "warning", "trigger"],
      dashboard: ["dashboard", "panel", "widget", "visualization"],
      reporting: ["report", "export", "analysis", "insight"],
      "social media": ["facebook", "twitter", "instagram", "linkedin"],
      monitoring: ["monitor", "track", "watch", "observe"],
      engagement: ["engage", "respond", "reply", "interact"],
      analytics: ["analytics", "metrics", "measure", "data"],
      influencer: ["influencer", "influence", "creator", "ambassador"],
    };

    const keywords = topicKeywords[topic.toLowerCase()] || [topic.toLowerCase()];

    // Search for any of the keywords
    let allResults = [];
    for (const keyword of keywords) {
      const result = await this.searchFlows({ query: keyword, limit: 5 });
      // Extract results from the response
      allResults.push(result);
    }

    return {
      content: [
        {
          type: "text",
          text: `Flows related to "${topic}":\n\n${allResults.map(r =>
            r.content[0].text.split('\n').slice(1).join('\n')
          ).join('\n')}`,
        },
      ],
    };
  }

  async getModuleInfo({ module }) {
    const moduleInfo = {
      listen: {
        name: "Listen",
        description:
          "Social listening and monitoring capabilities. Track brand mentions, sentiment, and conversations across social media and online sources.",
        key_features: [
          "Real-time monitoring",
          "Sentiment analysis",
          "Alert configuration",
          "Query building",
          "Trend detection",
        ],
      },
      measure: {
        name: "Measure",
        description:
          "Performance measurement and analytics dashboards. Create custom reports and visualizations to track social media metrics.",
        key_features: [
          "Custom dashboards",
          "Widget configuration",
          "Performance metrics",
          "Data export",
          "Comparative analysis",
        ],
      },
      engage: {
        name: "Engage",
        description:
          "Social media engagement and community management. Manage conversations, respond to customers, and track engagement metrics.",
        key_features: [
          "Unified inbox",
          "Response management",
          "Team collaboration",
          "Workflow automation",
          "Engagement tracking",
        ],
      },
      publish: {
        name: "Publish",
        description:
          "Content publishing and scheduling across social platforms. Plan, create, and schedule social media content.",
        key_features: [
          "Content calendar",
          "Multi-channel publishing",
          "Content approval workflow",
          "Asset library",
          "Performance tracking",
        ],
      },
      advertise: {
        name: "Advertise",
        description:
          "Social media advertising and campaign management. Create, manage, and optimize paid social campaigns.",
        key_features: [
          "Campaign creation",
          "Audience targeting",
          "Budget management",
          "Ad performance tracking",
          "A/B testing",
        ],
      },
      influence: {
        name: "Influence",
        description:
          "Influencer identification and tracking. Find and analyze influencers relevant to your brand.",
        key_features: [
          "Influencer discovery",
          "Audience analysis",
          "Engagement metrics",
          "Campaign tracking",
          "ROI measurement",
        ],
      },
      benchmark: {
        name: "Benchmark",
        description:
          "Competitive benchmarking tools. Compare your performance against competitors and industry standards.",
        key_features: [
          "Competitor analysis",
          "Industry benchmarks",
          "Share of voice",
          "Trend comparison",
          "Performance gaps",
        ],
      },
      consumer_research: {
        name: "Consumer Research",
        description:
          "Digital consumer intelligence and search capabilities. Deep dive into consumer behavior and preferences.",
        key_features: [
          "Consumer insights",
          "Trend analysis",
          "Audience segmentation",
          "Behavioral patterns",
          "Market research",
        ],
      },
      audience: {
        name: "Audience",
        description:
          "Audience analysis and segmentation features. Understand and segment your social media audiences.",
        key_features: [
          "Demographic analysis",
          "Interest mapping",
          "Behavior tracking",
          "Segment creation",
          "Audience insights",
        ],
      },
      reviews: {
        name: "Brandwatch Reviews",
        description:
          "Review management and analysis. Monitor and manage online reviews across platforms.",
        key_features: [
          "Review monitoring",
          "Sentiment analysis",
          "Response management",
          "Rating tracking",
          "Competitive analysis",
        ],
      },
      vizia: {
        name: "VIZIA",
        description:
          "Data visualization and command center features. Large-scale displays for real-time social data.",
        key_features: [
          "Command center displays",
          "Real-time visualizations",
          "Custom screens",
          "Data streaming",
          "Executive dashboards",
        ],
      },
    };

    const info = moduleInfo[module];
    if (!info) {
      return {
        content: [
          {
            type: "text",
            text: `Unknown module: ${module}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `## ${info.name}

**Description**: ${info.description}

**Key Features**:
${info.key_features.map((f) => `- ${f}`).join("\n")}

To see available flows, use: \`list_flows\` with module="${module}"`,
        },
      ],
    };
  }

  async listAllModules() {
    const modules = [
      { id: "listen", name: "Listen", desc: "Social listening and monitoring" },
      { id: "measure", name: "Measure", desc: "Analytics and dashboards" },
      { id: "engage", name: "Engage", desc: "Community management" },
      { id: "publish", name: "Publish", desc: "Content scheduling" },
      { id: "advertise", name: "Advertise", desc: "Ad campaign management" },
      { id: "influence", name: "Influence", desc: "Influencer tracking" },
      { id: "benchmark", name: "Benchmark", desc: "Competitive analysis" },
      { id: "consumer_research", name: "Consumer Research", desc: "Consumer insights" },
      { id: "audience", name: "Audience", desc: "Audience segmentation" },
      { id: "reviews", name: "Reviews", desc: "Review management" },
      { id: "vizia", name: "VIZIA", desc: "Command center displays" },
    ];

    return {
      content: [
        {
          type: "text",
          text: `## Available Brandwatch Modules

${modules
  .map((m) => `**${m.name}** (\`${m.id}\`)\n   ${m.desc}`)
  .join("\n\n")}

## Cross-Module Workflows
- **Crisis Management** - Multi-module crisis response workflow
- **Content Strategy** - Content optimization across channels
- **Influencer Campaign** - End-to-end influencer campaigns

Use \`get_module_info\` for detailed information about any module.`,
        },
      ],
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Brandwatch MCP Server running on stdio");
  }
}

// Start the server
const server = new BrandwatchMCPServer();
server.start().catch(console.error);