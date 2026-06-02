import { useState } from 'react';
import {
  Download, Upload, FileText, FileSpreadsheet, 
  File, CheckCircle, AlertTriangle, X, Loader,
  Settings, Eye, Trash2
} from 'lucide-react';
import './ExportImport.css';

function ExportImport({ reports, currentView = 'all' }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportScope, setExportScope] = useState('filtered');
  const [exportStatus, setExportStatus] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Export to CSV
  const exportToCSV = (data, filename) => {
    const headers = [
      'Report ID', 'Report Name', 'Domain', 'Frequency', 
      'Compliance Status', 'Automation Status', 'Risk Level',
      'Stakeholders', 'Created Date'
    ];

    const rows = data.map(report => [
      report.id || report.report_id || '',
      report.name || report.reportName || '',
      report.domain || '',
      report.frequency || '',
      report.complianceStatus || report.compliance_status || '',
      report.automationStatus || 'Manual',
      report.riskLevel || 'N/A',
      (report.stakeholders || []).join('; ') || '',
      new Date(report.createdAt || report.created_at || Date.now()).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel
  const exportToExcel = async (data, filename) => {
    try {
      // Dynamic import of xlsx
      const XLSX = await import('xlsx');

      // Prepare data
      const worksheet_data = [
        ['Report ID', 'Report Name', 'Domain', 'Frequency', 'Compliance Status', 'Automation Status', 'Risk Level', 'Stakeholders', 'Created Date'],
        ...data.map(report => [
          report.id || report.report_id || '',
          report.name || report.reportName || '',
          report.domain || '',
          report.frequency || '',
          report.complianceStatus || report.compliance_status || '',
          report.automationStatus || 'Manual',
          report.riskLevel || 'N/A',
          (report.stakeholders || []).join('; ') || '',
          new Date(report.createdAt || report.created_at || Date.now()).toLocaleDateString()
        ])
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheet_data);

      // Set column widths
      ws['!cols'] = [
        { wch: 12 }, // Report ID
        { wch: 30 }, // Report Name
        { wch: 15 }, // Domain
        { wch: 12 }, // Frequency
        { wch: 18 }, // Compliance Status
        { wch: 18 }, // Automation Status
        { wch: 12 }, // Risk Level
        { wch: 25 }, // Stakeholders
        { wch: 15 }  // Created Date
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Reports');

      // Save file
      XLSX.writeFile(wb, filename);
      
      return true;
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Failed to export to Excel. Make sure xlsx library is installed.');
    }
  };

  // Export to PDF
  const exportToPDF = async (data, filename) => {
    try {
      // Dynamic import of jsPDF and autoTable
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF('landscape');

      // Add title
      doc.setFontSize(18);
      doc.setTextColor(20, 184, 166);
      doc.text('Enterprise Finance Platform - Reports Export', 14, 20);

      // Add metadata
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Total Reports: ${data.length}`, 14, 34);

      // Prepare table data
      const tableData = data.map(report => [
        report.id || report.report_id || '',
        report.name || report.reportName || '',
        report.domain || '',
        report.frequency || '',
        report.complianceStatus || report.compliance_status || '',
        report.automationStatus || 'Manual',
        report.riskLevel || 'N/A'
      ]);

      // Add table
      doc.autoTable({
        startY: 40,
        head: [['ID', 'Report Name', 'Domain', 'Frequency', 'Compliance', 'Automation', 'Risk']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [20, 184, 166],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59]
        },
        alternateRowStyles: {
          fillColor: [241, 245, 249]
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 60 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 },
          6: { cellWidth: 25 }
        },
        margin: { top: 40, left: 14, right: 14 }
      });

      // Save PDF
      doc.save(filename);
      
      return true;
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Failed to export to PDF. Make sure jspdf and jspdf-autotable are installed.');
    }
  };

  // Handle export
  const handleExport = async () => {
    setIsProcessing(true);
    setExportStatus(null);

    try {
      const dataToExport = exportScope === 'all' ? reports : reports;
      const timestamp = new Date().toISOString().split('T')[0];
      let filename = '';
      let success = false;

      switch (exportFormat) {
        case 'csv':
          filename = `reports-export-${timestamp}.csv`;
          exportToCSV(dataToExport, filename);
          success = true;
          break;

        case 'excel':
          filename = `reports-export-${timestamp}.xlsx`;
          success = await exportToExcel(dataToExport, filename);
          break;

        case 'pdf':
          filename = `reports-export-${timestamp}.pdf`;
          success = await exportToPDF(dataToExport, filename);
          break;

        default:
          throw new Error('Invalid export format');
      }

      if (success) {
        setExportStatus({
          type: 'success',
          message: `Successfully exported ${dataToExport.length} reports to ${exportFormat.toUpperCase()}`
        });

        setTimeout(() => {
          setShowExportModal(false);
          setExportStatus(null);
        }, 2000);
      }
    } catch (error) {
      setExportStatus({
        type: 'error',
        message: error.message || 'Export failed. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportFile(file);
    setImportStatus(null);
    setImportPreview(null);

    // Read file for preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        let parsedData = [];

        if (file.name.endsWith('.csv')) {
          parsedData = parseCSV(content);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(content, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          parsedData = XLSX.utils.sheet_to_json(firstSheet);
        }

        setImportPreview(parsedData.slice(0, 10)); // Preview first 10 rows
        setImportStatus({
          type: 'info',
          message: `Preview of ${parsedData.length} records (showing first 10)`
        });
      } catch (error) {
        setImportStatus({
          type: 'error',
          message: 'Failed to parse file. Please check the format.'
        });
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  // Parse CSV
  const parseCSV = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  };

  // Handle import
  const handleImport = () => {
    if (!importPreview || importPreview.length === 0) {
      setImportStatus({
        type: 'error',
        message: 'No data to import'
      });
      return;
    }

    setIsProcessing(true);

    // Simulate import process
    setTimeout(() => {
      setImportStatus({
        type: 'success',
        message: `Successfully imported ${importPreview.length} records. (Demo mode - data not persisted)`
      });
      setIsProcessing(false);

      setTimeout(() => {
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview(null);
        setImportStatus(null);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="export-import-container">
      {/* Header */}
      <div className="export-import-header">
        <div className="export-import-header-left">
          <h2 className="export-import-title">
            <Download size={20} />
            Export & Import
          </h2>
          <p className="export-import-subtitle">
            Export reports to CSV, Excel, or PDF • Import data from files
          </p>
        </div>
        <div className="export-import-actions">
          <button
            className="export-import-btn export-btn"
            onClick={() => setShowExportModal(true)}
          >
            <Download size={16} />
            Export Data
          </button>
          <button
            className="export-import-btn import-btn"
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={16} />
            Import Data
          </button>
        </div>
      </div>

      {/* Quick Export Buttons */}
      <div className="quick-export-section">
        <h3 className="quick-export-title">Quick Export</h3>
        <div className="quick-export-buttons">
          <button
            className="quick-export-btn"
            onClick={() => {
              setExportFormat('csv');
              setExportScope('filtered');
              handleExport();
            }}
          >
            <FileText size={20} />
            <span>CSV</span>
            <span className="quick-export-desc">{reports.length} reports</span>
          </button>
          <button
            className="quick-export-btn"
            onClick={() => {
              setExportFormat('excel');
              setExportScope('filtered');
              handleExport();
            }}
          >
            <FileSpreadsheet size={20} />
            <span>Excel</span>
            <span className="quick-export-desc">Formatted workbook</span>
          </button>
          <button
            className="quick-export-btn"
            onClick={() => {
              setExportFormat('pdf');
              setExportScope('filtered');
              handleExport();
            }}
          >
            <File size={20} />
            <span>PDF</span>
            <span className="quick-export-desc">Printable document</span>
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Download size={18} />
                Export Reports
              </h3>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Format Selection */}
              <div className="form-group">
                <label className="form-label">Export Format</label>
                <div className="format-options">
                  <label className={`format-option ${exportFormat === 'csv' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <FileText size={20} />
                    <div className="format-info">
                      <span className="format-name">CSV</span>
                      <span className="format-desc">Comma-separated values</span>
                    </div>
                  </label>
                  <label className={`format-option ${exportFormat === 'excel' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="format"
                      value="excel"
                      checked={exportFormat === 'excel'}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <FileSpreadsheet size={20} />
                    <div className="format-info">
                      <span className="format-name">Excel</span>
                      <span className="format-desc">Formatted spreadsheet (.xlsx)</span>
                    </div>
                  </label>
                  <label className={`format-option ${exportFormat === 'pdf' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={exportFormat === 'pdf'}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <File size={20} />
                    <div className="format-info">
                      <span className="format-name">PDF</span>
                      <span className="format-desc">Printable document</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Scope Selection */}
              <div className="form-group">
                <label className="form-label">Data Scope</label>
                <div className="scope-options">
                  <label className="scope-option">
                    <input
                      type="radio"
                      name="scope"
                      value="filtered"
                      checked={exportScope === 'filtered'}
                      onChange={(e) => setExportScope(e.target.value)}
                    />
                    <span>Current View ({reports.length} reports)</span>
                  </label>
                  <label className="scope-option">
                    <input
                      type="radio"
                      name="scope"
                      value="all"
                      checked={exportScope === 'all'}
                      onChange={(e) => setExportScope(e.target.value)}
                    />
                    <span>All Reports ({reports.length} reports)</span>
                  </label>
                </div>
              </div>

              {/* Status Message */}
              {exportStatus && (
                <div className={`status-message ${exportStatus.type}`}>
                  {exportStatus.type === 'success' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertTriangle size={20} />
                  )}
                  <span>{exportStatus.message}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowExportModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleExport}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader size={16} className="spinner" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export {exportFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Upload size={18} />
                Import Reports
              </h3>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* File Upload */}
              <div className="form-group">
                <label className="form-label">Select File</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    id="file-upload"
                    className="file-input"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <Upload size={32} />
                    <span className="upload-text">
                      {importFile ? importFile.name : 'Click to upload or drag and drop'}
                    </span>
                    <span className="upload-hint">CSV or Excel files only</span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              {importPreview && importPreview.length > 0 && (
                <div className="import-preview">
                  <div className="preview-header">
                    <h4 className="preview-title">
                      <Eye size={16} />
                      Data Preview
                    </h4>
                    <button
                      className="preview-clear"
                      onClick={() => {
                        setImportFile(null);
                        setImportPreview(null);
                        setImportStatus(null);
                      }}
                    >
                      <Trash2 size={14} />
                      Clear
                    </button>
                  </div>
                  <div className="preview-table-wrapper">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          {Object.keys(importPreview[0]).map((key, idx) => (
                            <th key={idx}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((row, idx) => (
                          <tr key={idx}>
                            {Object.values(row).map((value, vidx) => (
                              <td key={vidx}>{value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {importStatus && (
                <div className={`status-message ${importStatus.type}`}>
                  {importStatus.type === 'success' ? (
                    <CheckCircle size={20} />
                  ) : importStatus.type === 'error' ? (
                    <AlertTriangle size={20} />
                  ) : (
                    <Settings size={20} />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowImportModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleImport}
                disabled={!importPreview || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader size={16} className="spinner" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Import Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportImport;

