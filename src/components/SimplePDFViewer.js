import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, AlertCircle, Download } from 'lucide-react';
import './PDFViewer.css';

const SimplePDFViewer = ({ pdfPath }) => {
  const [pdfStatus, setPdfStatus] = useState('loading'); // 'loading', 'ready', 'error'

  // React serves files from public folder at the root
  // So /pdfs/... will serve from public/pdfs/...
  const fullPdfPath = `/pdfs/${pdfPath}`;

  console.log('SimplePDFViewer - Loading PDF:', {
    pdfPath,
    fullPdfPath
  });

  useEffect(() => {
    // Reset status when path changes
    setPdfStatus('loading');

    // Since we're serving from public folder, we can just set ready
    // The browser will handle loading the PDF
    setPdfStatus('ready');
  }, [pdfPath]);

  const openInNewTab = () => {
    window.open(fullPdfPath, '_blank');
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = fullPdfPath;
    link.download = pdfPath.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <div className="pdf-info">
          <FileText size={20} />
          <span>{pdfPath.split('/').pop()}</span>
        </div>
        <div className="pdf-actions">
          <button onClick={downloadPDF} title="Download PDF">
            <Download size={20} />
            Download
          </button>
          <button onClick={openInNewTab} title="Open in new tab">
            <ExternalLink size={20} />
            Open in New Tab
          </button>
        </div>
      </div>

      {pdfStatus === 'loading' && (
        <div className="pdf-loading">
          Loading PDF...
        </div>
      )}

      {pdfStatus === 'error' && (
        <div className="pdf-error">
          <AlertCircle size={48} />
          <h3>Unable to display PDF</h3>
          <p>The PDF couldn't be loaded in the viewer.</p>
          <button onClick={openInNewTab} className="open-external">
            Open PDF in New Tab
          </button>
          <div className="pdf-debug">
            <p>Path: {pdfPath}</p>
          </div>
        </div>
      )}

      {pdfStatus === 'ready' && (
        <div className="pdf-embed-container">
          {/* Use iframe to display PDF - most browsers support this */}
          <iframe
            src={fullPdfPath}
            title={pdfPath.split('/').pop()}
            width="100%"
            height="100%"
            style={{
              border: 'none',
              display: 'block'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SimplePDFViewer;