/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DiffRow, RowStatus, DealVersion, CatalogItem } from '../types';
import { 
  Layers, UploadCloud, GitCommit, ArrowRight, CheckSquare, Activity, 
  FileSpreadsheet, Sparkles, ShieldCheck, Cpu, History, Plus, 
  RefreshCw, Play, Check, AlertCircle, Trash2, HelpCircle, FileText, 
  BookOpen, Network, CheckCircle2, Sliders, ChevronDown, Flame, Zap
} from 'lucide-react';
import { generateCatalog } from '../data';

interface PipelineControlCenterProps {
  currentRows: DiffRow[];
  onRowsUpdate: (rows: DiffRow[]) => void;
  activeTab: string;
  onSetPlatformContext: (ctx: string) => void;
  onSetConfigIdPrefix: (prefix: string) => void;
}

export default function PipelineControlCenter({
  currentRows,
  onRowsUpdate,
  activeTab,
  onSetPlatformContext,
  onSetConfigIdPrefix
}: PipelineControlCenterProps) {
  // 1. Core State
  const [activeStep, setActiveStep] = useState<number>(1);
  const [savedVersions, setSavedVersions] = useState<DealVersion[]>([]);
  const [selectedVersionsToCompare, setSelectedVersionsToCompare] = useState<string[]>([]);
  
  // Snapshot Dialog Form State
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotVer, setSnapshotVer] = useState('1.0');
  const [snapshotTitle, setSnapshotTitle] = useState('');
  const [snapshotDesc, setSnapshotDesc] = useState('');
  const [snapshotAuthor, setSnapshotAuthor] = useState('Vinodh S');
  const [snapshotPlatform, setSnapshotPlatform] = useState('HPE ProLiant Gen11 DL385');

  // Ingestion Sub-state
  const [ingestedSheets, setIngestedSheets] = useState<{ name: string; selected: boolean; rowsCount: number }[]>([
    { name: 'Compute Core Base Tab', selected: true, rowsCount: 4 },
    { name: 'Memory Expansion Module', selected: true, rowsCount: 3 },
    { name: 'NVMe Storage Matrix', selected: true, rowsCount: 3 }
  ]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestCompleted, setIngestCompleted] = useState(false);

  // Separate BOQ vs BOM Ingestion and Automated Scraper States
  const [boqFileName, setBoqFileName] = useState<string | null>('Primary_Deal_BOQ_v1.1.xlsx');
  const [bomFileName, setBomFileName] = useState<string | null>(null);
  const [isPlaywrightRunning, setIsPlaywrightRunning] = useState(false);
  const [playwrightLogs, setPlaywrightLogs] = useState<string[]>([]);
  const [playwrightProgress, setPlaywrightProgress] = useState(0);

  // Pre-Intelligence Gating Validation state
  const [isAuditingRules, setIsAuditingRules] = useState(false);
  const [ruleAudited, setRuleAudited] = useState(false);
  const [governanceChecks, setGovernanceChecks] = useState({
    taaCompliance: { status: 'PASS', message: 'All items trace to Trade Agreements Act sources.' },
    sovereignGating: { status: 'PASS', message: 'No high-risk sovereign access keys required.' },
    socketParity: { status: 'PASS', message: 'RDIMM configuration aligns to symmetric memory channel rules.' },
    thermalWattBudget: { status: 'PASS', message: 'Calculated load: 840W. Enclosure limit: 1205W.' }
  });

  // Portal Graduation state
  const [selectedPortal, setSelectedPortal] = useState<'HPE' | 'DELL'>('HPE');
  const [gradProgress, setGradProgress] = useState(0);
  const [isGraduating, setIsGraduating] = useState(false);
  const [certifiedUcid, setCertifiedUcid] = useState<string | null>(null);

  // Self learning Feedback / syn dict list
  const [synonyms, setSynonyms] = useState<{ id: string; alias: string; standardSku: string; approved: boolean }[]>([
    { id: '1', alias: 'EPYC high core 96', standardSku: 'P50465-B21', approved: true },
    { id: '2', alias: 'HPE 64GB RDIMM modules', standardSku: 'P43328-B21', approved: true },
    { id: '3', alias: 'PCIe Gen5 Controller 8-port', standardSku: 'P49049-B21', approved: false }
  ]);
  const [newAlias, setNewAlias] = useState('');
  const [newStandardSku, setNewStandardSku] = useState('');

  // Toast notifier
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Hydrate Initial Deal Versions on load
  useEffect(() => {
    const defaultVersions: DealVersion[] = [
      {
        id: 'VER-001',
        version: '1.0',
        title: 'Initial Enterprise Proposal',
        description: 'Standard baseline sapphire rapids configurations compiled for general VMs cloud workloads.',
        timestamp: '2026-05-30 14:12:05',
        ucid: 'UCID-09874531',
        totalCost: 19800,
        netDrift: 0,
        rowCount: 4,
        platform: 'HPE ProLiant Gen11 DL380',
        author: 'Systems Team',
        rows: [
          {
            id: 'demo-v1-1', part: 'P50465-B21', partKey: 'P50465B21', boqQty: 2, bomQty: 2, 
            boqDesc: 'Intel Xeon-G 6414U Processor', bomDesc: 'Intel Xeon-G 6414U Processor', 
            category: 'PROCESSOR', config: 'ALPHA-888', status: 'MATCHED', price: 8000, drift: 0
          },
          {
            id: 'demo-v1-2', part: 'P43328-B21', partKey: 'P43328B21', boqQty: 8, bomQty: 8, 
            boqDesc: '64GB RDIMM DDR5 Smart Memory', bomDesc: '64GB RDIMM DDR5 Smart Memory', 
            category: 'MEMORY', config: 'ALPHA-888', status: 'MATCHED', price: 800, drift: 0
          }
        ]
      },
      {
        id: 'VER-002',
        version: '1.1',
        title: 'Alternate Heavy Density Compute',
        description: 'Optimized high performance compute node layout with increased core count and redundant PSUs.',
        timestamp: '2026-05-30 16:30:10',
        ucid: 'UCID-50805014',
        totalCost: 26500,
        netDrift: 700,
        rowCount: 5,
        platform: 'DL385 High-Density EPYC Frame',
        author: 'Vinodh S',
        rows: [
          {
            id: 'demo-v2-1', part: 'P50465-B21', partKey: 'P50465B21', boqQty: 2, bomQty: 2, 
            boqDesc: 'Intel Xeon-G 6414U Processor', bomDesc: 'Intel Xeon-G 6414U Processor', 
            category: 'PROCESSOR', config: 'ALPHA-888', status: 'MATCHED', price: 8000, drift: 0
          },
          {
            id: 'demo-v2-2', part: 'P43328-B21', partKey: 'P43328B21', boqQty: 16, bomQty: 14, 
            boqDesc: '64GB RDIMM DDR5 Smart Memory', bomDesc: '64GB RDIMM Smart Memory Kit', 
            category: 'MEMORY', config: 'ALPHA-888', status: 'QTY_MISMATCH', price: 800, drift: -1600
          },
          {
            id: 'demo-v2-3', part: '865438-B21', partKey: '865438B21', boqQty: 2, bomQty: 2,
            boqDesc: 'Flexible Power Supply Unit 800W', bomDesc: 'Flexible Power Supply Unit 800W Platinum',
            category: 'POWER', config: 'ALPHA-888', status: 'MATCHED', price: 450, drift: 0
          }
        ]
      }
    ];

    try {
      const stored = localStorage.getItem('aether_deal_versions');
      if (stored) {
        setSavedVersions(JSON.parse(stored));
      } else {
        setSavedVersions(defaultVersions);
        localStorage.setItem('aether_deal_versions', JSON.stringify(defaultVersions));
      }
    } catch (e) {
      setSavedVersions(defaultVersions);
    }
  }, []);

  // 2. Action Handlers
  // Simulate multi-sheet Excel file parsing
  const handleSimulateMultiSheetIngest = () => {
    setIsIngesting(true);
    setIngestCompleted(false);

    setTimeout(() => {
      // Create new set of rows representing the merged data
      const mergedRows: DiffRow[] = [
        {
          id: 'ING-01',
          part: 'P50465-B21',
          partKey: 'P50465B21',
          boqQty: 2,
          bomQty: 2,
          boqDesc: 'Intel Xeon Scalable Gold 6430 32-Core Processor',
          bomDesc: 'Intel Xeon-G 6430 Processor Option',
          category: 'PROCESSOR',
          config: activeTab !== 'GLOBAL' ? activeTab : 'ALPHA-888',
          status: 'MATCHED',
          price: 7400,
          drift: 0,
          reasoning: 'Ingested from Base Compute Profile sheet. Processor matched.',
          capabilities: ['32-Cores', '2.1GHz Baseline']
        },
        {
          id: 'ING-02',
          part: 'P43328-B21',
          partKey: 'P43328B21',
          boqQty: 16,
          bomQty: 12,
          boqDesc: 'HPE 64GB Quad-Rank Registered RDIMM Modules',
          bomDesc: 'HPE 64GB RDIMM Smart Memory Kit',
          category: 'MEMORY',
          config: activeTab !== 'GLOBAL' ? activeTab : 'ALPHA-888',
          status: 'QTY_MISMATCH',
          price: 850,
          drift: -3400,
          reasoning: 'Ingested from Memory Expansion Tab. Quantity deficit detected (-4 RDIMMs). Socket rules require balanced channels.',
          capabilities: ['DDR5', 'Registered RDIMM']
        },
        {
          id: 'ING-03',
          part: 'P49049-B21',
          partKey: 'P49049B21',
          boqQty: 4,
          bomQty: 6,
          boqDesc: 'Read-Intensive enterprise NVMe SSD 1.92TB',
          bomDesc: 'HPE 1.92TB Gen5 SFF BC SSD Drive',
          category: 'NVME_DRIVE',
          config: activeTab !== 'GLOBAL' ? activeTab : 'ALPHA-888',
          status: 'QTY_MISMATCH',
          price: 450,
          drift: 900,
          reasoning: 'Ingested from NVMe Storage Matrix. Dynamic excess detected (+2 SSD spares).',
          capabilities: ['PCIe Gen5', 'SFF BC Form']
        },
        {
          id: 'ING-04',
          part: '865438-B21',
          partKey: '865438B21',
          boqQty: 2,
          bomQty: 2,
          boqDesc: 'Standard Flexible Slot 800W Platinum Power Supply',
          bomDesc: 'HPE 800W FS Platinum Hot-Plug PSU',
          category: 'POWER',
          config: activeTab !== 'GLOBAL' ? activeTab : 'ALPHA-888',
          status: 'MATCHED',
          price: 490,
          drift: 0,
          reasoning: 'Merged successfully. Redundant pairing configured.',
          capabilities: ['800W Hot-plug', '94% Efficiency']
        }
      ];

      onRowsUpdate(mergedRows);
      setIsIngesting(false);
      setIngestCompleted(true);
      setActiveStep(2); // Auto advance to Pre-Intelligence
      triggerToast('Merged 3 Excel sheets! Populated 4 active specification rows with physical attributes.');
    }, 1800);
  };

  // Run Playwright headless automation simulated scrape of the vendor configurator portal
  const handleRunPlaywrightSimulation = () => {
    setIsPlaywrightRunning(true);
    setPlaywrightProgress(0);
    setPlaywrightLogs(["🤖 [PLAYWRIGHT] Initializing headless chromium virtual worker..."]);
    
    setTimeout(() => {
      setPlaywrightProgress(20);
      setPlaywrightLogs(prev => [
        ...prev, 
        "🔐 [PLAYWRIGHT] Spawning remote browser page with secure configuration cookies...", 
        "🔑 [PLAYWRIGHT] Authenticated successfully on corporate partner portal under user: vinodhsubramanian@gmail.com"
      ]);
    }, 800);

    setTimeout(() => {
      setPlaywrightProgress(50);
      setPlaywrightLogs(prev => [
        ...prev, 
        "🔍 [PLAYWRIGHT] Target identified: active server basket configurator UID: 'BASKET-2026-X8'...", 
        "🛠️ [PLAYWRIGHT] Extracting dynamic product tree, verifying PCIe riser channel requirements, and reading MSRP ledger keys..."
      ]);
    }, 1600);

    setTimeout(() => {
      setPlaywrightProgress(85);
      setPlaywrightLogs(prev => [
        ...prev, 
        "📥 [PLAYWRIGHT] Siphoning complete spec data. Compiling official manufacturer spreadsheet...", 
        "💾 [PLAYWRIGHT] Document generated and downloaded: SECURE_PORTAL_BOM_REVISION_v3.xlsx (120 KB)"
      ]);
      setBomFileName('SECURE_PORTAL_BOM_REVISION_v3.xlsx');
    }, 2400);

    setTimeout(() => {
      setPlaywrightProgress(100);
      setIsPlaywrightRunning(false);
      setPlaywrightLogs(prev => [...prev, "🎯 [PLAYWRIGHT] Success! Scraped BOM integrated into active Compare matrix. Ready for reconciliation."]);
      
      const simulatedRows: DiffRow[] = [
        {
          id: 'ING-01',
          part: 'P50465-B21',
          partKey: 'P50465B21',
          boqQty: 2,
          bomQty: 2,
          boqDesc: 'Intel Xeon Scalable Gold 6430 32-Core Processor',
          bomDesc: 'Intel Xeon-G 6430 Processor Option',
          category: 'PROCESSOR',
          config: activeTab !== 'GLOBAL' ? activeTab : 'ALPHA-888',
          status: 'MATCHED',
          price: 7400,
          drift: 0,
          reasoning: 'Ingested from Base Compute Profile sheet. Processor matched.',
          capabilities: ['32-Cores', '2.1GHz Baseline']
        },
        {
          id: 'ING-02',
          part: 'P43328-B21',
          partKey: 'P43328B21',
          boqQty: 16,
          bomQty: 12,
          boqDesc: 'HPE 64GB Quad-Rank Registered RDIMM Modules',
          bomDesc: 'HPE 64GB RDIMM Smart Memory Kit',
          category: 'MEMORY',
          config: activeTab !== 'GLOBAL' ? activeTab : 'ALPHA-888',
          status: 'QTY_MISMATCH',
          price: 850,
          drift: -3400,
          reasoning: 'Ingested from Memory Expansion Tab. Quantity deficit detected (-4 RDIMMs). Socket rules require balanced channels.',
          capabilities: ['DDR5', 'Registered RDIMM']
        },
        {
          id: 'ING-03',
          part: 'P49049-B21',
          partKey: 'P49049B21',
          boqQty: 4,
          bomQty: 6,
          boqDesc: 'Read-Intensive enterprise NVMe SSD 1.92TB',
          bomDesc: 'HPE 1.92TB Gen5 SFF BC SSD Drive',
          category: 'NVME_DRIVE',
          config: activeTab !== 'GLOBAL' ? activeTab : 'ALPHA-888',
          status: 'QTY_MISMATCH',
          price: 450,
          drift: 900,
          reasoning: 'Ingested from NVMe Storage Matrix. Dynamic excess detected (+2 SSD spares).',
          capabilities: ['PCIe Gen5', 'SFF BC Form']
        },
        {
          id: 'ING-04',
          part: '865438-B21',
          partKey: '865438B21',
          boqQty: 2,
          bomQty: 2,
          boqDesc: 'Standard Flexible Slot 800W Platinum Power Supply',
          bomDesc: 'HPE 800W FS Platinum Hot-Plug PSU',
          category: 'POWER',
          config: activeTab !== 'GLOBAL' ? activeTab : 'ALPHA-888',
          status: 'MATCHED',
          price: 490,
          drift: 0,
          reasoning: 'Merged successfully. Redundant pairing configured.',
          capabilities: ['800W Hot-plug', '94% Efficiency']
        }
      ];

      onRowsUpdate(simulatedRows);
      setIngestCompleted(true);
      triggerToast('Scraped manufacturer BOM safely integrated with Client BOQ requirements!');
    }, 3200);
  };

  // Run Pre-intelligence simulation audits
  const handleRunPreIntelligenceAudits = () => {
    setIsAuditingRules(true);
    setRuleAudited(false);

    setTimeout(() => {
      // If we have mismatched memory, flag it in rules!
      const hasMemoryMismatch = currentRows.some(r => r.category === 'MEMORY' && r.status !== 'MATCHED');
      
      setGovernanceChecks({
        taaCompliance: { status: 'PASS', message: 'All active SKUs pass sovereign TAA supply alignment criteria.' },
        sovereignGating: { status: 'PASS', message: 'No unauthorized localized telemetry requirements present.' },
        socketParity: { 
          status: hasMemoryMismatch ? 'WARNING' : 'PASS', 
          message: hasMemoryMismatch 
            ? 'Channel deficit detected. Enforced even socket populating rule on memory matrix to protect performance bounds.' 
            : 'Symmetric channel memory spacing checks completed successfully.'
        },
        thermalWattBudget: { 
          status: 'PASS', 
          message: 'Estimated aggregate socket draw is 870W. Well below the 2U enclosure power threshold of 1205W.' 
        }
      });
      setIsAuditingRules(false);
      setRuleAudited(true);
      setActiveStep(3); // Auto advance to Reconciliation
      triggerToast('Pre-Intelligence Rules Audit completed! Registered 1 Warning.');
    }, 1500);
  };

  // Auto-resolve drift delta in current active workspace
  const handleAutoReconcileDrift = () => {
    if (currentRows.length === 0) return;

    const reconciled = currentRows.map(row => {
      if (row.status !== 'MATCHED') {
        return {
          ...row,
          bomQty: row.boqQty, // heal to match BOQ intensity exactly
          status: 'MATCHED' as RowStatus,
          drift: 0,
          reasoning: 'Healed and reconciled by Deep Learning synthesis algorithms. Injected layout symmetries.',
          trace: [...(row.trace || []), 'Auto-resolve: Adjusted BOM quantity option to balance drift values.']
        };
      }
      return row;
    });

    onRowsUpdate(reconciled);
    setActiveStep(4); // Advance to Manufacturer Graduation
    triggerToast('Reconciled all Spec quantities! Erased drift deficit.');
  };

  // Push to manufacturer portal graduation
  const handlePushToPortalGraduation = () => {
    setIsGraduating(true);
    setGradProgress(0);

    const interval = setInterval(() => {
      setGradProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGraduating(false);
          const newUcid = selectedPortal === 'HPE' ? 'UCID-88694034A1' : 'DELL-TAG-X94025Y';
          setCertifiedUcid(newUcid);
          onSetConfigIdPrefix(newUcid);
          onSetPlatformContext(selectedPortal === 'HPE' ? 'HPE ProLiant Server Frame' : 'Dell PowerEdge Balanced Chassis');
          setActiveStep(5); // Advance to Feedback loop
          triggerToast(`Portal Graduation Certified! Secured verified registration key: ${newUcid}`);
          return 100;
        }
        return prev + 25;
      });
    }, 600);
  };

  // Commit dynamic snapshot version
  const handleCommitSnapshot = () => {
    if (!snapshotTitle.trim()) {
      triggerToast('Please provide a descriptive title for this version commit.');
      return;
    }

    const nextId = `VER-${Date.now().toString().slice(-4)}`;
    const cumulativeMSRP = currentRows.reduce((acc, r) => acc + (r.bomQty * r.price), 0);
    const overallDrift = currentRows.reduce((acc, r) => acc + r.drift, 0);

    const newVer: DealVersion = {
      id: nextId,
      version: snapshotVer,
      title: snapshotTitle.trim(),
      description: snapshotDesc.trim() || 'No description notes included.',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ucid: certifiedUcid || 'SPECULATIVE_DNA',
      totalCost: cumulativeMSRP,
      netDrift: overallDrift,
      rowCount: currentRows.length,
      platform: snapshotPlatform,
      author: snapshotAuthor,
      rows: [...currentRows]
    };

    const updated = [newVer, ...savedVersions];
    setSavedVersions(updated);
    localStorage.setItem('aether_deal_versions', JSON.stringify(updated));
    
    setIsSnapshotModalOpen(false);
    setSnapshotTitle('');
    setSnapshotDesc('');
    setSnapshotVer((parseFloat(snapshotVer) + 0.1).toFixed(1));
    triggerToast(`Committed deal version ${newVer.version} to database logs!`);
  };

  // Restore saved deal revision to active workspace
  const handleRestoreVersion = (ver: DealVersion) => {
    onRowsUpdate(ver.rows);
    onSetConfigIdPrefix(ver.ucid);
    onSetPlatformContext(ver.platform);
    triggerToast(`Restored baseline layout configurations from version ${ver.version} (${ver.title})`);
  };

  // Delete version revision
  const handleDeleteVersion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedVersions.filter(v => v.id !== id);
    setSavedVersions(updated);
    localStorage.setItem('aether_deal_versions', JSON.stringify(updated));
    // Clear selection if deleted
    setSelectedVersionsToCompare(prev => prev.filter(vId => vId !== id));
    triggerToast('Deal version removed from tracker index.');
  };

  // Multi version compared analysis toggle
  const toggleSelectForComparison = (verId: string) => {
    setSelectedVersionsToCompare(prev => {
      if (prev.includes(verId)) {
        return prev.filter(id => id !== verId);
      }
      if (prev.length >= 2) {
        // Enforce max 2 compared items
        return [prev[1], verId];
      }
      return [...prev, verId];
    });
  };

  // Add synonym helper mapping aliases
  const handleAddSynonym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlias.trim() || !newStandardSku.trim()) return;

    const nextSyn = {
      id: `SYN-${Date.now()}`,
      alias: newAlias.trim(),
      standardSku: newStandardSku.trim().toUpperCase(),
      approved: true
    };

    setSynonyms([...synonyms, nextSyn]);
    setNewAlias('');
    setNewStandardSku('');
    triggerToast(`Dynamic alias "${nextSyn.alias}" registered into system SKU dictionary!`);
  };

  // Financial calculations
  const totalPricing = currentRows.reduce((acc, r) => acc + (r.bomQty * r.price), 0);
  const driftDeltaVal = currentRows.reduce((acc, r) => acc + r.drift, 0);

  // Compare metadata profiles
  const compared1 = savedVersions.find(v => v.id === selectedVersionsToCompare[0]);
  const compared2 = savedVersions.find(v => v.id === selectedVersionsToCompare[1]);

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Toast Notification Top Ingress */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white border border-slate-700 px-5 py-3 rounded-xl shadow-xl animate-scale-up text-xs font-semibold flex items-center gap-2 max-w-sm">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Overview & Progress State */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-650" />
            <span>End-to-End Enterprise Intelligence Flow</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            A seamless, zero-clutter workspace capturing the entire lifecycle of enterprise deals from spreadsheet parsing up to verified graduation logs.
          </p>
        </div>

        {/* Current status indicators */}
        <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex flex-col text-right leading-none">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Ledger Value</span>
            <span className="text-sm font-bold text-indigo-705 mt-1 font-mono">${totalPricing.toLocaleString()}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex flex-col text-right leading-none">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Drift Discrepancy</span>
            <span className={`text-sm font-bold mt-1 font-mono ${driftDeltaVal === 0 ? 'text-emerald-600' : driftDeltaVal > 0 ? 'text-rose-550' : 'text-cyan-600'}`}>
              {driftDeltaVal === 0 ? '$0' : driftDeltaVal > 0 ? `+$${driftDeltaVal}` : `-$${Math.abs(driftDeltaVal)}`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Pipeline Stages Selector Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { id: 1, title: 'Sheet Ingestion', icon: FileSpreadsheet, desc: 'Excel parsing tab' },
          { id: 2, title: 'Pre-Intelligence', icon: ShieldCheck, desc: 'Governance gating checks' },
          { id: 3, title: 'Reconciliation', icon: Sliders, desc: 'Resolve physical delta' },
          { id: 4, title: 'manufacturer Portal', icon: Network, desc: 'Graduation Certification' },
          { id: 5, title: 'Self-Learning Loop', icon: RefreshCw, desc: 'Synonyms & Knowledge Loop' }
        ].map(stage => {
          const isDone = stage.id < activeStep;
          const isActive = stage.id === activeStep;
          const StepIcon = stage.icon;

          return (
            <button
              key={stage.id}
              onClick={() => setActiveStep(stage.id)}
              className={`p-4 rounded-xl border text-left flex flex-col gap-2.5 transition-all outline-none cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-[1.01]' 
                  : isDone 
                  ? 'bg-emerald-50/50 border-emerald-250 text-slate-700 hover:bg-emerald-50 transition-colors' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-650 text-white' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-550'}`}>
                  {isDone ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                </span>
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase">
                  {isDone ? 'Completed' : isActive ? 'Active Step' : `Phase 0${stage.id}`}
                </span>
              </div>
              <div className="leading-tight mt-1">
                <h4 className="font-bold text-xs">{stage.title}</h4>
                <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{stage.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Selected Active Stage Controller Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[290px] flex flex-col justify-between">
        {activeStep === 1 && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slice-100 pb-4 text-left">
              <span className="text-[10px] font-mono font-black tracking-widest text-indigo-605 uppercase">Phase 01 — Dual-Channel File Ingestion System</span>
              <h3 className="font-bold text-slate-900 text-sm mt-1 uppercase">Clarity of Separate Inputs: BOQ Upload vs. Playwright BOM Extraction</h3>
              <p className="text-xs text-slate-505 mt-2 leading-relaxed">
                A secure comparison requires loading two distinct sources: the customer's requested <strong>Bill of Quantities (BOQ)</strong> file and the server manufacturer's official <strong>Bill of Materials (BOM)</strong>. Since retrieving the live BOM requires logging into locked distributor portals, you can upload a local BOM spreadsheet or run our automated service to extract it directly.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Client BOQ Input */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between text-left relative gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-teal-50 border border-teal-200 text-teal-700 uppercase">
                      🗳️ Client Request (BOQ)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Channel 01</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">1. Customer Bill of Quantities Spreadsheet</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Upload the raw physical requirements, multi-sheet procurement specifications, or hardware lists designated directly by the customer's architects.
                  </p>

                  <div className="bg-white border rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5" />
                      </span>
                      <div className="text-left">
                        <span className="text-xs font-semibold text-slate-800 block truncate max-w-[190px]">
                          {boqFileName || "No BOQ Sheet selected"}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          {boqFileName ? "Excel Workbook • 12 KB • Uploaded" : "Drag and drop or click below"}
                        </span>
                      </div>
                    </div>
                    {boqFileName ? (
                      <button 
                        onClick={() => { setBoqFileName(null); triggerToast("Cleared BOQ."); }}
                        className="text-slate-400 hover:text-slate-600 font-bold font-mono text-xs cursor-pointer p-1"
                      >
                        Clear
                      </button>
                    ) : (
                      <button 
                        onClick={() => { setBoqFileName("Client_Req_BOQ_Gen12.xlsx"); triggerToast("Loaded BOQ."); }}
                        className="text-indigo-600 hover:text-indigo-700 font-bold font-mono text-xs cursor-pointer bg-indigo-50 px-2.5 py-1 rounded"
                      >
                        Upload
                      </button>
                    )}
                  </div>

                  {/* Multi Tab Sheet Selector checklist representation */}
                  {boqFileName && (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-2 shadow-2xs">
                      <span className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider">Identified Excel Tabs/Sheets:</span>
                      <div className="flex flex-col gap-1.5 select-none text-[11px]">
                        {ingestedSheets.map((sheet, index) => (
                          <label key={sheet.name} className="flex items-center gap-2 cursor-pointer hover:text-slate-900 font-semibold text-slate-600 transition-colors">
                            <input
                              type="checkbox"
                              checked={sheet.selected}
                              onChange={() => {
                                const updated = [...ingestedSheets];
                                updated[index].selected = !updated[index].selected;
                                setIngestedSheets(updated);
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                            />
                            <span>{sheet.name}</span>
                            <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1 py-0.5 rounded ml-auto">
                              {sheet.rowsCount} parts
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 text-slate-400 text-[10px] italic">
                  * Real-time fuzzy alignment automatically matches these user sheets during analysis.
                </div>
              </div>

              {/* Right Column: Portal BOM Input */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between text-left relative gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase">
                      ⚙️ Manufacturer Portal (BOM)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Channel 02</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">2. Official Manufacturing Configurator BOM</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Retrieve the official HPE/Dell configuration specification. You can drag and drop a pre-downloaded XLSX files, or test our <strong>Playwright web crawler routine</strong> to log in and extract it automatically.
                  </p>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-indigo-50 text-indigo-650 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                      </span>
                      <div className="text-left">
                        <span className="text-xs font-semibold text-slate-800 block truncate max-w-[190px]">
                          {bomFileName || "Waiting for BOM Extract"}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          {bomFileName ? "Web Extracted XLS • 120 KB" : "Click below to auto-fetch via Scraper"}
                        </span>
                      </div>
                    </div>
                    {bomFileName && (
                      <button 
                        onClick={() => { setBomFileName(null); triggerToast("BOM removed."); }}
                        className="text-slate-400 hover:text-slate-600 font-bold font-mono text-xs cursor-pointer p-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Playwright Headless Terminal Simulator */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Playwright Scraping Actions Panel:</span>
                    {isPlaywrightRunning ? (
                      <div className="bg-slate-950 text-indigo-300 p-3.5 rounded-xl font-mono text-[9px] flex flex-col gap-1 shadow-inner h-28 overflow-y-auto border border-slate-900 select-text">
                        <div className="flex items-center justify-between text-[10px] text-white border-b border-slate-900 pb-1 mb-1 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-yellow-450 rounded-full animate-ping" />
                            Scraper Status: {playwrightProgress}% Complete
                          </span>
                          <span>Chromium Headless DBV</span>
                        </div>
                        {playwrightLogs.map((log, lIdx) => (
                          <div key={lIdx} className="leading-tight text-indigo-250 italic font-mono">{log}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleRunPlaywrightSimulation}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-semibold text-[10px] rounded-lg tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm uppercase transition-transform active:scale-[0.99]"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>Run Headless Playwright Portal Automation</span>
                        </button>
                        <p className="text-[10px] text-slate-400 text-center">
                          Playwright automatically loads configuration options, matching chassis limits, memory slots, and imports standard SKUs.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-slate-400 text-[10px]">
                  {bomFileName ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 leading-none uppercase">
                      <Check className="w-3 h-3 text-emerald-500" /> BOM channel loaded!
                    </span>
                  ) : (
                    <span>* Requires Playwright extraction or manual XLSX drops.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Ingestion triggers and indicators summary line */}
            <div className="bg-indigo-50/20 border border-indigo-100 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 text-left">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 uppercase font-mono block">Data Ingestion Status</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {ingestCompleted 
                    ? "Both Spec Sheets loaded in memory. Ready to proceed to Pre-Intelligence security checks!"
                    : "Upload BOQ and execute Playwright remote worker extraction to proceed."
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setBoqFileName("Client_Req_BOQ_Gen12.xlsx");
                    setBomFileName("SECURE_PORTAL_BOM_REVISION_v3.xlsx");
                    handleSimulateMultiSheetIngest();
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-indigo-400" />
                  <span>Interactive Hybrid Simulation (All Sheets)</span>
                </button>

                {ingestCompleted && (
                  <button
                    onClick={() => setActiveStep(2)}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-transform"
                  >
                    <span>Run Governance Gate Audit</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: Pre-Intelligence Gating */}
        {activeStep === 2 && (
          <div className="flex flex-col gap-5 text-left">
            <div>
              <span className="text-[10px] font-mono font-black tracking-widest text-indigo-605 uppercase">Phase 02 — Rule intelligence center</span>
              <h3 className="font-bold text-slate-900 text-sm mt-1 uppercase">Pre-Intelligence Security and Layout Audits</h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Before exporting or pushing proposed designs to manufacture systems, we analyze supply safety restrictions, physical limits (wattage draw, chassis fitment), and compliance frameworks.
              </p>
            </div>

            {/* Audit compliance results list cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(governanceChecks).map(([key, val]) => {
                const value = val as { status: string; message: string };
                const label = key.replace(/([A-Z])/g, ' $1').toUpperCase();
                const isPass = value.status === 'PASS';
                return (
                  <div key={key} className={`p-4 border rounded-xl flex items-start gap-3 transition-colors ${
                    isPass ? 'bg-emerald-50/20 border-emerald-150' : 'bg-amber-50/20 border-amber-155'
                  }`}>
                    <span className={`p-1 rounded-lg shrink-0 ${isPass ? 'bg-emerald-100/80 text-emerald-600' : 'bg-amber-100/80 text-amber-600 animate-pulse'}`}>
                      {isPass ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </span>
                    <div className="leading-normal text-left">
                      <div className="flex gap-2 items-center">
                        <h4 className="font-bold text-xs text-slate-800 font-mono tracking-wide">{label}</h4>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold font-mono uppercase ${
                          isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700 font-black'
                        }`}>
                          {value.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{value.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={handleRunPreIntelligenceAudits}
                disabled={isAuditingRules}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white font-bold text-xs rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5 transition-transform hover:scale-101"
              >
                {isAuditingRules ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>Execute Complete Pre-Intelligence Rule Audit</span>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: Siphoning & Reconciliation Matrix */}
        {activeStep === 3 && (
          <div className="flex flex-col gap-4 text-left">
            <div>
              <span className="text-[10px] font-mono font-black tracking-widest text-indigo-605 uppercase">Phase 03 — Spec validation & siphoning</span>
              <h3 className="font-bold text-slate-900 text-sm mt-1 uppercase">Drift Accounting & Power Redundancy Reconciliation</h3>
              <p className="text-xs text-slate-500 mt-1">
                Align quantities dynamically. Adjusting memory counts to correct channel populations or securing balanced redundant Power controller sets protects system stability.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-205 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-start gap-3 text-left">
                <span className="p-2 bg-indigo-50/80 rounded-xl text-indigo-705 mt-0.5">
                  <Sliders className="w-4 h-4 text-indigo-650 animate-pulse" />
                </span>
                <div>
                  <h4 className="font-bold text-xs text-slate-850 uppercase font-mono">Dynamic Alignment Optimizer</h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-lg leading-relaxed">
                    Instantly resolve current inventory quantity delta matching requirements (siphoning excess parts or injecting correct part substitutions automatically to reach target configurations).
                  </p>
                </div>
              </div>

              <button
                onClick={handleAutoReconcileDrift}
                disabled={currentRows.length === 0}
                className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-lg shadow-sm font-mono uppercase cursor-pointer tracking-wider shrink-0"
              >
                Auto-Align Spec Drift
              </button>
            </div>

            <div className="text-[11px] text-slate-450 border-t border-slate-150 pt-2 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Matching uses native balanced core placement rules. Restoring alignment reduces Spec risk and unlocks certified physical validation badges.</span>
            </div>
          </div>
        )}

        {/* PHASE 4: Partner Portal Graduation */}
        {activeStep === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center text-left">
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-mono font-black tracking-widest text-indigo-605 uppercase">Phase 04 — Manufacturer Secure Graduation</span>
                <h3 className="font-bold text-slate-900 text-sm mt-1 uppercase">Promote Verified Blueprint Payload to Manufacturer Portal</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Export fully validated, neutral-drift spec topologies to vendor portals via authenticated stubs. This locks physical configurations and acquires a unique certified UCID key.
                </p>
              </div>

              {/* Vendor Selector radio options */}
              <div className="flex gap-3">
                {(['HPE', 'DELL'] as const).map(portal => (
                  <button
                    key={portal}
                    type="button"
                    onClick={() => {
                      setSelectedPortal(portal);
                      setCertifiedUcid(null);
                    }}
                    className={`flex-1 p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      selectedPortal === portal 
                        ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900' 
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-550'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs uppercase">{portal} Partner Portal</span>
                      <input 
                        type="radio" 
                        checked={selectedPortal === portal} 
                        onChange={() => {}}
                        className="text-indigo-600 border-slate-300 pointer-events-none" 
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block leading-none mt-1">
                      {portal === 'HPE' ? 'UCID & Cloud Integration Stub' : 'PowerEdge Specs XML Generation'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Progress/State box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 relative justify-center min-h-[180px]">
              {isGraduating ? (
                <div className="flex flex-col gap-3 items-center text-center">
                  <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden max-w-xs">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${gradProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600">
                    Graduating payload specs to {selectedPortal} system... ({gradProgress}%)
                  </span>
                </div>
              ) : certifiedUcid ? (
                <div className="flex flex-col gap-2 items-center text-center py-2 animate-scale-up">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  <div className="leading-tight mt-1">
                    <h4 className="font-bold text-slate-900 text-xs">GRADUATION CERTIFIED SUCCESSFUL</h4>
                    <span className="text-[10px] text-slate-500">UCID: </span>
                    <strong className="text-xs text-indigo-650 font-mono tracking-wider">{certifiedUcid}</strong>
                  </div>
                  <p className="text-[10px] text-slate-450 max-w-xs mt-1">
                    This specification signature has been permanently registered in manufacturing validation portals.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 gap-4">
                  <HelpCircle className="w-8 h-8 text-slate-400 animate-pulse" />
                  <div className="text-center leading-tight">
                    <h5 className="font-bold text-slate-700 text-xs uppercase font-mono">Graduation Token Awaiting</h5>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                      Review structural rules diagnostics and trigger submission payloads below.
                    </p>
                  </div>
                  <button
                    onClick={handlePushToPortalGraduation}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer shadow-sm transition-colors"
                  >
                    Transmit specs payload
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PHASE 5: Self Learning Knowledge Loop */}
        {activeStep === 5 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-mono font-black tracking-widest text-indigo-605 uppercase">Phase 05 — self-learning loop feedback</span>
                <h3 className="font-bold text-slate-900 text-sm mt-1 uppercase">Dynamic SKU mapping database & Continuous Learning</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Every manual repair, SKU replacement, or custom correction is analyzed. By storing spelling variations, regional abbreviations, or supplier synonyms into a matching dictionary, we ensure subsequent ingestions resolve matching layout limits correctly.
                </p>
              </div>

              {/* Form to insert custom dynamic synonyms */}
              <form onSubmit={handleAddSynonym} className="bg-slate-50 p-4 border border-slate-205 rounded-xl flex flex-col gap-3">
                <span className="text-[9px] font-mono font-bold uppercase text-slate-450 tracking-wider">Register Custom SKU Synonym Mapping:</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono font-bold uppercase text-slate-550">Alias Synonym Code/Text</label>
                    <input
                      type="text"
                      placeholder="e.g. 64GB RDIMMs DDR5"
                      value={newAlias}
                      onChange={e => setNewAlias(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 tracking-wide focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono font-bold uppercase text-slate-550">Canonical Standard Model SKU</label>
                    <input
                      type="text"
                      placeholder="e.g. P43328-B21"
                      value={newStandardSku}
                      onChange={e => setNewStandardSku(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg tracking-wider uppercase cursor-pointer transition-colors"
                >
                  Map Synonym Pair
                </button>
              </form>
            </div>

            {/* Active System mappings list viewport */}
            <div className="border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 min-h-[220px]">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-650 tracking-wider">Dynamic Learning Synonym Index:</span>
              <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-48 custom-scrollbar divide-dashed pr-1 text-xs">
                {synonyms.map(syn => (
                  <div key={syn.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">{syn.alias}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Canonical Part Target → {syn.standardSku}</span>
                    </div>
                    <span className="text-[8px] font-mono font-bold uppercase bg-emerald-100 text-emerald-705 px-1.5 py-0.5 rounded-sm">
                      LEARNED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Snapshots Commits and Deal Versions Tracking Deck */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-650" />
              <span>Speculative Versions & Layout Snapshot Ledger</span>
            </h3>
            <p className="text-xs text-slate-550 mt-1">
              Select precisely <strong>two</strong> deal versions from the index list below to calculate comparative architectural gaps side-by-side.
            </p>
          </div>

          <button
            onClick={() => setIsSnapshotModalOpen(true)}
            className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 hover:scale-101 border text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl cursor-pointer shadow-sm transition-transform flex items-center gap-1.5"
          >
            <GitCommit className="w-4 h-4 animate-bounce" />
            <span>Commit Layout Snapshot</span>
          </button>
        </div>

        {/* Database saved profiles card list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedVersions.map(ver => {
            const isComparing = selectedVersionsToCompare.includes(ver.id);
            return (
              <div
                key={ver.id}
                onClick={() => toggleSelectForComparison(ver.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative hover:shadow-md flex flex-col justify-between gap-4 select-none ${
                  isComparing 
                    ? 'border-indigo-600 ring-2 ring-indigo-500/10 bg-indigo-50/5' 
                    : 'border-slate-200 bg-white hover:border-slate-350'
                }`}
              >
                {/* select ring bullet */}
                <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border flex items-center justify-center ${
                  isComparing ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {isComparing && <Check className="w-2.5 h-2.5 font-bold" />}
                </div>

                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded-lg border border-indigo-100">
                      v{ver.version}
                    </span>
                    <strong className="text-xs text-slate-850 font-bold max-w-[150px] truncate block">{ver.title}</strong>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{ver.description}</p>
                </div>

                {/* mini cost parameters metadata */}
                <div className="mt-2 border-t border-slate-100 pt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-mono text-slate-500 leading-none">
                  <div>
                    <span>Total MSRP: </span>
                    <strong className="text-slate-800 font-bold">${ver.totalCost?.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Net Drift: </span>
                    <strong className={`${ver.netDrift === 0 ? 'text-emerald-600' : 'text-slate-800 font-bold'}`}>
                      ${ver.netDrift?.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span>Items: </span>
                    <strong className="text-slate-850 font-bold">{ver.rowCount}</strong>
                  </div>
                  <div className="w-full mt-1.5 flex justify-between items-center text-[9px] text-slate-400">
                    <span>{ver.timestamp}</span>
                    <span className="text-indigo-650 font-bold font-mono">{ver.ucid}</span>
                  </div>
                </div>

                {/* Restoration click helper */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestoreVersion(ver);
                    }}
                    className="flex-1 py-1.5 bg-slate-50 hover:bg-indigo-50 text-indigo-705 border border-slate-200 hover:border-indigo-150 font-bold text-[10px] rounded-lg cursor-pointer transition-colors"
                  >
                    Restore Baseline Workspace
                  </button>
                  <button
                    onClick={(e) => handleDeleteVersion(ver.id, e)}
                    className="p-1.5 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-550 rounded-lg cursor-pointer hover:bg-rose-50/50 transition-colors"
                    title="Remove snapshot version"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. SPECULATIVE SIDE-BY-SIDE DEAL SOLUTION COMPARISON VIEW */}
        {selectedVersionsToCompare.length === 2 && compared1 && compared2 && (
          <div className="mt-4 border border-indigo-100 bg-indigo-50/5 rounded-2xl p-6 animate-scale-up text-left">
            <h4 className="text-xs font-bold text-indigo-900 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-2.5 mb-4">
              <Layers className="w-4 h-4 text-indigo-650" />
              <span>Side-by-Side Speculative Deal Solution Comparison (v{compared1.version} vs v{compared2.version})</span>
            </h4>

            {/* Specs comparison parameters layout table */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-indigo-100 pb-5 mb-5">
              {/* Factor parameters labels */}
              <div className="flex flex-col gap-4 font-bold text-xs text-slate-700 justify-center">
                <div className="border-b border-dashed border-slate-200 pb-2 flex justify-between items-center text-slate-450 uppercase font-mono text-[10px]">
                  <span>Metric Parameter</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span>Compilation Author:</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span>Target Chassis Platform:</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span>Registered Partner UCID:</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span>Active Ledger Cost:</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Net Spec Drift Difference:</span>
                </div>
              </div>

              {/* Version 1 profile comparison values */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl text-left flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center font-mono">
                  <span className="font-bold text-indigo-705 text-xs">v{compared1.version} Core Target</span>
                  <span className="text-[10px] text-slate-450">{compared1.timestamp.split(' ')[0]}</span>
                </div>
                <div className="text-xs text-slate-800 font-medium py-1">{compared1.author}</div>
                <div className="text-xs text-slate-800 font-medium py-1 truncate">{compared1.platform}</div>
                <div className="text-xs text-indigo-650 font-semibold font-mono py-1">{compared1.ucid}</div>
                <div className="text-xs font-bold text-slate-900 font-mono py-1">${compared1.totalCost?.toLocaleString()}</div>
                <div className="text-xs text-slate-800 font-mono py-1">
                  ${compared1.netDrift?.toLocaleString()}
                </div>
              </div>

              {/* Version 2 profile comparison values */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl text-left flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center font-mono">
                  <span className="font-bold text-indigo-705 text-xs">v{compared2.version} Spec Target</span>
                  <span className="text-[10px] text-slate-450">{compared2.timestamp.split(' ')[0]}</span>
                </div>
                <div className="text-xs text-slate-800 font-medium py-1">{compared2.author}</div>
                <div className="text-xs text-slate-800 font-medium py-1 truncate">{compared2.platform}</div>
                <div className="text-xs text-indigo-650 font-semibold font-mono py-1">{compared2.ucid}</div>
                <div className="text-xs font-bold text-slate-900 font-mono py-1">${compared2.totalCost?.toLocaleString()}</div>
                <div className="text-xs text-slate-800 font-mono py-1">
                  ${compared2.netDrift?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Direct Line item drift discrepancies comparison report detail */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-450">Architectural line items gap checklist:</span>
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                <div className="px-5 py-3 flex text-slate-500 font-semibold font-mono text-[10px] uppercase">
                  <span className="w-1/3">Canonical part SKU</span>
                  <span className="w-1/4 text-center">v{compared1.version} Qty</span>
                  <span className="w-1/4 text-center">v{compared2.version} Qty</span>
                  <span className="w-1/6 text-right">MSRP Unit Price</span>
                </div>
                
                {/* Aggregate active item targets to render rows comparison checklist */}
                {Array.from(new Set([
                  ...compared1.rows.map(r => r.part),
                  ...compared2.rows.map(r => r.part)
                ])).map(partNo => {
                  const r1 = compared1.rows.find(r => r.part === partNo);
                  const r2 = compared2.rows.find(r => r.part === partNo);
                  const itemPrice = r1?.price || r2?.price || 0;
                  const desc = r1?.boqDesc || r2?.boqDesc || '';

                  return (
                    <div key={partNo} className="px-5 py-3.5 flex items-center text-slate-705">
                      <div className="w-1/3 text-left">
                        <strong className="font-mono text-slate-900 font-bold">{partNo}</strong>
                        <span className="text-[10px] text-slate-500 truncate block font-medium mt-0.5">{desc}</span>
                      </div>
                      <span className="w-1/4 text-center font-mono font-semibold">{r1?.bomQty ?? 0} units</span>
                      <span className="w-1/4 text-center font-mono font-semibold">{r2?.bomQty ?? 0} units</span>
                      <span className="w-1/6 text-right font-mono font-bold text-slate-850">${itemPrice?.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delta value summation box */}
            <div className="bg-slate-900 text-white rounded-xl p-4 mt-4 flex justify-between items-center font-mono text-xs">
              <span className="uppercase font-bold text-[10px] text-slate-400">Total Solution Budget Discrepancy delta:</span>
              <strong className="text-sm font-bold text-indigo-305">
                ${Math.abs(compared1.totalCost - compared2.totalCost).toLocaleString()} Budget Difference ({compared1.totalCost > compared2.totalCost ? `v${compared1.version} leads` : `v${compared2.version} leads`})
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* SNAPSHOT CREATION MODAL DIALOG */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-250 w-full max-w-md rounded-2xl p-6 shadow-2xl relative flex flex-col gap-4 animate-scale-up text-left">
            <div>
              <h4 className="font-bold text-slate-900 text-sm uppercase font-mono">Commit Layout Configuration Snapshot</h4>
              <p className="text-xs text-slate-500 mt-1">
                Pin the current active configuration lines state to the versions revision index to maintain historical context of transaction progression.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1 col-span-1">
                <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Version No.</label>
                <input
                  type="text"
                  placeholder="e.g. 1.2"
                  value={snapshotVer}
                  onChange={e => setSnapshotVer(e.target.value)}
                  className="w-full bg-white border border-slate-205 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Compiler Author</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={snapshotAuthor}
                  onChange={e => setSnapshotAuthor(e.target.value)}
                  className="w-full bg-white border border-slate-205 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-semibold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Chassis Platform Family Context</label>
              <input
                type="text"
                placeholder="e.g. HPE ProLiant DL385 High Density"
                value={snapshotPlatform}
                onChange={e => setSnapshotPlatform(e.target.value)}
                className="w-full bg-white border border-slate-205 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Commit Label Title</label>
              <input
                type="text"
                placeholder="Unique identifier name for this design revision..."
                value={snapshotTitle}
                onChange={e => setSnapshotTitle(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-105"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Audit Compilation Notes</label>
              <textarea
                rows={3}
                placeholder="Specify specific adjustments made to parts quantity, power redundant adapters, or thermal limits checks..."
                value={snapshotDesc}
                onChange={e => setSnapshotDesc(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-105"
              />
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-50 justify-end">
              <button
                type="button"
                onClick={() => setIsSnapshotModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-655 hover:bg-slate-50 font-bold text-xs rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitSnapshot}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                Save Layout Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
