import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Type definition for submission data
export type ExportSubmission = {
  _id: string;
  fullName: string;
  passingDate: string;
  title: string;
  jurisdiction: string;
  yearsOfService: string;
  status: 'pending' | 'reviewed' | 'published';
  submittedAt: number;
  submitterName: string;
};

type ExportOptions = {
  statusFilter: string;
};

// Generate filename with date and filter
function generateFileName(filter: string, extension: string): string {
  const date = new Date().toISOString().split('T')[0];
  const filterLabel = filter === 'all' ? 'all' : filter;
  return `cogm-memorial-submissions-${date}-${filterLabel}.${extension}`;
}

// Format timestamp to readable date
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format status for display
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending Review',
    reviewed: 'Reviewed',
    published: 'Published'
  };
  return statusMap[status] || status;
}

// Escape CSV value to handle commas, quotes, and newlines
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Export submissions to CSV
export function exportToCSV(
  submissions: ExportSubmission[],
  options: ExportOptions
): void {
  const headers = [
    'Full Name',
    'Title',
    'Jurisdiction',
    'Date of Passing',
    'Years of Service',
    'Status',
    'Submitted At',
    'Submitter Name'
  ];

  const rows = submissions.map(sub => [
    sub.fullName,
    sub.title,
    sub.jurisdiction,
    sub.passingDate,
    sub.yearsOfService,
    formatStatus(sub.status),
    formatDate(sub.submittedAt),
    sub.submitterName
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = generateFileName(options.statusFilter, 'csv');
  link.click();
  URL.revokeObjectURL(link.href);
}

// Export submissions to PDF
export function exportToPDF(
  submissions: ExportSubmission[],
  options: ExportOptions
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Brand colors
  const maroon: [number, number, number] = [139, 35, 50];
  const cream: [number, number, number] = [245, 241, 235];

  // Header bar
  doc.setFillColor(...maroon);
  doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('COGM Memorial - Submissions Report', 14, 13);

  // Subtitle with filter info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const filterText = options.statusFilter === 'all'
    ? 'All Submissions'
    : `${formatStatus(options.statusFilter)} Submissions`;
  doc.text(`${filterText} | Generated: ${new Date().toLocaleDateString()}`, 14, 18);

  // Table headers
  const tableHeaders = [
    'Name',
    'Title',
    'Jurisdiction',
    'Passing Date',
    'Service Years',
    'Status',
    'Submitted',
    'Submitter'
  ];

  // Table data
  const tableData = submissions.map(sub => [
    sub.fullName,
    sub.title,
    sub.jurisdiction,
    sub.passingDate,
    sub.yearsOfService,
    formatStatus(sub.status),
    formatDate(sub.submittedAt),
    sub.submitterName
  ]);

  // Generate table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 25,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: maroon,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: cream
    },
    columnStyles: {
      0: { cellWidth: 35 },  // Name
      1: { cellWidth: 25 },  // Title
      2: { cellWidth: 35 },  // Jurisdiction
      3: { cellWidth: 25 },  // Passing Date
      4: { cellWidth: 20 },  // Service Years
      5: { cellWidth: 25 },  // Status
      6: { cellWidth: 25 },  // Submitted
      7: { cellWidth: 35 }   // Submitter
    },
    didDrawPage: (data) => {
      // Footer with page numbers
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });

  // Save PDF
  doc.save(generateFileName(options.statusFilter, 'pdf'));
}
