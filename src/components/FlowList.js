import React, { useRef, useEffect } from 'react';
import { GitBranch, FileText, ChevronRight, Lock, Unlock } from 'lucide-react';
import './FlowList.css';

const FlowList = ({ flows, selectedFlow, onSelectFlow, loading }) => {
  const flowRefs = useRef({});
  console.log('FlowList render - flows:', flows, 'loading:', loading);

  // Scroll to selected flow when it changes
  useEffect(() => {
    if (selectedFlow) {
      const flowId = selectedFlow.flow_id || selectedFlow.id;
      const flowElement = flowRefs.current[flowId];
      if (flowElement) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          flowElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    }
  }, [selectedFlow]);

  if (loading) {
    return <div className="loading">Loading flows...</div>;
  }

  if (!flows || flows.length === 0) {
    return <div className="no-flows">No flows found. Please select a module.</div>;
  }

  // Group flows by category
  const flowsByCategory = flows.reduce((acc, flow) => {
    const category = flow.flowCategory || 'Other';
    if (!acc[category]) {
      acc[category] = {
        name: category,
        description: flow.categoryDescription || '',
        flows: []
      };
    }
    acc[category].flows.push(flow);
    return acc;
  }, {});

  return (
    <div className="flow-list">
      {Object.values(flowsByCategory).map(category => (
        <div key={category.name} className="flow-category">
          <div className="category-header">
            <h3>{category.name}</h3>
            {category.description && (
              <p className="category-description">{category.description}</p>
            )}
          </div>
          {category.flows.map((flow, index) => {
            const flowId = flow.flow_id || flow.id || `flow-${index}`;
            const flowName = flow.flow_name || flow.name || 'Unnamed Flow';
            const isSelected = selectedFlow && (
              selectedFlow.flow_id === flowId ||
              selectedFlow.id === flowId ||
              selectedFlow === flow
            );

            return (
              <div
                key={flowId}
                ref={el => flowRefs.current[flowId] = el}
                className={`flow-item ${isSelected ? 'selected' : ''} ${flow.isPrerequisite ? 'prerequisite' : ''}`}
                onClick={() => onSelectFlow(flow)}
              >
                <div className="flow-item-header">
                  {flow.isPrerequisite ? (
                    <Unlock size={16} className="flow-icon prerequisite-icon" title="Starting point" />
                  ) : (
                    <GitBranch size={16} className="flow-icon" />
                  )}
                  <h4>{flowName}</h4>
                  {flow.dependencies && flow.dependencies.length > 0 && (
                    <ChevronRight size={14} className="dependency-indicator" title={`Requires ${flow.dependencies.length} prerequisite(s)`} />
                  )}
                </div>
                <p className="flow-description">
                  {flow.description || 'No description available'}
                </p>
                {flow.source_documents && flow.source_documents.length > 0 && (
                  <div className="flow-sources">
                    <FileText size={12} />
                    <span>{flow.source_documents.length} source{flow.source_documents.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                {flow.dependencies && flow.dependencies.length > 0 && (
                  <div className="flow-dependencies">
                    <Lock size={12} />
                    <span className="dependency-text">Requires {flow.dependencies.length} prerequisite{flow.dependencies.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default FlowList;