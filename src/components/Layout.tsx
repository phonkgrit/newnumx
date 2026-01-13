import React, { useState } from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import Sidebar from './Sidebar';
import type { MenuType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeMenu: MenuType;
  onMenuChange: (menu: MenuType) => void;
  title: string;
  userName?: string | null;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeMenu,
  onMenuChange,
  title,
  userName,
  onProfileClick,
  onLogout
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 max-w-[870px] mx-auto">
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={onMenuChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Left: Menu button + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h1 className="text-xl font-bold text-slate-800">{title}</h1>
                <p className="text-xs text-slate-500 hidden sm:block">ระบบจัดการหวย NumberX</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* User */}
              <button
                onClick={onProfileClick}
                className="flex items-center gap-2 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block font-medium text-sm">{userName || 'ผู้ใช้'}</span>
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          <div className="mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
