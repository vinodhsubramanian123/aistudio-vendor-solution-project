/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiffRow } from '../types';
import { Server, Zap, Cpu, Thermometer, Radio, ShieldAlert } from 'lucide-react';

interface ChassisVisualizerProps {
  rows: DiffRow[];
}

export default function ChassisVisualizer({ rows }: ChassisVisualizerProps) {
  // Sizing properties calculations
  const cpuCount = rows.find(r => r.category === 'PROCESSOR')?.bomQty || 2;
  const memoryModulesCount = rows.find(r => r.category === 'MEMORY')?.bomQty || 24;
  const psuWattage = rows.find(r => r.category === 'POWER')?.part === '800W-PSU' ? 800 : 1600;

  // DIMM Population Balance Checker
  const dimmsPerCpu = memoryModulesCount / cpuCount;
  const isOptimalDimm = dimmsPerCpu === 8 || dimmsPerCpu === 12;

  // Power rules check
  const requiresC19 = psuWattage > 1600;
  const hasC19Cord = rows.some(r => r.part.includes('C19') || r.part.includes('P78384'));
  const cordAlertTriggered = psuWattage > 1600 && !hasC19Cord;

  // Settle simulation state
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden">
      <div>
        <h2 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Server className="w-4 h-4 text-indigo-600" />
          <span>🔌 3D Physical Chassis & Slot Occupancy</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Visual server layout representing logical slots, memory channels, and electrical connections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sizing panel 1: Chassis Layout visualizer */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none text-left">
            Base Rack Enclosure
          </span>
          <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
            {/* Server Front Enclosure Panel */}
            <div className="border border-slate-200 bg-white rounded-lg p-2.5 flex flex-col gap-2 relative shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-700 border-b border-slate-100 pb-1">
                <span>HPE ProLiant Front Bay Slots Config</span>
                <span className="animate-pulse text-emerald-600">● SOLID_STATE</span>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 24 }).map((_, index) => {
                  const bayId = `BAY_${index + 1}`;
                  const isPopulated = index < 12;
                  return (
                    <div
                      key={bayId}
                      onClick={() => setActiveSlot(bayId)}
                      className={`h-8 border rounded flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isPopulated
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-100 text-slate-400 hover:border-slate-350 hover:text-slate-800'
                      }`}
                    >
                      <span className="text-[9px] font-mono font-bold">{index + 1}</span>
                      <span className="text-[7px] uppercase font-bold tracking-tighter">
                        {isPopulated ? 'SFF' : 'EMPTY'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sockets motherboard internally */}
            <div className="border border-slate-200 bg-white rounded-lg p-3 flex flex-col sm:flex-row gap-4 shadow-sm">
              {/* CPU Sockets */}
              <div className="flex-1 border border-slate-100 p-3 rounded-lg flex flex-col gap-2 bg-slate-50">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Dual Motherboard Sockets</span>
                <div className="flex justify-around gap-2 mt-1">
                  {Array.from({ length: 2 }).map((_, cpuIdx) => (
                    <div key={cpuIdx} className="border-2 border-indigo-150 p-3 bg-indigo-50/40 rounded-xl flex flex-col items-center justify-center gap-1 w-24">
                      <Cpu className="w-5 h-5 text-indigo-600 animate-pulse" />
                      <span className="text-[9px] font-mono font-bold text-slate-800">CPU_{cpuIdx + 1}</span>
                      <span className="text-[8px] font-mono text-slate-500 font-bold">AMD SP5 Socket</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Memory mapping slots */}
              <div className="flex-1 border border-slate-100 p-3 rounded-lg flex flex-col gap-1.5 bg-slate-50">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">DDR5 Channel Population</span>
                <div className="grid grid-cols-12 gap-0.5 mt-1 h-12 items-end">
                  {Array.from({ length: 24 }).map((_, dIdx) => {
                    const isOccupied = dIdx < memoryModulesCount;
                    return (
                      <div
                        key={dIdx}
                        className={`w-1.5 rounded-t transition-all ${
                          isOccupied
                            ? isOptimalDimm
                              ? 'bg-indigo-600 h-10'
                              : 'bg-amber-500 h-8 shadow-sm'
                            : 'bg-slate-200 h-4'
                        }`}
                        title={`DIMM Channel Slot ${dIdx + 1}`}
                      />
                    );
                  })}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between font-mono font-bold">
                  <span>DIMM Total: {memoryModulesCount} Slots</span>
                  <span className={isOptimalDimm ? "text-emerald-700" : "text-amber-700"}>
                    {isOptimalDimm ? 'Balanced' : 'Population error (use multiples of 8/12)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Space Sizing Panel 2: Sizing rules and safety alerts */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest leading-none text-left">
            Infrastructure Metrics
          </span>
          <div className="flex flex-col gap-4">
            {/* Electrical Power limits card */}
            <div className="border border-slate-200 bg-white p-4 rounded-xl flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Regulatory Electrical Limits</span>
                </span>
                <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  {psuWattage}W Base
                </span>
              </div>
              
              <div className="flex flex-col gap-2 font-mono text-[10px] leading-tight text-left text-slate-500">
                <div className="flex justify-between">
                  <span>Motherboard combined raw load:</span>
                  <span className="text-slate-800 font-semibold">720W</span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum PSU safety threshold:</span>
                  <span className="text-slate-800 font-semibold">1100W</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1 font-bold">
                  <span>Active Ingress Status:</span>
                  <span className="text-rose-600 uppercase">Under-Provisioned</span>
                </div>
              </div>

              {/* Power supply Outlet warning banner */}
              {cordAlertTriggered && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 flex gap-2 font-mono text-[10px]">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                  <div className="text-left">
                    <span className="font-bold uppercase block">Electrical Core Error:</span>
                    High-wattage redundant PSUs require heavy duty C19 electrical outlet leads style pairing.
                  </div>
                </div>
              )}
            </div>

            {/* Thermal Load card */}
            <div className="border border-slate-200 bg-white p-4 rounded-xl flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-rose-500" />
                  <span>Thermal Envelope Sizing</span>
                </span>
              </div>

              <div className="flex flex-col gap-2 font-mono text-[10px] leading-tight text-left text-slate-500">
                <div className="flex justify-between">
                  <span>CPU Max Heat TDP Combined:</span>
                  <span className="text-rose-600 font-semibold">720 Watts Peak</span>
                </div>
                <div className="flex justify-between">
                  <span>Cooling Requirement Level:</span>
                  <span className="text-indigo-700 font-semibold">Level S5 Super-Fluidic</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1 font-bold">
                  <span>Cooling Solution Status:</span>
                  <span className="text-amber-700 uppercase">Thermal warning: fan upgrade required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
