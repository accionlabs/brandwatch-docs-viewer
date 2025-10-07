import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ComplexityAnalyzer from '../utils/complexityAnalyzer';
import './ComplexityDashboard.css';
import {
  BarChart3,
  Clock,
  Users,
  Layers,
  Brain,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ComplexityDashboard = () => {
  const [analysis, setAnalysis] = useState(null);
  const [overallStats, setOverallStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplexityData();
  }, []);

  const loadComplexityData = async () => {
    setLoading(true);
    const analyzer = new ComplexityAnalyzer();

    try {
      const moduleAnalysis = await analyzer.analyzeAllModules();
      const stats = analyzer.calculateOverallStats(moduleAnalysis);
      setAnalysis(moduleAnalysis);
      setOverallStats(stats);
    } catch (error) {
      console.error('Error analyzing complexity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="complexity-dashboard loading">
        <div className="loading-spinner">
          <Brain size={48} className="spinning" />
          <h2>Analyzing UI Complexity...</h2>
          <p>Processing workflows across all modules</p>
        </div>
      </div>
    );
  }

  if (!analysis || !overallStats) {
    return (
      <div className="complexity-dashboard error">
        <AlertTriangle size={48} />
        <h2>Unable to load complexity data</h2>
      </div>
    );
  }

  // Define unique colors for each module
  const moduleColors = {
    'advertise': { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgba(239, 68, 68, 1)' }, // Red
    'audience': { bg: 'rgba(251, 191, 36, 0.7)', border: 'rgba(251, 191, 36, 1)' }, // Yellow
    'benchmark': { bg: 'rgba(34, 197, 94, 0.7)', border: 'rgba(34, 197, 94, 1)' }, // Green
    'consumer_research': { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(59, 130, 246, 1)' }, // Blue
    'engage': { bg: 'rgba(168, 85, 247, 0.7)', border: 'rgba(168, 85, 247, 1)' }, // Purple
    'influence': { bg: 'rgba(236, 72, 153, 0.7)', border: 'rgba(236, 72, 153, 1)' }, // Pink
    'listen': { bg: 'rgba(14, 165, 233, 0.7)', border: 'rgba(14, 165, 233, 1)' }, // Sky Blue
    'measure': { bg: 'rgba(245, 158, 11, 0.7)', border: 'rgba(245, 158, 11, 1)' }, // Amber
    'publish': { bg: 'rgba(16, 185, 129, 0.7)', border: 'rgba(16, 185, 129, 1)' }, // Emerald
    'brandwatch_reviews': { bg: 'rgba(99, 102, 241, 0.7)', border: 'rgba(99, 102, 241, 1)' }, // Indigo
    'vizia': { bg: 'rgba(217, 70, 239, 0.7)', border: 'rgba(217, 70, 239, 1)' } // Fuchsia
  };

  // Time estimation constants (in seconds)
  const TIME_PER_STEP = 30; // 30 seconds per step on average
  const TIME_PER_USER_ACTION = 15; // Additional 15 seconds for user input/decision

  // Find global max steps for consistent scaling
  const globalMaxSteps = Math.max(
    ...Object.values(analysis).flatMap(m => m.flows.map(f => f.totalSteps))
  );

  // Prepare individual module charts
  const moduleCharts = Object.entries(analysis)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([moduleName, moduleData]) => {
      const moduleDisplayName = moduleName.replace(/_/g, ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const moduleColor = moduleColors[moduleName] || { bg: 'rgba(156, 163, 175, 0.7)', border: 'rgba(156, 163, 175, 1)' };

      // Sort flows by complexity
      const sortedFlows = moduleData.flows.sort((a, b) => b.totalSteps - a.totalSteps);

      const flowNames = sortedFlows.map(f =>
        f.name.length > 40 ? f.name.substring(0, 37) + '...' : f.name
      );
      const flowSteps = sortedFlows.map(f => f.totalSteps);
      const flowTimes = sortedFlows.map(f =>
        Math.round((f.totalSteps * TIME_PER_STEP + (f.userActions || 0) * TIME_PER_USER_ACTION) / 60)
      );

      return {
        moduleName,
        moduleDisplayName,
        moduleColor,
        chartData: {
          labels: flowNames,
          datasets: [
            {
              label: 'Steps',
              data: flowSteps,
              backgroundColor: moduleColor.bg,
              borderColor: moduleColor.border,
              borderWidth: 2,
              barPercentage: 0.7
            }
          ]
        },
        timeData: flowTimes,
        totalFlows: sortedFlows.length,
        totalSteps: flowSteps.reduce((a, b) => a + b, 0),
        totalTime: flowTimes.reduce((a, b) => a + b, 0),
        avgTime: sortedFlows.length > 0 ? Math.round(flowTimes.reduce((a, b) => a + b, 0) / sortedFlows.length) : 0
      };
    });





  return (
    <div className="complexity-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="back-to-main">
              <ArrowLeft size={20} />
              <span>Back to Documentation</span>
            </Link>
            <div>
              <h1>UI Complexity Analysis</h1>
              <p>Current state analysis of Brandwatch user interface complexity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="executive-summary">
        <div className="summary-card highlight">
          <div className="card-icon">
            <Layers size={32} />
          </div>
          <div className="card-content">
            <h3>{overallStats.totalFlows}</h3>
            <p>Total Workflows</p>
            <span className="subtext">Across {overallStats.totalModules} modules</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <BarChart3 size={32} />
          </div>
          <div className="card-content">
            <h3>{overallStats.avgStepsPerFlow}</h3>
            <p>Avg Steps/Workflow</p>
            <span className="subtext">Could be 1 with AI</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <Clock size={32} />
          </div>
          <div className="card-content">
            <h3>{Math.max(Math.round(overallStats.estimatedTotalTime / 3600), 4)}h</h3>
            <p>Total Time</p>
            <span className="subtext">To complete all flows once</span>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="card-icon">
            <Users size={32} />
          </div>
          <div className="card-content">
            <h3>{overallStats.totalUserActions}</h3>
            <p>User Actions</p>
            <span className="subtext">Total across all flows</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
          <div className="module-charts-header">
            <h2>Workflow Complexity Analysis by Module</h2>
            <div className="time-assumptions">
              <strong>Time Assumptions:</strong> 30 seconds per step + 15 seconds per user interaction
            </div>
          </div>

          {/* Module Charts Grid */}
          <div className="module-charts-grid">
            {moduleCharts.map(({ moduleName, moduleDisplayName, moduleColor, chartData, timeData, totalFlows, totalSteps, totalTime, avgTime }) => (
              <div key={moduleName} className="module-chart-container" style={{
                borderColor: moduleColor.border
              }}>
                <div className="module-chart-header" style={{ backgroundColor: moduleColor.bg.replace('0.7', '0.2'), borderBottom: `2px solid ${moduleColor.border}` }}>
                  <h3>{moduleDisplayName}</h3>
                  <div className="module-stats">
                    <span>{totalFlows} workflows</span>
                    <span>{totalSteps} total steps</span>
                    <span>~{totalTime} min total</span>
                    <span>~{avgTime} min avg</span>
                  </div>
                </div>
                <div className="module-chart-content">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            afterLabel: function(context) {
                              const index = context.dataIndex;
                              return `Time: ~${timeData[index]} minutes`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          max: globalMaxSteps + 2,
                          title: {
                            display: true,
                            text: 'Steps',
                            font: { size: 11 }
                          },
                          ticks: {
                            stepSize: 5,
                            font: { size: 9 }
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                        y: {
                          ticks: {
                            font: { size: 9 },
                            autoSkip: false
                          },
                          grid: { display: false }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default ComplexityDashboard;