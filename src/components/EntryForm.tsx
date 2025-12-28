import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { entriesApi } from '../api';
import { NUMBER_TYPES, type NumberType } from '../config';
import { useAlert } from './AlertModal';
import type { LotteryEntry, CreateEntryData } from '../types';

interface EntryFormProps {
  roundId: number;
  onEntriesChange: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ roundId, onEntriesChange }) => {
  const [entries, setEntries] = useState<LotteryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { showAlert, showConfirm } = useAlert();
  
  // Form state
  const [numberValue, setNumberValue] = useState('');
  const [price, setPrice] = useState('');

  // Refs for input focus
  const numberInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (roundId) {
      fetchEntries();
      // Focus on number input when component mounts or roundId changes
      setTimeout(() => numberInputRef.current?.focus(), 100);
    }
  }, [roundId]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await entriesApi.getByRound(roundId);
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNumberValue('');
    setPrice('');
    setEditingId(null);
  };

  // Auto-detect number type based on length
  const getNumberType = (num: string): NumberType => {
    return num.length === 3 ? '3digit' : '2digit';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!numberValue || !price) {
      showAlert({ type: 'warning', message: 'กรุณากรอกเลขและราคา' });
      numberInputRef.current?.focus();
      return;
    }

    // Validate number format (2 or 3 digits only)
    if (numberValue.length < 2 || numberValue.length > 3) {
      showAlert({ type: 'warning', message: 'กรุณากรอกเลข 2 หรือ 3 หลัก' });
      numberInputRef.current?.focus();
      return;
    }

    const detectedType = getNumberType(numberValue);

    const data: CreateEntryData = {
      round_id: roundId,
      number_value: numberValue,
      number_type: detectedType,
      price: parseFloat(price),
    };

    try {
      if (editingId) {
        await entriesApi.update(editingId, data);
      } else {
        await entriesApi.create(data);
      }
      resetForm();
      fetchEntries();
      onEntriesChange();
      // Focus back to number input for continuous entry
      setTimeout(() => numberInputRef.current?.focus(), 50);
    } catch (error: any) {
      showAlert({
        type: 'error',
        message: error.response?.data?.detail || 'เกิดข้อผิดพลาด'
      });
    }
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      priceInputRef.current?.focus();
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleEdit = (entry: LotteryEntry) => {
    setNumberValue(entry.number_value);
    setPrice(entry.price.toString());
    setEditingId(entry.id);
    setTimeout(() => numberInputRef.current?.focus(), 50);
  };

  const handleDelete = async (id: number) => {
    showConfirm({
      title: 'ยืนยันการลบ',
      message: 'ต้องการลบรายการนี้หรือไม่?',
      onConfirm: async () => {
        try {
          await entriesApi.delete(id);
          fetchEntries();
          onEntriesChange();
        } catch (error) {
          showAlert({ type: 'error', message: 'ไม่สามารถลบได้' });
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <h2 
        className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 cursor-pointer"
        onClick={() => numberInputRef.current?.focus()}
      >
        <Plus className="w-5 h-5 text-primary-600" />
        {editingId ? 'แก้ไขรายการ' : 'เพิ่มเลข'}
      </h2>

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เลข (2-3 หลัก)
            </label>
            <input
              ref={numberInputRef}
              type="text"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handleNumberKeyDown}
              className="input-field text-center text-2xl font-bold"
              placeholder="00"
              maxLength={3}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ราคา
            </label>
            <input
              ref={priceInputRef}
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handlePriceKeyDown}
              className="input-field text-center text-2xl font-bold"
              placeholder="฿"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">
            {editingId ? 'บันทึก' : 'เพิ่ม'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              ยกเลิก
            </button>
          )}
        </div>
      </form>

      {/* Entries List */}
      <div className="mt-6">
        <h3 className="text-md font-semibold text-gray-700 mb-3">
          รายการที่บันทึก ({entries.length})
        </h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-gray-500">กำลังโหลด...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-4 text-gray-500">ยังไม่มีรายการ</div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border-2 ${
                  entry.is_over_limit
                    ? 'bg-danger-50 border-danger-300'
                    : 'bg-gray-50 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-800">
                      {entry.number_value}
                    </span>
                    <div>
                      <div className="text-sm text-gray-500">
                        {NUMBER_TYPES[entry.number_type as NumberType]}
                      </div>
                      <div className="font-semibold text-primary-600">
                        ฿{entry.price.toLocaleString()}
                      </div>
                    </div>
                    {entry.is_over_limit && (
                      <span className="badge-overlimit flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        เกินจำกัด
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-gray-500 hover:text-danger-500 hover:bg-danger-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryForm;
