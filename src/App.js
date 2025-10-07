import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import './App.css';
import ModuleSelector from './components/ModuleSelector';
import FlowDiagram from './components/FlowDiagram';
// import PDFViewer from './components/PDFViewer';
import SimplePDFViewer from './components/SimplePDFViewer';
import MarkdownViewer from './components/MarkdownViewer';
import { FileText, GitBranch, Search, BookOpen, X, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { sortFlowsForModule, sortModules, getModuleMetadata } from './utils/flowOrdering';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useAuth0 } from '@auth0/auth0-react';
import { LoginButton, LogoutButton, UserProfile } from './components/AuthButtons';
import EditSourceModal from './components/EditSourceModal';
import ComplexityDashboard from './components/ComplexityDashboard';

function MainApp() {
  const { isAuthenticated, isLoading, error, user } = useAuth0();
  const { moduleId, flowId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for auth bypass flag (development/testing only)
  const bypassAuth = process.env.REACT_APP_BYPASS_AUTH === 'true';

  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [allFlows, setAllFlows] = useState([]); // Store all flows from all modules
  const [viewMode, setViewMode] = useState('split'); // 'split', 'flow', 'pdf'
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [pendingFlowSelection, setPendingFlowSelection] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Debug: Log state changes
  useEffect(() => {
    console.log('State updated - flows count:', flows.length, 'selectedModule:', selectedModule);
  }, [flows, selectedModule]);

  // Log location changes
  useEffect(() => {
    console.log('Location changed:', location.pathname);
    console.log('Current params - moduleId:', moduleId, 'flowId:', flowId);
  }, [location, moduleId, flowId]);


  useEffect(() => {
    // Load modules data
    loadModules();
    // Load all flows for global search
    loadAllFlows();
  }, []);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        try {
          // Use process.env.PUBLIC_URL to correctly resolve the path
          const response = await fetch(`${process.env.PUBLIC_URL}/config/admins.json`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const adminConfig = await response.json();
          const isUserAdmin = adminConfig.adminEmails.includes(user.email);
          setIsAdmin(isUserAdmin);
          console.log(`User ${user.email} admin status:`, isUserAdmin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user]);

  // Handle URL parameters - this is now the single source of truth
  useEffect(() => {
    console.log('URL params changed - moduleId:', moduleId, 'flowId:', flowId);

    if (moduleId && modules.length > 0) {
      const module = modules.find(m => m.id === moduleId || m.name.toLowerCase().replace(/\s+/g, '_') === moduleId);
      if (module) {
        setSelectedModule(module);

        // Expand the module in the sidebar
        setExpandedModules(prev => ({
          ...prev,
          [module.id]: true
        }));

        if (flowId) {
          // Set pending flow selection for the flowId in URL
          setPendingFlowSelection({ flow_id: flowId, timestamp: Date.now() });
        } else {
          // Clear flow selection if no flowId in URL
          setSelectedFlow(null);
          setPendingFlowSelection(null);
        }
      }
    } else if (!moduleId) {
      // Clear selections if no module in URL
      setSelectedModule(null);
      setSelectedFlow(null);
      setPendingFlowSelection(null);
    }
  }, [moduleId, flowId, modules]);

  // Removed automatic URL update effect to prevent loops
  // URLs are now only updated when users click on items

  useEffect(() => {
    if (selectedModule) {
      console.log('Selected module changed:', selectedModule);
      // Extract module ID whether selectedModule is a string or object
      const moduleId = typeof selectedModule === 'string' ? selectedModule : selectedModule.id;
      loadFlowsForModule(moduleId);
    } else {
      setFlows([]);
    }
  }, [selectedModule]);

  // Handle pending flow selection after flows are loaded
  useEffect(() => {
    if (pendingFlowSelection && flows.length > 0 && selectedModule) {
      // Make sure we're not looking at cross-module flows when we need module-specific flows
      const isCrossModule = selectedModule.id === 'cross_module';
      const firstFlow = flows[0];
      const flowsAreCrossModule = firstFlow && firstFlow.isCrossModule;

      // If we're selecting a regular module but still have cross-module flows, wait
      if (!isCrossModule && flowsAreCrossModule) {
        console.log('Waiting for module flows to load, currently have cross-module flows');
        return;
      }

      console.log('Trying to select pending flow:', pendingFlowSelection);
      console.log('Current module:', selectedModule?.id);
      console.log('Number of flows available:', flows.length);
      console.log('Available flows:', flows.map(f => ({ id: f.id, flow_id: f.flow_id, name: f.name, flow_name: f.flow_name })));
      console.log('Searching for flow_id:', pendingFlowSelection.flow_id);

      // Find the matching flow in the loaded flows
      const matchingFlow = flows.find(f => {
        // Match by flow ID from URL
        if (pendingFlowSelection.flow_id) {
          const searchId = pendingFlowSelection.flow_id;

          // Direct ID matches (case sensitive for actual IDs like BW_PUB_001)
          const flowIdMatch = f.flow_id === searchId;
          const idMatch = f.id === searchId;

          // Slug matches (convert flow names to slugs for comparison)
          const flowNameSlug = f.flow_name ? f.flow_name.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_') : '';
          const nameSlug = f.name ? f.name.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_') : '';
          const searchIdLower = searchId.toLowerCase();
          const flowNameSlugMatch = flowNameSlug === searchIdLower;
          const nameSlugMatch = nameSlug === searchIdLower;

          if (flowIdMatch || idMatch || flowNameSlugMatch || nameSlugMatch) {
            console.log('Match found!', {
              flow: f,
              searchId,
              flowIdMatch,
              idMatch,
              flowNameSlugMatch,
              nameSlugMatch,
              flowNameSlug,
              nameSlug
            });
            return true;
          }
          return false;
        }

        // Match by flow_name or name
        const nameMatch = (f.flow_name || f.name) === (pendingFlowSelection.flow_name || pendingFlowSelection.name);
        // Also try to match by id if available
        const idMatch = f.flow_id && pendingFlowSelection.flow_id ?
          f.flow_id === pendingFlowSelection.flow_id :
          f.id === pendingFlowSelection.id;

        // Return true if names match, or if IDs are available and match
        return nameMatch || (idMatch && (f.flow_id || f.id));
      });

      if (matchingFlow) {
        console.log('Found matching flow:', matchingFlow);
        handleFlowSelect(matchingFlow);
        // Clear pending selection
        setPendingFlowSelection(null);
      } else {
        console.log('No matching flow found for:', pendingFlowSelection.flow_id);
        // Clear pending selection even if no match
        setPendingFlowSelection(null);
      }
    }
  }, [flows, pendingFlowSelection, selectedModule]);

  // Load all flows from all modules for global search
  const loadAllFlows = async () => {
    const allFlowsData = [];
    const moduleIds = ['listen', 'consumer_research', 'measure', 'benchmark', 'publish',
                       'engage', 'reviews', 'advertise', 'influence', 'audience', 'vizia'];

    for (const moduleId of moduleIds) {
      try {
        let response = await fetch(`${process.env.PUBLIC_URL}/data/${moduleId}_user_flows_with_citations.json?t=${Date.now()}`);
        if (!response.ok) {
          response = await fetch(`${process.env.PUBLIC_URL}/data/${moduleId}_user_flows.json?t=${Date.now()}`);
        }
        if (response.ok) {
          const data = await response.json();
          let flowsData = [];

          if (Array.isArray(data)) {
            flowsData = data;
          } else if (data.flows) {
            flowsData = data.flows;
          } else if (data.user_flows) {
            flowsData = data.user_flows;
          } else {
            const keys = Object.keys(data);
            for (const key of keys) {
              if (data[key]?.flows) {
                flowsData = data[key].flows;
                break;
              } else if (data[key]?.user_flows) {
                flowsData = data[key].user_flows;
                break;
              } else if (Array.isArray(data[key])) {
                flowsData = data[key];
                break;
              }
            }
          }

          // Add module info to each flow
          flowsData.forEach(flow => {
            flow.module = moduleId;
          });

          allFlowsData.push(...flowsData);
        }
      } catch (error) {
        console.error(`Error loading flows for ${moduleId}:`, error);
      }
    }

    setAllFlows(allFlowsData);
  };

  const loadModules = async () => {
    // Load module data from JSON files
    const moduleList = [
      { id: 'listen', name: 'Listen', description: 'Social listening and monitoring', icon: '👂', flows: 15 },
      { id: 'consumer_research', name: 'Consumer Research', description: 'Digital intelligence', icon: '🔍', flows: 5 },
      { id: 'measure', name: 'Measure', description: 'Analytics and dashboards', icon: '📊', flows: 10 },
      { id: 'benchmark', name: 'Benchmark', description: 'Competitive analysis', icon: '📈', flows: 5 },
      { id: 'publish', name: 'Publish', description: 'Content creation and scheduling', icon: '📝', flows: 25 },
      { id: 'engage', name: 'Engage', description: 'Social media engagement', icon: '💬', flows: 23 },
      { id: 'reviews', name: 'Reviews', description: 'Review management', icon: '⭐', flows: 5 },
      { id: 'advertise', name: 'Advertise', description: 'Ad campaign management', icon: '📢', flows: 7 },
      { id: 'influence', name: 'Influence', description: 'Influencer marketing', icon: '⭐', flows: 13 },
      { id: 'audience', name: 'Audience', description: 'Customer data platform', icon: '👥', flows: 6 },
      { id: 'vizia', name: 'VIZIA', description: 'Command center visualization', icon: '🖥️', flows: 6 },
      { id: '__divider__', name: '__divider__', isDivider: true },
      { id: 'cross_module', name: 'Cross-Module Workflows', description: 'Integrated multi-module workflows', icon: '🔄', flows: 3, isCrossModule: true }
    ];

    // Sort modules in logical order
    const sortedModules = sortModules(moduleList);

    // Add metadata to each module
    const modulesWithMetadata = sortedModules.map(module => ({
      ...module,
      ...getModuleMetadata(module.id)
    }));

    setModules(modulesWithMetadata);
  };

  const loadFlowsForModule = async (moduleId) => {
    setLoading(true);
    try {
      // Handle cross-module workflows differently
      if (moduleId === 'cross_module') {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/cross_module_workflows.json?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          const crossModuleFlows = [];

          // Load each cross-module workflow
          for (const workflow of data.workflows) {
            const workflowResponse = await fetch(`${process.env.PUBLIC_URL}/data/${workflow.file}?t=${Date.now()}`);
            if (workflowResponse.ok) {
              const workflowData = await workflowResponse.json();
              // Get unique source documents (since all steps point to the same markdown file)
              const allDocs = workflowData.workflow_steps.flatMap(step => step.source_documents || []);
              const uniqueDocs = [...new Set(allDocs)];

              crossModuleFlows.push({
                flow_name: workflowData.workflow_name,
                flow_id: workflowData.workflow_id,
                description: workflowData.description,
                modules_involved: workflowData.modules_involved,
                workflow_steps: workflowData.workflow_steps,
                source_documents: uniqueDocs,
                isCrossModule: true
              });
            }
          }

          setFlows(crossModuleFlows);
        }
        setLoading(false);
        return;
      }

      // Try with citations file first
      let response = await fetch(`${process.env.PUBLIC_URL}/data/${moduleId}_user_flows_with_citations.json?t=${Date.now()}`);

      // If citations file doesn't exist, try without citations
      if (!response.ok) {
        response = await fetch(`${process.env.PUBLIC_URL}/data/${moduleId}_user_flows.json?t=${Date.now()}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to load flows for ${moduleId}`);
      }

      const data = await response.json();
      console.log('Loaded data for', moduleId, ':', data);

      let flowsData = [];

      // Handle different JSON structures
      if (Array.isArray(data)) {
        flowsData = data;
      } else if (data.flows) {
        flowsData = data.flows;
      } else if (data.user_flows) {
        flowsData = data.user_flows;
      } else {
        // Check for nested structure (e.g., listen_user_flows, brandwatch_engage_user_flows)
        const keys = Object.keys(data);
        for (const key of keys) {
          // Look for flows in nested structure
          if (data[key]?.flows) {
            flowsData = data[key].flows;
            break;
          } else if (data[key]?.user_flows) {
            flowsData = data[key].user_flows;
            break;
          } else if (Array.isArray(data[key])) {
            flowsData = data[key];
            break;
          }
        }
      }

      console.log('Extracted flows:', flowsData);

      // Apply logical ordering to flows based on module
      const orderedFlows = sortFlowsForModule(flowsData || [], moduleId);

      setFlows(orderedFlows);
      setSelectedFlow(null);  // Reset selected flow when changing modules
    } catch (error) {
      console.error('Error loading flows:', error);
      // Fallback to empty array instead of sample data
      setFlows([]);
      setSelectedFlow(null);
    }
    setLoading(false);
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setSelectedFlow(null); // Clear flow when module changes

    // Don't navigate on module selection - only expand/collapse
    // Navigation happens only when a flow is selected
  };

  // This is now only called when URL changes trigger flow selection
  // No longer called directly from onClick since we use Links
  const handleFlowSelect = (flow) => {
    console.log('handleFlowSelect - flow selected via URL change:', flow);

    // Set the selected flow
    setSelectedFlow(flow);

    // If flow has source documents, select the first one
    if (flow?.source_documents && flow.source_documents.length > 0) {
      setSelectedDocument(flow.source_documents[0]);
    }
  };

  const handlePDFSelect = (pdfPath) => {
    setSelectedDocument(pdfPath);
  };

  const handleSaveSourceDocs = async (editedDocs) => {
    try {
      // Get the correct module name and flow ID
      const moduleName = selectedModule?.name || selectedModule || '';
      const flowId = selectedFlow?.flow_name || selectedFlow?.name || '';

      console.log('Saving with module:', moduleName, 'flowId:', flowId);

      const response = await fetch('http://localhost:3001/api/update-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: moduleName,
          flowId: flowId,
          sourceDocs: editedDocs
        })
      });

      if (response.ok) {
        // Update the local state with the new source documents
        const updatedFlow = { ...selectedFlow, source_documents: editedDocs };
        setSelectedFlow(updatedFlow);

        // Update flows array to reflect changes
        const updatedFlows = flows.map(f => {
          const fId = f.flow_name || f.name;
          const selectedId = selectedFlow.flow_name || selectedFlow.name;
          return fId === selectedId ? updatedFlow : f;
        });
        setFlows(updatedFlows);

        // Success notification could be added here
        console.log('Source documents updated successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving source documents:', error);
      throw error;
    }
  };

  // Handle global search
  const handleGlobalSearch = (searchValue) => {
    setGlobalSearchTerm(searchValue);

    if (!searchValue) {
      setSearchResults(null);
      return;
    }

    const results = allFlows.filter(flow => searchInFlow(flow, searchValue));
    setSearchResults(results);
  };

  // Select a flow from search results
  const handleSearchResultSelect = (flow) => {
    // Store the flow to be selected after module loads
    setPendingFlowSelection(flow);
    // Select the module
    setSelectedModule(flow.module);
    // Expand the module
    setExpandedModules(prev => ({
      ...prev,
      [flow.module]: true
    }));
    // Clear search
    setGlobalSearchTerm('');
    setSearchResults(null);
  };

  // Enhanced search function that searches through all flow data
  const searchInFlow = (flow, searchStr) => {
    const searchLower = searchStr.toLowerCase();

    // Search in flow name
    const flowName = (flow.flow_name || flow.name || '').toLowerCase();
    if (flowName.includes(searchLower)) return true;

    // Search in description
    const description = (flow.description || '').toLowerCase();
    if (description.includes(searchLower)) return true;

    // Search in flow steps
    if (flow.steps && Array.isArray(flow.steps)) {
      for (const step of flow.steps) {
        let stepText = '';
        if (typeof step === 'string') {
          stepText = step;
        } else if (step.action) {
          stepText = step.action;
        } else if (step.description) {
          stepText = step.description;
        } else if (step.step_description) {
          stepText = step.step_description;
        }
        if (stepText.toLowerCase().includes(searchLower)) return true;
      }
    }

    // Search in source documents
    if (flow.source_documents && Array.isArray(flow.source_documents)) {
      for (const doc of flow.source_documents) {
        if (doc.toLowerCase().includes(searchLower)) return true;
      }
    }

    return false;
  };

  const filteredFlows = flows.filter(flow => {
    if (!searchTerm) return true;
    return searchInFlow(flow, searchTerm);
  });

  console.log('Filtered flows:', filteredFlows.length, 'of', flows.length);

  // Check if authentication is bypassed
  if (bypassAuth) {
    console.warn('⚠️ Authentication bypassed - Development mode');
  } else {
    // Show loading state while Auth0 is initializing
    if (isLoading) {
      return (
        <div className="auth-loading">
          <div className="loading-spinner"></div>
          <p>Loading authentication...</p>
        </div>
      );
    }

    // Show error if Auth0 fails
    if (error) {
      console.error('Auth0 Error:', error);
      return (
        <div className="auth-error">
          <p>Authentication Error: {error.message}</p>
          <p>Error Code: {error.error || 'Unknown'}</p>
          <p>Description: {error.error_description || 'No description available'}</p>
          <p>Please check the browser console for more details.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
    }

    // Show login screen if not authenticated
    if (!isAuthenticated) {
      return (
        <div className="login-prompt">
          <BookOpen size={48} className="brandwatch-logo" />
          <h1>Brandwatch Documentation Viewer</h1>
          <p>Access comprehensive documentation and user flows for all Brandwatch modules.</p>
          <LoginButton />
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            New users can sign up on the Auth0 login page
          </p>
        </div>
      );
    }
  }

  return (
    <div className="App">
      <header className="app-header compact">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <div className="header-content">
          <div className="header-title">
            <BookOpen size={20} className="header-icon" />
            <h1>Brandwatch Docs</h1>
          </div>
          <div className="global-search">
            <input
              type="text"
              placeholder="Search all flows..."
              value={globalSearchTerm}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              className="global-search-input"
            />
            <Search size={16} className="search-icon" />
            {searchResults && (
              <div className="search-results-dropdown">
                <div className="search-results-header">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  <button
                    className="close-search"
                    onClick={() => {
                      setGlobalSearchTerm('');
                      setSearchResults(null);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="search-results-list">
                  {searchResults.slice(0, 10).map((flow, idx) => (
                    <div
                      key={idx}
                      className="search-result-item"
                      onClick={() => handleSearchResultSelect(flow)}
                    >
                      <div className="result-module">{flow.module}</div>
                      <div className="result-flow">{flow.flow_name || flow.name}</div>
                    </div>
                  ))}
                  {searchResults.length > 10 && (
                    <div className="search-results-more">
                      ...and {searchResults.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="header-actions">
          <Link to="/complexity-dashboard" className="complexity-dashboard-link">
            <BarChart3 size={18} />
            <span>Complexity Analysis</span>
          </Link>
          <div className="view-mode-selector">
            <button
              className={viewMode === 'split' ? 'active' : ''}
              onClick={() => setViewMode('split')}
              title="Split View"
            >
              Split
            </button>
            <button
              className={viewMode === 'flow' ? 'active' : ''}
              onClick={() => setViewMode('flow')}
              title="Flow Only"
            >
              Flow
            </button>
            <button
              className={viewMode === 'pdf' ? 'active' : ''}
              onClick={() => setViewMode('pdf')}
              title="PDF Only"
            >
              PDF
            </button>
          </div>
          <div className="auth-header-right">
            {bypassAuth ? (
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#ff9800',
                color: 'white',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                ⚠️ Auth Bypassed (Dev Mode)
              </div>
            ) : (
              <>
                <UserProfile />
                <LogoutButton />
              </>
            )}
          </div>
        </div>
      </header>

      <div className="app-container">
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-content">
            <div className="sidebar-section modules-section">
              <h3>Modules</h3>
              <ModuleSelector
                modules={modules}
                selectedModule={selectedModule}
                onSelectModule={handleModuleSelect}
                flows={selectedModule ? flows : []}
                selectedFlow={selectedFlow}
                onSelectFlow={null} // No longer needed - using Links now
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filteredFlows={filteredFlows}
                expandedModules={expandedModules}
                setExpandedModules={setExpandedModules}
              />
            </div>
          </div>
        </aside>

        <main className="main-content">
          {selectedFlow ? (
            <>
              <div className="content-header compact">
                <div className="flow-info">
                  <h2>{selectedFlow.flow_name || selectedFlow.name || 'User Flow'}</h2>
                  {isAdmin && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      style={{
                        marginLeft: '10px',
                        padding: '4px 8px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Edit Sources
                    </button>
                  )}
                  {selectedFlow.source_documents && selectedFlow.source_documents.length > 0 && (
                    <div className="source-documents compact">
                      <FileText size={14} />
                      {selectedFlow.source_documents.map((doc, idx) => {
                        const isMarkdown = doc.endsWith('.md');
                        const fileName = doc.split('/').pop().replace('.md', '');
                        return (
                          <button
                            key={idx}
                            className={`doc-link compact ${isMarkdown ? 'markdown-doc' : 'pdf-doc'}`}
                            onClick={() => handlePDFSelect(doc)}
                            title={doc}
                          >
                            {isMarkdown ? `📄 ${fileName}` : fileName}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="content-panels-container">
                <PanelGroup direction="horizontal" className="content-panels">
                  {(viewMode === 'split' || viewMode === 'flow') && (
                    <Panel defaultSize={viewMode === 'flow' ? 100 : 35} minSize={25} maxSize={75}>
                      <div className="panel flow-panel">
                        <FlowDiagram
                          flow={selectedFlow}
                          allFlows={flows}
                          onFlowSelect={(flowId) => {
                            // Try to find the flow by different ID fields
                            const targetFlow = flows.find(f =>
                              f.flow_id === flowId ||
                              f.id === flowId ||
                              (f.flow_name && f.flow_name.replace(/ /g, '_').replace(/-/g, '_') === flowId)
                            );
                            if (targetFlow) {
                              setSelectedFlow(targetFlow);
                              // Ensure the module is expanded to show the selected flow
                              if (selectedModule) {
                                setExpandedModules(prev => ({
                                  ...prev,
                                  [selectedModule]: true
                                }));
                              }
                            }
                          }}
                          onModuleFlowClick={null} // No longer needed - using Links now
                          showCitations={false}
                        />
                      </div>
                    </Panel>
                  )}

                  {viewMode === 'split' && (
                    <PanelResizeHandle className="resize-handle" />
                  )}

                  {(viewMode === 'split' || viewMode === 'pdf') && selectedDocument && (
                    <Panel defaultSize={viewMode === 'pdf' ? 100 : 65} minSize={25}>
                      <div className="panel pdf-panel">
                        {selectedDocument.endsWith('.md') ? (
                          <MarkdownViewer documentPath={selectedDocument} />
                        ) : (
                          <SimplePDFViewer pdfPath={selectedDocument} />
                        )}
                      </div>
                    </Panel>
                  )}
                </PanelGroup>
              </div>
            </>
          ) : (
            <div className="welcome-screen">
              <GitBranch size={64} color="#2196F3" />
              <h2>Welcome to Brandwatch Documentation Viewer</h2>
              <p>Select a module and flow to begin exploring</p>
              <div className="quick-stats">
                <div className="stat-card">
                  <h4>Total Flows</h4>
                  <span className="stat-number">118</span>
                </div>
                <div className="stat-card">
                  <h4>Modules</h4>
                  <span className="stat-number">11</span>
                </div>
                <div className="stat-card">
                  <h4>PDFs</h4>
                  <span className="stat-number">307+</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Source Documents Modal */}
      <EditSourceModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        sourceDocs={selectedFlow?.source_documents}
        onSave={handleSaveSourceDocs}
        flowName={selectedFlow?.flow_name || selectedFlow?.name}
        module={selectedModule?.name || selectedModule}
      />
    </div>
  );
}

// Main App component with routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/complexity-dashboard" element={<ComplexityDashboard />} />
        <Route path="/:moduleId/:flowId" element={<MainApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;