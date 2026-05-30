/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CatalogItem, HardwareCategory } from '../types';
import { 
  PlusCircle, Search, Trash2, Edit, X, Shield, ShieldCheck, DollarSign,
  Database, RefreshCw, AlertTriangle, Check, BookOpen, Layers, 
  Network, ArrowRight, Sparkles, HelpCircle, FileSpreadsheet, Play, CheckCircle2, Sliders, Settings2, HelpCircle as InfoIcon
} from 'lucide-react';

interface HardwareCatalogProps {
  catalogItems: CatalogItem[];
  setCatalogItems: React.Dispatch<React.SetStateAction<CatalogItem[]>>;
}

interface IngestSource {
  id: string;
  name: string;
  type: 'API' | 'PDF' | 'CSV' | 'XML';
  lastChecked: string;
  itemsFound: number;
  status: 'CONNECTED' | 'STALE' | 'OFFLINE';
}

interface PromotedRule {
  id: string;
  sourcePattern: string;
  learnedProperty: string;
  actionTaken: string;
  confidence: number;
  status: 'PROMOTED' | 'HEALED' | 'ELEVATED';
  timestamp: string;
}

interface HumanInterventionIssue {
  id: string;
  anomalySku: string;
  description: string;
  suggestedAction: string;
  matchedOptions: string[];
  severity: 'CRITICAL' | 'WARNING';
}

export default function HardwareCatalog({ catalogItems, setCatalogItems }: HardwareCatalogProps) {
  // Core Navigation Tabs inside Catalog view
  const [currentTab, setCurrentTab] = useState<'inventory' | 'scraper' | 'rules'>('inventory');

  // Search + Filters State (Existing standard criteria)
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCompliance, setSelectedCompliance] = useState<'ALL' | 'TAA' | 'SOVEREIGN'>('ALL');

  // Form Modal controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Form Elements State
  const [formSku, setFormSku] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMv, setFormMv] = useState('1250');
  const [formCategory, setFormCategory] = useState<HardwareCategory>('STORAGE_DRIVE');

  // Source Scraping State
  const [ingestSources, setIngestSources] = useState<IngestSource[]>([
    { id: 'src-1', name: 'HPE Live Partner Price Matrix API', type: 'API', lastChecked: 'Active 12m ago', itemsFound: 320, status: 'CONNECTED' },
    { id: 'src-2', name: 'Dell Premier Enterprise Catalog Feed', type: 'XML', lastChecked: 'Active 3h ago', itemsFound: 185, status: 'CONNECTED' },
    { id: 'src-3', name: 'Global Distributor Supply Chain TAA Compliance List', type: 'CSV', lastChecked: 'Active 1d ago', itemsFound: 1150, status: 'CONNECTED' },
    { id: 'src-4', name: 'Sovereign Gating Framework Restrictions Doc', type: 'PDF', lastChecked: 'Active 5d ago', itemsFound: 42, status: 'STALE' }
  ]);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedLogs, setScrapedLogs] = useState<string[]>([]);

  // Promoted Dynamic Rules Matrix
  const [promotedRules, setPromotedRules] = useState<PromotedRule[]>([
    { id: 'rule-01', sourcePattern: 'P43328-B21 RDIMMs', learnedProperty: 'DDR5 Balanced-channel multiplier symmetry requirement', actionTaken: 'Enforce twin configurations on CPU platforms', confidence: 99, status: 'PROMOTED', timestamp: '2026-05-30 14:15:20' },
    { id: 'rule-02', sourcePattern: 'P50465-B21 Xeon Core Option', learnedProperty: 'Requires minimum thermal heatsink option code', actionTaken: 'Auto-inject cooling riser elements pre-compliance', confidence: 94, status: 'ELEVATED', timestamp: '2026-05-30 15:32:10' },
    { id: 'rule-03', sourcePattern: '865438-B21 PSU Series', learnedProperty: 'Physical dimensions requirement 2U standard chassis', actionTaken: 'Prevent installation in 1U compact configurations', confidence: 97, status: 'HEALED', timestamp: '2026-05-30 16:48:45' }
  ]);

  // Unresolved Anomaly Issues requiring explicit Human Intervention
  const [humanInterventions, setHumanInterventions] = useState<HumanInterventionIssue[]>([
    { 
      id: 'hi-1', 
      anomalySku: 'UNRESOLVED_MEM_VNDR', 
      description: 'Incoming manufacturer line items note "64GB DDR5 ECC" but lack specified vendor channel keys or OEM branding coefficients. Standard mapping failed.',
      suggestedAction: 'Map this custom entry permanently to standard item "P43328-B21" (HPE 64GB RDIMM modules).',
      matchedOptions: ['P43328-B21', '865438-B21'],
      severity: 'CRITICAL'
    },
    { 
      id: 'hi-2', 
      anomalySku: 'AMBIGUOUS_POWER_WATTAGE', 
      description: 'Chassis spec notes "Hot plug generic PSU" without specific wattage draw or power layout parameters. Auto-compliance can design for 800W or 1600W configurations.',
      suggestedAction: 'Promote default spec "865438-B21" (800W Flex-Slot Platinum) as the baseline solver option.',
      matchedOptions: ['865438-B21', 'P50465-B21'],
      severity: 'WARNING'
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute category counts from actual catalog
  const computeCount = (cat: string) => {
    if (cat === 'All') return catalogItems.length;
    return catalogItems.filter(item => item.Category === cat).length;
  };

  // Preserved Category list
  const categoriesList = [
    'All',
    'STORAGE_ENCLOSURE',
    'PROCESSOR',
    'CHASSIS_CONFIG',
    'NETWORKING',
    'STORAGE_DRIVE',
    'CABLE',
    'NVME_DRIVE',
    'UNKNOWN',
    'MEMORY',
    'GPU_NODE',
    'MECHANICAL',
    'PSU_PLATINUM',
    'RISER',
    'STORAGE_CTRL',
    'CHASSIS',
    'SUPPORT_SERVICE',
    'RAIL_MECH',
    'FAN',
    'FAN_STD',
    'MGMT_SOFTWARE',
    'SECURITY',
    'NODE'
  ];

  // Preserved Modal CRUD Operations
  const handleSaveSkuSpecs = () => {
    const nextItem: CatalogItem = {
      SKU: formSku.trim(),
      Description: formDesc.trim(),
      Category: formCategory,
      MSRP: parseFloat(formMv) || 0,
      Platforms: 'DL380_G12',
      isTAA: true
    };

    if (editingItem) {
      setCatalogItems(prev => prev.map(item => (item.SKU === editingItem.SKU ? nextItem : item)));
      triggerToast(`Successfully modified catalog specifications for SKU: ${formSku}`);
    } else {
      setCatalogItems(prev => [nextItem, ...prev]);
      triggerToast(`Successfully registered new canonical SKU: ${formSku} into catalog inventory.`);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setFormSku('');
    setFormDesc('');
    setFormMv('1250');
  };

  const handleStartAddSKU = () => {
    setEditingItem(null);
    setFormSku('');
    setFormDesc('');
    setFormMv('1250');
    setFormCategory('STORAGE_DRIVE');
    setIsModalOpen(true);
  };

  const handleStartEditItem = (item: CatalogItem) => {
    setEditingItem(item);
    setFormSku(item.SKU);
    setFormDesc(item.Description);
    setFormMv(String(item.MSRP));
    setFormCategory(item.Category);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (sku: string) => {
    const confirmed = window.confirm(`Confirm deleting SKU specs mapping for ${sku}?`);
    if (confirmed) {
      setCatalogItems(prev => prev.filter(item => item.SKU !== sku));
      triggerToast(`Deleted canonical SKU: ${sku} from catalog mapping.`);
    }
  };

  // Feed/Scraper simulation task
  const handleTriggerLiveHarvest = () => {
    setIsScraping(true);
    setScrapedLogs(['Establishing connection with HPE Live Price API...', 'Establishing Dell Premier Secure API socket...']);

    let step = 1;
    const interval = setInterval(() => {
      if (step === 1) {
        setScrapedLogs(prev => [...prev, 'GET /api/catalog/v2/prices?market=US ... 320 records fetched successfully']);
      } else if (step === 2) {
        setScrapedLogs(prev => [...prev, 'Syncing XML manufacturer streams... detected sovereign TAA alignment changes']);
      } else if (step === 3) {
        setScrapedLogs(prev => [...prev, 'Evaluating constraints rules... 2 new physical power rules promoted']);
        
        // Dynamically add one item to simulate catalog harvesting and updating
        const newScrapedItem: CatalogItem = {
          SKU: 'SCRA-8869',
          Description: 'HPE Dual-Channel PCIe Smart Storage Battery-backed Controller',
          Category: 'STORAGE_CTRL',
          MSRP: 980,
          Platforms: 'DL380_G12 / GEN11 Frame',
          isTAA: true,
          isSovereign: true
        };
        setCatalogItems(prev => {
          if (!prev.some(item => item.SKU === 'SCRA-8869')) {
            return [newScrapedItem, ...prev];
          }
          return prev;
        });

        clearInterval(interval);
        setIsScraping(false);
        triggerToast('Dynamic partner scraping successfully harvested 1 new Storage Controller SKU!');
      }
      step++;
    }, 1000);
  };

  // Human intervention resolution logic
  const handleResolveHumanIntervention = (id: string, targetSku: string) => {
    // Find the item
    const unresolved = humanInterventions.find(h => h.id === id);
    if (!unresolved) return;

    // Simulate mapping the custom item to a canonical part definition
    // Here we can insert/update a catalog configuration mapping, or register that mapping
    setHumanInterventions(prev => prev.filter(h => h.id !== id));

    // Register a rule dynamic promotion as result of this human input!
    const newRule: PromotedRule = {
      id: `rule-${Date.now()}`,
      sourcePattern: unresolved.anomalySku,
      learnedProperty: `Explicit manual mapping from human validation. Target SKU verified.`,
      actionTaken: `Mapped to catalog: ${targetSku}`,
      confidence: 100,
      status: 'PROMOTED',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setPromotedRules([newRule, ...promotedRules]);
    triggerToast(`Resolved anomaly "${unresolved.anomalySku}"! Successfully converted human feedback node, promoting canonical rule.`);
  };

  // Filtering (Existing logic preserved perfectly)
  const filteredItems = catalogItems.filter(item => {
    if (selectedCategory !== 'All' && item.Category !== selectedCategory) {
      return false;
    }
    if (selectedCompliance === 'TAA' && !item.isTAA) return false;
    if (selectedCompliance === 'SOVEREIGN' && !item.isSovereign) return false;

    if (searchText.trim() !== '') {
      const q = searchText.toLowerCase();
      const healedQ = q === 'procser' ? 'processor' : q;
      
      const skuMatch = item.SKU.toLowerCase().includes(healedQ);
      const descMatch = item.Description.toLowerCase().includes(healedQ);
      const categoryMatch = item.Category.toLowerCase().includes(healedQ);
      return skuMatch || descMatch || categoryMatch;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Toast Notification Top Ingress */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white border border-slate-700 px-5 py-3 rounded-xl shadow-xl animate-scale-up text-xs font-semibold flex items-center gap-2 max-w-sm">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Overview Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Catalog SKUs stats */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1">
              Total Catalog SKUs
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{catalogItems.length}</span>
            <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
              HPE, Dell & Broadcom Specs
            </span>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-650">
            <Search className="w-5.2 h-5.2" />
          </div>
        </div>

        {/* Live Rule Promotion Log count */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1">
              Active Invariants
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{promotedRules.length + 17}</span>
            <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
              Sovereign & Symmetric Physical rules
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-655">
            <Shield className="w-5.2 h-5.2" />
          </div>
        </div>

        {/* Human Interventions Counter */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1">
              Human Gating Cases
            </span>
            <span className={`text-2xl font-bold font-mono ${humanInterventions.length > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-900'}`}>
              {humanInterventions.length}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
              Requires manual SKU alignment
            </span>
          </div>
          <div className={`p-2.5 rounded-lg ${humanInterventions.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="w-5.2 h-5.2" />
          </div>
        </div>

        {/* Active Harvester Channels */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1">
              Active Scrapers
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">4 Connected</span>
            <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
              Streaming OEM price logs
            </span>
          </div>
          <div className="p-2.5 bg-purple-50 rounded-lg text-purple-655">
            <Network className="w-5.2 h-5.2" />
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Switcher Controller */}
      <div className="flex border-b border-slate-200 gap-1 mt-1">
        {[
          { id: 'inventory', label: '🗄️ Canonical Catalog Inventory', count: catalogItems.length },
          { id: 'scraper', label: '🔌 Portal Scrapers & Harvest', count: ingestSources.length },
          { id: 'rules', label: '⚡ Rule Promotion & Human Gating', count: promotedRules.length + humanInterventions.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            className={`px-5 py-3 border-b-2 text-xs font-bold leading-none cursor-pointer transition-all flex items-center gap-2 ${
              currentTab === tab.id
                ? 'border-indigo-650 text-indigo-705'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
              currentTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-450'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: CANONICAL CATALOG INVENTORY (EXISTING COMPONENT PORTED FLOW) */}
      {currentTab === 'inventory' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          
          {/* Dynamic Category Quick Filters */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-430 uppercase tracking-widest mr-1">
                Category:
              </span>
              <div className="flex flex-wrap gap-1.5 overflow-x-auto max-w-full py-1">
                {categoriesList.map(cat => {
                  const isActive = selectedCategory === cat;
                  const count = computeCount(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border whitespace-nowrap cursor-pointer transition-all ${
                        isActive
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compliance Filter Controls */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-mono font-bold text-slate-430 uppercase tracking-widest mr-1">
                Compliance:
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSelectedCompliance('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                    selectedCompliance === 'ALL'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-755'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  Show All
                </button>
                <button
                  onClick={() => setSelectedCompliance('TAA')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                    selectedCompliance === 'TAA'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-755'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  TAA Only ({catalogItems.filter(i => i.isTAA).length})
                </button>
                <button
                  onClick={() => setSelectedCompliance('SOVEREIGN')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                    selectedCompliance === 'SOVEREIGN'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-755'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  Sovereign Only ({catalogItems.filter(i => i.isSovereign).length})
                </button>
              </div>
            </div>
          </div>

          {/* Search & Actions bar */}
          <div className="flex items-center justify-between gap-4 mt-2">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog canonical SKUs or descriptions..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            <button
              onClick={handleStartAddSKU}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add SKU</span>
            </button>
          </div>

          {/* Catalog Table list */}
          <div className="border border-slate-205 rounded-xl overflow-hidden mt-1 bg-white shadow-sm">
            <div className="grid grid-cols-[140px_1fr_160px_110px_140px_110px] items-center bg-slate-50 px-6 py-3 font-semibold text-xs font-mono text-slate-550 uppercase tracking-widest border-b border-slate-200">
              <div>Canonical SKU</div>
              <div>Forensic Description</div>
              <div className="text-center">Category</div>
              <div className="text-right">MSRP</div>
              <div className="text-center">Lineage</div>
              <div className="text-center">Actions</div>
            </div>

            <div className="divide-y divide-slate-200 max-h-[400px] overflow-y-auto custom-scrollbar bg-white">
              {filteredItems.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-mono text-xs">
                  No Catalog Data Matches Filter Criteria
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <div
                      key={item.SKU}
                      className="custom-scrollbar"
                    >
                      <div
                        className={`grid grid-cols-[140px_1fr_160px_110px_140px_110px] items-center px-6 py-3 text-[12px] font-medium text-slate-705 ${
                          isEven ? 'bg-white' : 'bg-slate-50/50'
                        } hover:bg-indigo-50/30 transition-colors`}
                      >
                        <div className="font-mono font-bold text-slate-900 tracking-wider select-all">
                          {item.SKU}
                        </div>

                        <div className="truncate pr-4 text-slate-600 font-medium font-sans">
                          {item.Description}
                        </div>

                        <div className="text-center flex justify-center">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-750 border border-indigo-100 font-bold rounded text-[10px] uppercase">
                            {item.Category}
                          </span>
                        </div>

                        <div className="text-right font-mono font-bold text-slate-850">
                          ${item.MSRP.toLocaleString()}
                        </div>

                        <div className="text-center truncate text-[10px] font-mono text-slate-400 font-medium px-2">
                          {item.Platforms}
                        </div>

                        <div className="text-center flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEditItem(item)}
                            title="Edit SKU Specs"
                            className="p-1 text-slate-400 hover:text-indigo-650 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.SKU)}
                            title="Delete SKU"
                            className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PORTAL SCRAPERS & INGESTION PIPE */}
      {currentTab === 'scraper' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-6">
          <div>
            <span className="text-[10px] font-mono font-black tracking-widest text-indigo-605 uppercase">Intelligence Feeds</span>
            <h3 className="font-bold text-slate-900 text-sm mt-1 uppercase">Dynamic Partner API & Specification Harvesters</h3>
            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
              Maintain price currency and structural specs validity. Our scraper automation streams pricing, limits mapping definitions, and compliance metadata from official partner endpoints to continuously refresh catalog bounds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scrapers sources list */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider">Configured Scraper Hooks:</span>
              <div className="flex flex-col gap-2.5">
                {ingestSources.map(src => (
                  <div key={src.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <span className={`p-2 rounded-lg font-mono font-black text-[10px] shrink-0 ${
                        src.type === 'API' ? 'bg-emerald-100 text-emerald-800' :
                        src.type === 'XML' ? 'bg-indigo-100 text-indigo-800' :
                        src.type === 'CSV' ? 'bg-cyan-100 text-cyan-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {src.type}
                      </span>
                      <div className="text-left leading-tight">
                        <h4 className="font-bold text-xs text-slate-800">{src.name}</h4>
                        <span className="text-[10px] text-slate-400 block mt-1">{src.lastChecked} — {src.itemsFound} items parsed</span>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-650 border border-slate-200">
                      {src.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Run Harvest Trigger Center */}
            <div className="bg-slate-50 border border-slate-220 rounded-xl p-5 flex flex-col justify-between gap-4">
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-800 uppercase font-mono tracking-wide">Initiate Price Harvest</h4>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Trigger raw crawls across HPE / Dell active configurators to synchronize supply values and update local database inventory tables dynamically.
                </p>
              </div>

              {isScraping ? (
                <div className="bg-white p-4 border border-slate-200 rounded-lg flex flex-col gap-2 text-left min-h-[110px]">
                  <span className="text-[9px] font-mono font-bold text-indigo-650 animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> HARVESTING ACTIVE...
                  </span>
                  <div className="text-[10px] font-mono text-slate-500 max-h-24 overflow-y-auto divide-y divide-slate-100">
                    {scrapedLogs.map((log, index) => (
                      <div key={index} className="py-1">{log}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTriggerLiveHarvest}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-all text-center flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Harvest Active Store Specs</span>
                </button>
              )}

              <div className="text-[10px] text-slate-450 leading-relaxed border-t border-slate-200 pt-2 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Price synchronizations use authenticated manufacturer stubs protecting intellectual ledger integrity.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RULE PROMOTION & HUMAN GATING PANEL */}
      {currentTab === 'rules' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-6">
          
          {/* SECTION A: HUMAN INTERVENTION REQUIRED (CRITICAL FAILURES/ANOMALIES) */}
          {humanInterventions.length > 0 && (
            <div className="border border-amber-200 bg-amber-50/15 rounded-2xl p-5 text-left">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs font-mono uppercase tracking-widest border-b border-amber-100 pb-2.5 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
                <span>⚠️ Gaps Detected: Human Intervention Required</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                The automation model encountered configuration lines or vendor aliases that cannot be uniquely mapped without validation. Manual assignment is flagged below:
              </p>

              <div className="flex flex-col gap-4">
                {humanInterventions.map(issue => (
                  <div key={issue.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xs transition-shadow">
                    <div className="text-left flex-1">
                      <div className="flex gap-2 items-center">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          issue.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {issue.severity} ANOMALY
                        </span>
                        <strong className="text-xs text-slate-900 font-mono tracking-wider font-bold">{issue.anomalySku}</strong>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed max-w-2xl">{issue.description}</p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <span className="text-[9px] font-mono text-slate-400 font-bold block leading-none">Map to Standard Canonical SKU:</span>
                      <div className="flex gap-1.5">
                        {issue.matchedOptions.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleResolveHumanIntervention(issue.id, opt)}
                            className="px-3 py-1.5 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-indigo-705 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: PROMOTED INVARIANTS RULE METRIC LOGS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-4 text-left">
              <div>
                <span className="text-[10px] font-mono font-black tracking-widest text-indigo-605 uppercase">Post-Synchronization Loop</span>
                <h3 className="font-bold text-slate-900 text-sm mt-1 uppercase">Dynamic Spec Rule Promotions & Learning History</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Every manual repair, channel substitution, or validated template mapping feeds back into the sovereign rule validation database. This list shows structural rules elevated to active constraints dynamically by the intelligence center.
                </p>
              </div>

              {/* Learning stats metric graph placeholder representation */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[9px] font-mono font-bold uppercase text-slate-450 tracking-wider">Knowledge Loop Health:</span>
                <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-center">
                  <div className="bg-white border rounded-lg p-2.5">
                    <span className="text-emerald-600 font-black text-sm block">100%</span>
                    <span className="text-[8px] text-slate-400 block mt-0.5">Rule Parity</span>
                  </div>
                  <div className="bg-white border rounded-lg p-2.5">
                    <span className="text-indigo-650 font-black text-sm block">12</span>
                    <span className="text-[8px] text-slate-400 block mt-0.5">Learnings Logged</span>
                  </div>
                  <div className="bg-white border rounded-lg p-2.5">
                    <span className="text-purple-650 font-black text-sm block">0.3s</span>
                    <span className="text-[8px] text-slate-400 block mt-0.5">Auto-Heal Speed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promoted rules timeline index */}
            <div className="border border-slate-205 rounded-xl p-5 flex flex-col gap-3 min-h-[220px]">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-650 tracking-wider block border-b border-dashed border-slate-200 pb-2">Active Promoted Rules ledger:</span>
              <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-60 custom-scrollbar pr-1 text-left text-xs">
                {promotedRules.map(rule => (
                  <div key={rule.id} className="py-2.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center bg-slate-50 p-1 px-1.5 rounded-md">
                      <span className="font-bold text-indigo-705 font-mono text-[10px]">{rule.sourcePattern}</span>
                      <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                        rule.status === 'PROMOTED' ? 'bg-emerald-100 text-emerald-800' :
                        rule.status === 'HEALED' ? 'bg-cyan-100 text-cyan-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {rule.status} Log ({rule.confidence}% conf)
                      </span>
                    </div>
                    <div className="leading-tight pl-1">
                      <p className="text-xs text-slate-750 font-semibold">{rule.learnedProperty}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">Outcome: <strong className="text-slate-600 font-medium">{rule.actionTaken}</strong></span>
                      <span className="text-[8px] text-slate-400 block mt-0.5">{rule.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Register New SKU Specs Modal Popup (Preserved intact) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-205 w-full max-w-md rounded-xl p-6 shadow-xl relative flex flex-col gap-4 animate-scale-up">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-md font-bold text-slate-950">Register New SKU Specs</h3>
              <p className="text-xs text-slate-500 mt-1">
                Extend core physical specifications mapping index inside active baseline.
              </p>
            </div>

            <div className="flex flex-col gap-3 font-medium text-slate-700">
              {/* SKU input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-440">Canonical SKU</label>
                <input
                  type="text"
                  placeholder="e.g. P48820-B21"
                  value={formSku}
                  onChange={e => setFormSku(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Description input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-440">Forensic Description</label>
                <input
                  type="text"
                  placeholder="e.g. HPE ProLiant DL380 Gen11 Intel Xeon-G 6430 Processor Kit"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* MSRP Price input */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-440">MSRP Price ($)</label>
                <input
                  type="text"
                  placeholder="e.g. 1250"
                  value={formMv}
                  onChange={e => setFormMv(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Category picker */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-440">Category Bucket</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as HardwareCategory)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="STORAGE_DRIVE">STORAGE_DRIVE</option>
                  <option value="PROCESSOR">PROCESSOR</option>
                  <option value="MEMORY">MEMORY</option>
                  <option value="CHASSIS">CHASSIS</option>
                  <option value="POWER">POWER</option>
                  <option value="RISER">RISER</option>
                  <option value="STORAGE_CTRL">STORAGE_CTRL</option>
                  <option value="SUPPORT_SERVICE">SUPPORT_SERVICE</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveSkuSpecs}
              className="mt-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
            >
              Save SKU Specs
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
