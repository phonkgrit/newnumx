import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, X } from 'lucide-react';
import { entriesApi } from '../api';
import type { NumberSummary } from '../types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAlert } from './AlertModal';

interface PrintReportProps {
  roundId: number;
  drawDate: string;
  onClose: () => void;
}

// Format number with commas, no decimals
const formatMoney = (num: number): string => {
  return Math.round(num).toLocaleString('th-TH');
};

const ITEMS_PER_PAGE = 20;

const PrintReport: React.FC<PrintReportProps> = ({ roundId, drawDate, onClose }) => {
  const [numberSummary, setNumberSummary] = useState<NumberSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { showAlert } = useAlert();

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [numberRes] = await Promise.all([
        entriesApi.getSummary(roundId),
      ]);
      setNumberSummary(numberRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [roundId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleSavePDF = async () => {
    if (!reportRef.current) return;

    try {
      setSaving(true);

      const pages = reportRef.current.querySelectorAll('.print-page');
      const pdf = new jsPDF('p', 'mm', 'a4');

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`รายงานหวย_${format(new Date(drawDate), 'dd-MM-yyyy')}.pdf`);
    } catch (error) {
      console.error('Error saving PDF:', error);
      showAlert({ type: 'error', message: 'ไม่สามารถบันทึก PDF ได้' });
    } finally {
      setSaving(false);
    }
  };

  // Calculate over limit excess amount
  const getOverLimitExcess = (item: NumberSummary): number => {
    const totalAmount = Number(item.total_amount) || 0;
    const limitAmount = Number(item.limit_amount) || 0;
    if (item.is_over_limit && limitAmount > 0) {
      return totalAmount - limitAmount;
    }
    return 0;
  };



  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-slate-500 mt-3">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const formattedDate = format(new Date(drawDate), 'd MMMM yyyy', { locale: th });

  // Sort data
  const sortedData = [...numberSummary].sort((a, b) => Number(b.total_amount) - Number(a.total_amount));

  // Chunk data for pagination
  const chunks = [];
  for (let i = 0; i < sortedData.length; i += ITEMS_PER_PAGE) {
    chunks.push(sortedData.slice(i, i + ITEMS_PER_PAGE));
  }

  if (chunks.length === 0) {
    chunks.push([]); // Ensure at least one page
  }

  return (
    <div>
      {/* Print Styles */}
      <style>{`
        .print-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .print-table th, .print-table td {
          border: 1px solid #333;
          padding: 6px 10px;
        }
        .print-table th {
          background-color: #e5e5e5;
          font-weight: 600;
        }
        .print-table .text-right {
          text-align: right;
        }
        .print-table .text-center {
          text-align: center;
        }
        .print-table .font-bold {
          font-weight: 700;
        }
        .summary-card {
          border: 2px solid #333;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .print-page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          position: relative;
        }
        @media print {
          .print-page {
            margin: 0;
            box-shadow: none;
            page-break-after: always;
          }
        }
      `}</style>

      {/* Header with Save Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">ตัวอย่างรายงาน (A4)</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSavePDF}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {saving ? 'กำลังบันทึก...' : 'บันทึก PDF'}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Report Content - For PDF Capture */}
      <div className="bg-gray-100 rounded-lg p-4 overflow-auto max-h-[80vh]">
        <div ref={reportRef}>
          {chunks.map((chunk, pageIndex) => (
            <div key={pageIndex} className="print-page">
              {/* Header - Show on every page or just first? Let's show on every page with page number */}
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold mb-1">รายงานสรุปหวย</h1>
                <p className="text-base">งวดวันที่ {formattedDate}</p>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-xs text-gray-500">พิมพ์เมื่อ: {format(new Date(), 'd MMM yyyy HH:mm', { locale: th })}</p>
                  <p className="text-xs text-gray-500">หน้า {pageIndex + 1} / {chunks.length}</p>
                </div>
              </div>



              {/* Table Content */}
              <div>
                {pageIndex === 0 && <h3 className="text-base font-bold text-gray-800 mb-2">📝 รายละเอียดทั้งหมด</h3>}
                <table className="print-table">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-center" style={{ width: '60px' }}>เลข</th>
                      <th className="text-center">ประเภท</th>
                      <th className="text-right">ยอดซื้อ</th>
                      <th className="text-right">จำกัด</th>
                      <th className="text-right">ยอดเกิน</th>
                      <th className="text-center" style={{ width: '60px' }}>เลข</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((item, idx) => {
                      let rowClass = 'bg-green-100';
                      if (item.is_over_limit) {
                        rowClass = 'bg-red-100';
                      } else if (item.limit_amount > 0 && Number(item.total_amount) === Number(item.limit_amount)) {
                        rowClass = 'bg-yellow-100';
                      }

                      return (
                        <tr key={`${pageIndex}-${idx}`} className={rowClass}>
                          <td className="text-center font-bold text-lg">{item.number_value}</td>
                          <td className="text-center text-gray-500">
                            {item.number_type === '2digit' ? '2 ตัว' : '3 ตัว'}
                          </td>
                          <td className="text-right font-bold text-lg">{formatMoney(item.total_amount)} ฿</td>
                          <td className="text-right">
                            {item.limit_amount > 0 ? `${formatMoney(item.limit_amount)} ฿` : '-'}
                          </td>
                          <td className={`text-right font-bold text-lg ${item.is_over_limit ? 'text-red-600' : 'text-black'}`}>
                            {item.is_over_limit ? `${formatMoney(getOverLimitExcess(item))} ฿` : '0 ฿'}
                          </td>
                          <td className="text-center font-bold text-lg">{item.number_value}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrintReport;
