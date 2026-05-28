import { useState, useMemo } from 'react';
import {
  Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, Eye, EyeOff,
  Download, Grid3x3, Table as TableIcon, ChevronDown, ChevronRight,
  Plus, Minus, Settings, X
} from 'lucide-react';
import './AdvancedTable.css';

function AdvancedTable({ reports }) {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'pivot'
  const [sortConfig, setSortConfig] = useState([]);
  const [columnFilters, setColumnFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  
  // Pivot table state
  const [pivotRows, setPivotRows] = useState(['domain']);
  const [pivotColumns, setPivotColumns] = useState(['frequency']);
  const [pivotValues, setPivotValues] = useState([{ field: 'count', aggregation: 'count' }]);
  const [showPivotSettings, setShowPivotSettings] = useState(false);

  // Define all available columns
  const allColumns = [
    { key: 'name', label: 'Report Name', sortable: true, filterable: true },
    { key: 'domain', label: 'Domain', sortable: true, filterable: true },
    { key: 'frequency', label: 'Frequency', sortable: true, filterable: true },
    { key: 'complianceStatus', label: 'Compliance', sortable: true, filterable: true },
    { key: 'automationStatus', label: 'Automation', sortable: true, filterable: true },
    { key: 'riskLevel', label: 'Risk Level', sortable: true, filterable: true },
    { key: 'stakeholders', label: 'Stakeholders', sortable: false, filterable: false },
    { key: 'createdAt', label: 'Created Date', sortable: true, filterable: false },
  ];

  // Initialize visible columns
  useMemo(() => {
    if (Object.keys(visibleColumns).length === 0) {
      const initial = {};
      allColumns.forEach(col => {
        initial[col.key] = true;
      });
      setVisibleColumns(initial);
    }
  }, []);

  // Get unique values for each filterable column
  const getUniqueValues = (columnKey) => {
    const values = new Set();
    reports.forEach(report => {
      const value = report[columnKey] || report[`${columnKey}_status`] || report[columnKey.replace('Status', '')];
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  };

  // Apply filters
  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(report => {
        const searchFields = [
          report.name,
          report.reportName,
          report.domain,
          report.description
        ].filter(Boolean);
        
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, values]) => {
      if (values && values.length > 0) {
        filtered = filtered.filter(report => {
          const reportValue = report[column] || 
                             report[`${column}_status`] || 
                             report[column.replace('Status', '')];
          return values.includes(reportValue);
        });
      }
    });

    return filtered;
  }, [reports, searchTerm, columnFilters]);

  // Apply sorting
  const sortedReports = useMemo(() => {
    if (sortConfig.length === 0) return filteredReports;

    return [...filteredReports].sort((a, b) => {
      for (const { key, direction } of sortConfig) {
        let aValue = a[key] || a[`${key}_status`] || a[key.replace('Status', '')] || '';
        let bValue = b[key] || b[`${key}_status`] || b[key.replace('Status', '')] || '';

        // Handle dates
        if (key === 'createdAt' || key === 'created_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Handle strings
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredReports, sortConfig]);

  // Group reports
  const groupedReports = useMemo(() => {
    if (!groupBy) return null;

    const groups = {};
    sortedReports.forEach(report => {
      const groupValue = report[groupBy] || 
                        report[`${groupBy}_status`] || 
                        report[groupBy.replace('Status', '')] || 
                        'Ungrouped';
      
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(report);
    });

    return groups;
  }, [sortedReports, groupBy]);

  // Handle sorting
  const handleSort = (columnKey) => {
    setSortConfig(prev => {
      const existingIndex = prev.findIndex(s => s.key === columnKey);
      
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        if (existing.direction === 'asc') {
          // Change to desc
          return [
            ...prev.slice(0, existingIndex),
            { key: columnKey, direction: 'desc' },
            ...prev.slice(existingIndex + 1)
          ];
        } else {
          // Remove from sort
          return prev.filter(s => s.key !== columnKey);
        }
      } else {
        // Add as asc
        return [...prev, { key: columnKey, direction: 'asc' }];
      }
    });
  };

  // Handle column filter
  const handleColumnFilter = (column, value) => {
    setColumnFilters(prev => {
      const current = prev[column] || [];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      if (newValues.length === 0) {
        const { [column]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [column]: newValues };
    });
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Toggle group expansion
  const toggleGroupExpansion = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Get sort indicator
  const getSortIndicator = (columnKey) => {
    const sort = sortConfig.find(s => s.key === columnKey);
    if (!sort) return null;
    
    const index = sortConfig.findIndex(s => s.key === columnKey);
    return (
      <span className="sort-indicator">
        {sort.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        {sortConfig.length > 1 && <span className="sort-order">{index + 1}</span>}
      </span>
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    const visibleCols = allColumns.filter(col => visibleColumns[col.key]);
    const headers = visibleCols.map(col => col.label).join(',');
    
    const rows = sortedReports.map(report => {
      return visibleCols.map(col => {
        const value = report[col.key] || report[`${col.key}_status`] || '';
        return `"${value}"`;
      }).join(',');
    }).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-table-${Date.now()}.csv`;
    a.click();
  };

  // Create pivot table
  const pivotTable = useMemo(() => {
    if (viewMode !== 'pivot') return null;

    const table = {};
    const rowValues = new Set();
    const colValues = new Set();

    // Collect all row and column values
    filteredReports.forEach(report => {
      const rowKey = pivotRows.map(r => report[r] || 'N/A').join(' | ');
      const colKey = pivotColumns.map(c => report[c] || 'N/A').join(' | ');
      
      rowValues.add(rowKey);
      colValues.add(colKey);

      if (!table[rowKey]) table[rowKey] = {};
      if (!table[rowKey][colKey]) table[rowKey][colKey] = [];
      
      table[rowKey][colKey].push(report);
    });

    // Calculate aggregations
    const aggregated = {};
    Object.entries(table).forEach(([rowKey, cols]) => {
      aggregated[rowKey] = {};
      Object.entries(cols).forEach(([colKey, reports]) => {
        aggregated[rowKey][colKey] = reports.length; // Count for now
      });
    });

    return {
      data: aggregated,
      rows: Array.from(rowValues).sort(),
      columns: Array.from(colValues).sort()
    };
  }, [filteredReports, viewMode, pivotRows, pivotColumns]);

  // Render column filter
  const renderColumnFilter = (column) => {
    if (!column.filterable) return null;

    const uniqueValues = getUniqueValues(column.key);
    const activeFilters = columnFilters[column.key] || [];

    return (
      <div className="column-filter-dropdown">
        <div className="column-filter-header">
          <Filter size={14} />
          <span>Filter {column.label}</span>
        </div>
        <div className="column-filter-options">
          {uniqueValues.map(value => (
            <label key={value} className="column-filter-option">
              <input
                type="checkbox"
                checked={activeFilters.includes(value)}
                onChange={() => handleColumnFilter(column.key, value)}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
        {activeFilters.length > 0 && (
          <button
            className="clear-column-filter"
            onClick={() => setColumnFilters(prev => {
              const { [column.key]: _, ...rest } = prev;
              return rest;
            })}
          >
            Clear Filter
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="advanced-table-container">
      {/* Header */}
      <div className="table-header">
        <div className="table-header-left">
          <h2 className="table-title">
            <TableIcon size={20} />
            Advanced Data Tables
          </h2>
          <p className="table-subtitle">
            Pivot tables, filtering, sorting, and grouping
          </p>
        </div>
        <div className="table-header-actions">
          <button
            className={`table-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <TableIcon size={16} />
            Table View
          </button>
          <button
            className={`table-mode-btn ${viewMode === 'pivot' ? 'active' : ''}`}
            onClick={() => setViewMode('pivot')}
          >
            <Grid3x3 size={16} />
            Pivot Table
          </button>
          <button
            className="table-action-btn"
            onClick={() => setShowColumnSettings(!showColumnSettings)}
          >
            <Settings size={16} />
            Columns
          </button>
          <button className="table-action-btn" onClick={exportToCSV}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="table-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {viewMode === 'table' && (
          <>
            <div className="table-group-by">
              <label>Group By:</label>
              <select value={groupBy || ''} onChange={(e) => setGroupBy(e.target.value || null)}>
                <option value="">None</option>
                {allColumns.filter(col => col.filterable).map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
            </div>

            {sortConfig.length > 0 && (
              <div className="active-sorts">
                <span className="sorts-label">Sorted by:</span>
                {sortConfig.map((sort, idx) => {
                  const column = allColumns.find(c => c.key === sort.key);
                  return (
                    <span key={sort.key} className="sort-badge">
                      {column?.label} ({sort.direction})
                      <button onClick={() => setSortConfig(prev => prev.filter((_, i) => i !== idx))}>
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
                <button className="clear-sorts" onClick={() => setSortConfig([])}>
                  Clear All
                </button>
              </div>
            )}
          </>
        )}

        {viewMode === 'pivot' && (
          <button
            className="table-action-btn"
            onClick={() => setShowPivotSettings(!showPivotSettings)}
          >
            <Settings size={16} />
            Pivot Settings
          </button>
        )}

        <div className="table-info">
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      </div>

      {/* Column Settings Panel */}
      {showColumnSettings && (
        <div className="column-settings-panel">
          <div className="column-settings-header">
            <h3>Column Visibility</h3>
            <button onClick={() => setShowColumnSettings(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="column-settings-list">
            {allColumns.map(col => (
              <label key={col.key} className="column-setting-item">
                <input
                  type="checkbox"
                  checked={visibleColumns[col.key]}
                  onChange={() => toggleColumnVisibility(col.key)}
                />
                <span>{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Pivot Settings Panel */}
      {showPivotSettings && viewMode === 'pivot' && (
        <div className="pivot-settings-panel">
          <div className="pivot-settings-header">
            <h3>Pivot Table Configuration</h3>
            <button onClick={() => setShowPivotSettings(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="pivot-settings-content">
            <div className="pivot-setting-group">
              <label>Rows:</label>
              <select
                value={pivotRows[0]}
                onChange={(e) => setPivotRows([e.target.value])}
              >
                <option value="domain">Domain</option>
                <option value="frequency">Frequency</option>
                <option value="complianceStatus">Compliance Status</option>
                <option value="automationStatus">Automation Status</option>
              </select>
            </div>
            <div className="pivot-setting-group">
              <label>Columns:</label>
              <select
                value={pivotColumns[0]}
                onChange={(e) => setPivotColumns([e.target.value])}
              >
                <option value="frequency">Frequency</option>
                <option value="domain">Domain</option>
                <option value="complianceStatus">Compliance Status</option>
                <option value="automationStatus">Automation Status</option>
              </select>
            </div>
            <div className="pivot-setting-group">
              <label>Values:</label>
              <select disabled>
                <option>Count</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-wrapper">
          {groupBy ? (
            // Grouped Table
            <div className="grouped-table">
              {Object.entries(groupedReports).map(([groupValue, groupReports]) => (
                <div key={groupValue} className="table-group">
                  <div
                    className="table-group-header"
                    onClick={() => toggleGroupExpansion(groupValue)}
                  >
                    <button className="group-expand-btn">
                      {expandedGroups[groupValue] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <span className="group-title">{groupValue}</span>
                    <span className="group-count">({groupReports.length} reports)</span>
                  </div>
                  {expandedGroups[groupValue] && (
                    <table className="data-table">
                      <thead>
                        <tr>
                          {allColumns.filter(col => visibleColumns[col.key]).map(column => (
                            <th key={column.key} className="table-header-cell">
                              <div className="header-cell-content">
                                <span>{column.label}</span>
                                {column.sortable && (
                                  <button
                                    className="sort-btn"
                                    onClick={() => handleSort(column.key)}
                                  >
                                    {getSortIndicator(column.key) || <ArrowUpDown size={14} />}
                                  </button>
                                )}
                                {column.filterable && (
                                  <div className="column-filter-wrapper">
                                    <button className="filter-btn">
                                      <Filter size={14} />
                                      {columnFilters[column.key]?.length > 0 && (
                                        <span className="filter-count">{columnFilters[column.key].length}</span>
                                      )}
                                    </button>
                                    {renderColumnFilter(column)}
                                  </div>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {groupReports.map((report, idx) => (
                          <tr key={idx}>
                            {allColumns.filter(col => visibleColumns[col.key]).map(column => (
                              <td key={column.key}>
                                {column.key === 'complianceStatus' || column.key === 'automationStatus' || column.key === 'riskLevel' ? (
                                  <span className={`status-badge ${(report[column.key] || '').toLowerCase()}`}>
                                    {report[column.key] || report[`${column.key}_status`] || report[column.key.replace('Status', '')] || 'N/A'}
                                  </span>
                                ) : column.key === 'createdAt' ? (
                                  new Date(report[column.key] || report.created_at).toLocaleDateString()
                                ) : column.key === 'name' ? (
                                  <span onClick={() => setSelectedReport(report)} style={{ color:'#60a5fa', cursor:'pointer', textDecoration:'underline' }}>{report[column.key] || 'N/A'}</span>
                                ) : (
                                  report[column.key] || report[column.key.replace('Status', '')] || 'N/A'
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Regular Table
            <table className="data-table">
              <thead>
                <tr>
                  {allColumns.filter(col => visibleColumns[col.key]).map(column => (
                    <th key={column.key} className="table-header-cell">
                      <div className="header-cell-content">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <button
                            className="sort-btn"
                            onClick={() => handleSort(column.key)}
                          >
                            {getSortIndicator(column.key) || <ArrowUpDown size={14} />}
                          </button>
                        )}
                        {column.filterable && (
                          <div className="column-filter-wrapper">
                            <button className="filter-btn">
                              <Filter size={14} />
                              {columnFilters[column.key]?.length > 0 && (
                                <span className="filter-count">{columnFilters[column.key].length}</span>
                              )}
                            </button>
                            {renderColumnFilter(column)}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedReports.length === 0 ? (
                  <tr>
                    <td colSpan={allColumns.filter(col => visibleColumns[col.key]).length} className="empty-state">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  sortedReports.map((report, idx) => (
                    <tr key={idx}>
                      {allColumns.filter(col => visibleColumns[col.key]).map(column => (
                        <td key={column.key}>
                          {column.key === 'complianceStatus' || column.key === 'automationStatus' || column.key === 'riskLevel' ? (
                            <span className={`status-badge ${(report[column.key] || '').toLowerCase()}`}>
                              {report[column.key] || report[`${column.key}_status`] || report[column.key.replace('Status', '')] || 'N/A'}
                            </span>
                          ) : column.key === 'createdAt' ? (
                            new Date(report[column.key] || report.created_at).toLocaleDateString()
                          ) : column.key === 'name' ? (
                            <span onClick={() => setSelectedReport(report)} style={{ color:'#60a5fa', cursor:'pointer', textDecoration:'underline' }}>{report[column.key] || 'N/A'}</span>
                          ) : (
                            report[column.key] || report[column.key.replace('Status', '')] || 'N/A'
                          )}
                        </td>
                      ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pivot Table View */}
      {viewMode === 'pivot' && pivotTable && (
        <div className="pivot-table-wrapper">
          <table className="pivot-table">
            <thead>
              <tr>
                <th className="pivot-corner-cell">{pivotRows.join(' / ')}</th>
                {pivotTable.columns.map(col => (
                  <th key={col} className="pivot-column-header">{col}</th>
                ))}
                <th className="pivot-total-header">Total</th>
              </tr>
            </thead>
            <tbody>
              {pivotTable.rows.map(row => {
                const rowTotal = pivotTable.columns.reduce((sum, col) => {
                  return sum + (pivotTable.data[row][col] || 0);
                }, 0);

                return (
                  <tr key={row}>
                    <th className="pivot-row-header">{row}</th>
                    {pivotTable.columns.map(col => (
                      <td key={col} className="pivot-cell">
                        {pivotTable.data[row][col] || 0}
                      </td>
                    ))}
                    <td className="pivot-total-cell">{rowTotal}</td>
                  </tr>
                );
              })}
              <tr className="pivot-total-row">
                <th className="pivot-row-header">Total</th>
                {pivotTable.columns.map(col => {
                  const colTotal = pivotTable.rows.reduce((sum, row) => {
                    return sum + (pivotTable.data[row][col] || 0);
                  }, 0);
                  return (
                    <td key={col} className="pivot-total-cell">{colTotal}</td>
                  );
                })}
                <td className="pivot-grand-total">
                  {pivotTable.rows.reduce((sum, row) => {
                    return sum + pivotTable.columns.reduce((rowSum, col) => {
                      return rowSum + (pivotTable.data[row][col] || 0);
                    }, 0);
                  }, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
      {selectedReport && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={() => setSelectedReport(null)}>
          <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:24,width:500,maxHeight:"80vh",overflowY:"auto"}} onClick={e => e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{color:"#f1f5f9",margin:0,fontSize:16}}>{selectedReport.name}</h2>
              <button onClick={() => setSelectedReport(null)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:20}}>x</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              {[["Domain",selectedReport.domain],["Frequency",selectedReport.frequency],["Compliance",selectedReport.complianceStatus||selectedReport.compliance_status],["Risk Level",selectedReport.riskLevel||selectedReport.risk_level||"Low"],["Automation",selectedReport.automationStatus||"Manual"],["Created",selectedReport.createdAt?new Date(selectedReport.createdAt).toLocaleDateString():"N/A"]].map(([label,value],i) => (
                <div key={i} style={{background:"#0f172a",borderRadius:8,padding:12}}>
                  <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",marginBottom:4}}>{label}</div>
                  <div style={{fontSize:13,color:"#f1f5f9",fontWeight:600}}>{value||"N/A"}</div>
                </div>
              ))}
            </div>
            {selectedReport.description && <p style={{color:"#94a3b8",fontSize:13,marginBottom:16}}>{selectedReport.description}</p>}
            {selectedReport.stakeholders?.length > 0 && (
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>STAKEHOLDERS</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{selectedReport.stakeholders.map((s,i) => <span key={i} style={{background:"#334155",color:"#94a3b8",padding:"2px 8px",borderRadius:20,fontSize:11}}>{s}</span>)}</div>
              </div>
            )}
            <button onClick={() => setSelectedReport(null)} style={{background:"#3b82f6",border:"none",borderRadius:8,color:"#fff",padding:"10px 20px",cursor:"pointer",fontWeight:600,width:"100%"}}>Close</button>
          </div>
        </div>
      )}
}

export default AdvancedTable;
