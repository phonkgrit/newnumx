import React, { useState, useEffect } from 'react';
import { Settings, Save, Trash2 } from 'lucide-react';
import { limitsApi } from '../api';
import { NUMBER_TYPES, type NumberType } from '../config';
import { useAlert } from './AlertModal';
import type { PriceLimit } from '../types';

interface LimitSettingsProps {
  roundId: number;
  onLimitsChange: () => void;
}

const LimitSettings: React.FC<LimitSettingsProps> = ({ roundId, onLimitsChange }) => {
  const [limits, setLimits] = useState<PriceLimit[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<NumberType, string>>({
    '2digit': '',
    '3digit': '',
  });
  const { showAlert, showConfirm } = useAlert();

  useEffect(() => {
    if (roundId) {
      fetchLimits();
    }
  }, [roundId]);

  const fetchLimits = async () => {
    try {
      setLoading(true);
      const response = await limitsApi.getByRound(roundId);
      setLimits(response.data);
      
      // Update form data with existing limits
      const newFormData: Record<string, string> = {
        '2digit': '',
        '3digit': '',
      };
      response.data.forEach((limit) => {
        newFormData[limit.number_type] = limit.limit_amount.toString();
      });
      setFormData(newFormData as Record<NumberType, string>);
    } catch (error) {
      console.error('Error fetching limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLimit = async (numberType: NumberType) => {
    const amount = formData[numberType];
    if (!amount || parseFloat(amount) <= 0) {
      showAlert({ type: 'warning', message: 'กรุณากรอกจำนวนเงิน' });
      return;
    }

    try {
      await limitsApi.create({
        round_id: roundId,
        number_type: numberType,
        limit_amount: parseFloat(amount),
      });
      fetchLimits();
      onLimitsChange();
    } catch (error: any) {
      showAlert({
        type: 'error',
        message: error.response?.data?.detail || 'ไม่สามารถบันทึกได้'
      });
    }
  };

  const handleDeleteLimit = async (limitId: number) => {
    showConfirm({
      title: 'ยืนยันการลบ',
      message: 'ต้องการลบขีดจำกัดนี้หรือไม่?',
      onConfirm: async () => {
        try {
          await limitsApi.delete(limitId);
          fetchLimits();
          onLimitsChange();
        } catch (error) {
          showAlert({ type: 'error', message: 'ไม่สามารถลบได้' });
        }
      }
    });
  };

  const getLimit = (numberType: NumberType): PriceLimit | undefined => {
    return limits.find(l => l.number_type === numberType);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary-600" />
        กำหนดขีดจำกัด
      </h2>

      {loading ? (
        <div className="text-center py-4 text-gray-500">กำลังโหลด...</div>
      ) : (
        <div className="space-y-3">
          {(Object.keys(NUMBER_TYPES) as NumberType[]).map((type) => {
            const existingLimit = getLimit(type);
            return (
              <div
                key={type}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">
                    {NUMBER_TYPES[type]}
                  </span>
                  {existingLimit && (
                    <span className="text-sm text-success-600 font-medium">
                      จำกัด: ฿{existingLimit.limit_amount.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData[type]}
                    onChange={(e) => setFormData({
                      ...formData,
                      [type]: e.target.value.replace(/\D/g, ''),
                    })}
                    className="input-field flex-1"
                    placeholder="จำนวนเงินจำกัด"
                    inputMode="numeric"
                  />
                  <button
                    onClick={() => handleSaveLimit(type)}
                    className="btn-primary p-2"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  {existingLimit && (
                    <button
                      onClick={() => handleDeleteLimit(existingLimit.id)}
                      className="btn-danger p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LimitSettings;
