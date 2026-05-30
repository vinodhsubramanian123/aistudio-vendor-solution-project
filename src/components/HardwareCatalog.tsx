/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CatalogItem, HardwareCategory } from '../types';
import { 
  PlusCircle, Search, Trash2, Edit, X, Shield, ShieldCheck, DollarSign,
  Database, RefreshCw, AlertTriangle, Check, BookOpen, Layers, 
  Network, ArrowRight, Sparkles, HelpCircle, FileSpreadsheet, Play, 
  CheckCircle2, Sliders, Settings2, Info, Cpu, HardDrive, ListCollapse,
  Activity, ArrowUpRight, CheckSquare, Sparkle, UserCheck, AlertCircle
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

// 1. Structure for Chassis Solution Variant Envelopes (Schema)
interface ChassisVariant {
  id: string;
  name: string;
  vendor: 'HPE' | 'DELL' | 'SOVEREIGN_CO';
  generation: string;
  formFactor: '1U' | '2U' | '4U';
  maxCores: number;
  maxDimmSlots: number;
  maxDriveBays: number;
  pcieSlots: number;
  ocpSlots: number;
  maxPowerWatts: number;
  thermalTdpCap: number;
  primaryWorkload: string;
  description: string;
}

export default function HardwareCatalog({ catalogItems, setCatalogItems }: HardwareCatalogProps) {
  // Core navigation perspectives
  const [currentTab, setCurrentTab] = useState<'variants' | 'inventory' | 'scraper' | 'rules'>('variants');

  // Vendor Hierarchy Switcher
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<'ALL' | 'HPE' | 'DELL' | 'SOVEREIGN'>('ALL');
  
  // Selected Chassis Variant for filtering qualified components
  const [activeChassisSelection, setActiveChassisSelection] = useState<string | null>(null);

  // Search & Basic Catalog Item Filter state
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCompliance, setSelectedCompliance] = useState<'ALL' | 'TAA' | 'SOVEREIGN'>('ALL');

  // NLP Constraint Matching Assistant State
  const [nlpQuery, setNlpQuery] = useState('');
  const [nlpMatchedChassis, setNlpMatchedChassis] = useState<string[]>([]);
  const [nlpAnalysisTrace, setNlpAnalysisTrace] = useState<string[]>([]);

  // Telemetry Self-Healing Real-time Monitor Logs (In progress actions)
  const [healingLogs, setHealingLogs] = useState<{ id: string; msg: string; status: 'HEALING' | 'CONVERTED'; timestamp: string }[]>([
    { id: 'h-1', msg: 'Analyzing Dell Premier XML Power Allocation: auto-substituting standard power plugs for heavy-duty C19 configuration under 1600W thermal draws.', status: 'HEALING', timestamp: 'Just now' },
    { id: 'h-2', msg: 'DDR5 Balanced-Channel multi-CPU parity rules discrepancy solved. Auto-adjusted 16 DIMM configuration request list into balanced 12-channel physical population.', status: 'CONVERTED', timestamp: '5 mins ago' }
  ]);

  // Hierarchical Chassis Definitions
  const chassisVariants: ChassisVariant[] = [
    {
      id: 'CHASSIS-HPE-DL385-10DW',
      name: 'ProLiant DL385 Gen11 10DW (AI Super Node)',
      vendor: 'HPE',
      generation: 'Gen11 AMD Genoa/Bergamo',
      formFactor: '2U',
      maxCores: 256,
      maxDimmSlots: 24,
      maxDriveBays: 12,
      pcieSlots: 8,
      ocpSlots: 2,
      maxPowerWatts: 2200,
      thermalTdpCap: 400,
      primaryWorkload: 'AI/ML Training, High-Density Accelerator workloads',
      description: 'Engineered for massive accelerator density with dual balanced socket paths.'
    },
    {
      id: 'CHASSIS-HPE-DL380-SFF',
      name: 'ProLiant DL380 Gen11 Standard SFF',
      vendor: 'HPE',
      generation: 'Gen11 Intel Sapphire Rapids',
      formFactor: '2U',
      maxCores: 128,
      maxDimmSlots: 32,
      maxDriveBays: 24,
      pcieSlots: 8,
      ocpSlots: 2,
      maxPowerWatts: 1600,
      thermalTdpCap: 350,
      primaryWorkload: 'Corporate Virtualization, Database Engines, Enterprise Applications',
      description: 'Flexible storage expansion chassis optimized for fast transactional data density.'
    },
    {
      id: 'CHASSIS-DELL-PE-R760',
      name: 'PowerEdge R760 Enterprise Server',
      vendor: 'DELL',
      generation: '16th Generation Intel Xeon',
      formFactor: '2U',
      maxCores: 120,
      maxDimmSlots: 32,
      maxDriveBays: 16,
      pcieSlots: 8,
      ocpSlots: 1,
      maxPowerWatts: 1400,
      thermalTdpCap: 350,
      primaryWorkload: 'SaaS Multi-tenancy, Dynamic Private Cloud hypervisors',
      description: 'Brings dense compute capability paired with high energy efficiency standard.'
    },
    {
      id: 'CHASSIS-DELL-PE-R660',
      name: 'PowerEdge R660 1U Compute Dense',
      vendor: 'DELL',
      generation: '16th Generation Intel',
      formFactor: '1U',
      maxCores: 64,
      maxDimmSlots: 32,
      maxDriveBays: 10,
      pcieSlots: 3,
      ocpSlots: 1,
      maxPowerWatts: 1100,
      thermalTdpCap: 300,
      primaryWorkload: 'Edge Servers, Distributed Microservices, Web Scale workloads',
      description: 'Ultra-thin, energy conscious dual-socket server built for restricted datacenters.'
    },
    {
      id: 'CHASSIS-SOV-ALLETRA-4110',
      name: 'Alletra Sovereign Core 4110 Storage',
      vendor: 'SOVEREIGN_CO',
      generation: 'Class 4 GAF Certified Encrypted Enclosure',
      formFactor: '1U',
      maxCores: 32,
      maxDimmSlots: 16,
      maxDriveBays: 24,
      pcieSlots: 4,
      ocpSlots: 2,
      maxPowerWatts: 1200,
      thermalTdpCap: 205,
      primaryWorkload: 'Sovereign Secure Storage, Encrypted NVMe, GAF Compliant Networks',
      description: 'Sealed secure storage system guaranteeing full source traceability and physical partition.'
    }
  ];

  // Preserved State for Custom Item Modal additions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formSku, setFormSku] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMv, setFormMv] = useState('1250');
  const [formCategory, setFormCategory] = useState<HardwareCategory>('STORAGE_DRIVE');

  // Port Scraper list state
  const [ingestSources, setIngestSources] = useState<IngestSource[]>([
    { id: 'src-1', name: 'HPE Live Partner Price Matrix API', type: 'API', lastChecked: 'Active 12m ago', itemsFound: 320, status: 'CONNECTED' },
    { id: 'src-2', name: 'Dell Premier Enterprise Catalog Feed', type: 'XML', lastChecked: 'Active 3h ago', itemsFound: 185, status: 'CONNECTED' },
    { id: 'src-3', name: 'Global Distributor Supply Chain TAA Compliance List', type: 'CSV', lastChecked: 'Active 1d ago', itemsFound: 1150, status: 'CONNECTED' },
    { id: 'src-4', name: 'Sovereign Gating Framework Restrictions Doc', type: 'PDF', lastChecked: 'Active 5d ago', itemsFound: 42, status: 'STALE' }
  ]);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedLogs, setScrapedLogs] = useState<string[]>([]);

  // Promoted dynamic rules
  const [promotedRules, setPromotedRules] = useState<PromotedRule[]>([
    { id: 'rule-01', sourcePattern: 'P43328-B21 RDIMMs', learnedProperty: 'DDR5 Balanced-channel multiplier symmetry requirement', actionTaken: 'Enforce twin configurations on CPU platforms', confidence: 99, status: 'PROMOTED', timestamp: '2026-05-30 14:15:20' },
    { id: 'rule-02', sourcePattern: 'P50465-B21 Xeon Core Option', learnedProperty: 'Requires minimum thermal heatsink option code', actionTaken: 'Auto-inject cooling riser elements pre-compliance', confidence: 94, status: 'ELEVATED', timestamp: '2026-05-30 15:32:10' },
    { id: 'rule-03', sourcePattern: '865438-B21 PSU Series', learnedProperty: 'Physical dimensions requirement 2U standard chassis', actionTaken: 'Prevent installation in 1U compact configurations', confidence: 97, status: 'HEALED', timestamp: '2026-05-30 16:48:45' }
  ]);

  // Unresolved exceptions begging for Human intervention
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

  // Fuzzy SKU Sandbox State
  const [sandboxImportDesc, setSandboxImportDesc] = useState('HPE 64GB RDIMM 4800 DDR5 Memory modules (for ProLiant Gen11 CPU channels)');
  const [sandboxActiveCategory, setSandboxActiveCategory] = useState<HardwareCategory>('MEMORY');
  const [sandboxBoqContext, setSandboxBoqContext] = useState<'HPE_PROLIANT_G11' | 'DELL_POWEREDGE_16G' | 'HPE_PROLIANT_G12'>('HPE_PROLIANT_G11');
  const [sandboxTrace, setSandboxTrace] = useState<string[]>([]);
  const [sandboxMatchedSku, setSandboxMatchedSku] = useState<CatalogItem | null>(null);
  const [sandboxMatchStats, setSandboxMatchStats] = useState<{ score: number; method: string; resolvedConflict: boolean } | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const evaluateSandboxFuzzyMatch = () => {
    if (!sandboxImportDesc.trim()) {
      setSandboxMatchedSku(null);
      setSandboxMatchStats(null);
      setSandboxTrace([]);
      return;
    }

    const trace: string[] = [];
    const text = sandboxImportDesc.toLowerCase();
    
    trace.push(`[STAGE 1] Ingesting raw item description: "${sandboxImportDesc}"`);
    trace.push(`[STAGE 2] User-provided category: ${sandboxActiveCategory}`);

    // Vendor footprint matches
    let detectedVendor = '';
    if (text.includes('hpe') || text.includes('proliant') || text.includes('alletra')) {
      detectedVendor = 'HPE';
    } else if (text.includes('dell') || text.includes('poweredge') || text.includes('pe')) {
      detectedVendor = 'DELL';
    } else if (text.includes('sovereign')) {
      detectedVendor = 'SOVEREIGN_CO';
    }
    if (detectedVendor) {
      trace.push(`   Detected clear Vendor footprint hint: "${detectedVendor}"`);
    }

    // Generation match
    let detectedGen = '';
    if (text.includes('gen12') || text.includes('g12')) {
      detectedGen = 'Gen12';
    } else if (text.includes('gen11') || text.includes('g11')) {
      detectedGen = 'Gen11';
    } else if (text.includes('16g') || text.includes('16th')) {
      detectedGen = '16G';
    }
    if (detectedGen) {
      trace.push(`   Detected clear Generation footprint hint: "${detectedGen}"`);
    }

    // Active BOQ / Server context footprint
    trace.push(`[STAGE 3] Scanning surrounding BOQ footprints for systemic context (Active Chassis = ${sandboxBoqContext})...`);
    let contextualVendor = 'HPE';
    let contextualGen = 'Gen11';
    if (sandboxBoqContext === 'HPE_PROLIANT_G11') {
      contextualVendor = 'HPE';
      contextualGen = 'Gen11';
      trace.push(`   Active session context notes: Prioritizing HPE options suited for Gen11 chassis configurations.`);
    } else if (sandboxBoqContext === 'HPE_PROLIANT_G12') {
      contextualVendor = 'HPE';
      contextualGen = 'Gen12';
      trace.push(`   Active session context notes: Prioritizing HPE options suited for Gen12 chassis configurations.`);
    } else {
      contextualVendor = 'DELL';
      contextualGen = '16G';
      trace.push(`   Active session context notes: Prioritizing Dell Enterprise options suited for 16th Gen chassis configurations.`);
    }

    // Category-Level Conflict checker
    let resolvedCategory = sandboxActiveCategory;
    let categoryConflictDetected = false;
    
    if ((text.includes('cable') || text.includes('cord') || text.includes('dac')) && sandboxActiveCategory !== 'CABLE') {
      resolvedCategory = 'CABLE';
      categoryConflictDetected = true;
      trace.push(`⚠️ WARNING: Category conflict detected! User requested "${sandboxActiveCategory}", but description matches CABLE nouns. Context solver auto-realigned target class to "CABLE" to prevent rules failures.`);
    } else if ((text.includes('drive') || text.includes('ssd') || text.includes('hdd') || text.includes('sata') || text.includes('sas')) && (sandboxActiveCategory !== 'STORAGE_DRIVE' && sandboxActiveCategory !== 'NVME_DRIVE')) {
      resolvedCategory = text.includes('nvme') ? 'NVME_DRIVE' : 'STORAGE_DRIVE';
      categoryConflictDetected = true;
      trace.push(`⚠️ WARNING: Category conflict detected! User requested "${sandboxActiveCategory}", but description matches DRIVE nouns. Context solver auto-realigned target class to "${resolvedCategory}".`);
    } else if ((text.includes('cpu') || text.includes('processor') || text.includes('amd') || text.includes('intel') || text.includes('gold') || text.includes('epyc')) && sandboxActiveCategory !== 'PROCESSOR') {
      resolvedCategory = 'PROCESSOR';
      categoryConflictDetected = true;
      trace.push(`⚠️ WARNING: Category conflict detected! User requested "${sandboxActiveCategory}", but description matches PROCESSOR nouns. Context solver auto-realigned target class to "PROCESSOR".`);
    }

    if (!categoryConflictDetected) {
      trace.push(`   Standard verification: No category-level noun contradictions found.`);
    }

    // Scoring catalogue algorithm
    trace.push(`[STAGE 4] Executing multi-criteria fuzzy scoring across catalog items list...`);

    const scored = catalogItems.map(item => {
      let score = 0;
      const idesc = item.Description.toLowerCase();
      const isku = item.SKU.toLowerCase();

      // 1. Matches Category
      if (item.Category === resolvedCategory) {
        score += 45;
      }

      // 2. Exact match SKU in text
      if (text.includes(isku) || isku.includes(text)) {
        score += 85;
      }

      // 3. Vendor match
      if (detectedVendor && item.Vendor === detectedVendor) {
        score += 25;
      } else if (!detectedVendor && item.Vendor === contextualVendor) {
        score += 15; // default to backplane context
      } else if (detectedVendor && item.Vendor !== detectedVendor) {
        score -= 20; // wrong-vendor penalty
      }

      // 4. Generation match
      if (detectedGen && item.Generation === detectedGen) {
        score += 25;
      } else if (!detectedGen && item.Generation === contextualGen) {
        score += 15; // context gen priority
      } else if (detectedGen && item.Generation !== detectedGen) {
        score -= 15; // wrong-generation penalty
      }

      // 5. Product subproduct matching (DL380 vs DL385 vs DL380a etc)
      if (text.includes('dl385') && item.SolutionFamily === 'DL385') {
        score += 30;
      } else if (text.includes('dl380a') && item.SolutionFamily === 'DL380a') {
        score += 35;
      } else if (text.includes('dl380') && !text.includes('dl380a') && item.SolutionFamily === 'DL380') {
        score += 30;
      } else if (text.includes('r760') && item.SolutionFamily === 'PE_R760') {
        score += 30;
      } else if (text.includes('r660') && item.SolutionFamily === 'PE_R660') {
        score += 30;
      } else if (text.includes('alletra') && item.SolutionFamily === 'Alletra4110') {
        score += 35;
      }

      // 6. Token overlap matching
      const wordsText = new Set(text.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2));
      const wordsSkuDesc = idesc.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
      
      let overlaps = 0;
      wordsSkuDesc.forEach(w => {
        if (wordsText.has(w)) overlaps++;
      });
      score += (overlaps * 5);

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const winner = scored[0];

    if (winner && winner.score > 20) {
      setSandboxMatchedSku(winner.item);
      setSandboxMatchStats({
        score: winner.score,
        method: winner.score > 75 ? 'Authoritative Alias Match' : 'Fuzzy Heuristics Matcher',
        resolvedConflict: categoryConflictDetected
      });
      trace.push(`🎯 MATCH DECISION: Catalog match identified for: SKU [${winner.item.SKU}] "${winner.item.Description}"`);
      trace.push(`↳ Properties mapping established: Vendor="${winner.item.Vendor}" • Family="${winner.item.SolutionFamily}" • Generation="${winner.item.Generation}" • Category="${winner.item.Category}"`);
    } else {
      setSandboxMatchedSku(null);
      setSandboxMatchStats(null);
      trace.push(`❌ EXCEPTION: Mapped similarity metrics too loose (< 20 target points). Flagged for Human intervention queue.`);
    }

    setSandboxTrace(trace);
  };

  useEffect(() => {
    evaluateSandboxFuzzyMatch();
  }, [sandboxImportDesc, sandboxActiveCategory, sandboxBoqContext, catalogItems]);

  // Run Local NLP solver
  const parseNLPQueryToConstraints = (query: string) => {
    if (!query.trim()) {
      setNlpMatchedChassis([]);
      setNlpAnalysisTrace([]);
      return;
    }

    const q = query.toLowerCase();
    const matches: string[] = [];
    const trace: string[] = [];

    trace.push(`Parsing query terms: "${query}"`);

    // Extract target vendor
    const isHpe = q.includes('hpe') || q.includes('proliant') || q.includes('alletra');
    const isDell = q.includes('dell') || q.includes('poweredge');
    const isSovereign = q.includes('sovereign') || q.includes('secure') || q.includes('encrypted');

    // Extract numerical values
    const coreMatch = q.match(/(\d+)\s*core/);
    const requiredCores = coreMatch ? parseInt(coreMatch[1], 10) : 0;

    const slotMatch = q.match(/(\d+)\s*(pcie|slot)/);
    const requiredSlots = slotMatch ? parseInt(slotMatch[1], 10) : 0;

    const powerMatch = q.match(/(\d+)\s*(w|watt)/);
    const requiredPower = powerMatch ? parseInt(powerMatch[1], 10) : 0;

    trace.push(`Parameters Isolated: Cores >= ${requiredCores}, PCIe slots >= ${requiredSlots}, Power budget >= ${requiredPower}W`);

    chassisVariants.forEach(ch => {
      let isCandidate = true;
      const reasons: string[] = [];

      if (isHpe && ch.vendor !== 'HPE') {
        isCandidate = false;
        reasons.push('Vendor mismatch (Requested HPE)');
      }
      if (isDell && ch.vendor !== 'DELL') {
        isCandidate = false;
        reasons.push('Vendor mismatch (Requested Dell)');
      }
      if (isSovereign && ch.vendor !== 'SOVEREIGN_CO') {
        isCandidate = false;
        reasons.push('Vendor mismatch (Requested Sovereign Core)');
      }

      if (requiredCores && ch.maxCores < requiredCores) {
        isCandidate = false;
        reasons.push(`Insufficient cores (Chassis cap is ${ch.maxCores} cores, needed ${requiredCores})`);
      }

      if (requiredSlots && ch.pcieSlots < requiredSlots) {
        isCandidate = false;
        reasons.push(`Insufficient physical slots (Chassis has ${ch.pcieSlots} PCIe slots, needed ${requiredSlots})`);
      }

      if (requiredPower && ch.maxPowerWatts < requiredPower) {
        isCandidate = false;
        reasons.push(`Power delivery bottleneck (Chassis PSU envelope cap is ${ch.maxPowerWatts}W, needed ${requiredPower}W)`);
      }

      if (isCandidate) {
        matches.push(ch.id);
        trace.push(`✅ MATCH FOUND: "${ch.name}" satisfies all structural limits.`);
      } else {
        trace.push(`❌ EXCLUDED: "${ch.name}" because: ${reasons.join(', ')}`);
      }
    });

    setNlpMatchedChassis(matches);
    setNlpAnalysisTrace(trace);
  };

  useEffect(() => {
    parseNLPQueryToConstraints(nlpQuery);
  }, [nlpQuery]);

  // Compute category matching distributions safely
  const computeCount = (cat: string) => {
    let baseFiltered = catalogItems;
    if (activeChassisSelection) {
      baseFiltered = catalogItems.filter(item => {
        const platformString = item.Platforms.toLowerCase();
        // Dynamic qualification mapping checks
        if (activeChassisSelection === 'CHASSIS-HPE-DL385-10DW') {
          return platformString.includes('dl385_g11') || platformString.includes('10dw');
        } else if (activeChassisSelection === 'CHASSIS-HPE-DL380-SFF') {
          return platformString.includes('dl380_g12') || platformString.includes('sff');
        } else if (activeChassisSelection === 'CHASSIS-DELL-PE-R760') {
          return platformString.includes('r760') || platformString.includes('2.5');
        } else if (activeChassisSelection === 'CHASSIS-DELL-PE-R660') {
          return platformString.includes('r660') || platformString.includes('1u');
        } else if (activeChassisSelection === 'CHASSIS-SOV-ALLETRA-4110') {
          return item.isSovereign;
        }
        return true;
      });
    }

    if (cat === 'All') return baseFiltered.length;
    return baseFiltered.filter(item => item.Category === cat).length;
  };

  // Canonical list of standard hardware parts classes
  const categoriesList = [
    'All',
    'CHASSIS',
    'PROCESSOR',
    'MEMORY',
    'STORAGE_DRIVE',
    'NVME_DRIVE',
    'STORAGE_CTRL',
    'NETWORKING',
    'POWER',
    'RISER',
    'FAN',
    'CABLE',
    'SUPPORT_SERVICE'
  ];

  // Simulated live partner gateway scrapings
  const handleTriggerLiveHarvest = () => {
    setIsScraping(true);
    setScrapedLogs(['Active: Dialing secured partner API connection hooks...', 'Parsing incoming HPE live BOM configurations...']);

    let step = 1;
    const interval = setInterval(() => {
      if (step === 1) {
        setScrapedLogs(prev => [...prev, 'GET /portal/api/v4/specs?family=proliant_gen11 ... OK (Fetched 412 records)']);
      } else if (step === 2) {
        setScrapedLogs(prev => [...prev, 'Downloading Dell Premier configuration matrices ... 100% complete']);
      } else if (step === 3) {
        setScrapedLogs(prev => [...prev, 'Verification matrix complete: Detected physical layout adjustments. Injecting 1 new Storage Controller item.']);
        
        // Push a live item to local inventory simulation
        const liveScrapedPart: CatalogItem = {
          SKU: 'SCRA-8869',
          Description: 'HPE Dual-Channel PCIe Smart Storage Battery-backed Controller',
          Category: 'STORAGE_CTRL',
          MSRP: 980,
          Platforms: 'DL385_G11, DL380_G12',
          isTAA: true,
          isSovereign: true
        };
        setCatalogItems(prev => {
          if (!prev.some(item => item.SKU === 'SCRA-8869')) {
            return [liveScrapedPart, ...prev];
          }
          return prev;
        });

        // Add a system log to trace healing
        setHealingLogs(prev => [
          {
            id: `hl-${Date.now()}`,
            msg: 'Healed missing SAS/SATA RAID battery pack option requirement dynamically in active storage matrices.',
            status: 'CONVERTED',
            timestamp: 'Just now'
          },
          ...prev
        ]);

        clearInterval(interval);
        setIsScraping(false);
        triggerToast('Harvest complete! Syncing dynamic ledger with local catalog schema.');
      }
      step++;
    }, 1000);
  };

  // Solve a user conflict block manually
  const handleResolveHumanIntervention = (id: string, targetSku: string) => {
    const matchedIssue = humanInterventions.find(h => h.id === id);
    if (!matchedIssue) return;

    setHumanInterventions(prev => prev.filter(h => h.id !== id));

    const newRule: PromotedRule = {
      id: `rule-${Date.now()}`,
      sourcePattern: matchedIssue.anomalySku,
      learnedProperty: `Explicit human mapping decision to resolve part-mapping ambiguity.`,
      actionTaken: `Auto-convert alias of unresolved raw imports directly to catalog: ${targetSku}`,
      confidence: 100,
      status: 'PROMOTED',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setPromotedRules([newRule, ...promotedRules]);
    
    // Add positive closure report to healing traces
    setHealingLogs(prev => [
      {
        id: `hl-${Date.now()}`,
        msg: `Human intervened successfully. Promoted standard rule targeting raw vendor pattern: "${matchedIssue.anomalySku}" map direction to "${targetSku}".`,
        status: 'CONVERTED',
        timestamp: 'Just now'
      },
      ...prev
    ]);

    triggerToast(`Successfully resolved exception! Converted manual guidance node into active layout validation rules.`);
  };

  // Perform Catalog CRUD Spec edits
  const handleSaveSkuSpecs = () => {
    const nextItem: CatalogItem = {
      SKU: formSku.trim(),
      Description: formDesc.trim(),
      Category: formCategory,
      MSRP: parseFloat(formMv) || 0,
      Platforms: activeChassisSelection ? activeChassisSelection.replace('CHASSIS-', '') : 'DL380_G12',
      isTAA: true
    };

    if (editingItem) {
      setCatalogItems(prev => prev.map(item => (item.SKU === editingItem.SKU ? nextItem : item)));
      triggerToast(`Modified specifications mapped to SKU Code: ${formSku}`);
    } else {
      setCatalogItems(prev => [nextItem, ...prev]);
      triggerToast(`Successfully recorded new SKU: ${formSku} inside isolated inventory namespace.`);
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
    const confirmed = window.confirm(`Permanently remove SKU spec maps for "${sku}"?`);
    if (confirmed) {
      setCatalogItems(prev => prev.filter(item => item.SKU !== sku));
      triggerToast(`Removed SKU mapping definition for: ${sku}`);
    }
  };

  // Deep structural platform routing & filtering bounds calculation
  const filteredItems = catalogItems.filter(item => {
    // 1. Local category filter
    if (selectedCategory !== 'All' && item.Category !== selectedCategory) {
      return false;
    }

    // 2. Multi-Vendor tab filter
    if (selectedVendorFilter !== 'ALL') {
      if (selectedVendorFilter === 'HPE' && item.Vendor !== 'HPE') return false;
      if (selectedVendorFilter === 'DELL' && item.Vendor !== 'DELL') return false;
      if (selectedVendorFilter === 'SOVEREIGN' && item.Vendor !== 'SOVEREIGN_CO') return false;
    }

    // 3. Chassis Variant Specific Filter (Prevents Cross-Pollution)
    if (activeChassisSelection) {
      const platformString = item.Platforms.toLowerCase();
      if (activeChassisSelection === 'CHASSIS-HPE-DL385-10DW') {
        const pass = platformString.includes('dl385_g11') || platformString.includes('10dw') || item.Category === 'MEMORY' || item.Category === 'CHASSIS';
        if (!pass) return false;
      } else if (activeChassisSelection === 'CHASSIS-HPE-DL380-SFF') {
        const pass = platformString.includes('dl380_g12') || platformString.includes('sff') || item.Category === 'MEMORY' || item.Category === 'CHASSIS';
        if (!pass) return false;
      } else if (activeChassisSelection === 'CHASSIS-DELL-PE-R760') {
        const pass = platformString.includes('r760') || platformString.includes('2.5') || platformString.includes('pe') || item.Category === 'PROCESSOR';
        if (!pass) return false;
      } else if (activeChassisSelection === 'CHASSIS-DELL-PE-R660') {
        const pass = platformString.includes('r660') || platformString.includes('1u') || platformString.includes('pe');
        if (!pass) return false;
      } else if (activeChassisSelection === 'CHASSIS-SOV-ALLETRA-4110') {
        if (!item.isSovereign) return false;
      }
    }

    // 4. Compliance tags
    if (selectedCompliance === 'TAA' && !item.isTAA) return false;
    if (selectedCompliance === 'SOVEREIGN' && !item.isSovereign) return false;

    // 5. Query Search
    if (searchText.trim() !== '') {
      const q = searchText.toLowerCase();
      const skuMatch = item.SKU.toLowerCase().includes(q);
      const descMatch = item.Description.toLowerCase().includes(q);
      const categoryMatch = item.Category.toLowerCase().includes(q);
      return skuMatch || descMatch || categoryMatch;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white border border-slate-700 px-5 py-3 rounded-xl shadow-xl animate-scale-up text-xs font-semibold flex items-center gap-2 max-w-sm">
          <Sparkle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Title Bar */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 uppercase block">Governance Platform</span>
        <h1 className="text-xl font-bold tracking-tight text-slate-950 font-sans mt-1">
          Universal Hardware Ingress & Solution Catalog
        </h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-3xl">
          Establish distinct hardware hierarchies, manage multi-vendor physical footprints, and prevent logic rule contamination. Leverage real-time telemetry healers and live human-intervention gating queues.
        </p>
      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1">
              Active Chassis Models
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{chassisVariants.length}</span>
            <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
              Isolated solution boundaries
            </span>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1">
              Qualified Raw SKUs
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{catalogItems.length}</span>
            <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
              Cross-vendor physical catalog
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1">
              Active Invariants
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">{promotedRules.length}</span>
            <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
              Promoted dynamic rules
            </span>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1">
              Interventions Flagged
            </span>
            <span className={`text-2xl font-bold font-mono ${humanInterventions.length > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-900'}`}>
              {humanInterventions.length}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1 leading-tight text-left">
              Ambiguous SKU anomalies
            </span>
          </div>
          <div className={`p-2.5 rounded-lg ${humanInterventions.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tab Controller */}
      <div className="flex border-b border-slate-200 gap-1">
        {[
          { id: 'variants', label: '🏟️ High-Level Chassis Envelopes & NLP', count: chassisVariants.length },
          { id: 'inventory', label: '🗄️ Unified Parts Inventory', count: filteredItems.length },
          { id: 'scraper', label: '🔌 Live Ingress Portal Scrapers', count: ingestSources.length },
          { id: 'rules', label: '🛡️ Dynamic Rules & Healing Console', count: promotedRules.length + humanInterventions.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            className={`px-5 py-3 border-b-2 text-xs font-bold leading-none cursor-pointer transition-all flex items-center gap-2 ${
              currentTab === tab.id
                ? 'border-indigo-650 text-indigo-705 bg-slate-50 border-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
              currentTab === tab.id ? 'bg-indigo-100 text-indigo-805' : 'bg-slate-100 text-slate-450'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: HIGH-LEVEL CHASSIS ENVELOPES & NLP REQUIREMENTS SOLVER */}
      {currentTab === 'variants' && (
        <div className="flex flex-col gap-6">
          {/* Section: NLP Smart Selector Assistant */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl relative overflow-hidden border border-slate-800 shadow-lg">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Network className="w-48 h-48 text-indigo-200" />
            </div>

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[9px] font-mono bg-indigo-500/30 text-indigo-300 rounded font-black border border-indigo-500/20">
                  REAL-TIME INTELLIGENT EXPERT MATCHING
                </span>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>

              <h3 className="text-md font-bold uppercase tracking-wide font-sans">
                NLP-Driven Solution Constraint Assistant
              </h3>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Translate customer budgets, high PCIe counts, core constraints, memory channels, and compliance needs into the ideal core platform variant instantly.
              </p>

              {/* Input Area */}
              <div className="flex flex-col md:flex-row gap-3 mt-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Type requirements (e.g., 'Need HPE server under 1600W with at least 128 cores and 8 OCP slots TAA')..."
                    value={nlpQuery}
                    onChange={(e) => setNlpQuery(e.target.value)}
                    className="w-full bg-slate-880/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-550 focus:border-transparent transition-all font-sans"
                  />
                  {nlpQuery && (
                    <button
                      onClick={() => setNlpQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Quick Prompts */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-slate-400 font-bold tracking-wider">POPULAR CUSTOMER SCENARIO TEMPLATES (NLP CLICK-TO-RUN):</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🔥 Extreme AI workloads (>200 cores, 2000W capability)', term: 'Extreme AI training option: multi-GPU node node needing 256 cores, huge power 2200W standard thermal limits' },
                    { label: '☁️ Enterprise Virtualization (120+ cores, HPE setup, compact)', term: 'HPE enterprise configuration with at least 128 cores capacity for massive hypervisors' },
                    { label: '🛡️ Sovereign Storage (Encrypted high-density node, low power)', term: 'Sovereign secure storage under 1200W with total physical GAF partition encryption' },
                    { label: '⚡ Energy Conscious Edge Virtualization (Dell, 1U thickness)', term: 'Dell server with edge deployment focus, tight constraints needing 1U form factor' }
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setNlpQuery(p.term)}
                      className={`text-[10px] px-3 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                        nlpQuery === p.term 
                          ? 'bg-indigo-600 border-indigo-400 text-white font-semibold' 
                          : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* NLP solver trace outputs */}
              {nlpQuery && (
                <div className="bg-slate-950/80 p-4 border border-slate-850 rounded-xl flex flex-col gap-2 text-left font-mono text-[10px] text-indigo-300">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>In-Memory Schema Solver Evaluation Trace:</span>
                  </div>
                  <div className="divide-y divide-slate-853/55 max-h-40 overflow-y-auto custom-scrollbar">
                    {nlpAnalysisTrace.map((tr, idx) => (
                      <div key={idx} className="py-1 tracking-wide leading-relaxed">
                        {tr}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive SKU Resolution & Category Conflict Scanner Sandbox */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div className="text-left">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-indigo-150 border border-indigo-200 text-indigo-700 uppercase tracking-wider mb-1">
                  ⚡ SKU Mapping & Disambiguation Playpen
                </span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Contextual Fuzzy Matcher & Gating Sandbox
                </h3>
                <p className="text-xs text-slate-505">
                  Test raw description mapping accuracy, trace logical keyword scoring, and witness automatic category-level conflict resolution.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <Sliders className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span>Parser Logic: STABLE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Inputs */}
              <div className="lg:col-span-6 flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>1. Real-time Raw Description Input</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" title="Paste any ambiguous description or title from raw customer orders/PDFs." />
                  </label>
                  <textarea
                    rows={3}
                    value={sandboxImportDesc}
                    onChange={(e) => setSandboxImportDesc(e.target.value)}
                    placeholder="Enter raw hardware description..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-550 focus:border-indigo-500 transition-all font-sans font-medium"
                  />
                </div>

                {/* Pre-configured Presets to Quick Test Mappings */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wider">CLICK SCENARIO TO TEST DYNAMIC FUZZY RESOLUTION MATCHING:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { 
                        title: '⚡ Memory (Conflict Override)', 
                        desc: 'HPE 64GB RDIMM modules - cable loop for DL380 (User designated category: MEMORY, but contains "cable" noun!)',
                        cat: 'MEMORY' as HardwareCategory,
                        ctx: 'HPE_PROLIANT_G11' as const
                      },
                      { 
                        title: '🖥️ Dell 16th Gen Core Upgrade', 
                        desc: 'Dell PowerEdge R760 16G Xeon scalable core item configuration with high-watt heatsinks Included',
                        cat: 'PROCESSOR' as HardwareCategory,
                        ctx: 'DELL_POWEREDGE_16G' as const
                      },
                      { 
                        title: '🔌 Ambiguous Cabling Option', 
                        desc: 'Standard flexible 100cm SAS cable kit for storage backplanes (Category: CABLE)',
                        cat: 'CABLE' as HardwareCategory,
                        ctx: 'HPE_PROLIANT_G12' as const
                      },
                      { 
                        title: '💾 High Density DL380a GPU Drive Slot', 
                        desc: 'NVMe read-intensive Enterprise SSD compatible for DL380a Gen11 Accelerator setup config',
                        cat: 'NVME_DRIVE' as HardwareCategory,
                        ctx: 'HPE_PROLIANT_G11' as const
                      }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSandboxImportDesc(preset.desc);
                          setSandboxActiveCategory(preset.cat);
                          setSandboxBoqContext(preset.ctx);
                          triggerToast(`Injected sandbox scenario preset: "${preset.title}"`);
                        }}
                        className="text-left p-2.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all flex flex-col gap-1 shadow-2xs group cursor-pointer"
                      >
                        <span className="text-[10px] font-bold text-slate-800 group-hover:text-indigo-650 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {preset.title}
                        </span>
                        <span className="text-[9px] text-slate-430 line-clamp-1 italic">{preset.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-705">
                      2. Designation Target Category
                    </label>
                    <select
                      value={sandboxActiveCategory}
                      onChange={(e) => setSandboxActiveCategory(e.target.value as HardwareCategory)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-750 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans font-semibold cursor-pointer"
                    >
                      {['MEMORY', 'PROCESSOR', 'CABLE', 'STORAGE_DRIVE', 'NVME_DRIVE', 'POWER', 'CHASSIS', 'RISER', 'UNKNOWN'].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-705">
                      3. Contextual Active BOQ Chassis
                    </label>
                    <select
                      value={sandboxBoqContext}
                      onChange={(e) => setSandboxBoqContext(e.target.value as any)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-750 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans font-semibold cursor-pointer"
                    >
                      <option value="HPE_PROLIANT_G11">HPE ProLiant Gen11 (Prioritize HPE Gen11)</option>
                      <option value="HPE_PROLIANT_G12">HPE ProLiant Gen12 (Prioritize HPE Gen12)</option>
                      <option value="DELL_POWEREDGE_16G">Dell PowerEdge 16G (Prioritize Dell 16G)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Schema Resolution log & trace outputs */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="bg-white border border-slate-205 rounded-2xl p-4 flex flex-col gap-3.5 shadow-2xs text-left relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold text-slate-900 block font-mono uppercase tracking-wide">
                      Resolved Catalog Matches
                    </span>
                    {sandboxMatchStats?.resolvedConflict && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Conflict Resolved!
                      </span>
                    )}
                  </div>

                  {sandboxMatchedSku ? (
                    <div className="flex flex-col gap-2.5 bg-indigo-50/20 border border-indigo-100 p-3.5 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-indigo-505 font-bold">MATCHED DATABASE SKU:</span>
                          <span className="font-mono font-bold text-slate-900 text-sm tracking-widest">{sandboxMatchedSku.SKU}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.7 rounded">
                          Score: {sandboxMatchStats?.score} / 150
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 font-sans font-bold text-left leading-tight">
                        {sandboxMatchedSku.Description}
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-indigo-100/55 mt-1">
                        <span className="text-[9px] font-mono font-black px-1.5 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 rounded uppercase">
                          Vendor: {sandboxMatchedSku.Vendor}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 rounded uppercase">
                          Family: {sandboxMatchedSku.SolutionFamily}
                        </span>
                        <span className="text-[9px] font-mono font-black px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded uppercase">
                          Gen: {sandboxMatchedSku.Generation}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {sandboxMatchedSku.Category}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono font-semibold text-slate-400 mt-1 flex justify-between">
                        <span>Parser Strategy: {sandboxMatchStats?.method}</span>
                        <span>MSRP MSRP: {sandboxMatchedSku.MSRP > 0 ? `$${sandboxMatchedSku.MSRP.toLocaleString()}` : 'OEM Config Option'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50">
                      ⚠️ Mapped similarity metrics too loose. Flagged for Human intervention queue.
                    </div>
                  )}

                  {/* Schema Evaluation Trace Logs */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[10px] font-sans font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                      Dynamic Gating Evaluation Trace Trace:
                    </span>
                    <div className="bg-slate-950 p-3 rounded-xl max-h-36 overflow-y-auto custom-scrollbar font-mono text-[9px] text-indigo-300 leading-relaxed text-left flex flex-col gap-1 select-text scroll-smooth shadow-inner border border-slate-900">
                      {sandboxTrace.map((line, idx) => {
                        const isWarning = line.includes('⚠️');
                        const isSolved = line.includes('🎯') || line.includes('🎯');
                        const isContext = line.includes('[STAGE');
                        return (
                          <div 
                            key={idx} 
                            className={`py-0.5 border-b border-slate-900/40 last:border-0 ${
                              isWarning ? 'text-amber-400 font-bold' : 
                              isSolved ? 'text-emerald-400 font-extrabold' : 
                              isContext ? 'text-indigo-400 font-bold border-t border-slate-900/55 pt-1 mt-1 first:border-t-0 first:pt-0' : 
                              'text-slate-350'
                            }`}
                          >
                            {line}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Chassis Variants Bento Grid */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest pl-1">
                Classified Hardware Solution Bases
              </span>
              {activeChassisSelection && (
                <button
                  onClick={() => setActiveChassisSelection(null)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-8o0 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Showing Active Platform Filtering (Clear Filter)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {chassisVariants.map(ch => {
                const isNlpMatch = nlpMatchedChassis.includes(ch.id);
                const isSelected = activeChassisSelection === ch.id;

                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      setActiveChassisSelection(isSelected ? null : ch.id);
                      triggerToast(`Switched active catalog catalog view filter to: ${ch.name}`);
                    }}
                    className={`relative p-5 border rounded-2xl flex flex-col gap-4 shadow-xs transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-600/10' 
                        : nlpQuery && isNlpMatch 
                        ? 'border-emerald-500 bg-emerald-50/15 ring-2 ring-emerald-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Badge header */}
                    <div className="flex items-start justify-between">
                      <div className="text-left">
                        <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                          ch.vendor === 'HPE' ? 'bg-teal-50 border-teal-200 text-teal-800' :
                          ch.vendor === 'DELL' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                          'bg-indigo-50 border-indigo-200 text-indigo-805'
                        }`}>
                          {ch.vendor === 'SOVEREIGN_CO' ? 'Sovereign Core' : ch.vendor}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-1 font-bold">
                          {ch.generation}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold font-mono text-[10px] rounded">
                        {ch.formFactor} Enclosure
                      </span>
                    </div>

                    <div className="text-left leading-tight">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 tracking-tight">
                        {ch.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed font-sans font-medium">
                        {ch.description}
                      </p>
                    </div>

                    {/* Chassis Specification Envelope Indicators */}
                    <div className="bg-slate-50 p-3 rounded-xl flex flex-col gap-2 text-left">
                      <span className="text-[8px] font-mono font-bold text-slate-430 uppercase tracking-widest block border-b border-slate-200 pb-1.5">
                        Chassis Envelope Capacity Budgets:
                      </span>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Memory DIMMs :</span>
                          <strong className="text-slate-800">{ch.maxDimmSlots} slots</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Power Delivery :</span>
                          <strong className="text-slate-800">{ch.maxPowerWatts}W max</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Max Cores :</span>
                          <strong className="text-slate-800">{ch.maxCores} Cores</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">PCIe / OCP Slots:</span>
                          <strong className="text-slate-800">{ch.pcieSlots} + {ch.ocpSlots} OCP</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-slate-100 pt-3 flex justify-between items-center text-[11px]">
                      <span className="text-indigo-650 font-bold font-sans flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Workload: {ch.formFactor === '1U' ? 'Edge-dense' : 'Datacenter'}</span>
                      </span>
                      <button
                        className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-all ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Filter Parts'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: UNIFIED PARTS INVENTORY LIST */}
      {currentTab === 'inventory' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          
          {/* Active Filtering Info Top Alert Block if filtering is active */}
          {activeChassisSelection && (
            <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-850">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-500" />
                <span>
                  Filtering active. Showing qualified parts optimized for: <strong>{chassisVariants.find(c => c.id === activeChassisSelection)?.name}</strong>
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveChassisSelection(null);
                  triggerToast('Cleared target chassis filters.');
                }}
                className="text-xs font-mono font-bold text-indigo-600 underline hover:text-indigo-850 cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* Quick Category Tab Matrix */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mr-1">
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
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Vendor Switches & Compliance Switches row */}
            <div className="flex flex-wrap items-center gap-6 mt-1 pt-1.5 border-t border-slate-100">
              {/* Vendor Multi-isolation Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Vendor Spec Set:
                </span>
                <div className="flex gap-1">
                  {[
                    { id: 'ALL', label: 'All Vendors' },
                    { id: 'HPE', label: 'HPE ProLiant' },
                    { id: 'DELL', label: 'Dell Enterprise' },
                    { id: 'SOVEREIGN', label: 'Sovereign GAF' }
                  ].map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVendorFilter(v.id as any)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                        selectedVendorFilter === v.id
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compliance Filter Controls */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Compliance Gating:
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedCompliance('ALL')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold border cursor-pointer transition-all ${
                      selectedCompliance === 'ALL'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-755'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Off
                  </button>
                  <button
                    onClick={() => setSelectedCompliance('TAA')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold border cursor-pointer transition-all ${
                      selectedCompliance === 'TAA'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-755'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    TAA Compliant ({catalogItems.filter(i => i.isTAA).length})
                  </button>
                  <button
                    onClick={() => setSelectedCompliance('SOVEREIGN')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold border cursor-pointer transition-all ${
                      selectedCompliance === 'SOVEREIGN'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-755'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Sovereign Cert ({catalogItems.filter(i => i.isSovereign).length})
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Catalog Operations Bar */}
          <div className="flex items-center justify-between gap-4 mt-1">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search canonical design SKUs or specific part descriptions..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            <button
              onClick={handleStartAddSKU}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New SKUs</span>
            </button>
          </div>

          {/* Inventory Data Matrix */}
          <div className="border border-slate-205 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="grid grid-cols-[140px_1fr_150px_110px_140px_100px] items-center bg-slate-50 px-6 py-3 font-semibold text-xs font-mono text-slate-550 uppercase tracking-widest border-b border-slate-200">
              <div>Canonical SKU</div>
              <div>Forensic Description</div>
              <div className="text-center">Category Bucket</div>
              <div className="text-right">MSRP Price</div>
              <div className="text-center">Platform Lineage</div>
              <div className="text-center">Actions</div>
            </div>

            <div className="divide-y divide-slate-200 max-h-[360px] overflow-y-auto custom-scrollbar bg-white">
              {filteredItems.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-mono text-xs">
                  No Catalog SKUs Match Active Segment Context or Queries
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <div
                      key={item.SKU}
                      className="grid grid-cols-[140px_1fr_150px_110px_140px_100px] items-center px-6 py-2.5 text-[12px] font-medium text-slate-705 bg-white hover:bg-indigo-50/20 transition-colors border-l-2 border-transparent hover:border-indigo-600"
                    >
                      <div className="font-mono font-bold text-slate-900 tracking-wider select-all flex items-center gap-1">
                        <span>{item.SKU}</span>
                        {item.isSovereign && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="Sovereign Core Part" />
                        )}
                      </div>

                      <div className="flex flex-col pr-4 text-left py-1">
                        <span className="text-slate-700 font-sans font-semibold text-xs leading-tight">
                          {item.Description}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border leading-none uppercase ${
                            item.Vendor === 'HPE' ? 'bg-teal-50 border-teal-200 text-teal-800' :
                            item.Vendor === 'DELL' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                            item.Vendor === 'SOVEREIGN' || item.Vendor === 'SOVEREIGN_CO' ? 'bg-indigo-50 border-indigo-200 text-indigo-805' :
                            'bg-slate-50 border-slate-200 text-slate-600'
                          }`}>
                            Vendor: {item.Vendor || 'HPE'}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-purple-50 border border-purple-250 text-purple-700 rounded leading-none uppercase">
                            Family: {item.SolutionFamily || 'DL380'}
                          </span>
                          <span className="text-[9px] font-mono font-black px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded leading-none uppercase">
                            Generation: {item.Generation || 'Gen12'}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-105 border border-slate-200 text-slate-500 rounded leading-none uppercase">
                            {item.Category} Component
                          </span>
                        </div>
                      </div>

                      <div className="text-center flex justify-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[9px] uppercase border border-slate-200 tracking-wider">
                          {item.Category}
                        </span>
                      </div>

                      <div className="text-right font-mono font-bold text-slate-850">
                        {item.MSRP > 0 ? `$${item.MSRP.toLocaleString()}` : <span className="text-slate-410 font-bold">-</span>}
                      </div>

                      <div className="text-center truncate text-[10px] font-mono text-slate-400 font-medium px-2">
                        {item.Platforms}
                      </div>

                      <div className="text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStartEditItem(item)}
                          title="Edit SKU spec data"
                          className="p-1 text-slate-400 hover:text-indigo-650 rounded transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.SKU)}
                          title="Delete SKU entry"
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
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
      )}

      {/* Tab 3: PORTAL SCRAPERS & INGRESS PIPE */}
      {currentTab === 'scraper' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-6">
          <div className="text-left">
            <span className="text-[10px] font-mono font-black tracking-widest text-indigo-600 uppercase">Live Ingress Feeds</span>
            <h3 className="font-bold text-slate-900 text-sm mt-1 uppercase">Dynamic Partner API & Specification Harvesters</h3>
            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
              Maintain dynamic price alignment and technical spec validity. Stream current platform profiles, compliance classifications, and MSRP levels directly from official HPE & Dell distribution price list hooks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-3">
              <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider text-left">Scraper Connections Configuration:</span>
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

            {/* Ingress Harvest Trigger */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 text-left">
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase font-mono tracking-wide">Dynamic Spec Crawl</h4>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Trigger secure background harvesting tasks to pull direct distributor pricing bounds and test platform validation layouts automatically.
                </p>
              </div>

              {isScraping ? (
                <div className="bg-white p-4 border border-slate-200 rounded-lg flex flex-col gap-2 text-left min-h-[110px]">
                  <span className="text-[9px] font-mono font-bold text-indigo-600 animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> RUNNING PORTAL SYNC...
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
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-all text-center flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 ml-1" />
                  <span>Crawl Live Manufacturer Feed</span>
                </button>
              )}

              <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-200 pt-2 block">
                Synchronized telemetry feeds automatically push to the rule learning loops inside the rules ledger.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: RULE PROMOTION & GATING */}
      {currentTab === 'rules' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-6">
          
          {/* Section: Telemetry Self-Healers (In Progress Learnings) */}
          <div className="border border-indigo-150 bg-indigo-50/5 p-5 rounded-2xl text-left">
            <div className="flex items-center gap-2 text-indigo-805 font-bold text-xs font-mono uppercase tracking-widest border-b border-indigo-100 pb-2.5 mb-4">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>🩹 Real-time Telemetry Self-Healers (In Progress)</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Our automated match logic tracks ongoing exceptions and calibrates rules as config revisions pass. Witness the system detecting patterns, executing live substitutions, or preparing mappings:
            </p>

            <div className="flex flex-col gap-3">
              {healingLogs.map(log => (
                <div key={log.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3.5">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.status === 'HEALING' ? 'bg-amber-600 animate-pulse' : 'bg-emerald-500'
                  }`} />
                  <div className="flex-1 text-left text-xs">
                    <p className="font-semibold text-slate-800">{log.msg}</p>
                    <div className="flex gap-2 items-center mt-1 text-[10px] font-mono text-slate-400">
                      <span>Status: <strong className={log.status === 'HEALING' ? 'text-amber-600' : 'text-emerald-600'}>{log.status}</strong></span>
                      <span>•</span>
                      <span>Trace Time: {log.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Unresolved Exceptions & Human Intervention Requests */}
          {humanInterventions.length > 0 && (
            <div className="border border-amber-200 bg-amber-50/15 rounded-2xl p-5 text-left">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs font-mono uppercase tracking-widest border-b border-amber-100 pb-2.5 mb-4 font-black">
                <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
                <span>⚠️ GAPS DETECTED: UNRESOLVED EXCEPTIONS FOR HUMAN INTERVENTION</span>
              </div>

              <p className="text-xs text-slate-650 leading-relaxed mb-4">
                The automatic alignment tool identified incoming vendor part aliases or specs combinations that do not resolve cleanly within standard catalogs schemas. Direct manual alignment is flagged:
              </p>

              <div className="flex flex-col gap-4">
                {humanInterventions.map(issue => (
                  <div key={issue.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xs transition-shadow">
                    <div className="text-left flex-1">
                      <div className="flex gap-2 items-center">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          issue.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {issue.severity} GAPPING CODE
                        </span>
                        <strong className="text-xs text-slate-900 font-mono tracking-wider font-bold">Alias ID: {issue.anomalySku}</strong>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed max-w-2xl">{issue.description}</p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 text-left md:text-right">
                      <span className="text-[9px] font-mono text-slate-400 font-bold block leading-none">Choose Map Option to Heal & Learn:</span>
                      <div className="flex gap-1.5 mt-1">
                        {issue.matchedOptions.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleResolveHumanIntervention(issue.id, opt)}
                            className="px-3 py-1.5 border border-indigo-205 hover:border-indigo-400 hover:bg-slate-50 text-indigo-705 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Map as {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Promoted Structural Rule Historian Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start border-t border-slate-100 pt-6">
            <div className="flex flex-col gap-4 text-left">
              <div>
                <span className="text-[10px] font-mono font-black tracking-widest text-indigo-600 uppercase">Knowledge Feedback Loop</span>
                <h3 className="font-bold text-slate-900 text-sm mt-1 uppercase">Dynamic Invariant Rule Promotions Matrix</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans font-medium">
                  Resolutions applied via human gating queues are promoted directly to active validation guidelines. Future config pipelines parsing corresponding anomalies auto-heal using these certified rulesets.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[9px] font-mono font-bold uppercase text-slate-450 tracking-wider">KNOWLEDGE HEALTH TELEMETRY:</span>
                <div className="grid grid-cols-3 gap-2 mt-2.5 font-mono text-center">
                  <div className="bg-white border rounded-lg p-2.5">
                    <span className="text-emerald-600 font-black text-sm block">100%</span>
                    <span className="text-[8px] text-slate-400 block mt-0.5">Parity Core</span>
                  </div>
                  <div className="bg-white border rounded-lg p-2.5">
                    <span className="text-indigo-600 font-black text-sm block">
                      {promotedRules.length + 15}
                    </span>
                    <span className="text-[8px] text-slate-400 block mt-0.5">Total Rules</span>
                  </div>
                  <div className="bg-white border rounded-lg p-2.5">
                    <span className="text-purple-650 font-black text-sm block">0.2s</span>
                    <span className="text-[8px] text-slate-400 block mt-0.5">Response Loop</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules Ledger Timeline Output */}
            <div className="border border-slate-200 rounded-xl p-5 flex flex-col gap-3 min-h-[220px]">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-605 tracking-wider block border-b border-dashed border-slate-200 pb-2 text-left">
                Active Promoted Environmental Rules:
              </span>
              <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-60 custom-scrollbar pr-1 text-left text-xs">
                {promotedRules.map(rule => (
                  <div key={rule.id} className="py-2.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center bg-slate-50 p-1 px-1.5 rounded-md">
                      <span className="font-bold text-indigo-705 font-mono text-[10px]">{rule.sourcePattern}</span>
                      <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                        rule.status === 'PROMOTED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {rule.status} Conf ({rule.confidence}% confidence)
                      </span>
                    </div>
                    <div className="leading-tight pl-1">
                      <p className="text-xs text-slate-750 font-semibold">{rule.learnedProperty}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">Consequence: <strong className="text-slate-600 font-medium">{rule.actionTaken}</strong></span>
                      <span className="text-[8px] text-slate-405 block mt-0.5">{rule.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Spec Item Modals Editor */}
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
              <h3 className="text-md font-bold text-slate-950">Add Specs Option to Active Catalog</h3>
              <p className="text-xs text-slate-500 mt-1">
                Inject custom physical attributes specs boundaries cleanly inside the catalog namespace.
              </p>
            </div>

            <div className="flex flex-col gap-3 font-medium text-slate-700 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Canonical SKU Code</label>
                <input
                  type="text"
                  placeholder="e.g. 865438-B21"
                  value={formSku}
                  onChange={e => setFormSku(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-440">Description Specifications</label>
                <input
                  type="text"
                  placeholder="e.g. HPE Smart Power Outflow Battery Backup Kit"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-440">MSRP List Price ($)</label>
                <input
                  type="text"
                  placeholder="e.g. 700"
                  value={formMv}
                  onChange={e => setFormMv(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

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
                  <option value="POWER">POWER</option>
                  <option value="RISER">RISER</option>
                  <option value="STORAGE_CTRL">STORAGE_CTRL</option>
                  <option value="CABLE">CABLE</option>
                  <option value="SUPPORT_SERVICE">SUPPORT_SERVICE</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveSkuSpecs}
              className="mt-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              Save SKU Specs Mapping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
