import React from 'react';
import { Hash, Settings } from 'lucide-react';
import EntryForm from './EntryForm';
import LimitSettings from './LimitSettings';
import type { LotteryRound } from '../types';

interface EntryPageProps {
  selectedRound: LotteryRound | null;
  onEntriesChange: () => void;
}

type EntryTab = 'entry' | 'limits';

const EntryPage: React.FC<EntryPageProps> = ({ selectedRound, onEntriesChange }) => {
  const [activeTab, setActiveTab] = React.useState<EntryTab>('entry');

  const tabs = [
    { id: 'entry' as EntryTab, label: 'เพิ่มเลข', icon: Hash },
    { id: 'limits' as EntryTab, label: 'จำกัด', icon: Settings },
  ];

  if (!selectedRound) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-8 text-center">
        <Hash className="w-16 h-16 mx-auto text-slate-300" />
        <h3 className="mt-4 text-lg font-medium text-slate-700">ยังไม่ได้เลือกงวด</h3>
        <p className="text-slate-500 mt-1">กรุณาไปที่เมนู "งวดหวย" เพื่อเลือกงวดก่อน</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Round Badge */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl px-4 py-2 text-white shadow-md inline-flex items-center gap-2">
        <span className="text-emerald-200 text-sm">งวด</span>
        <span className="font-bold">{selectedRound.draw_date}</span>
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
          {activeTab === 'entry' && (
            <EntryForm
              key={`entry-${selectedRound.id}`}
              roundId={selectedRound.id}
              onEntriesChange={onEntriesChange}
            />
          )}
          {activeTab === 'limits' && (
            <LimitSettings
              key={`limits-${selectedRound.id}`}
              roundId={selectedRound.id}
              onLimitsChange={onEntriesChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryPage;
