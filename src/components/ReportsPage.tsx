import React from 'react';
import { BarChart3, Printer } from 'lucide-react';
import SummaryReport from './SummaryReport';
import PrintReport from './PrintReport';
import type { LotteryRound } from '../types';

interface ReportsPageProps {
  selectedRound: LotteryRound | null;
}

type ReportTab = 'summary' | 'print';

const ReportsPage: React.FC<ReportsPageProps> = ({ selectedRound }) => {
  const [activeTab, setActiveTab] = React.useState<ReportTab>('summary');

  const tabs = [
    { id: 'summary' as ReportTab, label: 'สรุปยอด', icon: BarChart3 },
    { id: 'print' as ReportTab, label: 'พิมพ์', icon: Printer },
  ];

  if (!selectedRound) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-8 text-center">
        <BarChart3 className="w-16 h-16 mx-auto text-slate-300" />
        <h3 className="mt-4 text-lg font-medium text-slate-700">ยังไม่ได้เลือกงวด</h3>
        <p className="text-slate-500 mt-1">กรุณาไปที่เมนู "งวดหวย" เพื่อเลือกงวดก่อน</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl shadow-violet-500/20">
        <h2 className="text-2xl font-bold">รายงาน</h2>
        <p className="text-violet-100 mt-1">ดูสรุปยอดและพิมพ์รายงาน</p>
        
        <div className="mt-4 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl inline-block">
          <p className="text-violet-200 text-sm">งวดที่เลือก</p>
          <p className="font-bold text-lg">{selectedRound.draw_date}</p>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-4 px-4
                font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-600 -mb-px'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'summary' && (
            <SummaryReport
              key={`summary-${selectedRound.id}`}
              roundId={selectedRound.id}
              drawDate={selectedRound.draw_date}
            />
          )}
          {activeTab === 'print' && (
            <PrintReport
              key={`print-${selectedRound.id}`}
              roundId={selectedRound.id}
              drawDate={selectedRound.draw_date}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
