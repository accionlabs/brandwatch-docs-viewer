import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, AlertCircle } from 'lucide-react';
import './MarkdownViewer.css';

const MarkdownViewer = ({ documentPath }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentPath) {
      setContent('');
      setLoading(false);
      return;
    }

    const loadMarkdown = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construct the full URL for the markdown file
        const url = `${process.env.PUBLIC_URL}/${documentPath}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.statusText}`);
        }

        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error loading markdown:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [documentPath]);

  if (loading) {
    return (
      <div className="markdown-viewer loading">
        <div className="loading-spinner">
          <FileText size={48} />
          <p>Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="markdown-viewer error">
        <AlertCircle size={48} />
        <h3>Error Loading Document</h3>
        <p>{error}</p>
        <p className="document-path">{documentPath}</p>
      </div>
    );
  }

  if (!content && !documentPath) {
    return (
      <div className="markdown-viewer empty">
        <FileText size={64} />
        <h3>Select a Document</h3>
        <p>Choose a workflow from the sidebar to view its documentation</p>
      </div>
    );
  }

  return (
    <div className="markdown-viewer">
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom rendering for tables to make them responsive
            table: ({node, ...props}) => (
              <div className="table-wrapper">
                <table {...props} />
              </div>
            ),
            // Custom rendering for code blocks
            code: ({node, inline, className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="code-block">
                  <div className="code-block-header">{match[1]}</div>
                  <pre className={className}>
                    <code {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
            // Add smooth scrolling for anchor links
            a: ({node, ...props}) => {
              if (props.href && props.href.startsWith('#')) {
                return (
                  <a
                    {...props}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.querySelector(props.href);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  />
                );
              }
              return <a {...props} target="_blank" rel="noopener noreferrer" />;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownViewer;