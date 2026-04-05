import React from 'react';
import { 
  Type, Palette, Layout as LayoutIcon, Component, 
  CheckCircle2, AlertCircle, Info, AlertTriangle,
  ChevronRight, Search, Filter, Plus, MoreHorizontal,
  ArrowRight, Calendar, Clock, MapPin, Briefcase,
  ExternalLink, Github, Linkedin, Mail, Globe,
  FileText, MessageSquare, PieChart, BarChart3, TrendingUp,
  Zap, Target, Users, Shield, Settings, LogOut,
  Bell, User, Menu, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '../lib/utils';

const ColorSwatch = ({ name, hex, variable }: { name: string, hex: string, variable: string }) => (
  <div className="space-y-2">
    <div 
      className="h-16 w-full rounded-lg border border-slate-200 shadow-sm" 
      style={{ backgroundColor: hex }}
    />
    <div>
      <p className="text-xs font-bold text-slate-900">{name}</p>
      <p className="text-[10px] font-mono text-slate-500 uppercase">{hex}</p>
      <p className="text-[10px] font-mono text-brand-600">{variable}</p>
    </div>
  </div>
);

const Section = ({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) => (
  <section className="space-y-6">
    <div className="border-b border-slate-100 pb-4">
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        {title}
      </h2>
      {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
    </div>
    {children}
  </section>
);

export default function DesignSystem() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-16 pb-24">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold border border-brand-100">
          <Shield size={14} /> Design System v1.0
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Intelligence Job Tracker <span className="text-brand-600">Design System</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
          A clean, data-driven interface designed for clarity, efficiency, and professional aesthetics. 
          Built with React, Tailwind CSS, and Lucide Icons.
        </p>
      </header>

      {/* Colors */}
      <Section 
        title="Color Palette" 
        description="Our brand colors are built around a vibrant indigo primary and a sophisticated slate neutral scale."
      >
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Palette size={14} /> Brand Primary (Indigo)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-4">
              <ColorSwatch name="50" hex="#f5f7ff" variable="--color-brand-50" />
              <ColorSwatch name="100" hex="#ebf0fe" variable="--color-brand-100" />
              <ColorSwatch name="200" hex="#dae3fd" variable="--color-brand-200" />
              <ColorSwatch name="300" hex="#bccafb" variable="--color-brand-300" />
              <ColorSwatch name="400" hex="#93a7f8" variable="--color-brand-400" />
              <ColorSwatch name="500" hex="#6366f1" variable="--color-brand-500" />
              <ColorSwatch name="600" hex="#4f46e5" variable="--color-brand-600" />
              <ColorSwatch name="700" hex="#4338ca" variable="--color-brand-700" />
              <ColorSwatch name="800" hex="#3730a3" variable="--color-brand-800" />
              <ColorSwatch name="900" hex="#312e81" variable="--color-brand-900" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Semantic Colors</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ColorSwatch name="Success" hex="#10b981" variable="emerald-500" />
                <ColorSwatch name="Warning" hex="#f59e0b" variable="amber-500" />
                <ColorSwatch name="Error" hex="#ef4444" variable="rose-500" />
                <ColorSwatch name="Info" hex="#3b82f6" variable="blue-500" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Neutral Scale</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ColorSwatch name="White" hex="#ffffff" variable="white" />
                <ColorSwatch name="Bg" hex="#f8fafc" variable="slate-50" />
                <ColorSwatch name="Border" hex="#e2e8f0" variable="slate-200" />
                <ColorSwatch name="Text" hex="#0f172a" variable="slate-900" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Typography */}
      <Section 
        title="Typography" 
        description="We use Inter for UI elements and JetBrains Mono for data-heavy components and metrics."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="p-6 glass-panel space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-brand-600 uppercase tracking-widest">Primary Font: Inter</p>
                <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">The quick brown fox</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Inter is a variable font family carefully crafted & designed for computer screens. 
                  It features a tall x-height to aid in readability of mixed-case and lower-case text.
                </p>
                <div className="flex gap-4">
                  <span className="text-sm font-normal text-slate-900">Regular 400</span>
                  <span className="text-sm font-medium text-slate-900">Medium 500</span>
                  <span className="text-sm font-semibold text-slate-900">Semibold 600</span>
                  <span className="text-sm font-bold text-slate-900">Bold 700</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 glass-panel space-y-4 bg-slate-900 text-white">
              <div className="space-y-1">
                <p className="text-xs font-bold text-brand-400 uppercase tracking-widest">Data Font: JetBrains Mono</p>
                <h3 className="text-3xl font-bold font-mono tracking-tight">84.5% FIT SCORE</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400 leading-relaxed font-mono">
                  JetBrains Mono is a typeface for developers. It's designed to be easy to read 
                  in large blocks of code and data visualizations.
                </p>
                <div className="flex gap-4 font-mono">
                  <span className="text-sm font-normal">Regular 400</span>
                  <span className="text-sm font-medium">Medium 500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Components */}
      <Section 
        title="Core Components" 
        description="Reusable UI elements that maintain consistency across the application."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buttons */}
          <div className="glass-panel p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">
                Dark Action
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="p-2 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">
                <Settings size={18} className="text-slate-600" />
              </button>
              <button className="flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">
                Text Link <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Badges & Status */}
          <div className="glass-panel p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Badges & Status</h3>
            <div className="flex flex-wrap gap-3">
              <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">Applied</span>
              <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-100">Interview</span>
              <span className="badge bg-amber-50 text-amber-700 border border-amber-100">Screening</span>
              <span className="badge bg-rose-50 text-rose-700 border border-rose-100">Rejected</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">Remote</span>
              <span className="px-2 py-0.5 bg-brand-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">High Priority</span>
            </div>
          </div>

          {/* Cards */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Glass Panel</h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">S</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Stripe</h4>
                  <p className="text-[10px] text-slate-500">Product Analyst</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 w-3/4" />
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Form Elements</h3>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search applications..." 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all">
                  <option>All Statuses</option>
                  <option>Applied</option>
                </select>
                <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Filter size={16} className="text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Iconography */}
      <Section 
        title="Iconography" 
        description="We use Lucide React for a consistent, lightweight, and scalable icon set."
      >
        <div className="glass-panel p-8 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-8">
          <TrendingUp className="text-slate-400" />
          <Users className="text-slate-400" />
          <Target className="text-slate-400" />
          <Zap className="text-slate-400" />
          <Calendar className="text-slate-400" />
          <Clock className="text-slate-400" />
          <MapPin className="text-slate-400" />
          <Briefcase className="text-slate-400" />
          <CheckCircle2 className="text-emerald-500" />
          <AlertTriangle className="text-amber-500" />
          <AlertCircle className="text-rose-500" />
          <Info className="text-blue-500" />
          <Github className="text-slate-400" />
          <Linkedin className="text-slate-400" />
          <Mail className="text-slate-400" />
          <Globe className="text-slate-400" />
          <FileText className="text-slate-400" />
          <MessageSquare className="text-slate-400" />
          <PieChart className="text-slate-400" />
          <BarChart3 className="text-slate-400" />
          <Search className="text-slate-400" />
          <Filter className="text-slate-400" />
          <Plus className="text-slate-400" />
          <MoreHorizontal className="text-slate-400" />
        </div>
      </Section>

      {/* Layout Grid */}
      <Section 
        title="Layout & Spacing" 
        description="Our layouts are built on a fluid 12-column grid with consistent spacing tokens."
      >
        <div className="space-y-8">
          <div className="grid grid-cols-12 gap-4 h-32">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-brand-50 border border-brand-100 rounded flex items-center justify-center text-[10px] font-bold text-brand-300">
                {i + 1}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl border-dashed flex items-center justify-center text-xs text-slate-400">
              Gap 6 (24px)
            </div>
            <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl border-dashed flex items-center justify-center text-xs text-slate-400">
              Gap 6 (24px)
            </div>
            <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl border-dashed flex items-center justify-center text-xs text-slate-400">
              Gap 6 (24px)
            </div>
          </div>
        </div>
      </Section>

      <footer className="pt-12 border-t border-slate-100 text-center space-y-4">
        <p className="text-sm text-slate-500">
          Designed with ❤️ for high-performance job seekers.
        </p>
        <div className="flex justify-center gap-6">
          <button className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors">Documentation</button>
          <button className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors">GitHub</button>
          <button className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors">Figma</button>
        </div>
      </footer>
    </div>
  );
}
