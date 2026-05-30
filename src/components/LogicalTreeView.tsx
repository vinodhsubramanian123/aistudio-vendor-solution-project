/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiffRow } from '../types';
import { Cpu, Server, Layers, HelpCircle, HardDrive, Shield, Network, ArrowRight, CornerDownRight, ToggleLeft } from 'lucide-react';

interface LogicalTreeViewProps {
  rows: DiffRow[];
  onSolveGhost: (rowId: string) => void;
}

export default function LogicalTreeView({ rows, onSolveGhost }: LogicalTreeViewProps) {
  const [capabilitiesMode, setCapabilitiesMode] = useState(false);

  // Group items by category to construct a beautiful logical mapping representation
  const platformName = "HPE ProLiant DL385 Gen11 10DW";
  const chassisItem = rows.find(r => r.category === 'CHASSIS');
  const processors = rows.filter(r => r.category === 'PROCESSOR');
  const memory = rows.filter(r => r.category === 'MEMORY');
  const slots = rows.filter(r => r.category === 'RISER' || r.category === 'STORAGE_CTRL');
  const storage = rows.filter(r => r.category === 'STORAGE_DRIVE' || r.category === 'NVME_DRIVE');
  const powers = rows.filter(r => r.category === 'POWER');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden">
      {/* Dynamic Glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-50/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-100/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header controls for Logical Tree view */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-md font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-650" />
            <span>Multi-Axial Topology MindMap</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Relational hardware topology network for <span className="text-indigo-600 font-semibold">{platformName}</span>.
          </p>
        </div>

        {/* Capabilities mode switch */}
        <button
          onClick={() => setCapabilitiesMode(!capabilitiesMode)}
          data-testid="toggle-capabilities-mode"
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
            capabilitiesMode
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <span>Capabilities Mode</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${capabilitiesMode ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {capabilitiesMode ? 'ACTIVE' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Main Structural Map */}
      <div className="flex flex-col gap-8">
        {/* Step 1: Chassis Base node */}
        <div className="flex flex-col items-center justify-center">
          <div className="bg-white border-2 border-indigo-300 p-4 rounded-xl w-full max-w-sm flex items-center justify-between group shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Server className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-mono font-bold text-indigo-655 tracking-widest uppercase">Root Enclosure</span>
                <h3 className="font-bold text-slate-900 text-xs truncate">
                  {chassisItem ? chassisItem.boqDesc : 'HPE ProLiant Enclosure Base'}
                </h3>
                <span className="text-[10px] font-semibold text-slate-500 font-mono">
                  SKU: {chassisItem ? chassisItem.part : 'P50000-B21'} (Qty: {chassisItem ? chassisItem.bomQty : 1})
                </span>
              </div>
            </div>
            
            {capabilitiesMode && (
              <span className="text-[9px] bg-slate-50 border border-slate-200 text-slate-850 font-bold px-1.5 py-0.5 rounded font-mono">
                TAA • Gen11
              </span>
            )}
          </div>
          
          <div className="w-0.5 h-6 bg-slate-250" />
        </div>

        {/* Group child modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector Line behind cards */}
          <div className="hidden lg:block absolute left-10 right-10 top-0 h-0.5 bg-slate-200 -translate-y-8 z-0" />

          {/* Module 1: Processor segment */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-0.5 h-4 bg-slate-200 hidden lg:block -translate-y-4" />
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">Processors</h4>
            <div className="flex flex-col gap-3 w-full">
              {processors.map((row) => (
                <div key={row.id} className="bg-white border border-slate-200 p-3.5 rounded-xl text-left flex flex-col gap-2 hover:border-indigo-400/50 transition-colors shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <Cpu className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{row.part}</div>
                        <div className="text-[10px] text-slate-500 leading-tight truncate w-36">{row.boqDesc}</div>
                      </div>
                    </div>
                  </div>
                  {capabilitiesMode && (
                    <div className="flex flex-wrap gap-1 mt-1 text-[9px] font-mono font-bold">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-250 px-1 py-0.5 rounded uppercase">CORES: 192</span>
                      <span className="bg-slate-50 text-slate-600 border border-slate-200 px-1 py-0.5 rounded uppercase font-normal">360W TDP</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Module 2: Memory segment */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-0.5 h-4 bg-slate-200 hidden lg:block -translate-y-4" />
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">Memory RDIMMs</h4>
            <div className="flex flex-col gap-3 w-full">
              {memory.map((row) => {
                const isMismatch = row.status === 'QTY_MISMATCH';
                return (
                  <div
                    key={row.id}
                    className={`bg-white border p-3.5 rounded-xl text-left flex flex-col gap-2 hover:border-indigo-400/50 transition-colors shadow-sm ${
                      isMismatch ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <Layers className={`w-4 h-4 mt-0.5 ${isMismatch ? 'text-amber-600' : 'text-indigo-600'}`} />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{row.part}</div>
                          <div className="text-[10px] text-slate-500 leading-tight font-mono">BOM Qty: <span className="font-bold text-slate-800">{row.bomQty}</span> vs {row.boqQty}</div>
                        </div>
                      </div>
                    </div>
                    {capabilitiesMode && (
                      <div className="flex flex-wrap gap-1 mt-1 text-[9px] font-mono font-bold">
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1 py-0.5 rounded uppercase">DDR5</span>
                        <span className="bg-slate-50 text-slate-600 border border-slate-250 px-1 py-0.5 rounded uppercase font-normal">1.5TB Cap</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module 3: Slots & Risers (Including Ghost click fix) */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-0.5 h-4 bg-slate-200 hidden lg:block -translate-y-4" />
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">PCIE Riser Slots</h4>
            <div className="flex flex-col gap-3 w-full">
              {slots.map((row) => (
                <div key={row.id} className="bg-white border border-slate-200 p-3.5 rounded-xl text-left flex flex-col gap-2 hover:border-indigo-400/50 transition-colors shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <Network className="w-4 h-4 text-indigo-600 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{row.part}</div>
                        <div className="text-[10px] text-slate-500 leading-tight truncate w-36">{row.boqDesc}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Ensure a simulated placeholder Ghost node is always present representing the missing PCIe riser */}
              {rows.find(it => it.part === 'GHOST-RISER-CARD') ? (
                <div
                  onClick={() => onSolveGhost('D-GH-01')}
                  className="ghost-component-node border-2 border-dashed border-red-350 bg-red-50/50 hover:bg-red-50 p-3.5 rounded-xl text-left flex flex-col gap-2 cursor-pointer transition-all transform hover:scale-102 hover:border-red-500 animate-pulse relative group/ghost shadow-sm"
                  title="Critical Warning: Click to trigger Holographic Resolution and co-inject component specs!"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <Shield className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-red-700">🚨 GHOST COMPONENT</div>
                        <div className="text-[9px] text-slate-505 tracking-wider font-mono">SKU: GHOST-RISER-CARD</div>
                        <div className="text-[10px] text-red-655 font-bold leading-tight mt-1">Missing from vendor Quote. Click to heal.</div>
                      </div>
                    </div>
                  </div>
                  {capabilitiesMode && (
                    <div className="flex flex-wrap gap-1 mt-1 text-[9px] font-mono font-bold">
                      <span className="bg-red-100 text-red-700 border border-red-200 px-1 py-0.5 rounded uppercase">GEN5 SLOT</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-emerald-250 bg-emerald-50 p-3.5 rounded-xl text-center text-[10px] font-mono text-emerald-700 font-bold">
                  🎉 GHOST RISER RESOLVED
                </div>
              )}
            </div>
          </div>

          {/* Module 4: Auxiliary Space power / storage */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-0.5 h-4 bg-slate-200 hidden lg:block -translate-y-4" />
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">Storage / Power Nodes</h4>
            <div className="flex flex-col gap-3 w-full">
              {/* Powers or Storage list */}
              {storage.slice(0, 1).map((row) => (
                <div key={row.id} className="bg-white border border-slate-200 p-3.5 rounded-xl text-left flex flex-col gap-2 hover:border-indigo-400/50 transition-colors shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <HardDrive className="w-4 h-4 text-indigo-650 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{row.part}</div>
                        <div className="text-[10px] text-slate-505 leading-tight truncate w-36">{row.boqDesc}</div>
                      </div>
                    </div>
                  </div>
                  {capabilitiesMode && (
                    <div className="flex flex-wrap gap-1 mt-1 text-[9px] font-mono font-bold">
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1 py-0.5 rounded uppercase">NVME</span>
                    </div>
                  )}
                </div>
              ))}

              {powers.map((row) => (
                <div key={row.id} className="bg-white border border-purple-200 p-3.5 rounded-xl text-left flex flex-col gap-2 hover:border-purple-400/50 transition-colors shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <Layers className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-purple-800">{row.part}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">BOM Qty: {row.bomQty}</div>
                      </div>
                    </div>
                  </div>
                  {capabilitiesMode && (
                    <div className="flex flex-wrap gap-1 mt-1 text-[9px] font-mono font-bold">
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1 py-0.5 rounded uppercase">800W PSU</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
