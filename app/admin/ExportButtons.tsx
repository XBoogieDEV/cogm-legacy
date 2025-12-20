'use client';

import { useState } from 'react';
import { exportToCSV, exportToPDF, ExportSubmission } from '../../lib/exportUtils';

interface ExportButtonsProps {
  submissions: ExportSubmission[];
  statusFilter: string;
  isLoading?: boolean;
}

export function ExportButtons({
  submissions,
  statusFilter,
  isLoading = false
}: ExportButtonsProps) {
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const handleExportCSV = async () => {
    if (submissions.length === 0) {
      alert('No submissions to export');
      return;
    }

    setExporting('csv');
    try {
      exportToCSV(submissions, { statusFilter });
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    if (submissions.length === 0) {
      alert('No submissions to export');
      return;
    }

    setExporting('pdf');
    try {
      exportToPDF(submissions, { statusFilter });
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const isDisabled = isLoading || submissions.length === 0;

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportCSV}
        disabled={isDisabled || exporting === 'csv'}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-body bg-cream border border-gold/40 text-charcoal rounded-lg hover:bg-gold/20 hover:border-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export to CSV"
      >
        {exporting === 'csv' ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        CSV
      </button>

      <button
        onClick={handleExportPDF}
        disabled={isDisabled || exporting === 'pdf'}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-body bg-cream border border-gold/40 text-charcoal rounded-lg hover:bg-gold/20 hover:border-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export to PDF"
      >
        {exporting === 'pdf' ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
        PDF
      </button>
    </div>
  );
}
