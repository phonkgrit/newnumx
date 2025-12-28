import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertModalState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel: boolean;
  confirmText: string;
  cancelText: string;
}

interface AlertContextType {
  showAlert: (options: {
    type?: AlertType;
    title?: string;
    message: string;
    onConfirm?: () => void;
  }) => void;
  showConfirm: (options: {
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => void;
  closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

const initialState: AlertModalState = {
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
  showCancel: false,
  confirmText: 'ตกลง',
  cancelText: 'ยกเลิก',
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AlertModalState>(initialState);

  const showAlert = useCallback(({ type = 'info', title, message, onConfirm }: {
    type?: AlertType;
    title?: string;
    message: string;
    onConfirm?: () => void;
  }) => {
    setState({
      isOpen: true,
      type,
      title: title || getDefaultTitle(type),
      message,
      onConfirm,
      showCancel: false,
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก',
    });
  }, []);

  const showConfirm = useCallback(({
    title = 'ยืนยัน',
    message,
    onConfirm,
    onCancel,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
  }: {
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => {
    setState({
      isOpen: true,
      type: 'warning',
      title,
      message,
      onConfirm,
      onCancel,
      showCancel: true,
      confirmText,
      cancelText,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setState(initialState);
  }, []);

  const handleConfirm = () => {
    state.onConfirm?.();
    closeAlert();
  };

  const handleCancel = () => {
    state.onCancel?.();
    closeAlert();
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, closeAlert }}>
      {children}
      
      {/* Modal */}
      {state.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={state.showCancel ? handleCancel : closeAlert}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm transform transition-all animate-modal-pop">
            {/* Close Button */}
            <button
              onClick={state.showCancel ? handleCancel : closeAlert}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center pt-6">
              <div className={`p-4 rounded-full ${getIconBgColor(state.type)}`}>
                {getIcon(state.type)}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {state.title}
              </h3>
              <p className="text-gray-600">
                {state.message}
              </p>
            </div>

            {/* Actions */}
            <div className={`px-6 pb-6 ${state.showCancel ? 'flex gap-3' : ''}`}>
              {state.showCancel && (
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  {state.cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                className={`${state.showCancel ? 'flex-1' : 'w-full'} py-2.5 px-4 rounded-xl font-medium transition-colors ${getButtonColor(state.type)}`}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

function getDefaultTitle(type: AlertType): string {
  switch (type) {
    case 'success': return 'สำเร็จ';
    case 'error': return 'ข้อผิดพลาด';
    case 'warning': return 'คำเตือน';
    case 'info': return 'แจ้งเตือน';
  }
}

function getIcon(type: AlertType) {
  const iconClass = 'w-8 h-8';
  switch (type) {
    case 'success':
      return <CheckCircle className={`${iconClass} text-green-500`} />;
    case 'error':
      return <XCircle className={`${iconClass} text-red-500`} />;
    case 'warning':
      return <AlertTriangle className={`${iconClass} text-amber-500`} />;
    case 'info':
      return <AlertCircle className={`${iconClass} text-blue-500`} />;
  }
}

function getIconBgColor(type: AlertType): string {
  switch (type) {
    case 'success': return 'bg-green-100';
    case 'error': return 'bg-red-100';
    case 'warning': return 'bg-amber-100';
    case 'info': return 'bg-blue-100';
  }
}

function getButtonColor(type: AlertType): string {
  switch (type) {
    case 'success': return 'bg-green-500 hover:bg-green-600 text-white';
    case 'error': return 'bg-red-500 hover:bg-red-600 text-white';
    case 'warning': return 'bg-amber-500 hover:bg-amber-600 text-white';
    case 'info': return 'bg-blue-500 hover:bg-blue-600 text-white';
  }
}

export default AlertProvider;
