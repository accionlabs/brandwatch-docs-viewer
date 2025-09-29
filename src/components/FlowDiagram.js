import React, { useEffect, useState, useRef } from 'react';
import './FlowDiagram.css';

const FlowDiagram = ({ flow, showCitations = true }) => {
  const [nodes, setNodes] = useState([]);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (flow) {
      generateNodesFromFlow(flow);
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

  const generateNodesFromFlow = (flowData) => {
    const generatedNodes = [];
    const steps = flowData.steps || [];
    let currentY = 60;
    const nodeSpacing = 40; // Reduced base spacing between nodes
    const decisionExtraSpace = 10; // Reduced extra space for decision nodes

    // Add start node
    generatedNodes.push({
      id: 'start',
      type: 'start',
      label: 'Start',
      position: { x: 400, y: currentY },
      height: 50
    });
    currentY += 50 + nodeSpacing;

    // Add step nodes
    steps.forEach((step, index) => {
      let stepText = '';

      // Handle different step formats
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
        height: nodeHeight
      });

      currentY += nodeHeight + (isDecision ? nodeSpacing + decisionExtraSpace : nodeSpacing);
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
      'decision': '#FF9800'
    };

    if (node.type === 'decision') {
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
            fill={colors[node.type]}
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
            fill={colors[node.type]}
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
            fill={colors[node.type]}
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
      const fromNode = nodes[i];
      const toNode = nodes[i + 1];

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
      <svg
        className="flow-svg"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%'
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