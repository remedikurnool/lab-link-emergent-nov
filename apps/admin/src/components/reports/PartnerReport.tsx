'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV, exportToExcel, exportToPDF, formatCurrency, formatDateForReport } from '@/lib/reports/export';
import type { ReportData } from '@/lib/reports/export';

interface PartnerReportProps {
  partnerId: string;
  partnerName: string;
  bookings: any[];
  commissions: any[];
  dateRange: { start: Date; end: Date };
}

export function PartnerReport({
  partnerId,
  partnerName,
  bookings,
  commissions,
  dateRange,
}: PartnerReportProps) {
  const [exporting, setExporting] = useState(false);

  const generateReportData = (): ReportData => {
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const totalCommissions = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const paidCommissions = commissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
    const pendingCommissions = totalCommissions - paidCommissions;

    return {
      title: `Partner Performance Report - ${partnerName}`,
      headers: [
        'Metric',
        'Value',
      ],
      rows: [
        ['Partner Name', partnerName],
        ['Report Period', `${formatDateForReport(dateRange.start)} - ${formatDateForReport(dateRange.end)}`],
        ['Total Bookings', totalBookings.toString()],
        ['Total Revenue', formatCurrency(totalRevenue)],
        ['Total Commissions', formatCurrency(totalCommissions)],
        ['Paid Commissions', formatCurrency(paidCommissions)],
        ['Pending Commissions', formatCurrency(pendingCommissions)],
        ['Commission Rate', `${((totalCommissions / totalRevenue) * 100).toFixed(2)}%`],
      ],
      metadata: {
        partnerId,
        generatedAt: new Date().toISOString(),
      },
    };
  };

  const generateDetailedReport = (): ReportData => {
    return {
      title: `Partner Detailed Report - ${partnerName}`,
      headers: [
        'Booking ID',
        'Date',
        'Patient Name',
        'Amount',
        'Commission',
        'Status',
      ],
      rows: bookings.map((booking) => [
        booking.id,
        formatDateForReport(booking.created_at),
        booking.patient?.full_name || 'N/A',
        formatCurrency(booking.total_amount || 0),
        formatCurrency(booking.partner_commission || 0),
        booking.status,
      ]),
      metadata: {
        partnerId,
        generatedAt: new Date().toISOString(),
      },
    };
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExporting(true);
    try {
      const data = generateReportData();

      switch (format) {
        case 'csv':
          exportToCSV(data);
          break;
        case 'excel':
          exportToExcel(data);
          break;
        case 'pdf':
          await exportToPDF(data);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportDetailed = async (format: 'csv' | 'excel' | 'pdf') => {
    setExporting(true);
    try {
      const data = generateDetailedReport();

      switch (format) {
        case 'csv':
          exportToCSV(data);
          break;
        case 'excel':
          exportToExcel(data);
          break;
        case 'pdf':
          await exportToPDF(data);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const reportData = generateReportData();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Partner Report</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              CSV
            </Button>
            <Button
              onClick={() => handleExport('excel')}
              disabled={exporting}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <File className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {reportData.rows.slice(2).map(([metric, value], index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{metric}</div>
              <div className="text-lg font-semibold text-gray-900">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            onClick={() => handleExportDetailed('csv')}
            disabled={exporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Detailed Report
          </Button>
        </div>
      </div>
    </div>
  );
}

