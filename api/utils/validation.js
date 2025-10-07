const { Validator } = require('jsonschema');

const flowSchema = {
  type: 'object',
  required: ['flow_name', 'description', 'steps'],
  properties: {
    flow_id: {
      type: 'string',
      pattern: '^[A-Z0-9_]+$'
    },
    flow_name: {
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    description: {
      type: 'string',
      minLength: 1
    },
    flowCategory: {
      type: 'string'
    },
    categoryDescription: {
      type: 'string'
    },
    steps: {
      type: 'array',
      minItems: 1,
      items: {
        oneOf: [
          { type: 'string' },
          {
            type: 'object',
            properties: {
              step_id: { type: ['string', 'number'] },
              description: { type: 'string' },
              action: { type: 'string' },
              module: { type: 'string' }
            }
          }
        ]
      }
    },
    prerequisites: {
      type: 'array',
      items: { type: 'string' }
    },
    dependencies: {
      type: 'array',
      items: { type: 'string' }
    },
    related_flows: {
      type: 'array',
      items: { type: 'string' }
    },
    source_documents: {
      type: 'array',
      items: { type: 'string' }
    },
    isPrerequisite: {
      type: 'boolean'
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$'
    },
    created_at: {
      type: 'string',
      format: 'date-time'
    },
    updated_at: {
      type: 'string',
      format: 'date-time'
    },
    change_log: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          version: { type: 'string' },
          date: { type: 'string' },
          changes: {
            type: 'array',
            items: { type: 'string' }
          },
          source: { type: 'string' }
        }
      }
    }
  }
};

const crossModuleSchema = {
  type: 'object',
  required: ['workflow_id', 'workflow_name', 'description', 'workflow_steps'],
  properties: {
    workflow_id: {
      type: 'string',
      pattern: '^[A-Z0-9_]+$'
    },
    workflow_name: {
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    description: {
      type: 'string',
      minLength: 1
    },
    modules_involved: {
      type: 'array',
      minItems: 2,
      items: { type: 'string' }
    },
    business_value: {
      type: 'string'
    },
    workflow_steps: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['step_id', 'module', 'step_description'],
        properties: {
          step_id: { type: ['string', 'number'] },
          module: { type: 'string' },
          module_flow_reference: {
            type: 'object',
            properties: {
              flow_name: { type: 'string' },
              flow_id: { type: 'string' },
              description: { type: 'string' }
            }
          },
          step_description: { type: 'string' },
          outputs: {
            type: 'array',
            items: { type: 'string' }
          },
          inputs: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    },
    prerequisites: {
      type: 'array',
      items: { type: 'string' }
    },
    source_documents: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

const validator = new Validator();

function validateFlow(flow) {
  return validator.validate(flow, flowSchema);
}

function validateCrossModuleWorkflow(workflow) {
  return validator.validate(workflow, crossModuleSchema);
}

function sanitizeInput(input) {
  if (typeof input === 'string') {
    // Remove any potential script tags
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .trim();
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  if (input && typeof input === 'object') {
    const sanitized = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
}

module.exports = {
  validateFlow,
  validateCrossModuleWorkflow,
  sanitizeInput,
  flowSchema,
  crossModuleSchema
};