import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const exportToPDF = (report) => {
  const doc = new jsPDF('l', 'mm', 'a4') // landscape
  const pageW = doc.internal.pageSize.getWidth()
  
  // Header background
  doc.setFillColor(15, 23, 42) // #0f172a
  doc.rect(0, 0, pageW, 40, 'F')
  
  // Title
  doc.setTextColor(16, 185, 129) // #10b981
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Finance Solution Suite', 14, 15)
  
  // Report name
  doc.setTextColor(241, 245, 249) // #f1f5f9
  doc.setFontSize(12)
  doc.text(report.report_name || 'Report', 14, 25)
  
  // Meta info
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139) // #64748b
  doc.text(`Domain: ${report.domain_name || '-'}  |  Generated: ${new Date(report.run_at).toLocaleString()}  |  Records: ${report.total_records || 0}`, 14, 33)
  
  let yPos = 50
  
  // Summary section
  const summary = report.report_data?.summary
  if (summary && typeof summary === 'object') {
    doc.setFillColor(30, 41, 59) // #1e293b
    doc.rect(0, yPos-5, pageW, 8, 'F')
    doc.setTextColor(16, 185, 129)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('REPORT SUMMARY', 14, yPos)
    yPos += 8
    
    const summaryEntries = Object.entries(summary)
    const colWidth = (pageW - 28) / Math.min(summaryEntries.length, 4)
    
    summaryEntries.slice(0, 4).forEach(([key, val], i) => {
      const x = 14 + (i * colWidth)
      doc.setFillColor(15, 23, 42)
      doc.roundedRect(x, yPos, colWidth - 4, 20, 2, 2, 'F')
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toUpperCase().trim(), x + 3, yPos + 6)
      doc.setTextColor(241, 245, 249)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(String(val).slice(0, 20), x + 3, yPos + 15)
    })
    yPos += 28
  }
  
  // Data table
  const data = report.report_data?.data
  if (data && Array.isArray(data) && data.length > 0) {
    doc.setFillColor(30, 41, 59)
    doc.rect(0, yPos-5, pageW, 8, 'F')
    doc.setTextColor(16, 185, 129)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('DATA TABLE', 14, yPos)
    yPos += 5
    
    const headers = Object.keys(data[0])
    const rows = data.map(row => Object.values(row).map(v => String(v).slice(0, 30)))
    
    autoTable(doc, {
      startY: yPos,
      head: [headers.map(h => h.replace(/_/g, ' ').toUpperCase())],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255,255,255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fillColor: [15, 23, 42], textColor: [241, 245, 249], fontSize: 7 },
      alternateRowStyles: { fillColor: [30, 41, 59] },
      styles: { cellPadding: 2, overflow: 'linebreak' },
      margin: { left: 14, right: 14 }
    })
  }
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(15, 23, 42)
    doc.rect(0, doc.internal.pageSize.getHeight()-10, pageW, 10, 'F')
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7)
    doc.text(`Finance Solution Suite - Confidential | Page ${i} of ${totalPages}`, 14, doc.internal.pageSize.getHeight()-3)
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageW-70, doc.internal.pageSize.getHeight()-3)
  }
  
  doc.save(`${(report.report_name||'report').replace(/[^a-z0-9]/gi,'_')}.pdf`)
}