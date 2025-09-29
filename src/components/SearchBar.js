import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="search-bar">
      <Search size={16} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button onClick={handleClear} className="search-clear">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;