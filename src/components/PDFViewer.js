import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import './PDFViewer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({ pdfPath }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);

  // Construct the full path to the PDF
  const fullPdfPath = `/pdfs/${pdfPath}`;

  console.log('Loading PDF from:', fullPdfPath);
  console.log('Original path:', pdfPath);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    console.error('Attempted to load from:', fullPdfPath);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    setError(`Failed to load PDF: ${error.message || 'Unknown error'}`);
  };

  const previousPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const nextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  const downloadPDF = () => {
    window.open(fullPdfPath, '_blank');
  };

  if (error) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-error">
          <p>{error}</p>
          <div className="pdf-placeholder">
            <h3>📄 {pdfPath.split('/').pop()}</h3>
            <p>This PDF would be viewable when connected to the Brandwatch documentation server.</p>
            <div className="pdf-path">
              <strong>Full Path:</strong> {pdfPath}
            </div>
            <div className="pdf-instructions">
              <h4>To view this document:</h4>
              <ol>
                <li>Ensure the Brandwatch PDF files are in the public/pdfs directory</li>
                <li>Or set up a proxy to the Brandwatch documentation server</li>
                <li>Or use the desktop version of this application</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <button onClick={previousPage} disabled={pageNumber <= 1}>
          <ChevronLeft size={20} />
        </button>
        <span className="page-info">
          Page {pageNumber} of {numPages || '-'}
        </span>
        <button onClick={nextPage} disabled={pageNumber >= numPages}>
          <ChevronRight size={20} />
        </button>
        <div className="pdf-controls-separator" />
        <button onClick={zoomOut} title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <span className="zoom-info">{Math.round(scale * 100)}%</span>
        <button onClick={zoomIn} title="Zoom In">
          <ZoomIn size={20} />
        </button>
        <div className="pdf-controls-separator" />
        <button onClick={downloadPDF} title="Download PDF">
          <Download size={20} />
        </button>
      </div>
      <div className="pdf-document">
        <Document
          file={fullPdfPath}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="pdf-loading">
              Loading PDF...
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;