import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download } from 'lucide-react';
import { entriesApi, roundsApi } from '../api';
import type { NumberSummary, RoundSummary } from '../types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import { useAlert } from './AlertModal';

interface PrintReportProps {
  roundId: number;
  drawDate: string;
}

// Format number with commas, no decimals
const formatMoney = (num: number): string => {
  return Math.round(num).toLocaleString('th-TH');
};

const PrintReport: React.FC<PrintReportProps> = ({ roundId, drawDate }) => {
  const [numberSummary, setNumberSummary] = useState<NumberSummary[]>([]);
  const [roundSummary, setRoundSummary] = useState<RoundSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { showAlert } = useAlert();

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [numberRes, roundRes] = await Promise.all([
        entriesApi.getSummary(roundId),
        roundsApi.getSummary(roundId),
      ]);
      setNumberSummary(numberRes.data);
      setRoundSummary(roundRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [roundId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleSaveImage = async () => {
    if (!reportRef.current) return;
    
    try {
      setSaving(true);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `รายงานหวย_${format(new Date(drawDate), 'dd-MM-yyyy')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error saving image:', error);
      showAlert({ type: 'error', message: 'ไม่สามารถบันทึกภาพได้' });
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

  // Summary calculations
  const summary2digit = numberSummary.filter(i => i.number_type === '2digit');
  const summary3digit = numberSummary.filter(i => i.number_type === '3digit');
  
  const overLimit2digit = summary2digit.filter(i => i.is_over_limit);
  const overLimit3digit = summary3digit.filter(i => i.is_over_limit);

  const overLimit2digitAmount = overLimit2digit.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);
  const overLimit3digitAmount = overLimit3digit.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);
  
  const excess2digitAmount = overLimit2digit.reduce((sum, i) => sum + getOverLimitExcess(i), 0);
  const excess3digitAmount = overLimit3digit.reduce((sum, i) => sum + getOverLimitExcess(i), 0);

  const grandTotalAmount = Number(roundSummary?.total_amount) || 0;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-slate-500 mt-3">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const formattedDate = format(new Date(drawDate), 'd MMMM yyyy', { locale: th });

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
      `}</style>

      {/* Header with Save Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">ตัวอย่างรายงาน</h2>
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {saving ? 'กำลังบันทึก...' : 'บันทึกภาพ'}
        </button>
      </div>

      {/* Report Content - For Image Capture */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div ref={reportRef} className="bg-white shadow-lg p-6 rounded-lg">
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold mb-1">รายงานสรุปหวย</h1>
                <p className="text-base">งวดวันที่ {formattedDate}</p>
                <p className="text-xs text-gray-500">พิมพ์เมื่อ: {format(new Date(), 'd MMM yyyy HH:mm', { locale: th })}</p>
              </div>

              {/* Grand Total Box */}
              <div className="summary-card bg-blue-50 border-blue-400">
                <h2 className="text-lg font-bold text-center mb-3">📊 สรุปรวมทั้งงวด</h2>
                <table className="print-table">
                  <tbody>
                    <tr>
                      <td className="font-bold">ยอดเงินรวมทั้งหมด</td>
                      <td className="text-right font-bold text-green-700">฿{formatMoney(grandTotalAmount)}</td>
                    </tr>
                    <tr>
                      <td className="font-bold">จำนวนเลขทั้งหมด</td>
                      <td className="text-right font-bold">{numberSummary.length} เลข</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Over Limit Summary */}
              <div className="summary-card bg-red-50 border-red-400">
                <h2 className="text-base font-bold text-red-700 mb-3">🚨 เลขเกินจำกัด</h2>
                <table className="print-table">
                  <thead>
                    <tr className="bg-red-100">
                      <th>ประเภท</th>
                      <th className="text-right">จำนวนเลข</th>
                      <th className="text-right">ยอดรวม</th>
                      <th className="text-right">ยอดที่เกิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2 ตัว</td>
                      <td className="text-right">{overLimit2digit.length} เลข</td>
                      <td className="text-right">฿{formatMoney(overLimit2digitAmount)}</td>
                      <td className="text-right text-red-600 font-bold">฿{formatMoney(excess2digitAmount)}</td>
                    </tr>
                    <tr>
                      <td>3 ตัว</td>
                      <td className="text-right">{overLimit3digit.length} เลข</td>
                      <td className="text-right">฿{formatMoney(overLimit3digitAmount)}</td>
                      <td className="text-right text-red-600 font-bold">฿{formatMoney(excess3digitAmount)}</td>
                    </tr>
                    <tr className="bg-red-100 font-bold">
                      <td>รวม</td>
                      <td className="text-right">{overLimit2digit.length + overLimit3digit.length} เลข</td>
                      <td className="text-right">฿{formatMoney(overLimit2digitAmount + overLimit3digitAmount)}</td>
                      <td className="text-right text-red-600">฿{formatMoney(excess2digitAmount + excess3digitAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Over Limit 2 digit */}
              {overLimit2digit.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-base font-bold text-red-700 mb-2">📝 รายละเอียดเลขเกินจำกัด - 2 ตัว</h3>
                  <table className="print-table">
                    <thead>
                      <tr className="bg-red-100">
                        <th className="text-center" style={{width: '60px'}}>เลข</th>
                        <th className="text-right">ยอดซื้อ</th>
                        <th className="text-right">จำกัด</th>
                        <th className="text-right">ยอดเกิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overLimit2digit
                        .sort((a, b) => getOverLimitExcess(b) - getOverLimitExcess(a))
                        .map((item, idx) => (
                          <tr key={idx}>
                            <td className="text-center font-bold text-lg">{item.number_value}</td>
                            <td className="text-right">฿{formatMoney(item.total_amount)}</td>
                            <td className="text-right">฿{formatMoney(item.limit_amount)}</td>
                            <td className="text-right text-red-600 font-bold">฿{formatMoney(getOverLimitExcess(item))}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Over Limit 3 digit */}
              {overLimit3digit.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-base font-bold text-red-700 mb-2">📝 รายละเอียดเลขเกินจำกัด - 3 ตัว</h3>
                  <table className="print-table">
                    <thead>
                      <tr className="bg-red-100">
                        <th className="text-center" style={{width: '60px'}}>เลข</th>
                        <th className="text-right">ยอดซื้อ</th>
                        <th className="text-right">จำกัด</th>
                        <th className="text-right">ยอดเกิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overLimit3digit
                        .sort((a, b) => getOverLimitExcess(b) - getOverLimitExcess(a))
                        .map((item, idx) => (
                          <tr key={idx}>
                            <td className="text-center font-bold text-lg">{item.number_value}</td>
                            <td className="text-right">฿{formatMoney(item.total_amount)}</td>
                            <td className="text-right">฿{formatMoney(item.limit_amount)}</td>
                            <td className="text-right text-red-600 font-bold">฿{formatMoney(getOverLimitExcess(item))}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default PrintReport;
