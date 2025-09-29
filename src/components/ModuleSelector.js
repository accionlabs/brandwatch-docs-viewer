import React, { useState } from 'react';
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
  filteredFlows
}) => {
  const [expandedModules, setExpandedModules] = useState({});
  const handleModuleClick = (moduleId) => {
    if (selectedModule === moduleId) {
      // If already selected, toggle expand/collapse
      setExpandedModules(prev => ({
        ...prev,
        [moduleId]: !prev[moduleId]
      }));
    } else {
      // If selecting a new module, select it and expand it
      onSelectModule(moduleId);
      setExpandedModules(prev => ({
        ...prev,
        [moduleId]: true
      }));
    }
  };

  const isExpanded = (moduleId) => {
    return expandedModules[moduleId] && selectedModule === moduleId;
  };

  return (
    <div className="module-selector">
      {modules.map((module) => {
        const isSelected = selectedModule === module.id;
        const expanded = isExpanded(module.id);

        return (
          <div key={module.id} className="module-item">
            <div
              className={`module-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleModuleClick(module.id)}
            >
              <div className="module-expand-icon">
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              <div className="module-icon">{module.icon}</div>
              <div className="module-info">
                <h4>{module.name}</h4>
                <p>{module.flows} flows</p>
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
                    onSelectFlow={onSelectFlow}
                    loading={loading}
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