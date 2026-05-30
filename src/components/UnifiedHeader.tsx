/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, DollarSign, Activity, Terminal, Shield, RefreshCw } from 'lucide-react';

interface UnifiedHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  solutionValue: number;
  driftDelta: number;
  configId: string;
  platformName: string;
  isMockMode: boolean;
  onRefresh: () => void;
  pulseTab?: string;
  onOpenTerminal: () => void;
  onOpenSidebar: () => void;
}

// Clear metadata map per active config category
const CONFIG_METADATA: Record<string, {
  vendor: string;
  badgeColor: string;
  platformName: string;
  configId: string;
  iconBg: string;
  logoChar: string;
}> = {
  GLOBAL: {
    vendor: 'COMBINED VALUE',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    platformName: 'All Server Setups in Workbook',
    configId: 'ALL SYSTEMS ACTIVE',
    iconBg: 'bg-indigo-600',
    logoChar: '🌍'
  },
  'ALPHA-888': {
    vendor: 'HPE TARGET',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    platformName: 'HPE ProLiant Gen11/Gen12 Server Combo',
    configId: 'ALPHA-888 (Gen11 Baseline)',
    iconBg: 'bg-teal-600',
    logoChar: '🚀'
  },
  'DELL-PRO-25': {
    vendor: 'DELL TARGET',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    platformName: 'Dell PowerEdge R760 16G Server Setup',
    configId: 'DELL-PRO-25 (16G Dual Xeon)',
    iconBg: 'bg-blue-600',
    logoChar: '⚡'
  },
  'STORAGE-MAX-99': {
    vendor: 'ALLETRA STORAGE',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    platformName: 'Alletra SAN Storage Matrix',
    configId: 'STORAGE-MAX-99 (Enterprise Core)',
    iconBg: 'bg-purple-600',
    logoChar: '📦'
  }
};

export default function UnifiedHeader({
  activeTab,
  setActiveTab,
  solutionValue,
  driftDelta,
  configId,
  platformName,
  isMockMode,
  onRefresh,
  pulseTab,
  onOpenTerminal,
  onOpenSidebar
 }: UnifiedHeaderProps) {
  const tabs = [
    { id: 'GLOBAL', label: '🌍 COMBINED PROJECT SUMMARY', subtitle: 'All configurations combined' },
    { id: 'ALPHA-888', label: '🚀 HPE ProLiant (ALPHA-888)', subtitle: 'Gen11/12 Specs' },
    { id: 'DELL-PRO-25', label: '⚡ Dell PowerEdge (DELL-PRO-25)', subtitle: '16G Cluster specs' },
    { id: 'STORAGE-MAX-99', label: '📦 Sovereign Storage (STORAGE-MAX)', subtitle: 'Alletra SAN target' }
  ];

  // Resolve current active tab metadata fallback
  const meta = CONFIG_METADATA[activeTab] || {
    vendor: 'UNKNOWN PLATFORM',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    platformName: platformName || 'Dynamic Cloud Blueprint Configuration',
    configId: configId || activeTab,
    iconBg: 'bg-slate-600',
    logoChar: '⚙️'
  };

  return (
    <div
      data-testid="unified-header"
      className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side: Brand and Active Context */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center shadow-sm text-lg transition-all`}>
              <span className="leading-none">{meta.logoChar}</span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-600 tracking-wider">AETHER v100.0</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold border ${meta.badgeColor} uppercase tracking-wider`}>
                  {meta.vendor}
                </span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                BOQ/BOM Comparative Audit Engine
              </h1>
            </div>
          </div>
 
          <div className="h-8 w-px bg-slate-200 hidden md:block" />
 
          {/* Context Selector Toggle */}
          <div
            id="platform-context-selector"
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-705"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <div className="text-left">
              <div className="text-[9px] text-slate-400 uppercase font-bold leading-none">Design Target Context</div>
              <div className="font-semibold leading-tight text-slate-800">{meta.platformName}</div>
            </div>
          </div>
 
          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-mono px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {isMockMode ? '🔬 PRACTICE ENVIRONMENT' : '📂 LIVE WORKBOOK'}
          </span>
        </div>
 
        {/* Middle/Right Side: Live Financial Stats */}
        <div className="flex items-center gap-6 self-end md:self-auto">
          {/* Cumulative Solution Value */}
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
              <DollarSign className="w-3 h-3 text-emerald-600" /> Cumulative Value
            </div>
            <div
              data-testid="header-solution-value"
              className="text-xl font-bold font-mono text-slate-900 tracking-snug"
            >
              ${solutionValue.toLocaleString()}
            </div>
          </div>
 
          <div className="h-8 w-px bg-slate-200" />
 
          {/* Unique Active Configuration ID */}
          <div className="text-center bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
            <div className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-wider">
              Selected Config ID
            </div>
            <div
              data-testid="ucid-display"
              className="text-xs font-bold font-mono text-slate-700"
            >
              {meta.configId}
            </div>
          </div>
 
          <div className="h-8 w-px bg-slate-200" />
 
          {/* Real-time Technical Drift delta */}
          <div className="text-left">
            <div className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3 text-rose-600" /> Technical Drift
            </div>
            <div
              data-testid="header-drift-delta"
              className={`text-xl font-bold font-mono tracking-snug transition-colors flex items-center ${
                driftDelta !== 0 ? 'text-amber-600' : 'text-slate-600'
              }`}
            >
              {driftDelta !== 0 ? `+$${driftDelta.toLocaleString()}` : '$0'}
            </div>
          </div>
        </div>
      </div>
 
      {/* Navigation Task & Multi-UCID Telemetry Tabs */}
      <div className="border-t border-slate-200 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-2 py-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Split Views into separate visual layout categories */}
            <div className="flex items-center gap-3 py-1">
              {/* Category-like label to clearly separate views */}
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                All-in-One Report
              </span>
              <div className="flex items-center gap-1">
                {tabs.slice(0, 1).map(tab => {
                  const isActive = activeTab === tab.id;
                  const hasPulse = pulseTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      data-testid={`global-mission-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2.5 rounded-lg text-xs font-semibold font-mono relative tracking-wide cursor-pointer transition-all duration-150 flex items-center gap-1.5 ${
                        isActive
                          ? 'text-indigo-650 bg-indigo-50 border border-indigo-200 font-black shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-150/40'
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
 
              <div className="h-4 w-px bg-slate-300" />
 
              <span className="text-[10px] font-mono font-bold text-indigo-550 uppercase tracking-widest bg-indigo-50/75 px-2.5 py-1 rounded-md border border-indigo-100/60 font-medium">
                Server Configurations
              </span>

              <div className="flex items-center gap-1 overflow-x-auto max-w-[500px] custom-scrollbar">
                {tabs.slice(1).map(tab => {
                  const isActive = activeTab === tab.id;
                  const hasPulse = pulseTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      data-testid={`global-mission-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold font-mono relative tracking-wide cursor-pointer transition-all duration-150 flex items-center gap-1 shrink-0 ${
                        isActive
                          ? 'text-indigo-650 bg-indigo-100/40 border border-indigo-205 font-bold'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {hasPulse && !isActive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 font-bold"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
 
            <div className="flex items-center gap-2 py-1">
              <button
                data-testid="open-audit-console"
                onClick={onOpenTerminal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-sm transition-all"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Audit Console</span>
              </button>
 
              <button
                data-testid="open-advice-sidebar"
                onClick={onOpenSidebar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-sm transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Technical Advice</span>
              </button>
 
              <button
                title="Hot reload Active Invariants"
                onClick={onRefresh}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 cursor-pointer shadow-sm transition-transform duration-500 hover:rotate-180"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
 
          {/* Context Explainer Banner */}
          <div className="bg-indigo-50/40 border border-indigo-100/40 rounded-lg px-3.5 py-2 text-[11px] text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-sans">
            <div className="flex items-center gap-2">
              <span className="text-xs">💡</span>
              <span className="leading-normal">
                {activeTab === 'GLOBAL' ? (
                  <>
                    You are in the <strong>Multi-Vendor Global Rollup</strong>. This compares multiple high-density target platforms side-by-side to verify balanced specs and prevent pricing drift.
                  </>
                ) : (
                  <>
                    Showing specs for isolated container configuration <strong>{meta.platformName}</strong>. All SKU matches and physical chassis metrics are locked to this vendor's technical specifications.
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-mono text-slate-400 font-medium">Mapped Classes: {activeTab === 'GLOBAL' ? '3 active server configurations' : '1 isolated chassis target'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
