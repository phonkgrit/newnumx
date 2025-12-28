import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, CheckCircle, Printer } from 'lucide-react';
import { entriesApi, roundsApi } from '../api';
import { NUMBER_TYPES, type NumberType } from '../config';
import type { NumberSummary, RoundSummary } from '../types';
import PrintReport from './PrintReport';

interface SummaryReportProps {
  roundId: number;
  drawDate: string;
}

const SummaryReport: React.FC<SummaryReportProps> = ({ roundId, drawDate }) => {
  const [numberSummary, setNumberSummary] = useState<NumberSummary[]>([]);
  const [roundSummary, setRoundSummary] = useState<RoundSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterOverLimit, setFilterOverLimit] = useState<boolean>(false);
  const [showPrintReport, setShowPrintReport] = useState(false);

  useEffect(() => {
    if (roundId) {
      fetchSummary();
    }
  }, [roundId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const [numberRes, roundRes] = await Promise.all([
        entriesApi.getSummary(roundId),
        roundsApi.getSummary(roundId),
      ]);
      setNumberSummary(numberRes.data);
      setRoundSummary(roundRes.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSummary = numberSummary.filter((item) => {
    if (filterType !== 'all' && item.number_type !== filterType) return false;
    if (filterOverLimit && !item.is_over_limit) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 mb-4">
        <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          รายงานสรุป
        </h2>
        <button
          onClick={() => setShowPrintReport(true)}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Printer className="w-4 h-4" />
          พิมพ์
        </button>
      </div>

      {/* Print Report Modal */}
      {showPrintReport && (
        <PrintReport
          roundId={roundId}
          drawDate={drawDate}
          onClose={() => setShowPrintReport(false)}
        />
      )}

      {/* Overall Summary */}
      {roundSummary && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-primary-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {roundSummary.total_entries}
            </div>
            <div className="text-xs text-gray-600">รายการ</div>
          </div>
          <div className="bg-success-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-success-600">
              ฿{Math.round(roundSummary.total_amount).toLocaleString('th-TH')}
            </div>
            <div className="text-xs text-gray-600">ยอดรวม</div>
          </div>
          <div className="bg-danger-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-danger-600">
              {roundSummary.over_limit_count}
            </div>
            <div className="text-xs text-gray-600">เกินจำกัด</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            filterType === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          ทั้งหมด
        </button>
        {(Object.keys(NUMBER_TYPES) as NumberType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              filterType === type
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {NUMBER_TYPES[type]}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={filterOverLimit}
          onChange={(e) => setFilterOverLimit(e.target.checked)}
          className="w-4 h-4 text-primary-600 rounded"
        />
        <span className="text-sm text-gray-700">แสดงเฉพาะเลขที่เกินจำกัด</span>
      </label>

      {/* Summary by Number */}
      {filteredSummary.length === 0 ? (
        <div className="text-center py-8 text-gray-500">ไม่มีข้อมูล</div>
      ) : filterType === 'all' ? (
        /* Show all numbers combined when "all" is selected */
        <div className="space-y-2">
          {filteredSummary
            .sort((a, b) => b.total_amount - a.total_amount)
            .map((item, index) => (
              <div
                key={`${item.number_value}-${item.number_type}-${index}`}
                className={`p-3 rounded-lg ${
                  item.is_over_limit
                    ? 'bg-danger-50 border border-danger-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-800 min-w-[60px]">
                      {item.number_value}
                    </span>
                    <div>
                      <div className="text-xs text-gray-500">
                        {NUMBER_TYPES[item.number_type as NumberType]}
                      </div>
                      <div className="font-semibold text-primary-600">
                        ฿{Math.round(item.total_amount).toLocaleString('th-TH')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.total_entries} รายการ
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.limit_amount > 0 && (
                      <div className="text-xs text-gray-500">
                        จำกัด: ฿{item.limit_amount.toLocaleString()}
                      </div>
                    )}
                    {item.is_over_limit ? (
                      <AlertTriangle className="w-5 h-5 text-danger-500" />
                    ) : item.limit_amount > 0 ? (
                      <CheckCircle className="w-5 h-5 text-success-500" />
                    ) : null}
                  </div>
                </div>
                {item.limit_amount > 0 && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.is_over_limit ? 'bg-danger-500' : 'bg-success-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            (item.total_amount / item.limit_amount) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((item.total_amount / item.limit_amount) * 100).toFixed(1)}% ของขีดจำกัด
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        /* Show filtered by type */
        <div className="space-y-2">
          {filteredSummary
            .sort((a, b) => b.total_amount - a.total_amount)
            .map((item, index) => (
              <div
                key={`${item.number_value}-${item.number_type}-${index}`}
                className={`p-3 rounded-lg ${
                  item.is_over_limit
                    ? 'bg-danger-50 border border-danger-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-800 min-w-[60px]">
                      {item.number_value}
                    </span>
                    <div>
                      <div className="font-semibold text-primary-600">
                        ฿{Math.round(item.total_amount).toLocaleString('th-TH')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.total_entries} รายการ
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.limit_amount > 0 && (
                      <div className="text-xs text-gray-500">
                        จำกัด: ฿{Math.round(item.limit_amount).toLocaleString('th-TH')}
                      </div>
                    )}
                    {item.is_over_limit ? (
                      <AlertTriangle className="w-5 h-5 text-danger-500" />
                    ) : item.limit_amount > 0 ? (
                      <CheckCircle className="w-5 h-5 text-success-500" />
                    ) : null}
                  </div>
                </div>
                {item.limit_amount > 0 && (
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.is_over_limit ? 'bg-danger-500' : 'bg-success-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            (item.total_amount / item.limit_amount) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((item.total_amount / item.limit_amount) * 100).toFixed(1)}% ของขีดจำกัด
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SummaryReport;
