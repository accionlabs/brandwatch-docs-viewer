import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import './EditSourceModal.css';

const EditSourceModal = ({ isOpen, onClose, sourceDocs, onSave, flowName, module }) => {
  const [editedDocs, setEditedDocs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && sourceDocs) {
      setEditedDocs([...(sourceDocs || [])]);
      setError('');
    }
  }, [isOpen, sourceDocs]);

  if (!isOpen) return null;

  const handleAddSource = () => {
    setEditedDocs([...editedDocs, '']);
  };

  const handleRemoveSource = (index) => {
    setEditedDocs(editedDocs.filter((_, i) => i !== index));
  };

  const handleUpdateSource = (index, value) => {
    const newDocs = [...editedDocs];
    newDocs[index] = value;
    setEditedDocs(newDocs);
  };

  const handleSave = async () => {
    // Validate that all sources have values
    const invalidSources = editedDocs.filter(doc => !doc || doc.trim() === '');
    if (invalidSources.length > 0) {
      setError('Please fill in all source document paths or remove empty entries.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(editedDocs);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedDocs([]);
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Source Documents</h2>
          <button className="close-button" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-subheader">
          <p className="flow-info">
            <strong>Flow:</strong> {flowName}
          </p>
          <p className="module-info">
            <strong>Module:</strong> {module}
          </p>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="sources-list">
            {editedDocs.length === 0 ? (
              <div className="no-sources">
                <p>No source documents defined.</p>
                <p>Click "Add Source" to add documentation references.</p>
              </div>
            ) : (
              editedDocs.map((doc, index) => (
                <div key={index} className="source-item">
                  <span className="source-number">{index + 1}.</span>
                  <input
                    type="text"
                    value={doc}
                    onChange={(e) => handleUpdateSource(index, e.target.value)}
                    placeholder="e.g., Module/Subfolder/document.pdf"
                    className="source-input"
                  />
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveSource(index)}
                    title="Remove this source"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <button className="add-source-button" onClick={handleAddSource}>
            <Plus size={16} />
            Add Source Document
          </button>

          <div className="help-text">
            <h4>Format Guidelines:</h4>
            <ul>
              <li>Use forward slashes for path separation</li>
              <li>Include the module name at the start of the path</li>
              <li>Example: <code>Engage/Getting Started/Introduction.pdf</code></li>
              <li>For markdown files: <code>Engage/Workflows/workflow.md</code></li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSourceModal;