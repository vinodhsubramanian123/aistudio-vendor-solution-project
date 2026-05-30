/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MissionLog } from '../types';
import { Play, Pause, RotateCcw, Monitor, ShieldAlert, CheckCircle, RefreshCw, Layers, ShieldCheck, Terminal, Search } from 'lucide-react';
import { SIMULATOR_MISSION_STEPS } from '../data';

interface MissionControlProps {
  onEmitUCID: (ucid: string) => void;
}

export default function MissionControl({ onEmitUCID }: MissionControlProps) {
  // Config controllers
  const [orchestrationMode, setOrchestrationMode] = useState<'atomic' | 'multiu_id'>('atomic');
  const [regionLock, setRegionLock] = useState<'GLOBAL' | 'MEA' | 'AMS' | 'APJ'>('MEA');
  const [taaStrict, setTaaStrict] = useState(true);
  const [sovereignCloud, setSovereignCloud] = useState(true);
  const [mockSandbox, setMockSandbox] = useState(true);

  // Terminal active states
  const [isMissionActive, setIsMissionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  const progressRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize terminal on mount with standard loading statements
  useEffect(() => {
    setLogs([
      { timestamp: '10:55:40', type: 'INFO', ucid: 'GLOBAL', message: 'Resolving rules for family=undefined, gen=undefined, vendor=undefined. Candidates: ["/home/vinodh/.config/Electron/intelligence/specs/smart_audit_rules.json", "/data/smart_audit_rules.json"]' },
      { timestamp: '10:55:40', type: 'INFO', ucid: 'GLOBAL', message: 'Loaded and merged rules: count=132' },
      { timestamp: '10:55:43', type: 'INFO', ucid: 'GLOBAL', message: 'Registered platform spec for HPE:DL380:GEN12' }
    ]);
  }, []);

  const handleLaunchMission = () => {
    if (isMissionActive) return;

    setIsMissionActive(true);
    setIsPaused(false);
    setProgress(0);
    progressRef.current = 0;

    // Reset list and append step-by-step
    setLogs([
      { timestamp: '11:05:00', type: 'INFO', ucid: 'GLOBAL', message: '🚀 Launching Pre-Flight Inception Strike...' },
      { timestamp: '11:05:02', type: 'PORTAL', ucid: 'GLOBAL', message: 'Connecting to manufacturer secure Partner Portal...' },
      { timestamp: '11:05:05', type: 'FORENSIC', ucid: 'GLOBAL', message: 'Phase 1: Isolated DNA match found - Checking chassis baseline.' }
    ]);

    // Live streaming simulation simulation interval
    intervalRef.current = setInterval(() => {
      // Handle pause gate
      if (progressRef.current >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsMissionActive(false);
        // Promote final certified UCID to header
        onEmitUCID('MOCK-5080501412');
        return;
      }

      progressRef.current += 5;
      setProgress(progressRef.current);

      // Append logs dynamically
      if (progressRef.current === 15) {
        setLogs(prev => [
          ...prev,
          { timestamp: '11:05:12', type: 'SYSTEM', ucid: 'GLOBAL', message: 'Phase 2: Purging default elements and co-injecting custom modules.' }
        ]);
      } else if (progressRef.current === 40) {
        setLogs(prev => [
          ...prev,
          { timestamp: '11:05:25', type: 'HEAL', ucid: 'GLOBAL', message: '🩹 [AUTO-HEAL] Identified power load boundaries mismatch. Substituting flex-slot wattage.' }
        ]);
      } else if (progressRef.current === 65) {
        setLogs(prev => [
          ...prev,
          { timestamp: '11:05:40', type: 'PORTAL', ucid: 'GLOBAL', message: 'Phase 3: Triggering WebLogic action listeners & Save-Gate validations.' }
        ]);
      } else if (progressRef.current === 85) {
        setLogs(prev => [
          ...prev,
          { timestamp: '11:05:58', type: 'SUCCESS', ucid: 'GLOBAL', message: '🏆 UCID CONFIRMED: MOCK-5080501412 — Graduation Certified ✅' }
        ]);
      }
    }, 1500);
  };

  const handlePauseToggle = () => {
    if (!isMissionActive) return;
    if (isPaused) {
      setIsPaused(false);
      // Resume timer
      handleLaunchMission();
    } else {
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  // Perform search / toggles inside logs
  const logFilterKeys = ['ALL', 'PORTAL', 'SYSTEM', 'SUCCESS', 'ERROR', 'HEAL', 'FORENSIC', 'EXCEPTION'];

  const filteredLogs = logs.filter(item => {
    if (selectedTypeFilter !== 'ALL' && item.type !== selectedTypeFilter) return false;
    if (searchText.trim() !== '') {
      return item.message.toLowerCase().includes(searchText.toLowerCase());
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Target configs panels */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* CRT retro Terminal HUD console */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest text-left">
            Live Terminal HUD Feed
          </span>
          
          <div
            data-testid="live-agent-terminal"
            className="bg-slate-950 border border-white/10 rounded-3xl overflow-hidden flex flex-col relative group/terminal pointer-events-auto transition-all duration-500 w-full h-[580px] glowing-ambient-violet"
          >
            {/* Terminal bar */}
            <div className="bg-slate-900 px-6 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-[10px] font-mono font-black text-indigo-400 tracking-wider ml-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  CTO AUTONOMOUS AGENT STREAM
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                <span>BUFFER: ACTIVE</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </div>
            </div>

            {/* Simulated interactive Terminal log list viewport */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed flex flex-col gap-3 text-left">
              {filteredLogs.map((log, idx) => {
                let colorClass = 'text-slate-400';
                if (log.type === 'SUCCESS') colorClass = 'text-emerald-400 font-bold';
                if (log.type === 'HEAL') colorClass = 'text-cyan-400 font-bold';
                if (log.type === 'FORENSIC') colorClass = 'text-purple-400';
                if (log.type === 'PORTAL') colorClass = 'text-indigo-400';
                if (log.type === 'ERROR' || log.type === 'EXCEPTION') colorClass = 'text-rose-500 font-bold';

                return (
                  <div key={idx} className="flex gap-2 items-start border-l border-white/5 pl-2">
                    <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                    <span className={`text-[10px] bg-white/5 border border-white/10 px-1 py-0.2 rounded shrink-0 font-bold uppercase ${colorClass}`}>
                      {log.type}
                    </span>
                    <p className={`flex-1 ${colorClass}`}>{log.message}</p>
                  </div>
                );
              })}
            </div>

            {/* Progressive control panel */}
            <div className="bg-slate-900 border-t border-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLaunchMission}
                  disabled={isMissionActive}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-500 hover:bg-indigo-600 disabled:bg-white/5 disabled:text-slate-500 text-white cursor-pointer transition-all"
                >
                  {isMissionActive ? 'Agent Executing...' : 'Replay Timeline / Run'}
                </button>

                <button
                  onClick={handlePauseToggle}
                  className="p-2 bg-slate-950 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
              </div>

              {/* Progress gauge bar */}
              <div className="flex-1 max-w-sm flex items-center gap-3 text-xs text-slate-300">
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300 shadow-md shadow-indigo-500/50"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Control parameters */}
      <div className="flex flex-col gap-4 text-left">
        <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest leading-none">
          Automation Configurations
        </span>

        <div className="border border-white/10 p-5 rounded-3xl bg-slate-900/30 flex flex-col gap-4">
          {/* Mode selections toggles */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Orchestration Mode</span>
            </h4>
            <div className="flex flex-col gap-1.5 mt-1">
              <button
                onClick={() => setOrchestrationMode('atomic')}
                className={`flex flex-col text-left p-2.5 rounded-xl border cursor-pointer transition-all ${
                  orchestrationMode === 'atomic'
                    ? 'bg-indigo-500/10 border-indigo-500/40'
                    : 'bg-white/5 border-transparent hover:border-white/10'
                }`}
              >
                <span className="text-xs font-bold text-slate-200">Atomic Solution (Single UCID)</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Consolidates all configurations into a single high-fidelity Solution ID sequentially to prevent slot conflicts.
                </span>
              </button>

              <button
                onClick={() => setOrchestrationMode('multiu_id')}
                className={`flex flex-col text-left p-2.5 rounded-xl border cursor-pointer transition-all ${
                  orchestrationMode === 'multiu_id'
                    ? 'bg-indigo-500/10 border-indigo-500/40'
                    : 'bg-white/5 border-transparent hover:border-white/10'
                }`}
              >
                <span className="text-xs font-bold text-slate-200">Orchestrated Mission (Multi-UCID)</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Logs in once to cache vendor session securely, executing sequential actions within each tab while running multiple UCID configs in parallel.
                </span>
              </button>
            </div>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* Regional Lock parameters */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Regional DNA-Lock</h4>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {['GLOBAL', 'MEA', 'AMS', 'APJ'].map(reg => {
                const labelMap = { 'GLOBAL': 'Global', 'MEA': 'MEA / Dubai', 'AMS': 'AMS / Americas', 'APJ': 'APJ / Pacific' };
                return (
                  <button
                    key={reg}
                    onClick={() => setRegionLock(reg as any)}
                    className={`px-1 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                      regionLock === reg
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {labelMap[reg as 'GLOBAL' | 'MEA' | 'AMS' | 'APJ']}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* Slices of checkboxes buttons parameters */}
          <div className="flex flex-col gap-3 font-mono text-[10px]">
            {/* TAA filter switch */}
            <div className="flex items-center justify-between">
              <div className="text-left pr-4">
                <span className="text-slate-200 font-bold block">TAA Strict Filtering</span>
                <span className="text-[9px] text-slate-400">Mandatory for high-compliance government missions.</span>
              </div>
              <input
                type="checkbox"
                checked={taaStrict}
                onChange={() => setTaaStrict(!taaStrict)}
                className="rounded border-white/10 bg-slate-950 text-indigo-500 focus:ring-0 w-8 h-4 cursor-pointer"
              />
            </div>

            {/* Sovereign Cloud switch */}
            <div className="flex items-center justify-between">
              <div className="text-left pr-4">
                <span className="text-slate-200 font-bold block">Sovereign Cloud DNA</span>
                <span className="text-[9px] text-slate-400">Enable Dubai/MEA Sovereign region SKU variants.</span>
              </div>
              <input
                type="checkbox"
                checked={sovereignCloud}
                onChange={() => setSovereignCloud(!sovereignCloud)}
                className="rounded border-white/10 bg-slate-950 text-indigo-500 focus:ring-0 w-8 h-4 cursor-pointer"
              />
            </div>

            {/* Mock sandbox switch */}
            <div className="flex items-center justify-between">
              <div className="text-left pr-4">
                <span className="text-slate-200 font-bold block">Mock Sandbox Mode</span>
                <span className="text-[9px] text-slate-400">Simulate vendor portal response streams for offline E2E verification.</span>
              </div>
              <input
                type="checkbox"
                checked={mockSandbox}
                onChange={() => setMockSandbox(!mockSandbox)}
                className="rounded border-white/10 bg-slate-950 text-indigo-500 focus:ring-0 w-8 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Primary Action launchers */}
          <button
            onClick={handleLaunchMission}
            data-testid="run-agentic-mission"
            className="w-full py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs mt-2 cursor-pointer shadow-lg shadow-indigo-500/20 transition-all scale-102 uppercase"
          >
            Launch Mission Control
          </button>
        </div>
      </div>
    </div>
  );
}
