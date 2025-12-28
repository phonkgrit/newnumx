import React from 'react';
import { 
  Calendar, 
  Hash, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Ticket,
  X
} from 'lucide-react';
import type { MenuType } from '../types';

export type { MenuType };

interface SidebarProps {
  activeMenu: MenuType;
  onMenuChange: (menu: MenuType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeMenu, 
  onMenuChange,
  isOpen, 
  onToggle 
}) => {
  const menuItems = [
    { 
      id: 'rounds' as MenuType, 
      label: 'งวดหวย', 
      icon: Calendar,
      description: 'จัดการงวดหวย'
    },
    { 
      id: 'entry' as MenuType, 
      label: 'คีย์เลข', 
      icon: Hash,
      description: 'เพิ่มเลขและจำกัด'
    },
    { 
      id: 'reports' as MenuType, 
      label: 'รายงาน', 
      icon: BarChart3,
      description: 'ดูสรุปยอด'
    },
    { 
      id: 'settings' as MenuType, 
      label: 'ตั้งค่า', 
      icon: Settings,
      description: 'ตั้งค่าระบบ'
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full z-50
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          shadow-2xl transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-0 lg:w-20'}
          overflow-hidden
        `}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          <div className={`flex items-center gap-3 ${!isOpen && 'lg:justify-center lg:w-full'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <h1 className="text-white font-bold text-lg whitespace-nowrap">NumberX</h1>
                <p className="text-slate-400 text-xs whitespace-nowrap">ระบบจัดการหวย</p>
              </div>
            )}
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 px-3">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onMenuChange(item.id);
                      if (window.innerWidth < 1024) onToggle();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl
                      transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30' 
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                      }
                      ${!isOpen && 'lg:justify-center lg:px-0'}
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-400 rounded-r-full" />
                    )}
                    
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-primary-400'}`} />
                    
                    {isOpen && (
                      <div className="overflow-hidden">
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                        <p className={`text-xs whitespace-nowrap ${isActive ? 'text-primary-200' : 'text-slate-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {!isOpen && (
                      <div className="
                        absolute left-full ml-3 px-3 py-2 
                        bg-slate-800 text-white text-sm rounded-lg
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-200 whitespace-nowrap z-50
                        shadow-xl hidden lg:block
                      ">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 
                          border-8 border-transparent border-r-slate-800" />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Toggle Button - Desktop only */}
        <button
          onClick={onToggle}
          className="
            hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2
            w-10 h-10 items-center justify-center
            bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white
            rounded-full transition-all duration-200
            shadow-lg
          "
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
      </aside>
    </>
  );
};

export default Sidebar;
