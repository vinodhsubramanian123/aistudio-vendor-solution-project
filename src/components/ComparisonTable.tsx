/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DiffRow, RowStatus, HardwareCategory, CatalogItem } from '../types';
import { Search, RotateCcw, SlidersHorizontal, Check, Clipboard, HelpCircle, ArrowRight, Play, Edit, Trash2, FileText, Trash, ChevronDown, Sparkles, PlusCircle } from 'lucide-react';
import { generateCatalog } from '../data';
import AdvancedSearchFilters from './AdvancedSearchFilters';
import DataEntryForm from './DataEntryForm';

interface ComparisonTableProps {
  rows: DiffRow[];
  setRows: React.Dispatch<React.SetStateAction<DiffRow[]>>;
  filterText: string;
  setFilterText: (text: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onUploadFile: (side: 'left' | 'right') => void;
  activeTab: string;
}

export default function ComparisonTable({
  rows,
  setRows,
  filterText,
  setFilterText,
  selectedCategory,
  setSelectedCategory,
  onUploadFile,
  activeTab
}: ComparisonTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingQtyId, setEditingQtyId] = useState<{ id: string; side: 'boq' | 'bom' } | null>(null);
  const [editingText, setEditingText] = useState('');

  // Enriched advanced panel states
  const [catalogItems] = useState<CatalogItem[]>(generateCatalog());
  const [advancedFilteredRows, setAdvancedFilteredRows] = useState<DiffRow[]>(rows);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true); // default open for high visibility!

  // Compute the robust rows subset that respects the active Tab and user queries
  const visibleRows = React.useMemo(() => {
    if (showAdvancedFilters) {
      return advancedFilteredRows;
    }
    return rows.filter(row => {
      // 1. Config Active Tab Lock
      if (activeTab !== 'GLOBAL' && row.config !== activeTab) {
        return false;
      }
      // 2. Simple Category filter
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'STORAGE') {
          if (row.category !== 'STORAGE_DRIVE' && row.category !== 'NVME_DRIVE') return false;
        } else if (row.category !== selectedCategory) {
          return false;
        }
      }
      return true;
    });
  }, [rows, activeTab, selectedCategory, showAdvancedFilters, advancedFilteredRows]);

  // Sorter / categories available for tab filters
  const categories: { label: string; count: number }[] = [
    { label: 'ALL', count: rows.filter(r => activeTab === 'GLOBAL' || r.config === activeTab).length },
    { label: 'CHASSIS', count: rows.filter(r => (activeTab === 'GLOBAL' || r.config === activeTab) && r.category === 'CHASSIS').length },
    { label: 'PROCESSOR', count: rows.filter(r => (activeTab === 'GLOBAL' || r.config === activeTab) && r.category === 'PROCESSOR').length },
    { label: 'MEMORY', count: rows.filter(r => (activeTab === 'GLOBAL' || r.config === activeTab) && r.category === 'MEMORY').length },
    { label: 'STORAGE', count: rows.filter(r => (activeTab === 'GLOBAL' || r.config === activeTab) && (r.category === 'STORAGE_DRIVE' || r.category === 'NVME_DRIVE')).length }
  ];

  // Filters state helper
  const handleToggleCategory = (catLabel: string) => {
    if (selectedCategory === catLabel) {
      setSelectedCategory('ALL');
    } else {
      setSelectedCategory(catLabel);
    }
  };

  // Clipboard utility
  const handleCopySKU = (sku: string, id: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  // Selection toggles
  const handleToggleRowSelection = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRows(next);
  };

  const handleToggleSelectAll = () => {
    if (selectedRows.size === visibleRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(visibleRows.map(r => r.id)));
    }
  };

  // Manual configuration adding
  const handleAddItem = (newItem: DiffRow) => {
    setRows(prev => [newItem, ...prev]);
  };

  // Editable Quantities on-the-fly
  const handleStartEditQty = (id: string, side: 'boq' | 'bom', currentQty: number) => {
    setEditingQtyId({ id, side });
    setEditingText(String(currentQty));
  };

  const handleSaveEditQty = () => {
    if (!editingQtyId) return;
    const nextQty = parseInt(editingText) || 0;
    setRows(prev =>
      prev.map(r => {
        if (r.id === editingQtyId.id) {
          const boq = editingQtyId.side === 'boq' ? nextQty : r.boqQty;
          const bom = editingQtyId.side === 'bom' ? nextQty : r.bomQty;
          // Re-evaluate status on-the-fly
          let status: RowStatus = r.status;
          if (boq === bom) {
            status = 'MATCHED';
          } else if (boq !== 0 && bom === 0) {
            status = 'MISSING_IN_BOM';
          } else if (boq === 0 && bom !== 0) {
            status = 'EXTRA_IN_BOM';
          } else {
            status = 'QTY_MISMATCH';
          }
          return {
            ...r,
            boqQty: boq,
            bomQty: bom,
            status,
            drift: (bom - boq) * r.price
          };
        }
        return r;
      })
    );
    setEditingQtyId(null);
  };

  const handleIncrementQty = (id: string, side: 'boq' | 'bom') => {
    setRows(prev =>
      prev.map(r => {
        if (r.id === id) {
          const boq = side === 'boq' ? r.boqQty + 1 : r.boqQty;
          const bom = side === 'bom' ? r.bomQty + 1 : r.bomQty;
          let status: RowStatus = r.status;
          if (boq === bom) {
            status = 'MATCHED';
          } else if (boq !== 0 && bom === 0) {
            status = 'MISSING_IN_BOM';
          } else if (boq === 0 && bom !== 0) {
            status = 'EXTRA_IN_BOM';
          } else {
            status = 'QTY_MISMATCH';
          }
          return {
            ...r,
            boqQty: boq,
            bomQty: bom,
            status,
            drift: (bom - boq) * r.price
          };
        }
        return r;
      })
    );
  };

  const handleDecrementQty = (id: string, side: 'boq' | 'bom') => {
    setRows(prev =>
      prev.map(r => {
        if (r.id === id) {
          const boq = side === 'boq' ? Math.max(0, r.boqQty - 1) : r.boqQty;
          const bom = side === 'bom' ? Math.max(0, r.bomQty - 1) : r.bomQty;
          let status: RowStatus = r.status;
          if (boq === bom) {
            status = 'MATCHED';
          } else if (boq !== 0 && bom === 0) {
            status = 'MISSING_IN_BOM';
          } else if (boq === 0 && bom !== 0) {
            status = 'EXTRA_IN_BOM';
          } else {
            status = 'QTY_MISMATCH';
          }
          return {
            ...r,
            boqQty: boq,
            bomQty: bom,
            status,
            drift: (bom - boq) * r.price
          };
        }
        return r;
      })
    );
  };

  const handleDeleteRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // Note: perform search & filters in AdvancedSearchFilters component which updates advancedFilteredRows State reactively!

  // Unique status tags styled precisely
  const getStatusChip = (status: RowStatus) => {
    switch (status) {
      case 'MATCHED':
        return (
          <span
            data-testid="status-chip"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm cursor-help"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ✅ Matched
          </span>
        );
      case 'QTY_MISMATCH':
        return (
          <span
            data-testid="status-chip"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-sm cursor-help"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            ⚠️ Qty Mismatch
          </span>
        );
      case 'SKU_MISMATCH':
        return (
          <span
            data-testid="status-chip"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 shadow-sm cursor-help"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            ❌ SKU Mismatch
          </span>
        );
      case 'SIPHONED':
        return (
          <span
            data-testid="status-chip"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-sm cursor-help"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-550 animate-pulse" />
            🧬 Siphoned
          </span>
        );
      case 'SUBSTITUTED':
        return (
          <span
            data-testid="status-chip"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-sm cursor-help"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            🔄 Substituted
          </span>
        );
      case 'MISSING_IN_BOM':
        return (
          <span
            data-testid="status-chip"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200 shadow-sm cursor-help"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            🛑 Missing in BOM
          </span>
        );
      case 'EXTRA_IN_BOM':
        return (
          <span
            data-testid="status-chip"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 shadow-sm cursor-help"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            ➕ Extra in BOM
          </span>
        );
      default:
        return (
          <span
            data-testid="status-chip"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 cursor-help"
          >
            UNKNOWN
          </span>
        );
    }
  };

  // Rendering token highlights
  const renderDiffHighlight = (bomText: string, boqText: string) => {
    if (!bomText || bomText.startsWith('(')) {
      return <span className="text-slate-400 italic font-mono">{bomText || 'Awaiting Spec...'}</span>;
    }
    const boqWords = new Set(boqText ? boqText.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(/\s+/) : []);
    const bomWords = bomText.split(/\s+/);

    return (
      <div className="text-slate-700 font-medium font-sans">
        {bomWords.map((word, idx) => {
          const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/gi, '');
          const isExtra = cleanWord && !boqWords.has(cleanWord) && word !== 'HPE' && word !== 'Dell';
          if (isExtra) {
            return (
              <span
                key={idx}
                className="bg-emerald-50 text-emerald-850 px-1 py-0.5 rounded font-bold border border-emerald-200 mr-1 inline-block"
              >
                {word}
              </span>
            );
          }
          return <span key={idx} className="mr-1 inline-block text-slate-600">{word}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Ingestion File Targets */}
      {rows.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BOQ Intent Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-350 transition-all flex items-center justify-between group/boq relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover/boq:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-md font-bold text-slate-900 leading-tight">BOQ</h3>
                <p className="text-xs text-slate-500 mb-2">(Customer Intent Baseline)</p>
                <div className="flex gap-2 text-[9px] font-bold text-slate-400 font-mono">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">XLSX</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">PDF</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                    IMAGES
                  </span>
                </div>
              </div>
            </div>
            <button
              data-testid="file-input-left"
              onClick={() => onUploadFile('left')}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Browse BOQ
            </button>
          </div>

          {/* BOM Quote Input Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-350 transition-all flex items-center justify-between group/bom relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover/bom:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-md font-bold text-slate-900 leading-tight">BOM</h3>
                <p className="text-xs text-slate-500 mb-2">(Vendor Quote Reality)</p>
                <div className="flex gap-2 text-[9px] font-bold text-slate-400 font-mono">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">XLSX</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">PDF</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                    IMAGES
                  </span>
                </div>
              </div>
            </div>
            <button
              data-testid="file-input-right"
              onClick={() => onUploadFile('right')}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Browse BOM
            </button>
          </div>
        </div>
      )}

      {/* 2. Search & Manual Entry Control Hub Options */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Perspectives Selector */}
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-205 shadow-inner">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 bg-white border border-slate-200 shadow-xs">
              <span>Intent vs Quote</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              <span>Solution vs Solution</span>
            </button>
          </div>

          <button
            onClick={() => {
              setFilterText('');
              setSelectedCategory('ALL');
            }}
            title="Reset global categories quick filters"
            className="p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Specialty Feature Panel Toggles */}
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showManualForm 
                ? 'bg-indigo-50 border-indigo-350 text-indigo-750 font-bold' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-xs'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-indigo-650 animate-pulse" />
            <span>✍️ Manual Spec Entry</span>
          </button>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showAdvancedFilters 
                ? 'bg-indigo-50 border-indigo-350 text-indigo-750 font-bold' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-xs'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-650" />
            <span>🔍 Advanced Filter Index</span>
          </button>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end font-medium">
          <button
            disabled={rows.length === 0}
            data-testid="run-architecture-audit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none text-white border border-slate-200 cursor-pointer shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 text-emerald-405 font-bold" />
            <span>Run Forensic Audit</span>
          </button>

          <button
            disabled={rows.length === 0}
            onClick={() => {
              const textToCopy = JSON.stringify(advancedFilteredRows, null, 2);
              navigator.clipboard.writeText(textToCopy);
              setCopiedId('LEDGER-COPY');
              setTimeout(() => setCopiedId(null), 1500);
            }}
            title="Export filtered specs ledger"
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-655 hover:text-slate-905 transition-colors cursor-pointer shadow-sm"
          >
            <Clipboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {copiedId === 'LEDGER-COPY' && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-50 border border-emerald-350 text-emerald-900 font-bold px-4 py-2.5 rounded-xl shadow-lg text-xs font-mono uppercase">
          🚀 Filtered specs copied to Clipboard!
        </div>
      )}

      {/* Conditionally expanding panels */}
      {showManualForm && (
        <div className="animate-slide-down">
          <DataEntryForm 
            catalogItems={catalogItems} 
            activeTab={activeTab} 
            onAddItem={handleAddItem} 
          />
        </div>
      )}

      {showAdvancedFilters && (
        <div className="animate-slide-down">
          <AdvancedSearchFilters 
            rows={rows} 
            activeTab={activeTab} 
            onFilterChange={setAdvancedFilteredRows} 
          />
        </div>
      )}

      {/* 3. Category Quick Filters indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mr-1">
            Category:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => {
              const isActive = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  data-testid={`filter-${cat.label}`}
                  onClick={() => handleToggleCategory(cat.label)}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 scale-102 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-800'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary controls checkboxes */}
        <div className="flex items-center gap-2">
          <button className="text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer">
            Hide Ignored
          </button>
          <button
            disabled
            className="text-[11px] font-bold bg-slate-100 text-slate-400 border border-slate-200 px-2.5 py-1 rounded-md"
          >
            Ignored (0)
          </button>
          <button className="text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer">
            Doc Fidelity
          </button>
          <button className="text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer">
            Focus Gaps
          </button>
        </div>
      </div>

      {/* 4. Comparison Table Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative">
        {hoveredRowId && (
          <div
            data-testid="forensic-tooltip"
            className="absolute z-50 bg-white border border-slate-250 text-slate-805 rounded-xl p-4 shadow-xl w-80 pointer-events-none text-xs font-mono flex flex-col gap-2 transition-all bottom-20 left-1/3 animate-fade-in"
          >
            <div className="flex items-center gap-2 text-indigo-600 font-bold border-b border-slate-100 pb-1 uppercase tracking-wider">
              <span>🧠 Forensic Trace Findings</span>
            </div>
            <p className="text-slate-600 leading-tight font-sans">
              {rows.find(r => r.id === hoveredRowId)?.reasoning || 'Diagnostic verification matching rules.'}
            </p>
            <div className="flex flex-col gap-0.5 text-[10px] text-slate-500">
              <span className="font-bold text-slate-400 uppercase tracking-widest block mt-1">Verification Steps:</span>
              {rows.find(r => r.id === hoveredRowId)?.trace?.map((t, i) => (
                <div key={i} className="flex gap-1 items-start font-sans">
                  <span className="text-indigo-600">➔</span>
                  <span>{t}</span>
                </div>
              )) || <div>No tracing records compiled.</div>}
            </div>
          </div>
        )}

        {/* Floating copying modal */}
        {copiedId && (
          <div className="absolute top-4 right-4 z-50 bg-emerald-50 border border-emerald-305 text-emerald-800 font-bold px-4 py-2 rounded-lg animate-bounce text-xs font-mono uppercase">
            Copied! SKU Saved to Clipboard
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[1240px]">
            {/* Headers row */}
            <div className="grid grid-cols-[50px_2.2fr_90px_90px_2.2fr_130px_160px_130px_110px_110px_110px] items-center border-b border-slate-200 bg-slate-50 px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div>
                <input
                  type="checkbox"
                  checked={selectedRows.size === visibleRows.length && visibleRows.length > 0}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>
              <div>BOQ Intent Description</div>
              <div className="text-center">BOQ Qty</div>
              <div className="text-center">BOM Qty</div>
              <div>BOM Description</div>
              <div className="text-center">Status</div>
              <div className="text-center">SKU Identity</div>
              <div className="text-center">Category</div>
              <div className="text-right">Price</div>
              <div className="text-right">Drift Δ</div>
              <div className="text-center">Actions</div>
            </div>

            {/* List Body Rows */}
            <div className="divide-y divide-slate-200 max-h-[500px] overflow-y-auto custom-scrollbar bg-white">
              {visibleRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 gap-3">
                  <HelpCircle className="w-12 h-12 text-slate-450 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-slate-500">No Forensic Records Loaded</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Upload your Excel BOQ/BOM files or seed a demo platform above to begin auditing architectural traces.
                    </p>
                  </div>
                </div>
              ) : (
                visibleRows.map((row, index) => {
                  const isEven = index % 2 === 0;
                  const isSelected = selectedRows.has(row.id);
                  const isQtyEditingBOQ = editingQtyId?.id === row.id && editingQtyId?.side === 'boq';
                  const isQtyEditingBOM = editingQtyId?.id === row.id && editingQtyId?.side === 'bom';

                  return (
                    <div
                      key={row.id}
                      data-testid="bom-row"
                      className={`grid grid-cols-[50px_2.2fr_90px_90px_2.2fr_130px_160px_130px_110px_110px_110px] items-center px-6 py-3.5 transition-all duration-300 group/row row-dense text-[12px] cursor-pointer antialiased transform-gpu border-l-4 border-l-transparent ${
                        isEven ? 'bg-white bg-opacity-65' : 'bg-slate-50/50 bg-opacity-65'
                      } ${isSelected ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                    >
                      {/* 1. Checkbox */}
                      <div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRowSelection(row.id)}
                          className="rounded border-slate-300 bg-white text-indigo-650 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                      </div>

                      {/* 2. BOQ Intent */}
                      <div className="font-semibold text-slate-800 hover:text-indigo-900 transition-colors truncate pr-4">
                        {row.boqDesc}
                      </div>

                      {/* 3. BOQ Qty count click editing */}
                      <div className="text-center font-mono text-slate-700">
                        {isQtyEditingBOQ ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="text"
                              value={editingText}
                              onChange={e => setEditingText(e.target.value)}
                              onBlur={handleSaveEditQty}
                              onKeyDown={e => e.key === 'Enter' && handleSaveEditQty()}
                              autoFocus
                              className="w-10 bg-white border border-indigo-500 rounded text-center text-xs py-0.5 text-slate-900"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleDecrementQty(row.id, 'boq')}
                              className="px-1 text-slate-400 hover:text-slate-800 cursor-pointer text-xs font-bold"
                            >
                              -
                            </button>
                            <span
                              onClick={() => handleStartEditQty(row.id, 'boq', row.boqQty)}
                              className="px-2 py-0.5 font-bold font-mono text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded min-w-[28px] inline-block cursor-text text-center text-[11px]"
                              title="Click to edit raw quantity"
                            >
                              {row.boqQty}
                            </span>
                            <button
                              onClick={() => handleIncrementQty(row.id, 'boq')}
                              className="px-1 text-slate-400 hover:text-slate-800 cursor-pointer text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 4. BOM Qty count click editing */}
                      <div className="text-center font-mono text-slate-700">
                        {isQtyEditingBOM ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="text"
                              value={editingText}
                              onChange={e => setEditingText(e.target.value)}
                              onBlur={handleSaveEditQty}
                              onKeyDown={e => e.key === 'Enter' && handleSaveEditQty()}
                              autoFocus
                              className="w-10 bg-white border border-indigo-500 rounded text-center text-xs py-0.5 text-slate-900"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleDecrementQty(row.id, 'bom')}
                              className="px-1 text-slate-400 hover:text-slate-800 cursor-pointer text-xs font-bold"
                            >
                              -
                            </button>
                            <span
                              onClick={() => handleStartEditQty(row.id, 'bom', row.bomQty)}
                              className="px-2 py-0.5 font-bold font-mono text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100 border border-indigo-100 rounded min-w-[28px] inline-block cursor-text text-center text-[11px]"
                              title="Click to edit raw quantity"
                            >
                              {row.bomQty}
                            </span>
                            <button
                              onClick={() => handleIncrementQty(row.id, 'bom')}
                              className="px-1 text-slate-400 hover:text-slate-800 cursor-pointer text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 5. BOM Description with highlight difference */}
                      <div className="truncate pr-4">
                        {renderDiffHighlight(row.bomDesc, row.boqDesc)}
                      </div>

                      {/* 6. Status Chip */}
                      <div
                        className="text-center flex justify-center"
                        onMouseEnter={() => setHoveredRowId(row.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                      >
                        {getStatusChip(row.status)}
                      </div>

                      {/* 7. SKU Identity Pill with clipboard triggers */}
                      <div className="text-center flex justify-center">
                        <button
                          onClick={() => handleCopySKU(row.part, row.id)}
                          data-testid="sku-identity-pill"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-700 transition-all cursor-clipboard group/pill shadow-2xs"
                        >
                          <Clipboard className="w-3 h-3 text-slate-400 group-hover/pill:text-indigo-600" />
                          <span>{row.part}</span>
                        </button>
                      </div>

                      {/* 8. Category Badge */}
                      <div className="text-center flex justify-center">
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/50 font-bold rounded-lg uppercase tracking-wider text-[10px]">
                          {row.category}
                        </span>
                      </div>

                      {/* 9. MSRP Price */}
                      <div className="text-right font-mono font-bold text-slate-700">
                        ${row.price.toLocaleString()}
                      </div>

                      {/* 10. Drift value counter */}
                      <div
                        className="text-right font-mono"
                      >
                        {row.drift > 0 ? (
                          <span className="inline-block px-1.5 py-0.5 rounded font-bold text-rose-600 bg-rose-50 border border-rose-100">
                            +${row.drift.toLocaleString()}
                          </span>
                        ) : row.drift < 0 ? (
                          <span className="inline-block px-1.5 py-0.5 rounded font-bold text-emerald-600 bg-emerald-50 border border-emerald-100">
                            -${Math.abs(row.drift).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">$0</span>
                        )}
                      </div>

                      {/* 11. Actions list buttons */}
                      <div className="text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          title="Purge row spec"
                          className="p-1 px-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
