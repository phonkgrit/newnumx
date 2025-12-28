import React from 'react';
import { Plus, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useAlert } from './AlertModal';
import type { LotteryRound } from '../types';

interface RoundsPageProps {
  rounds: LotteryRound[];
  selectedRound: LotteryRound | null;
  onSelectRound: (round: LotteryRound) => void;
  onCreateRound: () => void;
  onDeleteRound: (id: number) => void;
  loading: boolean;
}

const RoundsPage: React.FC<RoundsPageProps> = ({
  rounds,
  selectedRound,
  onSelectRound,
  onCreateRound,
  onDeleteRound,
  loading
}) => {
  const { showConfirm } = useAlert();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'd MMMM yyyy', { locale: th });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-blue-500 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">จัดการงวดหวย</h2>
            <p className="text-primary-100 mt-1">เลือกงวดหวยหรือสร้างงวดใหม่</p>
          </div>
          <button
            onClick={onCreateRound}
            className="flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">สร้างงวดใหม่</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{rounds.length}</p>
            <p className="text-primary-200 text-sm">งวดทั้งหมด</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{rounds.filter(r => r.is_active).length}</p>
            <p className="text-primary-200 text-sm">งวดเปิดรับ</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl font-bold">{selectedRound ? 1 : 0}</p>
            <p className="text-primary-200 text-sm">งวดที่เลือก</p>
          </div>
        </div>
      </div>

      {/* Rounds List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">รายการงวดหวย</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-slate-500 mt-3">กำลังโหลด...</p>
          </div>
        ) : rounds.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-700">ยังไม่มีงวดหวย</h3>
            <p className="text-slate-500 mt-1">คลิกปุ่ม "สร้างงวดใหม่" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rounds.map((round) => {
              const isSelected = selectedRound?.id === round.id;
              return (
                <div
                  key={round.id}
                  onClick={() => onSelectRound(round)}
                  className={`
                    flex items-center justify-between p-4 cursor-pointer
                    transition-all duration-200
                    ${isSelected 
                      ? 'bg-primary-50 border-l-4 border-primary-500' 
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      ${isSelected 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-slate-100 text-slate-500'
                      }
                    `}>
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`font-semibold ${isSelected ? 'text-primary-700' : 'text-slate-800'}`}>
                        งวดวันที่ {formatDate(round.draw_date)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${round.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-600'
                          }
                        `}>
                          {round.is_active ? 'เปิดรับ' : 'ปิดแล้ว'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showConfirm({
                          title: 'ยืนยันการลบ',
                          message: 'ต้องการลบงวดนี้?',
                          onConfirm: () => onDeleteRound(round.id)
                        });
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-primary-500' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundsPage;
