/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HardwareCategory, RowStatus, DiffRow } from '../types';
import { 
  Search, SlidersHorizontal, BookMarked, Save, Trash2, X, Check,
  ChevronDown, HelpCircle, FileText, BarChart2, ShieldAlert
} from 'lucide-react';

interface AdvancedFilterConfig {
  name: string;
  query: string;
  selectedCategories: HardwareCategory[];
  selectedStatuses: RowStatus[];
  driftType: 'ALL' | 'DRIFT_ONLY' | 'NEUTRAL_ONLY' | 'POSITIVE_ONLY' | 'NEGATIVE_ONLY';
  minPrice: string;
  maxPrice: string;
}

interface AdvancedSearchFiltersProps {
  rows: DiffRow[];
  onFilterChange: (filteredRows: DiffRow[]) => void;
  activeTab: string;
}

export default function AdvancedSearchFilters({
  rows,
  onFilterChange,
  activeTab
}: AdvancedSearchFiltersProps) {
  // 1. Primary Filter States
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<HardwareCategory[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<RowStatus[]>([]);
  const [driftType, setDriftType] = useState<'ALL' | 'DRIFT_ONLY' | 'NEUTRAL_ONLY' | 'POSITIVE_ONLY' | 'NEGATIVE_ONLY'>('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // 2. Saved Configurations States
  const [savedConfigs, setSavedConfigs] = useState<AdvancedFilterConfig[]>([]);
  const [newConfigName, setNewConfigName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeConfigName, setActiveConfigName] = useState<string | null>(null);

  // Available Categories in Dataset
  const categoriesList: HardwareCategory[] = [
    'CHASSIS', 'PROCESSOR', 'MEMORY', 'STORAGE_DRIVE', 'NVME_DRIVE', 
    'RISER', 'POWER', 'SUPPORT_SERVICE', 'STORAGE_CTRL', 'UNKNOWN'
  ];

  // Available Status types
  const statusesList: RowStatus[] = [
    'MATCHED', 'QTY_MISMATCH', 'SKU_MISMATCH', 'SIPHONED', 
    'SUBSTITUTED', 'MISSING_IN_BOM', 'EXTRA_IN_BOM', 'REJECTED'
  ];

  // Hydrate configurations list along with defaults on-the-fly
  useEffect(() => {
    const defaultConfigs: AdvancedFilterConfig[] = [
      {
        name: '⚠️ All Gaps & Mismatches',
        query: '',
        selectedCategories: [],
        selectedStatuses: ['QTY_MISMATCH', 'SKU_MISMATCH', 'MISSING_IN_BOM', 'EXTRA_IN_BOM', 'REJECTED'],
        driftType: 'ALL',
        minPrice: '',
        maxPrice: ''
      },
      {
        name: '✅ Matched Hardware Base',
        query: '',
        selectedCategories: [],
        selectedStatuses: ['MATCHED'],
        driftType: 'NEUTRAL_ONLY',
        minPrice: '',
        maxPrice: ''
      },
      {
        name: '💎 Premium Line items (>$1000)',
        query: '',
        selectedCategories: [],
        selectedStatuses: [],
        driftType: 'ALL',
        minPrice: '1000',
        maxPrice: ''
      }
    ];

    try {
      const stored = localStorage.getItem('aether_saved_filters_v2');
      if (stored) {
        setSavedConfigs(JSON.parse(stored));
      } else {
        setSavedConfigs(defaultConfigs);
        localStorage.setItem('aether_saved_filters_v2', JSON.stringify(defaultConfigs));
      }
    } catch (e) {
      setSavedConfigs(defaultConfigs);
    }
  }, []);

  // 3. Main Live Filtering Evaluation Loop
  useEffect(() => {
    const lowerQuery = query.toLowerCase().trim();
    
    const results = rows.filter(row => {
      // Config Active Tab Lock
      if (activeTab !== 'GLOBAL' && activeTab !== 'CONSOLIDATED' && row.config !== activeTab) {
        return false;
      }

      // Query String match (Part SKU, descriptions, categories)
      if (lowerQuery !== '') {
        const itemSku = row.part.toLowerCase();
        const boqD = row.boqDesc.toLowerCase();
        const bomD = row.bomDesc.toLowerCase();
        const matchedQuery = itemSku.includes(lowerQuery) || boqD.includes(lowerQuery) || bomD.includes(lowerQuery);
        if (!matchedQuery) return false;
      }

      // Multi-select Categories check
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(row.category)) {
          return false;
        }
      }

      // Multi-select status check
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(row.status)) {
          return false;
        }
      }

      // Live Drift constraint check
      if (driftType === 'DRIFT_ONLY' && row.drift === 0) return false;
      if (driftType === 'NEUTRAL_ONLY' && row.drift !== 0) return false;
      if (driftType === 'POSITIVE_ONLY' && row.drift <= 0) return false;
      if (driftType === 'NEGATIVE_ONLY' && row.drift >= 0) return false;

      // Price constraints
      if (minPrice !== '') {
        const minVal = parseFloat(minPrice);
        if (!isNaN(minVal) && row.price < minVal) return false;
      }
      if (maxPrice !== '') {
        const maxVal = parseFloat(maxPrice);
        if (!isNaN(maxVal) && row.price > maxVal) return false;
      }

      return true;
    });

    onFilterChange(results);
  }, [query, selectedCategories, selectedStatuses, driftType, minPrice, maxPrice, rows, activeTab]);

  // 4. Save and Apply configs handlers
  const handleSaveCurrentFilter = () => {
    if (!newConfigName.trim()) return;

    const newConf: AdvancedFilterConfig = {
      name: newConfigName.trim(),
      query,
      selectedCategories,
      selectedStatuses,
      driftType,
      minPrice,
      maxPrice
    };

    const updated = [newConf, ...savedConfigs];
    setSavedConfigs(updated);
    localStorage.setItem('aether_saved_filters_v2', JSON.stringify(updated));
    setActiveConfigName(newConf.name);
    setNewConfigName('');
    setShowSaveModal(false);
  };

  const handleApplyConfig = (conf: AdvancedFilterConfig) => {
    setQuery(conf.query);
    setSelectedCategories(conf.selectedCategories);
    setSelectedStatuses(conf.selectedStatuses);
    setDriftType(conf.driftType);
    setMinPrice(conf.minPrice);
    setMaxPrice(conf.maxPrice);
    setActiveConfigName(conf.name);
  };

  const handleDeleteConfig = (nameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedConfigs.filter(it => it.name !== nameToDelete);
    setSavedConfigs(updated);
    localStorage.setItem('aether_saved_filters_v2', JSON.stringify(updated));
    if (activeConfigName === nameToDelete) {
      setActiveConfigName(null);
    }
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setDriftType('ALL');
    setMinPrice('');
    setMaxPrice('');
    setActiveConfigName(null);
  };

  // Toggle helpers for multi-selects
  const toggleCategorySelection = (cat: HardwareCategory) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setActiveConfigName(null);
  };

  const toggleStatusSelection = (st: RowStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]
    );
    setActiveConfigName(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col relative overflow-hidden transition-all duration-300">
      {/* Search Header control row */}
      <div className="p-4 flex flex-col sm:flex-row items-center gap-4 border-b border-slate-100">
        {/* Core Text Input Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Advanced index lookup (SKU part code, description keywords)..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActiveConfigName(null);
            }}
            className="w-full bg-white border border-slate-250 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 transition-all font-sans"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {/* Preset selector dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-655 hover:bg-slate-50 font-bold text-xs cursor-pointer transition-colors">
              <BookMarked className="w-3.5 h-3.5 text-indigo-600" />
              <span className="truncate max-w-[130px]">{activeConfigName || 'Load Presets'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            
            {/* Hover popup list */}
            <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-40 bg-white border border-slate-250 w-64 rounded-xl shadow-xl divide-y divide-slate-100">
              <div className="bg-slate-50 px-3 py-1.5 font-semibold text-[9px] font-mono text-slate-450 uppercase tracking-widest leading-none">
                Saved Configurations
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 divide-dashed">
                {savedConfigs.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs font-mono">No Presets Saved</div>
                ) : (
                  savedConfigs.map(conf => (
                    <button
                      key={conf.name}
                      onClick={() => handleApplyConfig(conf)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-705 hover:text-indigo-805 hover:bg-slate-50 flex items-center justify-between focus:outline-none cursor-pointer group/item"
                    >
                      <span className="truncate">{conf.name}</span>
                      <div className="flex items-center gap-1.5">
                        {activeConfigName === conf.name && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        {/* Exclude default non-deletable items from custom purge triggers */}
                        {!['⚠️ All Gaps & Mismatches', '✅ Matched Hardware Base', '💎 Premium Line items (>$1000)'].includes(conf.name) && (
                          <Trash2 
                            onClick={(e) => handleDeleteConfig(conf.name, e)}
                            className="w-3 h-3 text-slate-350 hover:text-red-500 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity" 
                          />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Collapsible toggle triggers */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold font-mono transition-all cursor-pointer ${
              isOpen 
                ? 'bg-indigo-50 border-indigo-300 text-indigo-705 font-bold shadow-xs' 
                : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-650" />
            <span>Advanced Filters</span>
          </button>

          {/* Quick Clear option */}
          {(query || selectedCategories.length > 0 || selectedStatuses.length > 0 || driftType !== 'ALL' || minPrice || maxPrice) && (
            <button
              onClick={handleClearFilters}
              title="Clear active filters"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Expanding Filter Panel */}
      {isOpen && (
        <div className="p-5 bg-slate-50 border-b border-indigo-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left animate-slide-down">
          {/* Select Category Multi Panel */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none border-b border-slate-200 pb-1.5">
              Categories ({selectedCategories.length} selected)
            </span>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto custom-scrollbar">
              {categoriesList.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900 leading-none">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCategorySelection(cat)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Select Status Multi Panel */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none border-b border-slate-200 pb-1.5">
              Row Audit Status ({selectedStatuses.length} selected)
            </span>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto custom-scrollbar">
              {statusesList.map(st => {
                const isSelected = selectedStatuses.includes(st);
                return (
                  <label key={st} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900 leading-none">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStatusSelection(st)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>{st}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Drift Type Filtering dropdown */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none border-b border-slate-200 pb-1.5">
              Drift & Financial delta
            </span>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <select
                  value={driftType}
                  onChange={e => {
                    setDriftType(e.target.value as any);
                    setActiveConfigName(null);
                  }}
                  className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-100 font-semibold cursor-pointer"
                >
                  <option value="ALL">Show All Drift Outcomes</option>
                  <option value="DRIFT_ONLY">Has Drift Only (Mismatches)</option>
                  <option value="NEUTRAL_ONLY">Neutral Drift Balance ($0)</option>
                  <option value="POSITIVE_ONLY">Positive Deficit (+Drift)</option>
                  <option value="NEGATIVE_ONLY">Negative Excess (-Drift)</option>
                </select>
              </div>

              {/* Status report indicator counts matching query */}
              <div className="text-[10px] font-medium text-slate-500 leading-tight">
                ℹ️ Filters recalculate MSRP ledger bounds dynamically for audit reports in real time.
              </div>
            </div>
          </div>

          {/* Unit Price Ranges */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none border-b border-slate-200 pb-1.5">
              Unit Price Threshold ($)
            </span>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={e => {
                    setMinPrice(e.target.value);
                    setActiveConfigName(null);
                  }}
                  className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1 text-xs text-center font-mono placeholder-slate-400 font-semibold"
                />
                <span className="text-slate-400 text-xs">—</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={e => {
                    setMaxPrice(e.target.value);
                    setActiveConfigName(null);
                  }}
                  className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1 text-xs text-center font-mono placeholder-slate-400 font-semibold"
                />
              </div>

              <button
                onClick={() => setShowSaveModal(true)}
                className="w-full flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs cursor-pointer transition-transform"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Active Setup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save presets popup modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-250 w-full max-w-sm rounded-xl p-5 shadow-xl relative flex flex-col gap-4 animate-scale-up text-left">
            <button
              onClick={() => setShowSaveModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h4 className="font-bold text-slate-900 text-sm">Save Current Filter Setup</h4>
              <p className="text-xs text-slate-500 mt-1">
                Name this filter combination. It will persist inside your workspace cache.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Setup Label</label>
              <input
                type="text"
                placeholder="e.g. Memory Mismatches Only"
                value={newConfigName}
                onChange={e => setNewConfigName(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              onClick={handleSaveCurrentFilter}
              disabled={!newConfigName.trim()}
              className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              Save Configuration Preset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
