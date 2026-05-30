/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuditLogEntry, MissionLog } from '../types';
import { ShieldCheck, ShieldAlert, Cpu, HardDrive, Zap, Info, X, Play, Terminal, HelpCircle } from 'lucide-react';
import { DEMO_AUDIT_LOGS } from '../data';

interface TechnicalAdviceProps {
  auditLogs: AuditLogEntry[];
  isOpen: boolean;
  onClose: () => void;
  onRunMissionSidebar?: () => void;
}

export default function TechnicalAdvice({
  auditLogs,
  isOpen,
  onClose,
  onRunMissionSidebar
}: TechnicalAdviceProps) {
  const [activeTab, setActiveTab] = useState<'scrutiny' | 'wisdom' | 'graph' | 'designer' | 'portal'>('scrutiny');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [logsList, setLogsList] = useState<MissionLog[]>([]);

  // Local state to hold mocked preflight warnings emitted dynamically
  const [preflightWarnings, setPreflightWarnings] = useState<string[]>([]);

  // Listen to global window dispatch events inside mounting cycle
  useEffect(() => {
    const handleLogEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const payload = customEvent.detail;
        if (payload.type === 'ADVICE' && payload.msg) {
          setPreflightWarnings(prev => [...prev, payload.msg]);
        }
        if (payload.type === 'PORTAL' && payload.msg) {
          setLogsList(prev => [...prev, { timestamp: '11:06:00', type: 'PORTAL', ucid: 'GLOBAL', message: payload.msg }]);
        }
      }
    };
    
    // Register listener
    window.addEventListener('__forensic_shadow_log__', handleLogEvent);
    return () => {
      window.removeEventListener('__forensic_shadow_log__', handleLogEvent);
    };
  }, []);

  if (!isOpen) return null;

  // Severe badge filter calculations
  const totalCounts = {
    ALL: auditLogs.length,
    FATAL: auditLogs.filter(l => l.severity === 'FATAL').length,
    WARNING: auditLogs.filter(l => l.severity === 'WARNING').length,
    ADVICE: auditLogs.filter(l => l.severity === 'ADVICE').length,
    PASS: auditLogs.filter(l => l.severity === 'PASS').length,
    FISCAL: auditLogs.filter(l => l.severity === 'FISCAL').length
  };

  const filteredLogs = auditLogs.filter(log => {
    if (severityFilter === 'ALL') return true;
    return log.severity === severityFilter;
  });

  const handleRunSidebarMission = () => {
    setIsSidebarActive(true);
    setPreflightWarnings(['[INTEL-WARNING] ➔ Potential Thermal Risk: 350W CPUs detected in Solution 1.']);
    setLogsList([
      { timestamp: '11:05:46', type: 'PORTAL', ucid: 'GLOBAL', message: 'Partner Portal: Injected Chassis 1' },
      { timestamp: '11:05:48', type: 'SYSTEM', ucid: 'GLOBAL', message: 'Establishing WebLogic secure tunnel...' }
    ]);
    if (onRunMissionSidebar) onRunMissionSidebar();
  };

  return (
    <aside
      data-testid="technical-advice-sidebar"
      className="fixed right-0 top-0 h-full w-[420px] bg-slate-950 border-l border-white/10 z-50 p-6 flex flex-col gap-6 shadow-2xl backdrop-blur-xl animate-slide-in-right overflow-y-auto custom-scrollbar"
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Technical Advice</h3>
            <p className="text-[10px] text-slate-400 leading-none">Intelligent Architectural Guardrails</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs list (Mandatory tab-portal) */}
      <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 shrink-0">
        <button
          data-testid="tab-scrutiny"
          onClick={() => setActiveTab('scrutiny')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all tracking-wider ${
            activeTab === 'scrutiny' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Scrutiny Logs
        </button>
        <button
          data-testid="tab-portal"
          onClick={() => setActiveTab('portal')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all tracking-wider ${
            activeTab === 'portal' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white font-normal'
          }`}
        >
          portal
        </button>
        <button
          onClick={() => setActiveTab('wisdom')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all tracking-wider ${
            activeTab === 'wisdom' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          wisdom
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all tracking-wider ${
            activeTab === 'graph' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          graph
        </button>
      </div>

      {activeTab === 'scrutiny' ? (
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-grow text-left">
          {/* Severity Counters Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(totalCounts).map(([sev, count]) => {
              const isSelected = severityFilter === sev;
              const colorMaps = {
                ALL: 'text-slate-300 bg-white/5',
                FATAL: 'text-red-400 bg-red-500/10 border-red-500/10',
                WARNING: 'text-amber-400 bg-amber-500/10 border-amber-500/10',
                ADVICE: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/10',
                PASS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10',
                FISCAL: 'text-purple-400 bg-purple-500/10 border-purple-500/10'
              };

              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1.5 border rounded-lg text-[10px] font-bold font-mono uppercase cursor-pointer transition-colors ${
                    isSelected ? 'border-white/20 font-black ring-1 ring-white/10' : 'border-transparent hover:bg-white/10'
                  } ${colorMaps[sev as keyof typeof colorMaps]}`}
                >
                  {sev} ({count})
                </button>
              );
            })}
          </div>

          {/* Standard logs card */}
          <div className="flex flex-col gap-3 mt-2 pr-1">
            {filteredLogs.map(log => {
              let isSevere = log.severity === 'FATAL' || log.severity === 'WARNING';
              return (
                <div
                  key={log.id}
                  className={`p-3.5 border rounded-xl flex flex-col gap-1.5 relative overflow-hidden transition-all ${
                    log.severity === 'FATAL'
                      ? 'bg-red-500/5 border-red-500/20'
                      : log.severity === 'WARNING'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-slate-900/30 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase">
                    <span className="text-slate-500">Phase {log.phase}: {log.phaseName}</span>
                    <span className={log.severity === 'FATAL' ? 'text-red-400' : log.severity === 'WARNING' ? 'text-amber-400' : 'text-slate-400'}>
                      {log.severity}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white leading-tight">
                    {log.category}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    {log.message}
                  </p>
                  {log.affectedPart && (
                    <span className="font-mono text-[9px] bg-slate-950 px-2 py-0.5 rounded text-indigo-300 border border-white/5 inline-block self-start mt-1">
                      Part: {log.affectedPart}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Portal Automation execution sidebar console */
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-grow text-left">
          <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Portal Sync & Agentic Build</span>
            </h4>
            <span className="text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono font-bold mt-2 inline-block">
              MEAA / UAE REGION
            </span>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button className="py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-1 border border-white/5 cursor-pointer">
                HPE Portal
              </button>
              <button className="py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-1 border border-white/5 cursor-pointer">
                DELL Portal
              </button>
            </div>

            {/* Launch pipeline in sidebar action button */}
            <button
              onClick={handleRunSidebarMission}
              data-testid="run-agentic-mission-sidebar"
              className="mt-4 w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch Pipeline Execution</span>
            </button>
          </div>

          {/* Secondary Live Agent Terminal Sidebar */}
          {isSidebarActive ? (
            <div
              data-testid="live-agent-terminal-sidebar"
              className="border border-white/10 bg-slate-950 p-4 rounded-2xl flex flex-col gap-3 shadow-inner"
            >
              <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest leading-none">
                Active Telemetry Stack
              </span>

              {/* Warnings and alerts deck */}
              {preflightWarnings.length > 0 && (
                <div
                  data-testid="preflight-warnings"
                  className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 flex flex-col gap-1 text-[11px] font-mono font-bold text-red-400 leading-tight"
                >
                  <span className="text-[9px] uppercase font-black text-red-500 tracking-widest block">PRE-FLIGHT ADVICE</span>
                  {preflightWarnings.map((warn, i) => (
                    <div key={i} className="flex gap-1.5 items-start">
                      <span className="text-red-500 select-none">➔</span>
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stream Logs */}
              <div className="flex flex-col gap-2 font-mono text-[10px] leading-tight select-text max-h-[160px] overflow-y-auto custom-scrollbar">
                {logsList.map((l, i) => (
                  <div key={i} className="flex gap-1.5 items-start text-slate-400 border-l border-white/5 pl-1.5">
                    <span className="text-slate-600 font-bold">{l.timestamp}</span>
                    <span className="text-[8px] bg-white/5 px-1 rounded uppercase border border-white/15 text-indigo-400 font-bold shrink-0">{l.type}</span>
                    <span className="text-slate-300">{l.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 font-mono text-xs">
              No Active Mission Logs
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
