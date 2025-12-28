import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar, Plus, Trash2, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { roundsApi } from '../api';
import { useAlert } from './AlertModal';
import type { LotteryRound, RoundSummary } from '../types';

interface RoundSelectorProps {
  selectedRound: LotteryRound | null;
  onSelectRound: (round: LotteryRound) => void;
}

const RoundSelector: React.FC<RoundSelectorProps> = ({ selectedRound, onSelectRound }) => {
  const [rounds, setRounds] = useState<LotteryRound[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newDate, setNewDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [roundSummaries, setRoundSummaries] = useState<Record<number, RoundSummary>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { showAlert, showConfirm } = useAlert();

  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = async () => {
    try {
      setLoading(true);
      const response = await roundsApi.getAll();
      setRounds(response.data);
      
      // Fetch summaries for all rounds
      const summaries: Record<number, RoundSummary> = {};
      for (const round of response.data) {
        try {
          const summaryRes = await roundsApi.getSummary(round.id);
          summaries[round.id] = summaryRes.data;
        } catch (e) {
          // Ignore errors for individual summaries
        }
      }
      setRoundSummaries(summaries);
    } catch (error) {
      console.error('Error fetching rounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRound = async () => {
    if (!newDate) return;
    
    try {
      const response = await roundsApi.create(newDate);
      setRounds([response.data, ...rounds]);
      setShowDatePicker(false);
      onSelectRound(response.data);
    } catch (error: any) {
      showAlert({
        type: 'error',
        message: error.response?.data?.detail || 'ไม่สามารถสร้างงวดได้'
      });
    }
  };

  const handleDeleteRound = async (roundId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: 'ยืนยันการลบ',
      message: 'ต้องการลบงวดนี้หรือไม่?',
      onConfirm: async () => {
        try {
          await roundsApi.delete(roundId);
          setRounds(rounds.filter(r => r.id !== roundId));
          if (selectedRound?.id === roundId) {
            onSelectRound(rounds[0]);
          }
        } catch (error) {
          showAlert({ type: 'error', message: 'ไม่สามารถลบงวดได้' });
        }
      }
    });
  };

  const formatThaiDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'd MMM yyyy', { locale: th });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          งวดหวย
          {selectedRound && (
            <span className="text-sm font-normal text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              {formatThaiDate(selectedRound.draw_date)}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDatePicker(!showDatePicker);
              setIsCollapsed(false);
            }}
            className="btn-primary flex items-center gap-1 text-sm py-1.5 px-3"
          >
            <Plus className="w-4 h-4" />
            สร้างงวดใหม่
          </button>
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <>
          {/* Date Picker for new round */}
          {showDatePicker && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกวันที่ออกรางวัล
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="input-field"
              />
              <div className="flex gap-2 mt-3">
                <button onClick={handleCreateRound} className="btn-success text-sm py-1.5">
                  สร้าง
                </button>
                <button onClick={() => setShowDatePicker(false)} className="btn-secondary text-sm py-1.5">
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* Rounds List */}
          <div className="space-y-2 max-h-64 overflow-y-auto mt-4">
            {loading ? (
              <div className="text-center py-4 text-gray-500">กำลังโหลด...</div>
            ) : rounds.length === 0 ? (
              <div className="text-center py-4 text-gray-500">ยังไม่มีงวดหวย</div>
            ) : (
              rounds.map((round) => {
                const summary = roundSummaries[round.id];
                return (
                  <div
                    key={round.id}
                    onClick={() => onSelectRound(round)}
                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                      selectedRound?.id === round.id
                        ? 'bg-primary-100 border-2 border-primary-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-gray-800">
                        {formatThaiDate(round.draw_date)}
                      </div>
                      {summary && (
                        <div className="text-sm text-gray-500">
                          {summary.total_entries} รายการ • ฿{Number(summary.total_amount).toLocaleString()}
                          {summary.over_limit_count > 0 && (
                            <span className="ml-2 text-danger-500">
                              ({summary.over_limit_count} เกินจำกัด)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteRound(round.id, e)}
                        className="p-1.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RoundSelector;
