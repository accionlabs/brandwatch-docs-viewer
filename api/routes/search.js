const express = require('express');
const router = express.Router();
const { searchFlows, getCrossModuleWorkflows } = require('../utils/fileUtils');

// GET /api/search - Search across all flows
router.get('/', async (req, res, next) => {
  try {
    const { q, query, module, limit = 50, offset = 0 } = req.query;

    const searchQuery = q || query;
    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters',
        query: searchQuery
      });
    }

    // Search in module flows
    const results = await searchFlows(searchQuery, { module });

    // Also search in cross-module workflows if no specific module filter
    const crossModuleResults = [];
    if (!module) {
      const workflows = await getCrossModuleWorkflows();
      const searchTerm = searchQuery.toLowerCase();

      for (const workflow of workflows) {
        let match = false;
        let matchedFields = [];

        // Search in workflow name
        if (workflow.workflow_name && workflow.workflow_name.toLowerCase().includes(searchTerm)) {
          match = true;
          matchedFields.push('workflow_name');
        }

        // Search in description
        if (workflow.description && workflow.description.toLowerCase().includes(searchTerm)) {
          match = true;
          matchedFields.push('description');
        }

        // Search in business value
        if (workflow.business_value && workflow.business_value.toLowerCase().includes(searchTerm)) {
          match = true;
          matchedFields.push('business_value');
        }

        // Search in workflow steps
        if (workflow.workflow_steps) {
          for (const step of workflow.workflow_steps) {
            if (step.step_description && step.step_description.toLowerCase().includes(searchTerm)) {
              match = true;
              matchedFields.push('workflow_steps');
              break;
            }
          }
        }

        if (match) {
          crossModuleResults.push({
            type: 'cross-module',
            workflow: workflow,
            matchedFields: matchedFields,
            score: matchedFields.includes('workflow_name') ? 2 : 1
          });
        }
      }
    }

    // Combine and sort all results
    const allResults = [...results, ...crossModuleResults];
    allResults.sort((a, b) => b.score - a.score);

    // Apply pagination
    const paginatedResults = allResults.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      query: searchQuery,
      total: allResults.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      results: paginatedResults
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/search/suggest - Get search suggestions
router.get('/suggest', async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({
        error: 'Query must be at least 1 character',
        query: q
      });
    }

    // Get partial matches for autocomplete
    const results = await searchFlows(q, {});

    // Extract unique flow names and categories
    const suggestions = new Set();

    for (const result of results) {
      if (result.flow.flow_name) {
        suggestions.add(result.flow.flow_name);
      }
      if (result.flow.flowCategory) {
        suggestions.add(result.flow.flowCategory);
      }
    }

    // Convert to array and limit
    const suggestionArray = Array.from(suggestions)
      .filter(s => s.toLowerCase().includes(q.toLowerCase()))
      .slice(0, parseInt(limit));

    res.json({
      query: q,
      suggestions: suggestionArray
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/search/advanced - Advanced search with filters
router.post('/advanced', async (req, res, next) => {
  try {
    const {
      query,
      modules,
      categories,
      hasPrerequisites,
      hasDependencies,
      hasDocumentation,
      limit = 50,
      offset = 0
    } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters',
        query: query
      });
    }

    // Get all search results
    const results = await searchFlows(query, {});

    // Apply filters
    let filteredResults = results;

    // Filter by modules
    if (modules && Array.isArray(modules) && modules.length > 0) {
      filteredResults = filteredResults.filter(r => modules.includes(r.module));
    }

    // Filter by categories
    if (categories && Array.isArray(categories) && categories.length > 0) {
      filteredResults = filteredResults.filter(r =>
        categories.includes(r.flow.flowCategory)
      );
    }

    // Filter by prerequisites
    if (hasPrerequisites !== undefined) {
      filteredResults = filteredResults.filter(r =>
        hasPrerequisites ? r.flow.isPrerequisite : !r.flow.isPrerequisite
      );
    }

    // Filter by dependencies
    if (hasDependencies !== undefined) {
      filteredResults = filteredResults.filter(r => {
        const deps = r.flow.dependencies || [];
        return hasDependencies ? deps.length > 0 : deps.length === 0;
      });
    }

    // Filter by documentation
    if (hasDocumentation !== undefined) {
      filteredResults = filteredResults.filter(r => {
        const docs = r.flow.source_documents || [];
        return hasDocumentation ? docs.length > 0 : docs.length === 0;
      });
    }

    // Apply pagination
    const paginatedResults = filteredResults.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      query: query,
      filters: {
        modules,
        categories,
        hasPrerequisites,
        hasDependencies,
        hasDocumentation
      },
      total: filteredResults.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      results: paginatedResults
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;