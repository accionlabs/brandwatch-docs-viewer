import React, { useEffect, useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';
import './FlowDiagram.css';

const FlowDiagram = ({ flow, allFlows = [], onFlowSelect, showCitations = true, onModuleFlowClick }) => {
  const [nodes, setNodes] = useState([]);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (flow) {
      generateNodesFromFlow(flow);
      setZoomLevel(1); // Reset zoom when flow changes
      setPanOffset({ x: 0, y: 0 }); // Reset pan when flow changes
    }
  }, [flow]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    handleResize(); // Initial size

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
      }
    };

    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (svgElement) {
        svgElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(3, prev + 0.2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.5, prev - 0.2));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Panning handlers
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click only
      setIsPanning(true);
      setStartPan({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Add mouse event listeners for panning
  useEffect(() => {
    const handleDocumentMouseMove = (e) => handleMouseMove(e);
    const handleDocumentMouseUp = () => handleMouseUp();

    if (isPanning) {
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [isPanning, startPan]);

  const generateNodesFromFlow = (flowData) => {
    const generatedNodes = [];
    const isCrossModule = flowData.isCrossModule || !!flowData.workflow_steps;
    const steps = isCrossModule ? (flowData.workflow_steps || []) : (flowData.steps || []);
    let currentY = 60;
    const nodeSpacing = 40; // Reduced base spacing between nodes
    const decisionExtraSpace = 10; // Reduced extra space for decision nodes
    const moduleSpacing = 60; // Extra spacing between modules

    // Module colors for cross-module workflows
    const moduleColors = {
      'listen': '#4A90E2',
      'consumer_research': '#7B68EE',
      'engage': '#50C878',
      'measure': '#FFB347',
      'vizia': '#FF6B6B',
      'publish': '#9370DB',
      'advertise': '#FF69B4',
      'influence': '#20B2AA',
      'benchmark': '#87CEEB',
      'reviews': '#DDA0DD',
      'audience': '#F0E68C'
    };

    // Add start node
    generatedNodes.push({
      id: 'start',
      type: 'start',
      label: 'Start',
      position: { x: 400, y: currentY },
      height: 50
    });
    currentY += 50 + nodeSpacing;

    // Track current module for cross-module workflows
    let currentModule = null;

    // Add step nodes
    steps.forEach((step, index) => {
      let stepText = '';
      let stepModule = null;

      // Handle cross-module workflow steps
      if (isCrossModule) {
        stepModule = step.module;
        stepText = step.step_description || step.description || `Step ${index + 1}`;

        // Add module label if module changes
        if (stepModule && stepModule !== currentModule) {
          // Get proper module display name
          const moduleDisplayNames = {
            'listen': 'LISTEN',
            'consumer_research': 'CONSUMER RESEARCH',
            'engage': 'ENGAGE',
            'measure': 'MEASURE',
            'vizia': 'VIZIA',
            'publish': 'PUBLISH',
            'advertise': 'ADVERTISE',
            'influence': 'INFLUENCE',
            'benchmark': 'BENCHMARK',
            'reviews': 'REVIEWS',
            'audience': 'AUDIENCE'
          };
          const moduleName = moduleDisplayNames[stepModule] || stepModule.toUpperCase();
          generatedNodes.push({
            id: `module-label-${stepModule}`,
            type: 'module-label',
            label: `📦 ${moduleName} MODULE`,
            position: { x: 400, y: currentY },
            height: 30,
            module: stepModule,
            color: moduleColors[stepModule]
          });
          currentY += 40;
          currentModule = stepModule;
        }
      } else {
        // Handle regular flow steps
        if (typeof step === 'string') {
          stepText = step;
        } else if (step.action) {
          stepText = step.action;
        } else if (step.description) {
          stepText = step.description;
        } else if (step.step_description) {
          stepText = step.step_description;
        } else {
          stepText = `Step ${index + 1}`;
        }
      }

      const isDecision = stepText.toLowerCase().includes('if ') ||
                         stepText.toLowerCase().includes('decide') ||
                         stepText.toLowerCase().includes('choose') ||
                         stepText.includes('?');

      // Calculate actual node height based on text
      let nodeHeight;
      if (isDecision) {
        nodeHeight = 120;
      } else {
        // Calculate height for process nodes based on text wrapping
        const lines = Math.ceil(stepText.length / 30); // Rough estimate
        nodeHeight = Math.max(60, lines * 16 + 20);
      }

      generatedNodes.push({
        id: `step-${index}`,
        type: isDecision ? 'decision' : 'process',
        label: stepText,
        position: { x: 400, y: currentY + nodeHeight/2 },
        height: nodeHeight,
        module: stepModule,
        color: stepModule ? moduleColors[stepModule] : null,
        moduleFlowReference: isCrossModule ? step.module_flow_reference : null,
        stepData: step
      });

      // Add extra spacing between different modules
      const nextStep = steps[index + 1];
      const nextModule = nextStep?.module;
      const moduleChanges = isCrossModule && stepModule && nextModule && stepModule !== nextModule;

      currentY += nodeHeight + (isDecision ? nodeSpacing + decisionExtraSpace : nodeSpacing);
      if (moduleChanges) {
        currentY += moduleSpacing;
      }
    });

    // Add end node
    generatedNodes.push({
      id: 'end',
      type: 'end',
      label: 'End',
      position: { x: 400, y: currentY },
      height: 50
    });

    setNodes(generatedNodes);
  };

  const wrapText = (text, maxWidth, fontSize = 12) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = [];

    // Approximate character width (for monospace-ish calculation)
    const charWidth = fontSize * 0.6;
    const maxChars = Math.floor(maxWidth / charWidth);

    words.forEach(word => {
      const testLine = [...currentLine, word].join(' ');
      if (testLine.length > maxChars && currentLine.length > 0) {
        lines.push(currentLine.join(' '));
        currentLine = [word];
      } else {
        currentLine.push(word);
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }

    return lines;
  };

  const renderNodeAsSVG = (node) => {
    const colors = {
      'start': '#4CAF50',
      'end': '#F44336',
      'process': '#2196F3',
      'decision': '#FF9800',
      'module-label': '#6B7280'
    };

    // Use module-specific color if available
    const nodeColor = node.color || colors[node.type];

    if (node.type === 'module-label') {
      // Module label for cross-module workflows
      return (
        <g key={node.id}>
          <rect
            x={node.position.x - 150}
            y={node.position.y - 15}
            width="300"
            height="35"
            rx="8"
            ry="8"
            fill={node.color || nodeColor}
            stroke="white"
            strokeWidth="2"
          />
          <text
            x={node.position.x}
            y={node.position.y + 4}
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
          >
            {node.label}
          </text>
        </g>
      );
    } else if (node.type === 'decision') {
      // Diamond shape for decision nodes
      const size = 60;
      const points = [
        `${node.position.x},${node.position.y - size}`,
        `${node.position.x + size},${node.position.y}`,
        `${node.position.x},${node.position.y + size}`,
        `${node.position.x - size},${node.position.y}`
      ].join(' ');

      const lines = wrapText(node.label, 80, 11);
      const lineHeight = 14;
      const startY = node.position.y - ((lines.length - 1) * lineHeight / 2);

      return (
        <g key={node.id}>
          <polygon
            points={points}
            fill={nodeColor}
            stroke="white"
            strokeWidth="2"
          />
          {lines.map((line, i) => (
            <text
              key={i}
              x={node.position.x}
              y={startY + (i * lineHeight)}
              textAnchor="middle"
              fill="white"
              fontSize="11"
              fontWeight="500"
            >
              {line}
            </text>
          ))}
        </g>
      );
    } else if (node.type === 'start' || node.type === 'end') {
      // Rounded rectangles for start/end
      return (
        <g key={node.id}>
          <rect
            x={node.position.x - 80}
            y={node.position.y - 25}
            width="160"
            height="50"
            rx="25"
            ry="25"
            fill={nodeColor}
            stroke="white"
            strokeWidth="2"
          />
          <text
            x={node.position.x}
            y={node.position.y + 5}
            textAnchor="middle"
            fill="white"
            fontSize="16"
            fontWeight="500"
          >
            {node.label}
          </text>
        </g>
      );
    } else {
      // Rectangle for process nodes
      const lines = wrapText(node.label, 180, 13);
      const lineHeight = 16;
      const boxHeight = Math.max(60, lines.length * lineHeight + 20);
      const startY = node.position.y - ((lines.length - 1) * lineHeight / 2);

      return (
        <g key={node.id}>
          <rect
            x={node.position.x - 140}
            y={node.position.y - boxHeight / 2}
            width="280"
            height={boxHeight}
            rx="8"
            ry="8"
            fill={nodeColor}
            stroke="white"
            strokeWidth="2"
          />
          {lines.map((line, i) => (
            <text
              key={i}
              x={node.position.x}
              y={startY + (i * lineHeight)}
              textAnchor="middle"
              fill="white"
              fontSize="13"
            >
              {line}
            </text>
          ))}
        </g>
      );
    }
  };

  const renderConnectionsAsSVG = () => {
    const connections = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      let fromNode = nodes[i];
      let toNode = nodes[i + 1];

      // Skip module-label nodes for connections
      if (fromNode && fromNode.type === 'module-label') {
        continue;
      }
      if (toNode && toNode.type === 'module-label' && i + 2 < nodes.length) {
        toNode = nodes[i + 2];
      }

      // Calculate connection points based on node type and height
      let y1Offset = 25; // Default for start/end nodes
      let y2Offset = -25;

      if (fromNode.type === 'process') {
        // Calculate actual box height for process nodes
        const lines = wrapText(fromNode.label, 180, 13);
        const boxHeight = Math.max(60, lines.length * 16 + 20);
        y1Offset = boxHeight / 2;
      } else if (fromNode.type === 'decision') {
        y1Offset = 60;
      }

      if (toNode.type === 'process') {
        const lines = wrapText(toNode.label, 180, 13);
        const boxHeight = Math.max(60, lines.length * 16 + 20);
        y2Offset = -(boxHeight / 2);
      } else if (toNode.type === 'decision') {
        y2Offset = -60;
      }

      connections.push(
        <line
          key={`connection-${i}`}
          x1={fromNode.position.x}
          y1={fromNode.position.y + y1Offset}
          x2={toNode.position.x}
          y2={toNode.position.y + y2Offset}
          stroke="#666"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
      );
    }
    return connections;
  };

  // Calculate bounds of all nodes to determine viewBox
  const calculateBounds = () => {
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      let nodeWidth = 200;
      let nodeHeight = 60;

      if (node.type === 'process') {
        nodeWidth = 280;
        const lines = wrapText(node.label, 180, 13);
        nodeHeight = Math.max(60, lines.length * 16 + 20);
      } else if (node.type === 'decision') {
        nodeWidth = 120;
        nodeHeight = 120;
      } else if (node.type === 'start' || node.type === 'end') {
        nodeWidth = 160;
        nodeHeight = 50;
      }

      minX = Math.min(minX, node.position.x - nodeWidth/2 - 20);
      minY = Math.min(minY, node.position.y - nodeHeight/2 - 20);
      maxX = Math.max(maxX, node.position.x + nodeWidth/2 + 20);
      maxY = Math.max(maxY, node.position.y + nodeHeight/2 + 20);
    });

    return { minX, minY, maxX, maxY };
  };

  const bounds = calculateBounds();
  const svgWidth = bounds.maxX - bounds.minX + 200; // Add padding
  const svgHeight = bounds.maxY - bounds.minY + 200;
  const viewBox = `${bounds.minX - 50} ${bounds.minY - 50} ${svgWidth} ${svgHeight}`;

  return (
    <div className="flow-diagram" ref={containerRef}>
      <div className="zoom-controls">
        <button onClick={handleZoomIn} title="Zoom In (Ctrl + Scroll Up)" className="zoom-btn">
          <ZoomIn size={18} />
        </button>
        <button onClick={handleZoomOut} title="Zoom Out (Ctrl + Scroll Down)" className="zoom-btn">
          <ZoomOut size={18} />
        </button>
        <button onClick={handleZoomReset} title="Reset Zoom & Position" className="zoom-btn">
          <Maximize2 size={18} />
        </button>
        <button onClick={() => setPanOffset({ x: 0, y: 0 })} title="Center View" className="zoom-btn">
          <Move size={18} />
        </button>
        <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
      </div>
      <div className="svg-container" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          className={`flow-svg ${isPanning ? 'is-panning' : ''}`}
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          onMouseDown={handleMouseDown}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center',
            transition: isPanning ? 'none' : 'transform 0.2s ease',
            cursor: isPanning ? 'grabbing' : 'grab'
          }}
        >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#666"
            />
          </marker>
        </defs>

        {/* Grid background */}
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="#e0e0e0" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Render connections first (behind nodes) */}
        <g className="connections">
          {renderConnectionsAsSVG()}
        </g>

        {/* Render nodes */}
        <g className="nodes">
          {nodes.map(renderNodeAsSVG)}
        </g>
      </svg>
      </div>
      {flow.prerequisites && flow.prerequisites.length > 0 && (
        <div className="flow-prerequisites-panel">
          <h4>Prerequisites</h4>
          <ul>
            {flow.prerequisites.map((prereq, idx) => (
              <li key={idx}>{prereq}</li>
            ))}
          </ul>
        </div>
      )}
      {flow.related_flows && flow.related_flows.length > 0 && (
        <div className="flow-dependencies-panel">
          <h4>Related Flows</h4>
          <ul>
            {flow.related_flows.map((flowId, idx) => {
              // Try to find the related flow by different ID fields
              const relatedFlow = allFlows.find(f =>
                f.flow_id === flowId ||
                f.id === flowId ||
                (f.flow_name && f.flow_name.replace(/ /g, '_').replace(/-/g, '_') === flowId)
              );

              if (!relatedFlow) {
                // If we can't find the flow, at least make the ID more readable
                const displayName = flowId
                  .replace(/_/g, ' ')
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^\s+/, '')
                  .replace(/\b\w/g, c => c.toUpperCase());
                return (
                  <li key={idx}>
                    <span className="flow-dependency-unavailable">{displayName}</span>
                  </li>
                );
              }

              return (
                <li key={idx}>
                  <button
                    className="flow-dependency-link"
                    onClick={() => {
                      if (onFlowSelect) {
                        // Try to select by different ID fields
                        const flowToSelect = allFlows.find(f =>
                          f.flow_id === flowId ||
                          f.id === flowId ||
                          (f.flow_name && f.flow_name.replace(/ /g, '_').replace(/-/g, '_') === flowId)
                        );
                        if (flowToSelect) {
                          onFlowSelect(flowToSelect.flow_id || flowToSelect.id || flowId);
                        }
                      }
                    }}
                    title={relatedFlow.description || relatedFlow.flow_description || ''}
                  >
                    {relatedFlow.flow_name || relatedFlow.name || flowId}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {/* Related Module Flows for Cross-Module Workflows */}
      {flow.workflow_steps && flow.workflow_steps.length > 0 && (
        <div className="related-module-flows">
          <h4>Related Module Flows</h4>
          <div className="module-flows-grid">
            {flow.workflow_steps.filter(step => step.module_flow_reference).map((step, idx) => {
              const moduleDisplayNames = {
                'listen': 'Listen',
                'consumer_research': 'Consumer Research',
                'engage': 'Engage',
                'measure': 'Measure',
                'vizia': 'Vizia',
                'publish': 'Publish',
                'advertise': 'Advertise',
                'influence': 'Influence',
                'benchmark': 'Benchmark',
                'reviews': 'Reviews',
                'audience': 'Audience'
              };

              const moduleName = moduleDisplayNames[step.module] || step.module;
              const flowRef = step.module_flow_reference;

              return (
                <div key={idx} className="module-flow-item">
                  <div className="module-flow-step">Step {step.step_id}</div>
                  <div className="module-flow-module">{moduleName}</div>
                  <a
                    href={`#/${step.module}/${flowRef.flow_id}`}
                    className="module-flow-link"
                    title={`${flowRef.description} (${flowRef.flow_id})`}
                  >
                    {flowRef.flow_name}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {showCitations && flow.source_documents && flow.source_documents.length > 0 && (
        <div className="flow-citations">
          <h4>Source Documentation:</h4>
          <ul>
            {flow.source_documents.map((doc, idx) => (
              <li key={idx}>{doc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FlowDiagram;