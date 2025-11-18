/**
 * Report Export Utilities
 * Export reports to CSV, Excel, and PDF formats
 */

export interface ReportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
  metadata?: Record<string, any>;
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: ReportData): void {
  const csvContent = [
    data.title,
    '',
    data.headers.join(','),
    ...data.rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${data.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to Excel (using CSV format with .xlsx extension)
 * For full Excel support, consider using a library like xlsx
 */
export function exportToExcel(data: ReportData): void {
  // For now, export as CSV with .xlsx extension
  // In production, use a library like 'xlsx' for proper Excel format
  exportToCSV(data);
}

/**
 * Generate PDF report (client-side)
 * For full PDF support, consider using a library like jsPDF or pdfmake
 */
export function exportToPDF(data: ReportData): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create HTML table
      const tableHTML = `
        <html>
          <head>
            <title>${data.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>${data.title}</h1>
            ${data.metadata ? `<p>Generated: ${new Date().toLocaleString()}</p>` : ''}
            <table>
              <thead>
                <tr>
                  ${data.headers.map((h) => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(tableHTML);
        printWindow.document.close();
        printWindow.print();
        resolve();
      } else {
        reject(new Error('Failed to open print window'));
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format date for reports
 */
export function formatDateForReport(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format currency for reports
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

