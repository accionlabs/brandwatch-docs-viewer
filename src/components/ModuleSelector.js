import React, { useState, useRef, useEffect } from 'react';
import FlowList from './FlowList';
import SearchBar from './SearchBar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import './ModuleSelector.css';

const ModuleSelector = ({
  modules,
  selectedModule,
  onSelectModule,
  flows,
  selectedFlow,
  onSelectFlow,
  loading,
  searchTerm,
  onSearchChange,
  filteredFlows,
  expandedModules,
  setExpandedModules
}) => {
  // Use props if provided, otherwise manage locally
  const [localExpandedModules, setLocalExpandedModules] = useState({});
  const expandedState = expandedModules !== undefined ? expandedModules : localExpandedModules;
  const setExpandedState = setExpandedModules !== undefined ? setExpandedModules : setLocalExpandedModules;
  const moduleRefs = useRef({});

  const handleModuleClick = (module) => {
    const moduleId = typeof module === 'string' ? module : module.id;
    const currentSelectedId = typeof selectedModule === 'string' ? selectedModule : selectedModule?.id;

    if (currentSelectedId === moduleId) {
      // If already selected, toggle expand/collapse
      setExpandedState(prev => ({
        ...prev,
        [moduleId]: !prev[moduleId]
      }));
    } else {
      // If selecting a new module, select it and expand it
      onSelectModule(module);
      setExpandedState(prev => ({
        ...prev,
        [moduleId]: true
      }));
    }
  };

  // Scroll to module when flows are loaded (but NOT if a specific flow is selected)
  useEffect(() => {
    const currentSelectedId = typeof selectedModule === 'string' ? selectedModule : selectedModule?.id;
    // Only scroll to module if there's no selected flow - this prevents overriding flow scroll
    if (currentSelectedId && flows.length > 0 && expandedState[currentSelectedId] && !selectedFlow) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const moduleElement = moduleRefs.current[currentSelectedId];
        if (moduleElement) {
          const sidebar = moduleElement.closest('.sidebar-content');
          if (sidebar) {
            // Find the module card within the module element
            const moduleCard = moduleElement.querySelector('.module-card');
            if (moduleCard) {
              // Get the absolute position of the module card
              const moduleCardRect = moduleCard.getBoundingClientRect();
              const sidebarRect = sidebar.getBoundingClientRect();

              // Calculate the scroll position to put module card at the top
              const currentScroll = sidebar.scrollTop;
              const relativeTop = moduleCardRect.top - sidebarRect.top;
              const targetScroll = currentScroll + relativeTop - 10; // 10px padding from top

              sidebar.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
              });
            }
          }
        }
      }, 150); // Slightly longer delay to ensure flows are rendered
    }
  }, [selectedModule, flows.length, expandedState, selectedFlow]);

  const isExpanded = (moduleId) => {
    const currentSelectedId = typeof selectedModule === 'string' ? selectedModule : selectedModule?.id;
    return expandedState[moduleId] && currentSelectedId === moduleId;
  };

  return (
    <div className="module-selector">
      {modules.map((module) => {
        // Handle divider
        if (module.isDivider) {
          return (
            <div key={module.id} className="module-divider">
              <hr />
            </div>
          );
        }

        const currentSelectedId = typeof selectedModule === 'string' ? selectedModule : selectedModule?.id;
        const isSelected = currentSelectedId === module.id;
        const expanded = isExpanded(module.id);
        const isCrossModule = module.isCrossModule;

        return (
          <div
            key={module.id}
            className={`module-item ${isCrossModule ? 'cross-module-item' : ''}`}
            ref={el => moduleRefs.current[module.id] = el}
          >
            <div
              className={`module-card ${isSelected ? 'selected' : ''} ${isCrossModule ? 'cross-module' : ''}`}
              onClick={() => handleModuleClick(module)}
            >
              <div className="module-expand-icon">
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              <div className="module-icon">{module.icon}</div>
              <div className="module-info">
                <h4>{module.name}</h4>
                <p>{module.flows} {isCrossModule ? 'workflows' : 'flows'}</p>
              </div>
            </div>

            {expanded && (
              <div className="module-flows">
                {flows.length > 0 && (
                  <div className="flows-search">
                    <SearchBar
                      value={searchTerm}
                      onChange={onSearchChange}
                      placeholder="Search flows..."
                    />
                  </div>
                )}
                {loading ? (
                  <div className="loading">Loading flows...</div>
                ) : flows.length > 0 ? (
                  <FlowList
                    flows={filteredFlows}
                    selectedFlow={selectedFlow}
                    loading={loading}
                    moduleId={module.id}
                  />
                ) : (
                  <div className="no-flows">No flows available</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ModuleSelector;