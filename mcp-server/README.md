# Brandwatch Documentation MCP Server

This MCP (Model Context Protocol) server provides tools for querying and managing Brandwatch documentation flows. It allows Claude to access and search through the Brandwatch documentation system.

## Features

The MCP server provides the following tools:

### 1. **search_flows**
Search for flows across all Brandwatch modules.
- Parameters: `query` (required), `module` (optional), `limit` (optional)
- Example: Search for "alerts" in the listen module

### 2. **get_flow**
Get detailed information about a specific flow.
- Parameters: `module` (required), `flow_id` (required)
- Example: Get flow_001 from the listen module

### 3. **list_flows**
List all flows for a specific module.
- Parameters: `module` (required), `category` (optional)
- Example: List all flows in the measure module

### 4. **get_cross_module_workflow**
Get a cross-module workflow by name.
- Parameters: `workflow_name` (required)
- Options: 'crisis_management', 'content_strategy', 'influencer_campaign'

### 5. **find_flows_by_topic**
Find flows related to a specific topic or use case.
- Parameters: `topic` (required)
- Example topics: 'alerts', 'dashboard', 'reporting', 'social media'

### 6. **get_module_info**
Get detailed information about a Brandwatch module.
- Parameters: `module` (required)
- Example: Get info about the 'listen' module

### 7. **list_all_modules**
List all available Brandwatch modules with descriptions.
- No parameters required

## Installation

### For Claude Desktop

1. Make sure the MCP server is installed:
```bash
cd /Users/ashutoshbijoor/Documents/Accion Labs/Projects/Cision/Nexus/Brandwatch/brandwatch-docs-viewer/mcp-server
npm install
```

2. Add to Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "brandwatch-docs": {
      "command": "node",
      "args": [
        "/Users/ashutoshbijoor/Documents/Accion Labs/Projects/Cision/Nexus/Brandwatch/brandwatch-docs-viewer/mcp-server/server.js"
      ]
    }
  }
}
```

3. Restart Claude Desktop

## Usage Examples

Once connected, you can ask Claude questions like:

- "Search for flows about creating alerts in Brandwatch"
- "Show me all flows in the measure module"
- "What is the crisis management workflow?"
- "Find flows related to social media monitoring"
- "Get details about flow_001 in the listen module"
- "List all available Brandwatch modules"
- "What flows are related to dashboards?"

## How It Works

The MCP server:
1. Reads the JSON files from the `public/data` directory
2. Provides structured access to flow documentation
3. Enables semantic search across all modules
4. Returns formatted, readable responses

## Testing the Server

You can test the server standalone:

```bash
cd mcp-server
node server.js
```

The server will run on stdio and wait for MCP protocol messages.

## Module Structure

The server accesses documentation for these modules:
- **Listen**: Social listening and monitoring
- **Measure**: Analytics and dashboards
- **Engage**: Community management
- **Publish**: Content scheduling
- **Advertise**: Ad campaign management
- **Influence**: Influencer tracking
- **Benchmark**: Competitive analysis
- **Consumer Research**: Consumer insights
- **Audience**: Audience segmentation
- **Reviews**: Review management
- **VIZIA**: Command center displays

## Cross-Module Workflows

The server also provides access to cross-module workflows:
- Crisis Management Workflow
- Content Strategy Optimization Loop
- Influencer Campaign Lifecycle

## Data Source

The MCP server reads from the same JSON files that the web application uses, ensuring consistency between the documentation viewer and the MCP tools.