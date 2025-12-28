import React from 'react';
import { Settings, Bell, Shield, Database } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-gray-600 rounded-2xl p-6 text-white shadow-xl shadow-slate-500/20">
        <h2 className="text-2xl font-bold">ตั้งค่าระบบ</h2>
        <p className="text-slate-300 mt-1">กำหนดค่าต่างๆ ของระบบ</p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* General Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">ทั่วไป</h3>
              <p className="text-sm text-slate-500">ตั้งค่าพื้นฐานระบบ</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อร้าน</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="กรอกชื่อร้าน"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทร</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="กรอกเบอร์โทร"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">การแจ้งเตือน</h3>
              <p className="text-sm text-slate-500">ตั้งค่าการแจ้งเตือน</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
              <span className="text-sm text-slate-700">แจ้งเตือนเมื่อเลขเต็ม</span>
              <input type="checkbox" className="w-5 h-5 text-primary-600" defaultChecked />
            </label>
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
              <span className="text-sm text-slate-700">แจ้งเตือนยอดขายใหม่</span>
              <input type="checkbox" className="w-5 h-5 text-primary-600" />
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">ความปลอดภัย</h3>
              <p className="text-sm text-slate-500">ตั้งค่าความปลอดภัย</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านเดิม</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านใหม่</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">ข้อมูล</h3>
              <p className="text-sm text-slate-500">จัดการข้อมูลระบบ</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              สำรองข้อมูล
            </button>
            <button className="w-full px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
              กู้คืนข้อมูล
            </button>
            <button className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              ล้างข้อมูลทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
