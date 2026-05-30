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
    { id: 'GLOBAL', label: '🌍 GLOBAL' },
    { id: 'ALPHA-888', label: '🚀 ALPHA-888' },
    { id: 'DELL-PRO-25', label: '⚡ DELL-PRO-25' },
    { id: 'STORAGE-MAX-99', label: '📦 STORAGE-MAX-99' },
    { id: 'CONSOLIDATED', label: '⚖️ ∑ CONSOLIDATED' }
  ];

  return (
    <div
      data-testid="unified-header"
      className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side: Brand and Active Context */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-600 tracking-wider">AETHER v100.0</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold border border-indigo-100">PLATINUM</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                BOQ/BOM Comparative Audit Engine
              </h1>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden md:block" />

          {/* Context Selector Toggle */}
          <button
            id="platform-context-selector"
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <div className="text-left">
              <div className="text-[9px] text-slate-400 uppercase font-bold leading-none">Platform Context</div>
              <div className="font-semibold leading-tight text-slate-800">{platformName}</div>
            </div>
          </button>

          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-205 font-mono px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {isMockMode ? 'MOCK MODE' : '🌐 PRODUCTION'}
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
              Unique Config ID
            </div>
            <div
              data-testid="ucid-display"
              className="text-xs font-bold font-mono text-slate-700"
            >
              {activeTab === 'CONSOLIDATED' ? '∑ CONSOLIDATED' : configId}
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
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center overflow-x-auto custom-scrollbar gap-1 py-1">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const hasPulse = pulseTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-testid={`global-mission-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-xs font-semibold font-mono relative tracking-wide cursor-pointer transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/40 rounded-t-lg font-bold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 rounded-lg'
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
      </div>
    </div>
  );
}
