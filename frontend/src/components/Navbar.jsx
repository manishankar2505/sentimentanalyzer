import React from 'react';
import { Activity, LogOut, Settings } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenSettings, onNewAnalysis }) {
  return (
    <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNewAnalysis}>
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">Sentiment Analyzer</span>
                <span className="text-[11px] font-semibold tracking-wide bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-100">
                  Full-Stack AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Phone Call Intelligence & Sentiment KPI Engine</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Settings Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              title="Cerebras API Settings"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Badge & Logout */}
            <div className="h-6 w-px bg-slate-200 mx-1" />

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 pl-1 pr-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-medium text-slate-700 max-w-[140px] truncate">
                  {user?.name || user?.email}
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
