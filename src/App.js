import React, { useState, useEffect } from 'react';
import './App.css';
import ModuleSelector from './components/ModuleSelector';
import FlowDiagram from './components/FlowDiagram';
// import PDFViewer from './components/PDFViewer';
import SimplePDFViewer from './components/SimplePDFViewer';
import { FileText, GitBranch, Search, BookOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { sortFlowsForModule, sortModules, getModuleMetadata } from './utils/flowOrdering';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useAuth0 } from '@auth0/auth0-react';
import { LoginButton, LogoutButton, UserProfile } from './components/AuthButtons';

function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [allFlows, setAllFlows] = useState([]); // Store all flows from all modules
  const [viewMode, setViewMode] = useState('split'); // 'split', 'flow', 'pdf'
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [pendingFlowSelection, setPendingFlowSelection] = useState(null);

  // Debug: Log state changes
  useEffect(() => {
    console.log('State updated - flows count:', flows.length, 'selectedModule:', selectedModule);
  }, [flows, selectedModule]);

  useEffect(() => {
    // Load modules data
    loadModules();
    // Load all flows for global search
    loadAllFlows();
  }, []);

  useEffect(() => {
    if (selectedModule) {
      console.log('Selected module changed:', selectedModule);
      loadFlowsForModule(selectedModule);
    } else {
      setFlows([]);
    }
  }, [selectedModule]);

  // Handle pending flow selection after flows are loaded
  useEffect(() => {
    if (pendingFlowSelection && flows.length > 0) {
      // Find the matching flow in the loaded flows
      const matchingFlow = flows.find(f => {
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
        console.log('Setting selected flow from pending:', matchingFlow);
        setSelectedFlow(matchingFlow);
        // Set PDF if available
        if (matchingFlow.source_documents && matchingFlow.source_documents.length > 0) {
          setSelectedPDF(matchingFlow.source_documents[0]);
        }
        // Clear pending selection
        setPendingFlowSelection(null);
      }
    }
  }, [flows, pendingFlowSelection]);

  // Load all flows from all modules for global search
  const loadAllFlows = async () => {
    const allFlowsData = [];
    const moduleIds = ['listen', 'consumer_research', 'measure', 'benchmark', 'publish',
                       'engage', 'reviews', 'advertise', 'influence', 'audience', 'vizia'];

    for (const moduleId of moduleIds) {
      try {
        let response = await fetch(`${process.env.PUBLIC_URL}/data/${moduleId}_user_flows_with_citations.json`);
        if (!response.ok) {
          response = await fetch(`${process.env.PUBLIC_URL}/data/${moduleId}_user_flows.json`);
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
      { id: 'influence', name: 'Influence', description: 'Influencer marketing', icon: '⭐', flows: 1 },
      { id: 'audience', name: 'Audience', description: 'Customer data platform', icon: '👥', flows: 6 },
      { id: 'vizia', name: 'VIZIA', description: 'Command center visualization', icon: '🖥️', flows: 6 }
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
      // Try with citations file first
      let response = await fetch(`${process.env.PUBLIC_URL}/data/${moduleId}_user_flows_with_citations.json`);

      // If citations file doesn't exist, try without citations
      if (!response.ok) {
        response = await fetch(`${process.env.PUBLIC_URL}/data/${moduleId}_user_flows.json`);
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

  const handleFlowSelect = (flow) => {
    setSelectedFlow(flow);
    // If flow has source documents, select the first one
    if (flow.source_documents && flow.source_documents.length > 0) {
      setSelectedPDF(flow.source_documents[0]);
    }
  };

  const handlePDFSelect = (pdfPath) => {
    setSelectedPDF(pdfPath);
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
      </div>
    );
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
            <UserProfile />
            <LogoutButton />
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
                onSelectModule={setSelectedModule}
                flows={selectedModule ? flows : []}
                selectedFlow={selectedFlow}
                onSelectFlow={handleFlowSelect}
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
                  {selectedFlow.source_documents && selectedFlow.source_documents.length > 0 && (
                    <div className="source-documents compact">
                      <FileText size={14} />
                      {selectedFlow.source_documents.map((doc, idx) => (
                        <button
                          key={idx}
                          className="doc-link compact"
                          onClick={() => handlePDFSelect(doc)}
                          title={doc}
                        >
                          {doc.split('/').pop()}
                        </button>
                      ))}
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
                          showCitations={false}
                        />
                      </div>
                    </Panel>
                  )}

                  {viewMode === 'split' && (
                    <PanelResizeHandle className="resize-handle" />
                  )}

                  {(viewMode === 'split' || viewMode === 'pdf') && selectedPDF && (
                    <Panel defaultSize={viewMode === 'pdf' ? 100 : 65} minSize={25}>
                      <div className="panel pdf-panel">
                        <SimplePDFViewer pdfPath={selectedPDF} />
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
    </div>
  );
}

export default App;