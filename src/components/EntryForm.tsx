import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { entriesApi } from '../api';

import { useAlert } from './AlertModal';
import { useUserName } from '../hooks/useUserName';
import type { LotteryEntry, CreateEntryData } from '../types';

interface EntryFormProps {
  roundId: number;
}

const DISPLAY_LIMIT = 10;

const EntryForm: React.FC<EntryFormProps> = ({ roundId }) => {
  const [entries, setEntries] = useState<LotteryEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { showAlert, showConfirm } = useAlert();
  const { userName } = useUserName();

  // Form state
  const [numberValue, setNumberValue] = useState('');
  const [price, setPrice] = useState('');

  // Refs for input focus and scroll container
  const numberInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roundId) {
      // Reset pagination state
      setEntries([]);
      setOffset(0);
      setHasMore(true);
      fetchEntries(0, true);
      // Focus on number input when component mounts or roundId changes
      setTimeout(() => numberInputRef.current?.focus(), 100);
    }
  }, [roundId]);

  const fetchEntries = async (startOffset: number = 0, isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const response = await entriesApi.getByRound(roundId, DISPLAY_LIMIT, startOffset);
      const newEntries = response.data.entries;
      
      if (isInitial) {
        setEntries(newEntries);
      } else {
        setEntries(prev => [...prev, ...newEntries]);
      }
      
      setTotalCount(response.data.total);
      setOffset(startOffset + newEntries.length);
      setHasMore(newEntries.length === DISPLAY_LIMIT && (startOffset + newEntries.length) < response.data.total);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const resetForm = () => {
    setNumberValue('');
    setPrice('');
    setEditingId(null);
  };

  // Handle number input with validation
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');

    if (value.length > 2) {
      showAlert({ type: 'warning', message: 'กรุณากรอกเลขได้แค่ 2 หลักเท่านั้น' });
      return;
    }

    setNumberValue(value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!numberValue || !price) {
      showAlert({ type: 'warning', message: 'กรุณากรอกเลขและราคา' });
      numberInputRef.current?.focus();
      return;
    }

    // Validate number format (2 digits only)
    if (numberValue.length !== 2) {
      showAlert({ type: 'warning', message: 'กรุณากรอกเลข 2 หลักเท่านั้น' });
      numberInputRef.current?.focus();
      return;
    }

    const data: CreateEntryData = {
      round_id: roundId,
      number_value: numberValue,
      number_type: '2digit',
      price: parseFloat(price),
      recorded_by: userName,
    };

    try {
      if (editingId) {
        const res = await entriesApi.update(editingId, data);
        // Update entry in-place
        setEntries(prev => prev.map(e => e.id === editingId ? res.data : e));
      } else {
        const res = await entriesApi.create(data);
        // Prepend new entry to the top (user just added it)
        setEntries(prev => [res.data, ...prev]);
        setTotalCount(prev => prev + 1);
      }
      resetForm();
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
          // Remove entry from local state instantly
          setEntries(prev => prev.filter(e => e.id !== id));
          setTotalCount(prev => prev - 1);
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
              เลข (2 หลัก)
            </label>
            <input
              ref={numberInputRef}
              type="text"
              value={numberValue}
              onChange={handleNumberChange}
              onKeyDown={handleNumberKeyDown}
              className="input-field text-center text-2xl font-bold"
              placeholder="00"
              maxLength={2}
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
          รายการที่บันทึก ({totalCount})
          {totalCount > DISPLAY_LIMIT && (
            <span className="text-xs font-normal text-gray-400 ml-2">
              แสดง {entries.length} รายการล่าสุด
            </span>
          )}
        </h3>
        <div
          ref={scrollContainerRef}
          className="space-y-2 max-h-80 overflow-y-auto"
          onScroll={(e) => {
            const target = e.currentTarget;
            // Load more when scrolled near bottom (within 50px)
            if (
              hasMore &&
              !loadingMore &&
              target.scrollHeight - target.scrollTop - target.clientHeight < 50
            ) {
              fetchEntries(offset, false);
            }
          }}
        >
          {loading ? (
            <div className="text-center py-4 text-gray-500">กำลังโหลด...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-4 text-gray-500">ยังไม่มีรายการ</div>
          ) : (
            <>
              {entries.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-lg border-2 ${entry.is_over_limit
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

                      <div className="font-semibold text-primary-600">
                        ฿{Number(entry.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      {entry.recorded_by && (
                        <div className="text-xs text-slate-400">
                          โดย: {entry.recorded_by}
                        </div>
                      )}
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
              ))}
              {loadingMore && (
                <div className="text-center py-3 text-gray-400 text-sm">
                  กำลังโหลดเพิ่ม...
                </div>
              )}
              {!loadingMore && hasMore && entries.length < totalCount && (
                <button
                  onClick={() => fetchEntries(offset, false)}
                  className="w-full py-2 text-sm text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  โหลดเพิ่ม ({entries.length} / {totalCount})
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryForm;
