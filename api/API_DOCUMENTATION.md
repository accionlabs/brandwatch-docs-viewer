# Brandwatch Flow Management API Documentation

## Overview
REST API for managing Brandwatch user flows and cross-module workflows. This API provides CRUD operations for flows, search functionality, and workflow validation.

**Base URL:** `http://localhost:3001/api`

## Endpoints

### Health Check

#### GET /api/health
Check API server status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-30T09:34:10.405Z"
}
```

---

### Modules

#### GET /api/modules
List all available modules with flow counts.

**Response:**
```json
{
  "count": 11,
  "modules": [
    {
      "id": "listen",
      "name": "Listen",
      "description": "Social listening and monitoring capabilities",
      "icon": "headphones",
      "color": "#98D8C8",
      "flowCount": 15
    }
  ]
}
```

#### GET /api/modules/:moduleId
Get detailed information about a specific module.

**Parameters:**
- `moduleId` (path) - Module identifier (e.g., "listen", "measure")

**Response:**
```json
{
  "module": {
    "id": "listen",
    "name": "Listen",
    "flowCount": 15,
    "categories": [
      {
        "name": "Monitoring",
        "description": "Real-time monitoring flows",
        "flows": [...]
      }
    ]
  }
}
```

#### GET /api/modules/:moduleId/stats
Get statistics for a module.

**Response:**
```json
{
  "module": {...},
  "statistics": {
    "totalFlows": 15,
    "totalSteps": 81,
    "averageStepsPerFlow": 5.4,
    "prerequisiteFlows": 0,
    "flowsWithDependencies": 3,
    "flowsWithDocumentation": 15,
    "categories": {"Monitoring": 8, "Analysis": 7},
    "recentlyUpdated": [...]
  }
}
```

---

### Flows

#### GET /api/flows/:module
Get all flows for a module.

**Parameters:**
- `module` (path) - Module identifier

**Response:**
```json
{
  "module": "listen",
  "count": 15,
  "flows": [
    {
      "flow_id": "flow_001",
      "flow_name": "Creating and Managing Searches",
      "description": "Learn how to create and manage searches in Listen",
      "steps": [...],
      "source_documents": [...]
    }
  ]
}
```

#### GET /api/flows/:module/:flowId
Get a specific flow.

**Parameters:**
- `module` (path) - Module identifier
- `flowId` (path) - Flow identifier

#### POST /api/flows/:module
Create a new flow.

**Request Body:**
```json
{
  "flow_name": "New Flow Name",
  "description": "Flow description",
  "flowCategory": "Category Name",
  "steps": [
    "Step 1 description",
    "Step 2 description"
  ],
  "prerequisites": [],
  "dependencies": [],
  "source_documents": []
}
```

**Response:** 201 Created
```json
{
  "message": "Flow created successfully",
  "module": "listen",
  "flow": {
    "flow_id": "LST_MG6D1Y4I",
    "flow_name": "New Flow Name",
    "created_at": "2025-09-30T09:34:10.405Z",
    "version": "1.0.0"
  }
}
```

#### PUT /api/flows/:module/:flowId
Update an existing flow.

**Request Body:** Same as POST, all fields required.

**Response:**
```json
{
  "message": "Flow updated successfully",
  "flow": {
    "flow_id": "LST_MG6D1Y4I",
    "version": "1.0.1",
    "updated_at": "2025-09-30T09:34:10.405Z"
  }
}
```

#### PATCH /api/flows/:module/:flowId
Partially update a flow.

**Request Body:** Only include fields to update.

#### DELETE /api/flows/:module/:flowId
Delete a flow.

**Response:**
```json
{
  "message": "Flow deleted successfully",
  "deletedFlow": {...}
}
```

---

### Search

#### GET /api/search
Search flows across all modules.

**Query Parameters:**
- `q` or `query` (required) - Search term (min 2 characters)
- `module` (optional) - Filter by module
- `limit` (optional, default: 50) - Maximum results
- `offset` (optional, default: 0) - Pagination offset

**Example:** `/api/search?q=alert&module=listen&limit=10`

**Response:**
```json
{
  "query": "alert",
  "total": 5,
  "limit": 10,
  "offset": 0,
  "results": [
    {
      "module": "listen",
      "flow": {...},
      "matchedFields": ["flow_name", "description"],
      "score": 2
    }
  ]
}
```

#### GET /api/search/suggest
Get search suggestions for autocomplete.

**Query Parameters:**
- `q` (required) - Partial search term (min 1 character)
- `limit` (optional, default: 10) - Maximum suggestions

**Response:**
```json
{
  "query": "mon",
  "suggestions": [
    "Monitoring Dashboard",
    "Monitor Competitors",
    "Monitoring"
  ]
}
```

#### POST /api/search/advanced
Advanced search with multiple filters.

**Request Body:**
```json
{
  "query": "data",
  "modules": ["listen", "measure"],
  "categories": ["Analysis"],
  "hasPrerequisites": false,
  "hasDependencies": true,
  "hasDocumentation": true,
  "limit": 50,
  "offset": 0
}
```

---

### Cross-Module Workflows

#### GET /api/cross-module
Get all cross-module workflows.

**Response:**
```json
{
  "count": 3,
  "workflows": [
    {
      "workflow_id": "crisis_management",
      "workflow_name": "Crisis Management Workflow",
      "modules_involved": ["listen", "engage", "measure"],
      "workflow_steps": [...]
    }
  ]
}
```

#### GET /api/cross-module/:workflowId
Get a specific cross-module workflow.

#### POST /api/cross-module
Create a new cross-module workflow.

**Request Body:**
```json
{
  "workflow_name": "New Workflow",
  "description": "Workflow description",
  "modules_involved": ["listen", "measure"],
  "business_value": "Value description",
  "workflow_steps": [
    {
      "step_id": 1,
      "module": "listen",
      "module_flow_reference": {
        "flow_name": "Create Search",
        "flow_id": "flow_001",
        "description": "Setup monitoring"
      },
      "step_description": "Monitor brand mentions",
      "outputs": ["Mention data"],
      "inputs": []
    }
  ]
}
```

#### PUT /api/cross-module/:workflowId
Update a cross-module workflow.

#### DELETE /api/cross-module/:workflowId
Delete a cross-module workflow.

#### GET /api/cross-module/:workflowId/validate
Validate that all flow references in a workflow exist.

**Response:**
```json
{
  "workflow_id": "crisis_management",
  "workflow_name": "Crisis Management Workflow",
  "valid": true,
  "validation": [
    {
      "step": 1,
      "module": "listen",
      "flow_id": "flow_005",
      "valid": true,
      "found": {
        "flow_name": "Creating and Managing Email Alerts",
        "description": "..."
      }
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid flow data",
  "details": [
    {
      "property": "flow_name",
      "message": "is required"
    }
  ]
}
```

### 404 Not Found
```json
{
  "error": "Flow not found",
  "module": "listen",
  "flowId": "invalid_id"
}
```

### 409 Conflict
```json
{
  "error": "Flow with this ID already exists",
  "flowId": "flow_001"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "details": "Stack trace (development only)"
}
```

---

## Data Models

### Flow Schema
```javascript
{
  flow_id: String,           // Unique identifier (auto-generated if not provided)
  flow_name: String,         // Required: Flow name
  description: String,       // Required: Flow description
  flowCategory: String,      // Category grouping
  categoryDescription: String,
  steps: Array,             // Required: Array of step descriptions or objects
  prerequisites: Array,      // Array of prerequisite flow IDs
  dependencies: Array,       // Array of dependent flow IDs
  related_flows: Array,      // Array of related flow IDs
  source_documents: Array,   // Array of documentation references
  isPrerequisite: Boolean,   // Is this a prerequisite flow?
  tags: Array,              // Array of tags
  version: String,          // Semantic version (e.g., "1.0.0")
  created_at: String,       // ISO 8601 timestamp
  updated_at: String,       // ISO 8601 timestamp
  change_log: Array         // Array of change records
}
```

### Cross-Module Workflow Schema
```javascript
{
  workflow_id: String,       // Unique identifier
  workflow_name: String,     // Required: Workflow name
  description: String,       // Required: Description
  modules_involved: Array,   // Array of module IDs (min 2)
  business_value: String,    // Business value description
  workflow_steps: Array,     // Required: Array of workflow steps
  prerequisites: Array,      // Prerequisites
  source_documents: Array,   // Documentation references
  created_at: String,       // ISO 8601 timestamp
  updated_at: String        // ISO 8601 timestamp
}
```

---

## Usage Examples

### cURL Examples

#### Search for flows
```bash
curl "http://localhost:3001/api/search?q=alert&limit=5"
```

#### Create a new flow
```bash
curl -X POST "http://localhost:3001/api/flows/listen" \
  -H "Content-Type: application/json" \
  -d '{
    "flow_name": "My New Flow",
    "description": "Description here",
    "steps": ["Step 1", "Step 2", "Step 3"]
  }'
```

#### Update a flow
```bash
curl -X PUT "http://localhost:3001/api/flows/listen/flow_001" \
  -H "Content-Type: application/json" \
  -d '{
    "flow_name": "Updated Flow Name",
    "description": "Updated description",
    "steps": ["Updated Step 1", "Updated Step 2"]
  }'
```

### JavaScript/Node.js Example

```javascript
// Search for flows
const response = await fetch('http://localhost:3001/api/search?q=monitoring');
const results = await response.json();

// Create a new flow
const newFlow = {
  flow_name: 'Custom Monitoring Flow',
  description: 'Monitor specific keywords',
  steps: [
    'Configure keywords',
    'Set up alerts',
    'Review results'
  ]
};

const createResponse = await fetch('http://localhost:3001/api/flows/listen', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newFlow)
});

const created = await createResponse.json();
console.log('Created flow:', created.flow.flow_id);
```

---

## Notes

1. **Backup:** All write operations automatically create backups in the `/api/backups` directory
2. **Validation:** Flow data is validated against JSON schemas before writes
3. **IDs:** Flow IDs are auto-generated if not provided (format: `MODULE_PREFIX_TIMESTAMP`)
4. **Versioning:** Flows use semantic versioning, automatically incremented on updates
5. **Change Tracking:** All updates are logged in the `change_log` array

---

## Next Steps

### Authentication (Planned)
- API key authentication for n8n integration
- JWT tokens for user sessions
- Rate limiting per API key

### n8n Integration (Planned)
- Webhook endpoints for n8n triggers
- Batch operations for multiple flows
- Diff/merge capabilities for conflict resolution