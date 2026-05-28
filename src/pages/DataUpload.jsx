import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Eye, Download, Sparkles, ArrowRight, X, Table } from 'lucide-react';
import ReportViewer from '../components/ReportViewer';
import './DataUpload.css';

const DataUpload = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [columnMapping, setColumnMapping] = useState({});
  const [generatedReport, setGeneratedReport] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Select Template, 4: Map Columns, 5: Generated
  const [showReportViewer, setShowReportViewer] = useState(false);

  // Available report templates
  const reportTemplates = [
    { id: 'financial', name: 'Financial Report', fields: ['revenue', 'expenses', 'profit', 'date'] },
    { id: 'sales', name: 'Sales Performance Report', fields: ['product', 'quantity', 'amount', 'date', 'region'] },
    { id: 'operations', name: 'Operations Report', fields: ['department', 'tasks_completed', 'efficiency', 'date'] },
    { id: 'analytics', name: 'Analytics Report', fields: ['metric_name', 'value', 'target', 'date', 'category'] },
    { id: 'compliance', name: 'Compliance Report', fields: ['requirement', 'status', 'due_date', 'responsible_person'] }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    
    // Parse file (CSV or Excel)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').filter(row => row.trim());
      const headers = rows[0].split(',').map(h => h.trim());
      const data = rows.slice(1, 6).map(row => {
        const values = row.split(',');
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] ? values[index].trim() : '';
        });
        return rowData;
      });

      setPreviewData({
        headers,
        data,
        totalRows: rows.length - 1
      });
      console.log('📊 CSV Headers:', headers);
      console.log('📊 Preview Data:', { headers, data, totalRows: rows.length - 1 });
      const detectedType = detectReportType(headers);
      setSelectedTemplate(detectedType);
      console.log('Auto-detected report type:', detectedType);
      // Auto-run column matching after detection
      const template = [
        { id: 'financial', name: 'Financial Report', fields: ['revenue', 'expenses', 'profit', 'date'] },
        { id: 'sales', name: 'Sales Performance Report', fields: ['product', 'quantity', 'amount', 'date', 'region'] },
        { id: 'operations', name: 'Operations Report', fields: ['department', 'tasks_completed', 'efficiency', 'date'] },
        { id: 'analytics', name: 'Analytics Report', fields: ['metric_name', 'value', 'target', 'date', 'category'] },
        { id: 'compliance', name: 'Compliance Report', fields: ['requirement', 'status', 'due_date', 'responsible_person'] }
      ].find(t => t.id === detectedType);
      if (template && headers) {
        const autoMapping = fuzzyMatch(headers, template.fields);
        setColumnMapping(autoMapping);
      }
      setSelectedTemplate(detectedType);
      console.log('Auto-detected report type:', detectedType);
      setStep(2);
    };
    reader.readAsText(file);
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    const template = reportTemplates.find(t => t.id === templateId);
    
    // Auto-map columns (basic matching)
    const mapping = {};
    template.fields.forEach(field => {
      const matchingHeader = previewData.headers.find(h => 
        h.toLowerCase().includes(field.toLowerCase()) || 
        field.toLowerCase().includes(h.toLowerCase())
      );
      if (matchingHeader) {
        mapping[field] = matchingHeader;
      }
    });
    setColumnMapping(mapping);
    setStep(4);
  };

  const handleGenerateReport = () => {
    setProcessing(true);
    setTimeout(() => {
      const template = reportTemplates.find(t => t.id === selectedTemplate);
      const mappedFields = Object.entries(columnMapping).filter(([,v]) => v);
      const unmappedFields = Object.keys(columnMapping).filter(k => !columnMapping[k]);
      
      // Process data - use mapped columns where available, raw data for unmapped
      const processedData = previewData.data.map(row => {
        const mappedRow = {};
        // Add all mapped fields
        mappedFields.forEach(([field, sourceCol]) => {
          mappedRow[field] = row[sourceCol] || 'N/A';
        });
        // For unmapped fields, use raw column values if available
        unmappedFields.forEach((field, idx) => {
          const rawCol = previewData.headers[mappedFields.length + idx];
          mappedRow[field] = rawCol ? (row[rawCol] || 'N/A') : 'N/A';
        });
        // Also include all original columns as extra data
        mappedRow._rawData = row;
        return mappedRow;
      });

      // Auto-generate summary from whatever numeric data exists
      const numericSummary = {};
      previewData.headers.forEach(header => {
        const values = previewData.data.map(r => parseFloat(r[header])).filter(v => !isNaN(v));
        if (values.length > 0) {
          numericSummary[header] = {
            total: values.reduce((a,b) => a+b, 0).toFixed(2),
            avg: (values.reduce((a,b) => a+b, 0) / values.length).toFixed(2),
            max: Math.max(...values),
            min: Math.min(...values)
          };
        }
      });

      const report = {
        id: Date.now(),
        name: template.name + ' - ' + uploadedFile.name,
        template: selectedTemplate,
        templateName: template.name,
        generatedAt: new Date().toISOString(),
        dataSource: uploadedFile.name,
        totalRecords: previewData.totalRows,
        processedRecords: processedData.length,
        mappedFields: mappedFields.length,
        totalFields: template.fields.length,
        unmappedFields: unmappedFields,
        data: processedData,
        numericSummary,
        summary: generateSummary(processedData, template)
      };
      setGeneratedReport(report);
      setProcessing(false);
      setStep(5);
    }, 1500);
  };


  // AI-powered dynamic column matching
  const aiMatchColumns = async (headers, templateFields) => {
    try {
      const prompt = `You are a data analyst. Match these uploaded CSV columns to report fields.

Uploaded columns: ${JSON.stringify(headers)}
Report fields needed: ${JSON.stringify(templateFields)}

Rules:
1. Match even if names are different (e.g. "amt" -> "revenue", "dept" -> "department", "qty" -> "quantity")
2. If no good match exists for a field, set it to null
3. If uploaded columns have extra data not in template, suggest the best report field they could map to
4. Return ONLY a JSON object like: {"revenue": "amt", "expenses": "cost", "date": "month", "profit": null}

Return ONLY valid JSON, no explanation.`

      const res = await fetch('https://finance-backend-so86.onrender.com/api/v1/ai/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      const text = data?.data?.narrative || '{}'
      const clean = text.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    } catch (e) {
      console.error('AI matching failed, using fuzzy match', e)
      return null
    }
  }

  // Fuzzy match fallback
  const fuzzyMatch = (headers, fields) => {
    const mapping = {}
    const synonyms = {
      revenue: ['revenue', 'income', 'sales', 'amt', 'amount', 'total', 'gross', 'turnover', 'receipts'],
      expenses: ['expenses', 'expense', 'cost', 'costs', 'expenditure', 'spend', 'outflow', 'charges'],
      profit: ['profit', 'net', 'margin', 'earnings', 'gain', 'surplus', 'pnl', 'p&l'],
      date: ['date', 'month', 'year', 'period', 'time', 'day', 'week', 'quarter'],
      department: ['department', 'dept', 'division', 'unit', 'team', 'group', 'section'],
      quantity: ['quantity', 'qty', 'units', 'count', 'volume', 'number', 'nos'],
      product: ['product', 'item', 'sku', 'goods', 'service', 'description', 'name'],
      region: ['region', 'area', 'zone', 'territory', 'location', 'city', 'state', 'country'],
      status: ['status', 'state', 'condition', 'flag', 'active', 'result'],
      category: ['category', 'type', 'class', 'group', 'segment', 'kind'],
      value: ['value', 'val', 'amount', 'figure', 'number', 'score', 'rating'],
      target: ['target', 'goal', 'budget', 'plan', 'forecast', 'expected'],
      metric_name: ['metric', 'kpi', 'measure', 'indicator', 'name', 'label'],
      requirement: ['requirement', 'rule', 'policy', 'regulation', 'control', 'check'],
      responsible_person: ['responsible', 'owner', 'assignee', 'manager', 'person', 'contact', 'name'],
      due_date: ['due_date', 'deadline', 'due', 'expiry', 'end_date', 'target_date'],
      efficiency: ['efficiency', 'performance', 'productivity', 'rate', 'score', 'utilization'],
      tasks_completed: ['tasks', 'completed', 'done', 'finished', 'count', 'total'],
    }

    fields.forEach(field => {
      const fieldSynonyms = synonyms[field] || [field]
      let bestMatch = null
      let bestScore = 0

      headers.forEach(header => {
        const h = header.toLowerCase().replace(/[^a-z0-9]/g, '')
        fieldSynonyms.forEach(syn => {
          const s = syn.toLowerCase().replace(/[^a-z0-9]/g, '')
          if (h === s) { bestMatch = header; bestScore = 100 }
          else if (h.includes(s) || s.includes(h)) { if (bestScore < 80) { bestMatch = header; bestScore = 80 } }
          else if (h.slice(0,3) === s.slice(0,3) && bestScore < 60) { bestMatch = header; bestScore = 60 }
        })
      })
      mapping[field] = bestMatch
    })
    return mapping
  }

  // Auto-detect report type from columns
  const detectReportType = (headers) => {
    const h = headers.map(h => h.toLowerCase()).join(' ')
    if (h.includes('revenue') || h.includes('profit') || h.includes('expense') || h.includes('income') || h.includes('cost')) return 'financial'
    if (h.includes('product') || h.includes('quantity') || h.includes('sale') || h.includes('order') || h.includes('customer')) return 'sales'
    if (h.includes('task') || h.includes('efficiency') || h.includes('department') || h.includes('operation')) return 'operations'
    if (h.includes('requirement') || h.includes('compliance') || h.includes('status') || h.includes('regulation')) return 'compliance'
    return 'analytics' // default
  }

  const generateSummary = (data, template) => {
    // Generate summary based on template type
    if (template.id === 'financial') {
      const totalRevenue = data.reduce((sum, row) => sum + parseFloat(row.revenue || 0), 0);
      const totalExpenses = data.reduce((sum, row) => sum + parseFloat(row.expenses || 0), 0);
      return {
        totalRevenue: `$${totalRevenue.toLocaleString()}`,
        totalExpenses: `$${totalExpenses.toLocaleString()}`,
        netProfit: `$${(totalRevenue - totalExpenses).toLocaleString()}`
      };
    } else if (template.id === 'sales') {
      const totalQuantity = data.reduce((sum, row) => sum + parseInt(row.quantity || 0), 0);
      const totalAmount = data.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
      return {
        totalQuantity,
        totalAmount: `$${totalAmount.toLocaleString()}`,
        avgOrderValue: `$${(totalAmount / data.length).toFixed(2)}`
      };
    }
    return { recordsProcessed: data.length };
  };

  const handleDownloadReport = () => {
    downloadAsPDF();
  };

  const downloadAsCSV = () => {
    try {
      console.log('Downloading CSV...', generatedReport);
      
      // Create CSV header
      const headers = Object.keys(generatedReport.data[0]);
      const csvHeader = headers.join(',');
      
      // Create CSV rows
      const csvRows = generatedReport.data.map(row => {
        return headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',');
      });
      
      // Combine with summary
      const csvContent = [
        `REPORT,${generatedReport.name}`,
        `Generated,${new Date(generatedReport.generatedAt).toLocaleString()}`,
        `Total Records,${generatedReport.totalRecords}`,
        ``,
        `SUMMARY`,
        ...Object.entries(generatedReport.summary).map(([key, value]) => `${key},${value}`),
        ``,
        csvHeader,
        ...csvRows
      ].join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generatedReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('CSV downloaded successfully!');
    } catch (error) {
      console.error('CSV download error:', error);
      alert('Error downloading CSV: ' + error.message);
    }
  };

  const downloadAsExcel = () => {
    try {
      console.log('Downloading Excel...', generatedReport);
      
      // Create Excel-compatible CSV (with BOM for proper Excel opening)
      const headers = Object.keys(generatedReport.data[0]);
      const csvHeader = headers.join(',');
      
      const csvRows = generatedReport.data.map(row => {
        return headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',');
      });
      
      const csvContent = [
        `REPORT,${generatedReport.name}`,
        `Generated,${new Date(generatedReport.generatedAt).toLocaleString()}`,
        ``,
        `SUMMARY`,
        ...Object.entries(generatedReport.summary).map(([key, value]) => `${key},${value}`),
        ``,
        csvHeader,
        ...csvRows
      ].join('\n');
      
      // Add BOM for Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generatedReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Excel download error:', error);
      alert('Error downloading Excel: ' + error.message);
    }
  };

  const downloadAsPDF = () => {
    try {
      console.log('Downloading PDF/Text...', generatedReport);
      
      const reportContent = `
GENERATED REPORT
===============================================

Report Name: ${generatedReport.name}
Template: ${generatedReport.template}
Generated: ${new Date(generatedReport.generatedAt).toLocaleString()}
Data Source: ${generatedReport.dataSource}
Total Records: ${generatedReport.totalRecords}
Processed Records: ${generatedReport.processedRecords}

SUMMARY:
${Object.entries(generatedReport.summary).map(([key, value]) => `${key}: ${value}`).join('\n')}

DATA:
${JSON.stringify(generatedReport.data, null, 2)}

===============================================
`;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generatedReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Report downloaded as text file!');
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Error downloading report: ' + error.message);
    }
  };

  const resetWorkflow = () => {
    setUploadedFile(null);
    setPreviewData(null);
    setSelectedTemplate('');
    setColumnMapping({});
    setGeneratedReport(null);
    setStep(1);
  };

  return (
    <>
    <div className="data-upload-page">
      <div className="data-upload-container">
        
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <div className="step-label">Upload Data</div>
          </div>
          <div className={`progress-line ${step > 1 ? 'completed' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <div className="step-label">Preview</div>
          </div>
          <div className={`progress-line ${step > 2 ? 'completed' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-circle">3</div>
            <div className="step-label">Select Template</div>
          </div>
          <div className={`progress-line ${step > 3 ? 'completed' : ''}`}></div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
            <div className="step-circle">4</div>
            <div className="step-label">Map Fields</div>
          </div>
          <div className={`progress-line ${step > 4 ? 'completed' : ''}`}></div>
          <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>
            <div className="step-circle">5</div>
            <div className="step-label">Generated</div>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="upload-section">
            <div className="upload-header">
              <Upload size={48} style={{ color: '#14b8a6' }} />
              <h2>Upload Your Data</h2>
              <p>Upload CSV or Excel file to generate custom reports</p>
            </div>

            <div className="upload-dropzone">
              <FileText size={64} style={{ color: '#64748b', marginBottom: '20px' }} />
              <h3>Upload Your Data File</h3>
              <p>Supported formats: CSV, Excel (.xlsx, .xls)</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                style={{
                  display: 'block',
                  margin: '30px auto',
                  padding: '15px',
                  backgroundColor: '#14b8a6',
                  color: '#0a0e27',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              />
            </div>

            <div className="upload-instructions">
              <h4>📋 Data Format Requirements:</h4>
              <ul>
                <li>First row should contain column headers</li>
                <li>Data should be properly formatted (dates, numbers, text)</li>
                <li>No empty rows between data</li>
                <li>Maximum file size: 10MB</li>
              </ul>
            </div>

            <div className="action-buttons">
              <button className="button-secondary" onClick={() => window.history.back()}>
                Go to Dashboard
              </button>
              <button className="button-secondary" onClick={resetWorkflow}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview Data */}
        {step === 2 && previewData && (
          <div className="preview-section">
            <div className="section-header">
              <Eye size={32} style={{ color: '#14b8a6' }} />
              <div>
                <h2>Preview Your Data</h2>
                <p>Showing first 5 rows of {previewData.totalRows} total records</p>
              </div>
            </div>

            <div className="file-info">
              <FileText size={20} />
              <span>{uploadedFile.name}</span>
              <span className="file-size">({(uploadedFile.size / 1024).toFixed(2)} KB)</span>
            </div>

            <div className="preview-table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    {previewData.headers.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {previewData.headers.map((header, colIndex) => (
                        <td key={colIndex}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="action-buttons">
              <button className="button-secondary" onClick={() => window.history.back()}>
                Go to Dashboard
              </button>
              <button className="button-secondary" onClick={resetWorkflow}>
                <X size={20} />
                Cancel
              </button>
              <button className="button-primary" onClick={() => setStep(3)}>
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Template */}
        {step === 3 && (
          <div className="template-section">
            <div className="section-header">
              <Sparkles size={32} style={{ color: '#14b8a6' }} />
              <div>
                <h2>Select Report Template</h2>
                <p>Choose the type of report you want to generate</p>
              </div>
            </div>

            <div className="templates-grid">
              {reportTemplates.map(template => (
                <div
                  key={template.id}
                  className="template-card"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <FileText size={32} />
                  <h3>{template.name}</h3>
                  <div className="template-fields">
                    <p>Required Fields:</p>
                    <ul>
                      {template.fields.map((field, index) => (
                        <li key={index}>{field.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                  <button className="select-template-btn">
                    Select Template
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="action-buttons">
              <button className="button-secondary" onClick={() => window.history.back()}>
                Go to Dashboard
              </button>
              <button className="button-secondary" onClick={resetWorkflow}>
                <X size={20} />
                Cancel
              </button>
              <button className="button-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button 
                className="button-primary"
                disabled={!selectedTemplate}
                onClick={() => setStep(4)}
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Map Columns */}
        {step === 4 && selectedTemplate && previewData && (
          <div className="mapping-section">
            <div className="section-header">
              <Table size={32} style={{ color: '#14b8a6' }} />
              <div>
                <h2>Map Your Data Columns</h2>
                <p>Match your data columns to report fields</p>
              </div>
            </div>

            {console.log('🔍 Step 4 - previewData:', previewData)}
            {console.log('🔍 Step 4 - headers:', previewData?.headers)}

            <div className="mapping-grid">
              {reportTemplates.find(t => t.id === selectedTemplate).fields.map(field => (
                <div key={field} className="mapping-row">
                  <div className="field-name">
                    <span className="field-label">{field.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="field-required">Required</span>
                  </div>
                  <ArrowRight size={20} style={{ color: '#64748b' }} />
                  <select
                    value={columnMapping[field] || ''}
                    onChange={(e) => setColumnMapping({...columnMapping, [field]: e.target.value})}
                    className="column-selector"
                  >
                    <option value="">-- Select Column --</option>
                    {previewData && previewData.headers && previewData.headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {columnMapping[field] ? (
                      <CheckCircle size={20} style={{ color: '#10b981' }} />
                    ) : (
                      <AlertCircle size={20} style={{ color: '#f59e0b' }} />
                    )}
                    {columnMapping[field] && (
                      <span style={{fontSize:10,color:"#10b981",background:"#10b98120",padding:"2px 6px",borderRadius:10}}>Auto-matched</span>
                    )}
                    {!columnMapping[field] && (
                      <span style={{fontSize:10,color:"#f59e0b",background:"#f59e0b20",padding:"2px 6px",borderRadius:10}}>No match found</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mapping-status">
              {(() => {
                const mapped = Object.values(columnMapping).filter(Boolean).length;
                const total = reportTemplates.find(t => t.id === selectedTemplate).fields.length;
                const pct = Math.round((mapped/total)*100);
                return mapped === total ? (
                  <div className='status-success'><CheckCircle size={20}/><span>All {total} fields mapped! Ready to generate.</span></div>
                ) : mapped > 0 ? (
                  <div className='status-warning'><AlertCircle size={20}/><span>{mapped}/{total} fields mapped ({pct}%). You can still generate � unmapped fields will use available data.</span></div>
                ) : (
                  <div className='status-warning'><AlertCircle size={20}/><span>No fields auto-matched. Please manually select columns or generate with raw data.</span></div>
                );
              })()}
            </div>

            <div className="action-buttons">
              <button className="button-secondary" onClick={() => window.history.back()}>
                Go to Dashboard
              </button>
              <button className="button-secondary" onClick={resetWorkflow}>
                <X size={20} />
                Cancel
              </button>
              <button className="button-secondary" onClick={() => setStep(3)}>
                Back
              </button>
              <button 
                className="button-primary"
                disabled={Object.keys(columnMapping).length !== reportTemplates.find(t => t.id === selectedTemplate).fields.length}
                onClick={handleGenerateReport}
              >
                {processing ? 'Generating...' : 'Generate Report'}
                <Sparkles size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Generated Report */}
        {step === 5 && generatedReport && (
          <div className="generated-section">
            <div className="success-header">
              <div className="success-icon">
                <CheckCircle size={64} style={{ color: '#14b8a6' }} />
              </div>
              <h2>Report Generated Successfully!</h2>
              <p>{generatedReport.name}</p>
            </div>

            <div className="report-summary-cards">
              <div className="summary-card">
                <div className="summary-label">Template</div>
                <div className="summary-value">{generatedReport.template}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Total Records</div>
                <div className="summary-value">{generatedReport.totalRecords}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Processed</div>
                <div className="summary-value">{generatedReport.processedRecords}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Generated</div>
                <div className="summary-value">{new Date(generatedReport.generatedAt).toLocaleTimeString()}</div>
              </div>
            </div>

            {Object.keys(generatedReport.summary).length > 0 && (
              <div className="report-analytics">
                <h3>Report Summary</h3>
                <div className="analytics-grid">
                  {Object.entries(generatedReport.summary).map(([key, value]) => (
                    <div key={key} className="analytics-item">
                      <span className="analytics-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="analytics-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="report-preview">
              <h3>Data Preview</h3>
              <div className="preview-table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      {Object.keys(generatedReport.data[0]).map((key, index) => (
                        <th key={index}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generatedReport.data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <td key={colIndex}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="action-buttons">
              <button className="button-secondary" onClick={() => window.history.back()}>
                Go to Dashboard
              </button>
              <button className="button-secondary" onClick={resetWorkflow}>
                Upload New Data
              </button>
              <button 
                className="button-primary" 
                onClick={downloadAsCSV}
                style={{ backgroundColor: '#14b8a6' }}
              >
                <Download size={20} />
                Download CSV
              </button>
              <button 
                className="button-primary" 
                onClick={downloadAsExcel}
                style={{ backgroundColor: '#10b981' }}
              >
                <Download size={20} />
                Download Excel
              </button>
              <button 
                className="button-primary" 
                onClick={downloadAsPDF}
                style={{ backgroundColor: '#3b82f6' }}
              >
                <Download size={20} />
                Download PDF/Text
              </button>
              <button 
                className="button-primary"
                onClick={() => setShowReportViewer(true)}
                style={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                  fontWeight: '700'
                }}
              >
                <Sparkles size={20} />
                View Professional Report
              </button>
              <button onClick={() => navigate('/kpi-dashboard')}>
                Advanced KPI Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>

    {showReportViewer && generatedReport && (
      <ReportViewer
        reportData={generatedReport}
        onClose={() => setShowReportViewer(false)}
        onExport={(format) => {
          if (format === 'csv') downloadAsCSV();
          else if (format === 'excel') downloadAsExcel();
          else if (format === 'pdf') downloadAsPDF();
        }}
      />
    )}
    </>
  );
};

export default DataUpload;





