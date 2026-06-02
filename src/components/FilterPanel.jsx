import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Calendar, RefreshCw } from 'lucide-react';
import './FilterPanel.css';

function FilterPanel({ onFilterChange, activeFilters, onReset }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(activeFilters || {});

  // Filter options
  const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
  const domains = [
    'Finance', 'HR', 'Operations', 'Sales', 'IT', 
    'Healthcare', 'General', 'Education', 'Telecom',
    'Manufacturing', 'Retail', 'Banking', 'Energy'
  ];
  const complianceStatuses = ['Required', 'Optional', 'Recommended'];
  const automationStatuses = ['Automated', 'Manual', 'Hybrid'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Latin America', 'Africa'];
  const riskLevels = ['Low', 'Medium', 'High', 'Critical'];
  const roles = ['CFO', 'HR Head', 'Operations Manager', 'Compliance Officer', 'Board Member', 'Auditor'];

  const handleMultiSelect = (filterKey, value) => {
    const current = localFilters[filterKey] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    setLocalFilters({ ...localFilters, [filterKey]: updated });
  };

  const handleSingleSelect = (filterKey, value) => {
    setLocalFilters({ ...localFilters, [filterKey]: value });
  };

  const handleDateChange = (type, value) => {
    setLocalFilters({
      ...localFilters,
      dateRange: {
        ...localFilters.dateRange,
        [type]: value
      }
    });
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsExpanded(false);
  };

  const resetFilters = () => {
    setLocalFilters({});
    onReset();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.keys(activeFilters || {}).forEach(key => {
      if (key === 'dateRange') {
        if (activeFilters.dateRange?.from || activeFilters.dateRange?.to) count++;
      } else if (Array.isArray(activeFilters[key]) && activeFilters[key].length > 0) {
        count++;
      } else if (activeFilters[key]) {
        count++;
      }
    });
    return count;
  };

  const removeFilter = (filterKey, value = null) => {
    const updated = { ...activeFilters };
    
    if (value && Array.isArray(updated[filterKey])) {
      updated[filterKey] = updated[filterKey].filter(v => v !== value);
      if (updated[filterKey].length === 0) delete updated[filterKey];
    } else {
      delete updated[filterKey];
    }
    
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className="filter-panel-container">
      {/* Filter Header */}
      <div className="filter-header">
        <button 
          className="filter-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter size={16} />
          <span>Advanced Filters</span>
          {activeCount > 0 && (
            <span className="filter-count-badge">{activeCount}</span>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {activeCount > 0 && (
          <button className="reset-all-btn" onClick={resetFilters}>
            <RefreshCw size={14} />
            Reset All
          </button>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeCount > 0 && (
        <div className="active-filters-badges">
          {/* Frequency badges */}
          {activeFilters.frequency?.map(freq => (
            <span key={freq} className="filter-badge">
              {freq}
              <button onClick={() => removeFilter('frequency', freq)}>
                <X size={12} />
              </button>
            </span>
          ))}

          {/* Domain badges */}
          {activeFilters.domains?.map(domain => (
            <span key={domain} className="filter-badge">
              {domain}
              <button onClick={() => removeFilter('domains', domain)}>
                <X size={12} />
              </button>
            </span>
          ))}

          {/* Compliance badges */}
          {activeFilters.compliance?.map(status => (
            <span key={status} className="filter-badge">
              {status}
              <button onClick={() => removeFilter('compliance', status)}>
                <X size={12} />
              </button>
            </span>
          ))}

          {/* Automation badges */}
          {activeFilters.automation?.map(status => (
            <span key={status} className="filter-badge">
              {status}
              <button onClick={() => removeFilter('automation', status)}>
                <X size={12} />
              </button>
            </span>
          ))}

          {/* Region badges */}
          {activeFilters.regions?.map(region => (
            <span key={region} className="filter-badge">
              {region}
              <button onClick={() => removeFilter('regions', region)}>
                <X size={12} />
              </button>
            </span>
          ))}

          {/* Risk level badges */}
          {activeFilters.riskLevel?.map(level => (
            <span key={level} className="filter-badge">
              Risk: {level}
              <button onClick={() => removeFilter('riskLevel', level)}>
                <X size={12} />
              </button>
            </span>
          ))}

          {/* Role badges */}
          {activeFilters.roles?.map(role => (
            <span key={role} className="filter-badge">
              {role}
              <button onClick={() => removeFilter('roles', role)}>
                <X size={12} />
              </button>
            </span>
          ))}

          {/* Date range badge */}
          {activeFilters.dateRange && (
            <span className="filter-badge">
              <Calendar size={12} />
              {activeFilters.dateRange.from && `From: ${activeFilters.dateRange.from}`}
              {activeFilters.dateRange.to && ` To: ${activeFilters.dateRange.to}`}
              <button onClick={() => removeFilter('dateRange')}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {isExpanded && (
        <div className="filter-panel-content">
          <div className="filter-grid">
            
            {/* Date Range */}
            <div className="filter-group">
              <label className="filter-label">
                <Calendar size={14} />
                Date Range
              </label>
              <div className="date-range-inputs">
                <input
                  type="date"
                  className="filter-input"
                  placeholder="From"
                  value={localFilters.dateRange?.from || ''}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  className="filter-input"
                  placeholder="To"
                  value={localFilters.dateRange?.to || ''}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                />
              </div>
            </div>

            {/* Frequency */}
            <div className="filter-group">
              <label className="filter-label">Frequency</label>
              <div className="filter-checkboxes">
                {frequencies.map(freq => (
                  <label key={freq} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(localFilters.frequency || []).includes(freq)}
                      onChange={() => handleMultiSelect('frequency', freq)}
                    />
                    <span>{freq}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Domains */}
            <div className="filter-group">
              <label className="filter-label">Domains</label>
              <div className="filter-checkboxes">
                {domains.map(domain => (
                  <label key={domain} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(localFilters.domains || []).includes(domain)}
                      onChange={() => handleMultiSelect('domains', domain)}
                    />
                    <span>{domain}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Compliance Status */}
            <div className="filter-group">
              <label className="filter-label">Compliance Status</label>
              <div className="filter-checkboxes">
                {complianceStatuses.map(status => (
                  <label key={status} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(localFilters.compliance || []).includes(status)}
                      onChange={() => handleMultiSelect('compliance', status)}
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Automation Status */}
            <div className="filter-group">
              <label className="filter-label">Automation Status</label>
              <div className="filter-checkboxes">
                {automationStatuses.map(status => (
                  <label key={status} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(localFilters.automation || []).includes(status)}
                      onChange={() => handleMultiSelect('automation', status)}
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Regions */}
            <div className="filter-group">
              <label className="filter-label">Regions</label>
              <div className="filter-checkboxes">
                {regions.map(region => (
                  <label key={region} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(localFilters.regions || []).includes(region)}
                      onChange={() => handleMultiSelect('regions', region)}
                    />
                    <span>{region}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Risk Level */}
            <div className="filter-group">
              <label className="filter-label">Risk Level</label>
              <div className="filter-checkboxes">
                {riskLevels.map(level => (
                  <label key={level} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(localFilters.riskLevel || []).includes(level)}
                      onChange={() => handleMultiSelect('riskLevel', level)}
                    />
                    <span className={`risk-${level.toLowerCase()}`}>{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Roles */}
            <div className="filter-group">
              <label className="filter-label">Role-Based View</label>
              <div className="filter-checkboxes">
                {roles.map(role => (
                  <label key={role} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(localFilters.roles || []).includes(role)}
                      onChange={() => handleMultiSelect('roles', role)}
                    />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="filter-actions">
            <button className="btn-secondary" onClick={() => setIsExpanded(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
