import React, { useState } from 'react';
import { User } from 'lucide-react';

interface NameModalProps {
    isOpen: boolean;
    onSubmit: (name: string) => void;
}

const NameModal: React.FC<NameModalProps> = ({ isOpen, onSubmit }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-modal-pop">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-t-2xl p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">ยินดีต้อนรับ</h2>
                    <p className="text-primary-100 text-sm mt-1">กรุณาใส่ชื่อของคุณ</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ชื่อของคุณ"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-lg
                     focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                     transition-all duration-200"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full mt-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 
                     text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30
                     hover:from-primary-700 hover:to-primary-600
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
                    >
                        เข้าสู่ระบบ
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NameModal;
