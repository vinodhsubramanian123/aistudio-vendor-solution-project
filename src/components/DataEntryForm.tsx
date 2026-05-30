/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CatalogItem, HardwareCategory, DiffRow, RowStatus } from '../types';
import { 
  Plus, Check, AlertCircle, Sparkles, Sliders, Info, Shield, 
  HelpCircle, RefreshCw, Layout, Layers, Heart, FileCode, CheckSquare
} from 'lucide-react';

interface DataEntryFormProps {
  catalogItems: CatalogItem[];
  activeTab: string;
  onAddItem: (newItem: DiffRow) => void;
}

export default function DataEntryForm({ catalogItems, activeTab, onAddItem }: DataEntryFormProps) {
  // 1. Core Form States
  const [part, setPart] = useState('');
  const [boqQty, setBoqQty] = useState<number>(1);
  const [bomQty, setBomQty] = useState<number>(1);
  const [boqDesc, setBoqDesc] = useState('');
  const [bomDesc, setBomDesc] = useState('');
  const [category, setCategory] = useState<HardwareCategory>('MEMORY');
  const [price, setPrice] = useState<number>(0);
  const [config, setConfig] = useState(activeTab);

  // 2. Conditional Fields States
  const [hasC19Validation, setHasC19Validation] = useState(false);
  const [isPowerRedundant, setIsPowerRedundant] = useState(true);
  const [supportTier, setSupportTier] = useState<'STANDARD' | 'PREMIUM' | 'CRITICAL'>('PREMIUM');
  const [supportDuration, setSupportDuration] = useState<number>(36);
  const [rackFormFactor, setRackFormFactor] = useState<'1U' | '2U' | '4U'>('2U');

  // 3. UI Flow Control
  const [showAutoSuggest, setShowAutoSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState<CatalogItem[]>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [committedFlash, setCommittedFlash] = useState(false);

  // Refs for tracking changes and auto-save timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Sync active configuration UCID
  useEffect(() => {
    setConfig(activeTab);
  }, [activeTab]);

  // Click outside auto-suggest handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowAutoSuggest(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 4. Auto-suggest lookup when typing SKU part number
  useEffect(() => {
    if (part.trim().length >= 2) {
      const q = part.toLowerCase();
      const matches = catalogItems.filter(item => 
        item.SKU.toLowerCase().includes(q) || 
        item.Description.toLowerCase().includes(q)
      ).slice(0, 5);
      setSuggestions(matches);
      setShowAutoSuggest(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowAutoSuggest(false);
    }
  }, [part, catalogItems]);

  // 5. Reactive validation checks
  const validations = {
    part: part.trim().length >= 3,
    boqQty: boqQty >= 0 && Number.isInteger(boqQty),
    bomQty: bomQty >= 0 && Number.isInteger(bomQty),
    boqDesc: boqDesc.trim().length >= 4,
    bomDesc: bomDesc.trim().length >= 4,
    price: price >= 0,
    // Category specific rules
    powerParity: category === 'POWER' || category === 'PSU_PLATINUM' ? (isPowerRedundant ? bomQty % 2 === 0 : true) : true,
    chassisCheck: category === 'CHASSIS' ? boqQty > 0 : true,
  };

  const isFormValid = Object.values(validations).every(v => v === true);

  // 6. Auto-Save Action Trigger (debounced)
  const triggerAutoSave = () => {
    setIsAutoSaving(true);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      setIsAutoSaving(false);
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setLastSavedTime(timeStr);
      // Persist draft to standard local storage so it serves as continuous cache
      const draft = {
        part, boqQty, bomQty, boqDesc, bomDesc, category, price, config,
        hasC19Validation, isPowerRedundant, supportTier, supportDuration, rackFormFactor
      };
      localStorage.setItem('aether_boq_form_draft', JSON.stringify(draft));
    }, 1000);
  };

  // Trigger auto-save whenever any input values change
  useEffect(() => {
    if (part || boqDesc || bomDesc || price > 0 || boqQty > 1 || bomQty > 1) {
      triggerAutoSave();
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [
    part, boqQty, bomQty, boqDesc, bomDesc, category, price, config,
    hasC19Validation, isPowerRedundant, supportTier, supportDuration, rackFormFactor
  ]);

  // Retrieve saved draft if present on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aether_boq_form_draft');
      if (saved) {
        const draft = JSON.parse(saved);
        setPart(draft.part || '');
        setBoqQty(draft.boqQty ?? 1);
        setBomQty(draft.bomQty ?? 1);
        setBoqDesc(draft.boqDesc || '');
        setBomDesc(draft.bomDesc || '');
        setCategory(draft.category || 'MEMORY');
        setPrice(draft.price ?? 0);
        setHasC19Validation(draft.hasC19Validation ?? false);
        setIsPowerRedundant(draft.isPowerRedundant ?? true);
        setSupportTier(draft.supportTier || 'PREMIUM');
        setSupportDuration(draft.supportDuration ?? 36);
        setRackFormFactor(draft.rackFormFactor || '2U');
      }
    } catch (e) {
      console.warn('Could not read saved spec draft', e);
    }
  }, []);

  // Suggestions Selection Auto-fill Handler
  const handleSelectSuggestion = (item: CatalogItem) => {
    setPart(item.SKU);
    setBoqDesc(item.Description);
    setBomDesc(item.Description);
    setCategory(item.Category);
    setPrice(item.MSRP);
    
    // Auto conditional sets
    if (item.Category === 'PSU_PLATINUM' || item.Category === 'POWER') {
      setHasC19Validation(item.MSRP > 400); // 1605W needs C19 Cords
    }
    
    setShowAutoSuggest(false);
  };

  // 7. Push fully audited, saved item to the comparative table
  const handleCommitItem = () => {
    if (!isFormValid) return;

    // Determine comparative status
    let status: RowStatus = 'MATCHED';
    if (boqQty !== bomQty) {
      if (boqQty > 0 && bomQty === 0) {
        status = 'MISSING_IN_BOM';
      } else if (boqQty === 0 && bomQty > 0) {
        status = 'EXTRA_IN_BOM';
      } else {
        status = 'QTY_MISMATCH';
      }
    }

    const nextRow: DiffRow = {
      id: `CST-${Date.now()}`,
      part: part.trim().toUpperCase(),
      partKey: part.trim().replace(/[^A-Z0-9]/gi, '').toUpperCase(),
      boqQty,
      bomQty,
      boqDesc: boqDesc.trim(),
      bomDesc: bomDesc.trim(),
      category,
      config,
      status,
      price,
      drift: (bomQty - boqQty) * price,
      reasoning: `Form entry configured manually with attributes: ${
        category === 'POWER' ? `C19_VAL=${hasC19Validation}, REDUNDANCY_LEVEL=${isPowerRedundant ? 'DUAL' : 'SINGLE'}` : 
        category === 'SUPPORT_SERVICE' ? `TIER=${supportTier}, MONTHS=${supportDuration}` :
        category === 'CHASSIS' ? `RACK_U_LIMIT=${rackFormFactor}` : 'STANDARD_PART'
      }. Verified inline validation parity.`,
      trace: [
        'Form: Ingested options manually.',
        'Validation: Checked socket/cable constraints.',
        `Commit: Injected into UCID ${config}.`
      ],
      capabilities: [
        category,
        `Price: $${price}`,
        ...(category === 'POWER' && hasC19Validation ? ['C19 Needed'] : [])
      ]
    };

    onAddItem(nextRow);

    // Flash success styling
    setCommittedFlash(true);
    setTimeout(() => setCommittedFlash(false), 2000);

    // Clear draft and reset
    localStorage.removeItem('aether_boq_form_draft');
    setPart('');
    setBoqQty(1);
    setBomQty(1);
    setBoqDesc('');
    setBomDesc('');
    setPrice(0);
  };

  return (
    <div 
      ref={formRef}
      className={`bg-white border rounded-2xl p-6 transition-all duration-300 ${
        committedFlash ? 'ring-4 ring-emerald-500/10 border-emerald-500 shadow-md' : 'border-slate-200 shadow-sm'
      }`}
    >
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-50 text-indigo-650 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              High-Fidelity Manual Entry Form
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure target hardware specifications, apply inline validation rules, and co-inject entries.
          </p>
        </div>

        {/* Live Auto-Save Indicator */}
        <div className="flex items-center gap-3 self-start sm:self-auto text-xs">
          <div className="flex items-center gap-1.5 font-semibold font-mono">
            {isAutoSaving ? (
              <span className="inline-flex items-center gap-1.5 text-indigo-600">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Syncing Draft...</span>
              </span>
            ) : lastSavedTime ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Check className="w-3.5 h-3.5" />
                <span>Auto-saved ({lastSavedTime})</span>
              </span>
            ) : (
              <span className="text-slate-400">Spec Cache Clean</span>
            )}
          </div>
          
          <div className="h-4 w-px bg-slate-200" />

          {/* Form Readiness Dot */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isFormValid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
              {isFormValid ? 'Audit Ready' : 'Incomplete'}
            </span>
          </div>
        </div>
      </div>

      {/* Inputs Layout Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        {/* Row 1, Col 1: Part SKU Name + Auto suggests */}
        <div className="flex flex-col gap-1 relative">
          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <span>Canonical Part SKU</span>
            {!validations.part && <span className="text-rose-500">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. P50000-B21"
              value={part}
              onChange={e => setPart(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono tracking-wider"
            />
            {/* suggestions list */}
            {showAutoSuggest && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-250 rounded-xl shadow-xl divide-y divide-slate-100 overflow-hidden max-h-56 overflow-y-auto">
                <div className="bg-slate-50 px-3 py-1 font-semibold text-[9px] font-mono text-slate-450 uppercase tracking-widest">
                  Auto-suggest matches
                </div>
                {suggestions.map(item => (
                  <button
                    key={item.SKU}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex flex-col gap-0.5 focus:outline-none transition-colors"
                  >
                    <div className="font-bold text-xs text-indigo-705 font-mono">{item.SKU}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.Description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-600 font-mono">
                        {item.Category}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500">${item.MSRP.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {!validations.part && part.trim().length > 0 && (
            <p className="text-[10px] text-rose-550 flex items-center gap-1 leading-none mt-0.5">
              <AlertCircle className="w-2.5 h-2.5" />
              Min 3 characters required.
            </p>
          )}
        </div>

        {/* Row 1, Col 2: Category Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Category Bucket</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as HardwareCategory)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-semibold"
          >
            <option value="MEMORY">MEMORY (RDIMMs)</option>
            <option value="PROCESSOR">PROCESSOR (CPUs)</option>
            <option value="CHASSIS">CHASSIS (Enclosures)</option>
            <option value="POWER">POWER (PSUs/Cables)</option>
            <option value="RISER">RISER (PCIe Expansion)</option>
            <option value="STORAGE_DRIVE">STORAGE_DRIVE</option>
            <option value="NVME_DRIVE">NVME_DRIVE (SSDs)</option>
            <option value="STORAGE_CTRL">STORAGE_CTRL</option>
            <option value="SUPPORT_SERVICE">SUPPORT_SERVICE</option>
            <option value="NETWORKING">NETWORKING</option>
            <option value="GPU_NODE">GPU_NODE</option>
          </select>
        </div>

        {/* Row 1, Col 3: BOQ Quantity Entry */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
            <span>BOQ Quantity</span>
            <span className="text-slate-400">Intent</span>
          </label>
          <input
            type="number"
            min="0"
            value={boqQty}
            onChange={e => setBoqQty(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold"
          />
          {!validations.boqQty && (
            <p className="text-[10px] text-rose-550 flex items-center gap-1 leading-none mt-0.5">
              <AlertCircle className="w-2.5 h-2.5" /> Must be non-negative integer.
            </p>
          )}
        </div>

        {/* Row 1, Col 4: BOM Quantity Entry */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
            <span>BOM Quantity</span>
            <span className="text-slate-400">Quote</span>
          </label>
          <input
            type="number"
            min="0"
            value={bomQty}
            onChange={e => setBomQty(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold"
          />
          {!validations.bomQty && (
            <p className="text-[10px] text-rose-550 flex items-center gap-1 leading-none mt-0.5">
              <AlertCircle className="w-2.5 h-2.5" /> Must be non-negative integer.
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Descriptions & Price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-left">
        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex justify-between">
            <span>BOQ Specification Description</span>
            {!validations.boqDesc && <span className="text-rose-500">*</span>}
          </label>
          <input
            type="text"
            placeholder="e.g. 64GB DDR5 Registered Smart Memory"
            value={boqDesc}
            onChange={e => setBoqDesc(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {!validations.boqDesc && boqDesc.trim().length > 0 && (
            <p className="text-[10px] text-rose-550 mt-0.5 leading-none">Min 4 characters needed.</p>
          )}
        </div>

        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex justify-between">
            <span>BOM Specification Description</span>
            {!validations.bomDesc && <span className="text-rose-500">*</span>}
          </label>
          <input
            type="text"
            placeholder="e.g. HPE 64GB DDR5 Registered Memory Kit"
            value={bomDesc}
            onChange={e => setBomDesc(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {!validations.bomDesc && bomDesc.trim().length > 0 && (
            <p className="text-[10px] text-rose-550 mt-0.5 leading-none">Min 4 characters needed.</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Unit Price / MSRP ($)</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={e => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-semibold"
          />
          {!validations.price && (
            <p className="text-[10px] text-rose-550 mt-0.5 leading-none">Price must be positive.</p>
          )}
        </div>
      </div>

      {/* 8. Conditional Logic Fields Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-5 text-left transition-all">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 border-b border-slate-100 pb-1.5 mb-2">
          <Sliders className="w-3.5 h-3.5 text-indigo-650" />
          <span>Category Specific Intelligence Checkpoints</span>
        </h4>

        {category === 'POWER' || category === 'PSU_PLATINUM' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="c19-val-chk"
                checked={hasC19Validation}
                onChange={e => setHasC19Validation(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-0 mt-1 cursor-pointer"
              />
              <div className="text-left leading-tight">
                <label htmlFor="c19-val-chk" className="text-xs font-semibold text-slate-800 cursor-pointer block">
                  Enforce Heavy-Duty C19 Power Cord check?
                </label>
                <span className="text-[10px] text-slate-500 block">
                  C19 connectors are strictly verified for Titanium PSUs over 1200W.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="redundant-pwr-chk"
                checked={isPowerRedundant}
                onChange={e => setIsPowerRedundant(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-0 mt-1 cursor-pointer"
              />
              <div className="text-left leading-tight">
                <label htmlFor="redundant-pwr-chk" className="text-xs font-semibold text-slate-800 cursor-pointer block">
                  Power Redundancy (Dual Controller Multiplier)?
                </label>
                <span className="text-[10px] text-slate-500 block">
                  Locks quantity checks to even configurations to secure power parity.
                </span>
              </div>
            </div>

            {!validations.powerParity && (
              <div className="sm:col-span-2 bg-amber-50 border border-amber-250 p-2.5 rounded-lg flex gap-2 text-amber-800 text-[11px] leading-tight mt-1 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Configuration Warning:</strong> Active redundant power policies require an even number (2, 4...) of PSUs. Currently configured: <strong>{bomQty}</strong>. If saved, this will trigger an active socket check warning.
                </span>
              </div>
            )}
          </div>
        ) : category === 'SUPPORT_SERVICE' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Support Severity SLA Level</label>
              <select
                value={supportTier}
                onChange={e => setSupportTier(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="STANDARD">Standard Care (9x5 NBD)</option>
                <option value="PREMIUM">Premium Care (24x7 4Hr response)</option>
                <option value="CRITICAL">Critical Co-care (Holographic resolution)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Contract Coverage Duration</label>
              <select
                value={supportDuration}
                onChange={e => setSupportDuration(parseInt(e.target.value) || 36)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="12">12 Months (1 Year Baseline)</option>
                <option value="36">36 Months (3 Years Optimal)</option>
                <option value="60">60 Months (5 Years Long-term)</option>
              </select>
            </div>
          </div>
        ) : category === 'CHASSIS' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Rack Unit Height Profile</label>
              <div className="flex gap-2">
                {(['1U', '2U', '4U'] as const).map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setRackFormFactor(u)}
                    className={`flex-1 px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                      rackFormFactor === u
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-705'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {u} Factor
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-[11px] leading-tight pl-2">
              <Info className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>
                Selection binds physical thermal bounds. <strong>{rackFormFactor} height</strong> enforces a maximum threshold wattage of <strong>{rackFormFactor === '1U' ? '600W' : rackFormFactor === '2U' ? '1205W' : '2200W'}</strong> across aggregated accessory components.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
            <Info className="w-4 h-4 text-indigo-650" />
            <span>
              Standard lineage specification. Select a specialty category (Power, Chassis, Support) above to load automated physical validation checkpoints.
            </span>
          </div>
        )}
      </div>

      {/* Form Action Controls */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setPart('');
            setBoqQty(1);
            setBomQty(1);
            setBoqDesc('');
            setBomDesc('');
            setPrice(0);
            localStorage.removeItem('aether_boq_form_draft');
          }}
          className="px-4 py-2 border border-slate-200 text-slate-655 hover:text-slate-800 hover:bg-slate-50 text-xs font-bold rounded-lg cursor-pointer transition-colors"
        >
          Reset Form Specs
        </button>

        <button
          onClick={handleCommitItem}
          disabled={!isFormValid}
          className={`flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-lg cursor-pointer shadow-sm transition-all ${
            isFormValid 
              ? 'bg-slate-900 hover:bg-slate-800 text-white hover:scale-101' 
              : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Commit to Comparative Grid</span>
        </button>
      </div>
    </div>
  );
}
