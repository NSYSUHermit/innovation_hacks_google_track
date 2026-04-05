import React, { useState } from 'react';
import { LayoutDashboard, Briefcase, Search, Bell, User, Plus, Command, Filter, ChevronRight, Brain, Sparkles, Zap, Target } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      active 
        ? "bg-brand-50 text-brand-600" 
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon size={18} />
    {label}
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activePage: 'apps' | 'dashboard';
  setActivePage: (page: 'apps' | 'dashboard') => void;
}

export default function Layout({ children, activePage, setActivePage }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200/50">
            <Brain size={24} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">HireMind</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-4">
            Main
          </div>
          <SidebarItem 
            icon={Target} 
            label="Command Center" 
            active={activePage === 'apps'} 
            onClick={() => setActivePage('apps')}
          />
          <SidebarItem 
            icon={Sparkles} 
            label="Intelligence" 
            active={activePage === 'dashboard'} 
            onClick={() => setActivePage('dashboard')}
          />
          
          <div className="pt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Resources
          </div>
          <SidebarItem icon={Zap} label="Job Search" onClick={() => alert('Simulating "Job Search" flow: Searching for high-fit roles...')} />
          <SidebarItem icon={User} label="Profile & Resume" onClick={() => alert('Simulating "Profile & Resume" flow: Optimizing resume for AI scanners...')} />
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer transition-all border border-transparent hover:border-slate-200 group">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold border border-white shadow-sm group-hover:scale-105 transition-transform">
              HT
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Henry Lin</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-wider">Pro Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search jobs, or insights..." 
                className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-brand-500 focus:ring-0 rounded-md py-1.5 pl-10 pr-4 text-sm transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] text-slate-400 font-mono shadow-xs uppercase">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] text-slate-400 font-mono shadow-xs uppercase">F</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative group">
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
