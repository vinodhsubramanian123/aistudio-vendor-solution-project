/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import UnifiedHeader from './components/UnifiedHeader';
import ComparisonTable from './components/ComparisonTable';
import LogicalTreeView from './components/LogicalTreeView';
import ChassisVisualizer from './components/ChassisVisualizer';
import HardwareCatalog from './components/HardwareCatalog';
import MissionControl from './components/MissionControl';
import TechnicalAdvice from './components/TechnicalAdvice';
import PipelineControlCenter from './components/PipelineControlCenter';
import { DiffRow, CatalogItem, AuditLogEntry, RowStatus } from './types';
import {
  DEMO_ROWS_DL385_GEN11,
  MOCK_MULTI_MISSION_DATASYNC,
  generateCatalog,
  DEMO_AUDIT_LOGS
} from './data';
import { Layers, ShieldCheck, CornerDownRight, CheckCircle2, AlertTriangle, Play, X, Terminal } from 'lucide-react';

export default function App() {
  // Query parameters state
  const params = new URLSearchParams(window.location.search);
  const isDemoModeOnStart = params.get('demo') === 'true';
  const startGradPlatform = params.get('grad') || '';

  // Workspace configuration states
  const [activeTab, setActiveTab] = useState<string>('ALPHA-888');
  const [viewMode, setViewMode] = useState<'pipeline' | 'table' | 'tree' | 'physical' | 'reconcile' | 'catalog'>('pipeline');
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Unified global metrics computed state
  const [rows, setRows] = useState<DiffRow[]>(() => [
    ...DEMO_ROWS_DL385_GEN11,
    ...MOCK_MULTI_MISSION_DATASYNC['DELL-PRO-25'],
    ...MOCK_MULTI_MISSION_DATASYNC['STORAGE-MAX-99']
  ]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(generateCatalog());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(DEMO_AUDIT_LOGS);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Simulated notifications
  const [pulseTab, setPulseTab] = useState<string | undefined>(undefined);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Active configurations Metadata
  const [configIdPrefix, setConfigIdPrefix] = useState('ALPHA-888');
  const [platformContext, setPlatformContext] = useState('Generic HPE Platform');

  // Initialize with initial hydrated seed datasets on-the-fly
  useEffect(() => {
    if (isDemoModeOnStart || startGradPlatform) {
      // Auto-hydrate demo datasets
      setRows(DEMO_ROWS_DL385_GEN11);
      setPlatformContext('DL385 High-Density Architecture');
      setConfigIdPrefix('DEMO-PLATINUM-77');
    }

    // Connect standard custom window dispatchers for parallel test runners
    const handleRowsInject = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const injected: any[] = customEvent.detail;
        const parsedRows: DiffRow[] = injected.map((item, index) => ({
          id: item.id || `I-${index}`,
          part: item.part,
          partKey: item.part.replace(/[^A-Z0-9]/gi, '').toUpperCase(),
          boqQty: item.boqQty ?? 2,
          bomQty: item.bomQty ?? 2,
          boqDesc: `${item.part} Standard Inception Specification Option`,
          bomDesc: `${item.part} Standard Inception Specification Option`,
          category: (item.part.includes('SSD') || item.part.includes('NVME')) ? 'NVME_DRIVE' : item.part.includes('BOSS') ? 'STORAGE_CTRL' : 'PROCESSOR',
          config: item._ucid || 'ALPHA-888',
          status: item.boqQty === item.bomQty ? 'MATCHED' : 'QTY_MISMATCH',
          price: item.part.includes('BOSS') ? 650 : item.part.includes('SSD') ? 320 : 8000,
          drift: (item.bomQty - item.boqQty) * (item.part.includes('BOSS') ? 650 : item.part.includes('SSD') ? 320 : 8000),
          trace: ['Phase 4: Siphoning verified on-the-fly.'],
          capabilities: ['PCIe Gen5', 'Enterprise']
        }));

        setRows(parsedRows);
      }
    };

    const handleLogEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail === 'string') {
        const msg = customEvent.detail;
        console.log(`[E2E-TESTING] ${msg}`);
        // Extract UCID pulse targeting
        const ucidMatch = msg.match(/\[UCID:([A-Za-z0-0-#]+)\]/);
        if (ucidMatch) {
          setPulseTab(ucidMatch[1]);
        }
      }
    };

    window.addEventListener('__test_inject_rows__', handleRowsInject);
    window.addEventListener('__forensic_shadow_log__', handleLogEvent);

    return () => {
      window.removeEventListener('__test_inject_rows__', handleRowsInject);
      window.removeEventListener('__forensic_shadow_log__', handleLogEvent);
    };
  }, [isDemoModeOnStart, startGradPlatform]);

  // Handle ucid switch reset alert pulse
  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (pulseTab === tabId) {
      setPulseTab(undefined);
    }
  };

  // Upload/seed trigger helper
  const handleUploadFile = (side: 'left' | 'right') => {
    // Populate rows on file upload
    setRows(DEMO_ROWS_DL385_GEN11);
    setPlatformContext('HPE ProLiant Chassis Generation-11 Map');
    setConfigIdPrefix('DEMO-PLATINUM-77');
  };

  // Resolve Ghost nodes on logical tree click
  const handleSolveGhost = (rowId: string) => {
    // Simulating holographic part injection
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          return {
            ...r,
            bomQty: r.boqQty,
            bomDesc: 'HPE DL385 Gen11 PCIe x16 Primary Riser Board Option',
            status: 'MATCHED' as RowStatus,
            drift: 0
          };
        }
        return r;
      })
    );

    // Trigger toast notification
    setCopiedText('Holographic Resolution: Injecting matching primary riser card!');
    setTimeout(() => {
      setCopiedText(null);
    }, 3000);
  };

  // Re-comparisons/hot refresh
  const handleResetWorkspace = () => {
    setRows([]);
    setPlatformContext('Generic HPE Platform');
    setConfigIdPrefix('AWAITING_DNA');
  };

  // Computed financial counters based on active tab filtering
  const activeRows = rows.filter(r => {
    if (activeTab === 'GLOBAL' || activeTab === 'CONSOLIDATED') return true;
    return r.config === activeTab;
  });

  const cumulativeValue = activeRows.reduce((acc, r) => acc + (r.bomQty * r.price), 0);
  const technicalDrift = activeRows.reduce((acc, r) => acc + r.drift, 0);

  // Render perspectives view toggles mapped directly to client selections
  const viewModesMap = [
    { id: 'pipeline', label: '⚡ Deal Lifecycle & Snapshots', testId: 'view-mode-pipeline' },
    { id: 'table', label: '📊 Specs Comparison', testId: 'view-mode-table' },
    { id: 'tree', label: 'Logical Tree', testId: 'view-mode-tree' },
    { id: 'physical', label: '🔌 3D Physical Chassis', testId: 'view-mode-physical' },
    { id: 'reconcile', label: '⚖️ Reconciliation', testId: 'view-mode-reconcile' },
    { id: 'catalog', label: '🗄️ Universal Ingress & Catalog', testId: 'view-mode-catalog' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col relative antialiased transition-colors duration-500 selection:bg-indigo-500/10 selection:text-indigo-800 pb-12">
      {/* Subtle background clean texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white pointer-events-none z-0" />

      {/* Holographic system notifications toast */}
      {copiedText && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl shadow-lg animate-fade-in flex items-center gap-3 font-semibold text-xs text-center border-l-4 border-l-indigo-600 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
          <span>{copiedText}</span>
        </div>
      )}

      {/* 2. Unified Header */}
      <UnifiedHeader
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        solutionValue={cumulativeValue}
        driftDelta={technicalDrift}
        configId={configIdPrefix}
        platformName={platformContext}
        isMockMode={true}
        onRefresh={() => setAuditLogs([...DEMO_AUDIT_LOGS])}
        pulseTab={pulseTab}
        onOpenTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main layout container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6 relative z-10 transition-all">
        {/* Dynamic perspective selectors */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 self-start mb-2 shadow-sm overflow-x-auto max-w-full custom-scrollbar">
          {viewModesMap.map(m => (
            <button
              key={m.id}
              data-testid={m.testId}
              onClick={() => setViewMode(m.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                viewMode === m.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* View mode routing controller */}
        {viewMode === 'pipeline' && (
          <PipelineControlCenter
            currentRows={rows}
            onRowsUpdate={setRows}
            activeTab={activeTab}
            onSetPlatformContext={setPlatformContext}
            onSetConfigIdPrefix={setConfigIdPrefix}
          />
        )}

        {viewMode === 'table' && (
          <div className="flex flex-col gap-6">
            <ComparisonTable
              rows={rows}
              setRows={setRows}
              filterText={filterText}
              setFilterText={setFilterText}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onUploadFile={handleUploadFile}
              activeTab={activeTab}
            />

            {/* Quick Demo Sandboxes Trigger Banners */}
            {rows.length === 0 && (
              <div className="border border-slate-200 bg-white p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Awaiting Workspace Artifacts</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a pre-compiled chassis blueprint sandbox below to instantly seed and render the forensic compare tables.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setRows(DEMO_ROWS_DL385_GEN11);
                      setPlatformContext('DL380 Gen12 High-Density Frame');
                      setConfigIdPrefix('DEMO-PLATINUM-77');
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer transition-colors"
                  >
                    DL380 Gen12 Sandbox Seed
                  </button>
                  <button
                    onClick={() => {
                      setRows(DEMO_ROWS_DL385_GEN11);
                      setPlatformContext('DL385 High-Density Architecture');
                      setConfigIdPrefix('DEMO-PLATINUM-77');
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer transition-colors"
                  >
                    DL385 Gen11 Sandbox Seed
                  </button>
                  <button
                    onClick={() => {
                      setRows(DEMO_ROWS_DL385_GEN11);
                      setPlatformContext('DL580 High-Performance Compute');
                      setConfigIdPrefix('DEMO-PLATINUM-77');
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer transition-colors"
                  >
                    DL580 Gen12 Sandbox Seed
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'tree' && (
          <LogicalTreeView rows={rows} onSolveGhost={handleSolveGhost} />
        )}

        {viewMode === 'physical' && (
          <ChassisVisualizer rows={rows} />
        )}

        {viewMode === 'reconcile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            {/* Left side Columns: Reconcile Matrix Solutions */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <span className="text-[10px] font-mono font-bold text-slate-550 uppercase tracking-widest leading-none">
                Reconciliation Solutions Matrix
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Solution A card */}
                <div
                  data-testid="reconcile-solution-col"
                  className="bg-white border border-slate-200 border-l-4 border-l-indigo-600 p-5 rounded-r-xl flex flex-col gap-3 shadow-sm"
                >
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase font-mono">OPTION A (Intel Xeon Balanced)</h4>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Recommended baseline deployment</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-650">$29,650</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    This solution solves socket balance restrictions perfectly, enforcing optimal channel population using Sapphire Rapids standard RDIMMs.
                  </p>
                  <div className="font-mono text-[10px] text-slate-500 flex flex-col gap-1">
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span>MSRP Tech-drift matching:</span>
                      <span className="text-slate-705 font-bold">$0 (Neutral)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>C19 power cords verified:</span>
                      <span className="text-emerald-600 font-bold">YES</span>
                    </div>
                  </div>
                </div>

                {/* Solution B card */}
                <div
                  data-testid="reconcile-solution-col"
                  className="bg-white border border-slate-200 border-l-4 border-l-cyan-600 p-5 rounded-r-xl flex flex-col gap-3 shadow-sm"
                >
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase font-mono">OPTION B (AMD EPYC High-Density)</h4>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Minimalist cost allocation layout</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-650">$24,300</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Designed for maximum energy efficiency with Genoa single-socket processors, bypassing dual-socket multiplier overheads.
                  </p>
                  <div className="font-mono text-[10px] text-slate-500 flex flex-col gap-1">
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span>MSRP Tech-drift matching:</span>
                      <span className="text-amber-600 font-bold">+$1,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>C19 power cords verified:</span>
                      <span className="text-slate-500 font-bold">NOT REQUIRED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Master Build logic */}
              <div
                data-testid="master-build-logic"
                className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm"
              >
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Synthesis Engine Strategy</h3>
                <p className="text-[11px] text-slate-600 mt-1 lines-normal">
                  The comparative audit siphons unused or extra memory kits from collateral nodes and applies **Substitution Density Bonding** automatically on compilation.
                </p>
              </div>
            </div>

            {/* Right side Columns: drift accounting block */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-mono font-black text-slate-550 uppercase tracking-widest leading-none">
                Drift Valuation Panel
              </span>

              <div
                data-testid="drift-valuation"
                className="border border-slate-200 p-5 rounded-2xl bg-white flex flex-col gap-3 relative shadow-sm"
              >
                <div className="text-[11px] font-mono font-bold text-indigo-600 uppercase">Valuation Ledger</div>
                <h3 className="text-xl font-bold text-slate-900 font-mono tracking-snug">$29,650 Total</h3>
                
                <div className="h-px bg-slate-100 my-1" />
                
                <div className="flex flex-col gap-2 font-mono text-[10px] leading-tight text-slate-600">
                  <div className="flex justify-between">
                    <span>Base chassis allocation value:</span>
                    <span className="text-slate-700 font-medium">$12,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processors power matching:</span>
                    <span className="text-slate-700 font-medium">$8,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RDIMMs density drift:</span>
                    <span className="text-slate-700 font-medium">$6,500</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 mt-1.5 font-bold text-amber-600">
                    <span>Active Technical Drift:</span>
                    <span>+$700</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'catalog' && (
          <HardwareCatalog catalogItems={catalogItems} setCatalogItems={setCatalogItems} />
        )}
      </main>

      {/* Interactive terminal and mission launchers modal overlay */}
      {isTerminalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700/50 w-full max-w-7xl rounded-3xl p-6 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col gap-4 text-left">
            {/* Close button */}
            <button
              onClick={() => setIsTerminalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors z-50"
              title="Close Audit Console"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pr-12 text-left">
              <h2 className="text-md font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span>Audit Console & Intelligent Agent HUD</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure orchestrator loops, witness diagnostic self-healing trace sequences, policy restriction gates, and multi-tenant live configuration pipelines.
              </p>
            </div>

            <div className="flex-1 min-h-0">
              <MissionControl
                onEmitUCID={(newUcid) => {
                  setConfigIdPrefix(newUcid);
                  setPulseTab(newUcid);
                  // Force rows status to success simulated
                  setRows(prev => prev.map(r => ({ ...r, status: 'MATCHED', drift: 0 })));
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Technical Advice sidebar panel drawer */}
      <TechnicalAdvice
        auditLogs={auditLogs}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onRunMissionSidebar={() => {
          setAuditLogs(prev => prev.map(l => l.severity === 'FATAL' ? { ...l, severity: 'PASS', message: 'Holographic auto-healed.' } : l));
        }}
      />
    </div>
  );
}
