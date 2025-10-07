import React, { useRef, useEffect } from 'react';
import { GitBranch, FileText, ChevronRight, Lock, Unlock } from 'lucide-react';
import './FlowList.css';

const FlowList = ({ flows, selectedFlow, loading, moduleId }) => {
  const flowRefs = useRef({});
  console.log('FlowList render - flows:', flows, 'loading:', loading);

  // Scroll to selected flow when it changes
  useEffect(() => {
    if (selectedFlow) {
      const flowId = selectedFlow.flow_id || selectedFlow.id;
      const flowElement = flowRefs.current[flowId];
      if (flowElement) {
        // Small delay to ensure DOM is ready and module scroll has finished
        setTimeout(() => {
          // Find the sidebar container for proper scrolling
          const sidebar = flowElement.closest('.sidebar-content');
          if (sidebar) {
            // Get positions
            const flowRect = flowElement.getBoundingClientRect();
            const sidebarRect = sidebar.getBoundingClientRect();

            // Check if the flow is already visible
            const isVisible = flowRect.top >= sidebarRect.top &&
                            flowRect.bottom <= sidebarRect.bottom;

            // Only scroll if the flow is not fully visible
            if (!isVisible) {
              // Calculate scroll to center the flow in view
              const currentScroll = sidebar.scrollTop;
              const relativeTop = flowRect.top - sidebarRect.top;
              const flowHeight = flowRect.height;
              const sidebarHeight = sidebarRect.height;

              // Center the flow in the visible area
              const targetScroll = currentScroll + relativeTop - (sidebarHeight - flowHeight) / 2;

              sidebar.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
              });
            }
          } else {
            // Fallback to scrollIntoView if sidebar not found
            flowElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 200); // Slightly longer delay to ensure module scroll has completed
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

            // Create the flow slug for the URL
            const flowSlug = flow.flow_id
              || flow.id
              || (flow.flow_name ? flow.flow_name.toLowerCase().replace(/\s+/g, '_') : '')
              || (flow.name ? flow.name.toLowerCase().replace(/\s+/g, '_') : '');

            return (
              <a
                key={flowId}
                href={`#/${moduleId}/${flowSlug}`}
                ref={el => flowRefs.current[flowId] = el}
                className={`flow-item ${isSelected ? 'selected' : ''} ${flow.isPrerequisite ? 'prerequisite' : ''}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={(e) => {
                  console.log(`[A CLICK] Navigating to #/${moduleId}/${flowSlug}`);
                  // Let the browser handle the navigation naturally
                }}
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
              </a>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default FlowList;