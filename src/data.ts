/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CatalogItem, DiffRow, AuditLogEntry, MissionLog, HardwareCategory } from './types';

// ==========================================
// 1. PRECOMPILED CHASSIS SEEDS GAF PROFILE
// ==========================================

export const DEMO_ROWS_DL385_GEN11: DiffRow[] = [
  {
    id: 'D-CH-01',
    part: 'P50000-B21',
    partKey: 'P50000B21',
    boqQty: 1,
    bomQty: 1,
    boqDesc: 'HPE ProLiant DL385 Gen11 10DW Chassis',
    bomDesc: 'HPE ProLiant DL385 Gen11 10DW Chassis',
    category: 'CHASSIS',
    config: 'ALPHA-888',
    status: 'MATCHED',
    price: 12500,
    drift: 0,
    reasoning: 'Authoritative server enclosure baseline.',
    trace: ['Phase 1: Isolated DNA match found.', 'Phase 2: Verified regional chassis compliance.'],
    capabilities: ['10DW AI Node', 'TAA', 'Gen11 Base']
  },
  {
    id: 'D-PR-01',
    part: 'P12345-B21',
    partKey: 'P12345B21',
    boqQty: 2,
    bomQty: 2,
    boqDesc: 'AMD EPYC 9654 Processor (96-core, 360W TDP)',
    bomDesc: 'AMD EPYC 9654 Processor (96-core, 360W TDP)',
    category: 'PROCESSOR',
    config: 'ALPHA-888',
    status: 'MATCHED',
    price: 8000,
    drift: 0,
    reasoning: 'Extracted 192 cores aggregate across dual sockets.',
    trace: ['Phase 4: Match vector exact.', 'Phase 11: Thermal envelope limit check passed.'],
    capabilities: ['96-Cores', 'SP5 Socket', '360W TDP', 'PCIe Gen5']
  },
  {
    id: 'D-ME-01',
    part: 'P64846-B21',
    partKey: 'P64846B21',
    boqQty: 16,
    bomQty: 24,
    boqDesc: '64GB DDR5 4800 MT/s Registered Smart Memory RDIMM',
    bomDesc: '64GB DDR5 4800 MT/s Registered Smart Memory RDIMM',
    category: 'MEMORY',
    config: 'ALPHA-888',
    status: 'QTY_MISMATCH',
    price: 650,
    drift: 5200,
    reasoning: 'Socket parity validation warning: optimal population is 12 channels per CPU (1DPC). Recalibrated to 24 DIMMs total.',
    trace: ['Phase 8: Identified sub-optimal DDR5 population.', 'Phase 9: Auto-healed quantity for 1DPC parity.'],
    capabilities: ['DDR5 Registered', '4800 MT/s', '1.5TB Total']
  },
  {
    id: 'D-ST-01',
    part: 'SFF-CAGE-TYPO',
    partKey: 'SFFCAGETYPO',
    boqQty: 1,
    bomQty: 1,
    boqDesc: 'HPE SFF Cage (Legacy)',
    bomDesc: 'HPE SFF Cage (Legacy)',
    category: 'STORAGE_DRIVE',
    config: 'ALPHA-888',
    status: 'MATCHED',
    price: 450,
    drift: 0,
    reasoning: 'Ingested layout match.',
    trace: ['Phase 10: Slot bounds validation.'],
    capabilities: ['SFF Cage', 'SAS/SATA']
  },
  {
    id: 'D-PW-01',
    part: '800W-PSU',
    partKey: '800WPSU',
    boqQty: 0,
    bomQty: 2,
    boqDesc: 'ADAPTER IDENTITY',
    bomDesc: 'HPE 800W Flex Slot Platinum Power Supply Unit',
    category: 'POWER',
    config: 'ALPHA-888',
    status: 'EXTRA_IN_BOM',
    price: 350,
    drift: 700,
    reasoning: 'Critical warning: Dual 360W processors with thermal load exceed 800W PSU limits. Recommend upgrade to 1600W/2200W redundant supplies.',
    trace: ['Phase 6: Missing dependencies added.', 'Phase 11: Power balance threshold checking failed.'],
    capabilities: ['800W Hot-plug', '80Plus Platinum']
  },
  {
    id: 'D-OTH-01',
    part: 'SHADOW-DRIVE-CAGE',
    partKey: 'SHADOWDRIVECAGE',
    boqQty: 1,
    bomQty: 0,
    boqDesc: 'Additional Drive Cage for 10DW Optimization',
    bomDesc: 'Additional Drive Cage for 10DW Optimization',
    category: 'SUPPORT_SERVICE',
    config: 'ALPHA-888',
    status: 'SIPHONED',
    price: 500,
    drift: -500,
    reasoning: 'Siphoned from parallel configuration slice to satisfy chassis enclosure space.',
    trace: ['Phase 5: Siphoned to optimize budget drift.'],
    capabilities: ['Siphoned Allocation']
  },
  {
    id: 'D-GH-01',
    part: 'GHOST-RISER-CARD',
    partKey: 'GHOSTRISERCARD',
    boqQty: 2,
    bomQty: 0,
    boqDesc: 'GHOST: Dual-Slot PCIe Gen5 Primary Riser Board',
    bomDesc: '(Awaiting Ingestion / Missing from Quote)',
    category: 'RISER',
    config: 'ALPHA-888',
    status: 'MISSING_IN_BOM',
    price: 300,
    drift: -600,
    reasoning: 'Aether physical slot checker warns: 10DW AI build requires primary riser boards. Resolve instantly below.',
    trace: ['Phase 9: Unresolved dependent components flagged.', 'Phase 15: Critical Forensic blocking issue.'],
    capabilities: ['PCIe Gen5 x16', 'Double-Width Support']
  }
];

// ==========================================
// 2. MOCK MULTI-UCID LOGS AND SCENARIOS
// ==========================================

export const MOCK_MULTI_MISSION_DATASYNC: Record<string, DiffRow[]> = {
  'GLOBAL': [], // Fallback, will be populated or filtered in App
  'ALPHA-888': [
    ...DEMO_ROWS_DL385_GEN11
  ],
  'DELL-PRO-25': [
    {
      id: 'D-1',
      part: 'BOSS-N1',
      partKey: 'BOSSN1',
      boqQty: 1,
      bomQty: 2,
      boqDesc: 'Dell BOSS-N1 Boot Controller Card with 2x M.2 SSDs',
      bomDesc: 'Dell BOSS-N1 Boot Controller Card with 2x M.2 SSDs',
      category: 'STORAGE_CTRL',
      config: 'DELL-PRO-25',
      status: 'QTY_MISMATCH',
      price: 650,
      drift: 650,
      reasoning: 'Redundancy multiplier applied.',
      trace: ['Phase 6: Provision mismatch resolved.'],
      capabilities: ['RAID1 Boot', 'Hot-plug M.2 SATA']
    },
    {
      id: 'D-2',
      part: 'XEON-G-6430',
      partKey: 'XEON6430',
      boqQty: 2,
      bomQty: 2,
      boqDesc: 'Intel Xeon Gold 6430 Multi-Core Processor (32-core)',
      bomDesc: 'Intel Xeon Gold 6430 Multi-Core Processor (32-core)',
      category: 'PROCESSOR',
      config: 'DELL-PRO-25',
      status: 'MATCHED',
      price: 5200,
      drift: 0,
      reasoning: 'Dual socket standard CPU configuration.',
      trace: ['Phase 2: Verified regional compliance.'],
      capabilities: ['Intel Security', 'Symmetric Channel Support']
    },
    {
      id: 'D-3',
      part: 'DELL-1100W-PSU',
      partKey: 'DELL1100W',
      boqQty: 2,
      bomQty: 2,
      boqDesc: 'Dell 1100W Titanium Redundant Hot-swap Power Supply Unit',
      bomDesc: 'Dell 1100W Titanium Redundant Hot-swap Power Supply Unit',
      category: 'POWER',
      config: 'DELL-PRO-25',
      status: 'MATCHED',
      price: 490,
      drift: 0,
      reasoning: 'Power envelope verified for mid-intensity compute load.',
      trace: ['Phase 5: Power calculations passed.'],
      capabilities: ['Titanium efficiency', '1100W limit']
    },
    {
      id: 'D-4',
      part: 'DELL-R660-CHAS',
      partKey: 'DELLR660CHAS',
      boqQty: 1,
      bomQty: 0,
      boqDesc: 'Dell PowerEdge R660 1U Server Chassis',
      bomDesc: '(Awaiting Ingestion / Missing from Quote)',
      category: 'CHASSIS',
      config: 'DELL-PRO-25',
      status: 'MISSING_IN_BOM',
      price: 3200,
      drift: -3200,
      reasoning: 'Dell Premier catalog feed mismatch. Enclosure missing from Quote bundle.',
      trace: ['Phase 9: Highlighted chassis configuration mismatch.'],
      capabilities: ['1U Enclosure', 'Redundant fans']
    }
  ],
  'STORAGE-MAX-99': [
    {
      id: 'S-1',
      part: 'NVME-1.92TB-SSD',
      partKey: 'NVME192TBSSD',
      boqQty: 24,
      bomQty: 24,
      boqDesc: '1.92TB enterprise U.3 PCIe NVMe SSD Drive',
      bomDesc: '1.92TB enterprise U.3 PCIe NVMe SSD Drive',
      category: 'NVME_DRIVE',
      config: 'STORAGE-MAX-99',
      status: 'MATCHED',
      price: 320,
      drift: 0,
      reasoning: 'High-density array storage matches.',
      trace: ['Phase 10: Drive slots fully saturated.'],
      capabilities: ['U.3 NVMe', 'Read Intensive', '15mm Form']
    },
    {
      id: 'S-2',
      part: 'SAS-EXPANDER',
      partKey: 'SASEXPANDER',
      boqQty: 2,
      bomQty: 2,
      boqDesc: 'Microchip 12G 24-Port SAS Expander Card Option',
      bomDesc: 'Microchip 12G 24-Port SAS Expander Card Option',
      category: 'STORAGE_CTRL',
      config: 'STORAGE-MAX-99',
      status: 'MATCHED',
      price: 480,
      drift: 0,
      reasoning: 'Enables high density backplane cascading.',
      trace: ['Phase 6: Backplane channel routing check complete.'],
      capabilities: ['12G SAS', '24 internal ports']
    },
    {
      id: 'S-3',
      part: 'HPE-DL380-CAGE',
      partKey: 'HPEDL380CAGE',
      boqQty: 0,
      bomQty: 1,
      boqDesc: '',
      bomDesc: 'HPE DL380 Gen11 8SFF NVMe/SAS Drive Cage Kit',
      category: 'STORAGE_DRIVE',
      config: 'STORAGE-MAX-99',
      status: 'EXTRA_IN_BOM',
      price: 380,
      drift: 380,
      reasoning: 'Backplane cage injected on BOM to support extra high-speed drive slots.',
      trace: ['Phase 10: Drive slots requirement satisfied.'],
      capabilities: ['8SFF Cage', 'SFF form factor']
    },
    {
      id: 'S-4',
      part: 'HPE-1600W-PSU',
      partKey: 'HPE1600W',
      boqQty: 2,
      bomQty: 2,
      boqDesc: 'HPE 1600W Flex Slot Platinum Power Supply Unit',
      bomDesc: 'HPE 1600W Flex Slot Platinum Power Supply Unit',
      category: 'POWER',
      config: 'STORAGE-MAX-99',
      status: 'MATCHED',
      price: 550,
      drift: 0,
      reasoning: 'Heavy duty PSU pair ensuring dynamic drive burst activity security.',
      trace: ['Phase 5: Certified redundant power delivery.'],
      capabilities: ['1600W Hot-Plug', '94% Efficiency']
    }
  ]
};

// ==========================================
// 3. 712 COMPILED HARDWARE CATALOG ITEMS
// ==========================================

const BASE_CATALOG_DATA: CatalogItem[] = [
  { SKU: 'P50000-B21', Description: 'HPE ProLiant DL385 Gen11 10DW Chassis Enclosure', Category: 'CHASSIS', MSRP: 12500, Platforms: 'DL385_G11', isTAA: true, isSovereign: true },
  { SKU: 'P12345-B21', Description: 'AMD EPYC 9654 Processor 96-core 360W CPU SP5 Kit', Category: 'PROCESSOR', MSRP: 8000, Platforms: 'DL385_G11, DL380_G12', isTAA: true },
  { SKU: 'P64846-B21', Description: 'HPE 64GB DDR5 4800 Registered Smart Memory RDIMM', Category: 'MEMORY', MSRP: 650, Platforms: 'DL385_G11, DL380_G12, DL580_G12', isTAA: true },
  { SKU: '800W-PSU', Description: 'HPE 800W Flex Slot Platinum Hot Plug Power Supply Unit', Category: 'PSU_PLATINUM', MSRP: 350, Platforms: 'DL385_G11, DL380_G12', isTAA: true, isSovereign: true },
  { SKU: '1600W-PSU', Description: 'HPE 1600W Flex Slot Titanium Hot Plug Power Supply Unit', Category: 'PSU_PLATINUM', MSRP: 550, Platforms: 'DL385_G11, DL380_G12', isTAA: true },
  { SKU: 'BOSS-N1', Description: 'Dell BOSS-N1 Boot Optimized Storage Controller with 2x M.2 drives', Category: 'STORAGE_CTRL', MSRP: 650, Platforms: 'PowerEdge_16G, PowerEdge_17G', isTAA: false },
  { SKU: 'NVME-1.92TB-SSD', Description: 'HPE 1.92TB enterprise U.3 PCIe NVMe SSD Mainstream Drive', Category: 'NVME_DRIVE', MSRP: 320, Platforms: 'DL385_G11, DL380_G12, DL580_G12', isTAA: true },
  { SKU: 'GHOST-RISER-CARD', Description: 'HPE DL385 Gen11 PCIe x16 Primary Riser Board Option', Category: 'RISER', MSRP: 300, Platforms: 'DL385_G11', isTAA: true },
  { SKU: '512485-B21', Description: 'HPE iLO Advanced 1-server License with 1yr Support on iLO Licensed Features', Category: 'SUPPORT_SERVICE', MSRP: 0, Platforms: 'DL380_G12, DL380a_G12', isTAA: true },
  { SKU: '512487-B21', Description: 'HPE iLO Advanced AKA Tracking License with 1yr Support on iLO Licensed Features', Category: 'PROCESSOR', MSRP: 0, Platforms: 'DL380_G12, DL380a_G12', isTAA: true },
  { SKU: '666987-B21', Description: 'HPE Small Form Factor Hard Drive Blank Kit', Category: 'PROCESSOR', MSRP: 0, Platforms: 'DL380_G12', isTAA: true },
  { SKU: '701498-B21', Description: 'HPE Mobile USB DVD-RW Optical Drive', Category: 'PROCESSOR', MSRP: 0, Platforms: 'DL380_G12, DL385_G11', isTAA: true },
  { SKU: '726536-B21', Description: 'HPE 9.5mm SATA DVD-ROM Optical Drive', Category: 'PROCESSOR', MSRP: 0, Platforms: 'DL380_G12, DL385_G11', isTAA: true },
  { SKU: '726537-B21', Description: 'HPE 9.5mm SATA DVD-RW Optical Drive', Category: 'PROCESSOR', MSRP: 0, Platforms: 'DL380_G12, DL385_G11', isTAA: true },
  { SKU: '804398-B21', Description: 'HPE Smart Array E208e-p SR Gen10 (8 External Lanes/No Cache) 12G SAS PCIe Plug-in Controller', Category: 'PROCESSOR', MSRP: 0, Platforms: 'DL380_G12, DL385_G11', isTAA: true },
  { SKU: '807878-B21', Description: 'HPE Gen9 LFF HDD Spade Blank Kit', Category: 'PROCESSOR', MSRP: 0, Platforms: 'DL380_G12', isTAA: true },
  { SKU: '829335-B21', Description: 'HPE 100Gb 1-port OP101 QSFP28 x16 PCIe Gen3 with Intel Omni-Path Architecture Adapter', Category: 'PROCESSOR', MSRP: 0, Platforms: 'DL380a_G12', isTAA: true },
  { SKU: '833928-B21', Description: 'HPE 4TB SAS 12G Business Critical 7.2K LFF LP 1-year Warranty Multi Vendor HDD', Category: 'PROCESSOR', MSRP: 0, Platforms: 'DL385_G11', isTAA: true }
];

// Helper to generate exactly 712 items matching the distribution counts
export const generateCatalog = (): CatalogItem[] => {
  const items: CatalogItem[] = [...BASE_CATALOG_DATA];

  // Distribution Target Counts to reach exactly 712 SKUs:
  // STORAGE_ENCLOSURE: 135
  // PROCESSOR: 98
  // CHASSIS_CONFIG: 71
  // NETWORKING: 60
  // STORAGE_DRIVE: 55
  // CABLE: 48
  // NVME_DRIVE: 45
  // UNKNOWN: 41
  // MEMORY: 32
  // GPU_NODE: 22
  // MECHANICAL: 21
  // PSU_PLATINUM: 20
  // RISER: 15
  // STORAGE_CTRL: 14
  // CHASSIS: 11
  // SUPPORT_SERVICE: 10
  // RAIL_MECH: 5
  // FAN: 4
  // FAN_STD: 2
  // MGMT_SOFTWARE: 1
  // SECURITY: 1
  // NODE: 1
  // Remaining to hit exactly 712 line items is filled or dynamically padded.
  
  const categoryTargets: Record<HardwareCategory, number> = {
    'UNKNOWN': 41,
    'CHASSIS': 11,
    'PROCESSOR': 98,
    'MEMORY': 32,
    'STORAGE_DRIVE': 55,
    'CABLE': 48,
    'RISER': 15,
    'NETWORKING': 60,
    'STORAGE_CTRL': 14,
    'GPU_NODE': 22,
    'POWER': 20, // matches PSU_PLATINUM category name in items and stats
    'SUPPORT_SERVICE': 10,
    'RAIL_MECH': 5,
    'FAN': 6, // FAN + FAN_STD + mechanicals
  } as unknown as Record<HardwareCategory, number>;

  // Let's create an item generation loop to hit exactly 712 total items
  const categoriesToPad = Object.keys(categoryTargets) as HardwareCategory[];
  
  // Create flat helper counts
  const currentCounts: Record<string, number> = {};
  items.forEach(item => {
    currentCounts[item.Category] = (currentCounts[item.Category] || 0) + 1;
  });

  const exactCategoryDistribution: Record<string, number> = {
    'STORAGE_ENCLOSURE': 135,
    'PROCESSOR': 98,
    'CHASSIS_CONFIG': 71,
    'NETWORKING': 60,
    'STORAGE_DRIVE': 55,
    'CABLE': 48,
    'NVME_DRIVE': 45,
    'UNKNOWN': 41,
    'MEMORY': 32,
    'GPU_NODE': 22,
    'MECHANICAL': 21,
    'PSU_PLATINUM': 20,
    'RISER': 15,
    'STORAGE_CTRL': 14,
    'CHASSIS': 11,
    'SUPPORT_SERVICE': 10,
    'RAIL_MECH': 5,
    'FAN': 4,
    'FAN_STD': 2,
    'MGMT_SOFTWARE': 1,
    'SECURITY': 1,
    'NODE': 1,
  };

  // Build items mapping
  let generatedId = 10000;
  Object.entries(exactCategoryDistribution).forEach(([catName, targetCount]) => {
    const currentCount = items.filter(it => it.Category === catName).length;
    const padNeeded = targetCount - currentCount;
    for (let i = 0; i < padNeeded; i++) {
      generatedId++;
      
      const modelIndex = i % 4; // 0=HPE DL380 Gen12, 1=HPE DL385 Gen11, 2=HPE DL380a Gen11, 3=DELL PE R760 16G
      let platforms = 'DL380_G12';
      let vendor = 'HPE';
      let generation = 'Gen12';
      let solFamily = 'DL380';
      let desc = '';

      if (modelIndex === 0) {
        platforms = 'DL380_G12';
        vendor = 'HPE';
        generation = 'Gen12';
        solFamily = 'DL380';
        desc = `HPE ProLiant DL380 Gen12 Standard option for ${catName} Part ${i + 1}`;
      } else if (modelIndex === 1) {
        platforms = 'DL385_G11';
        vendor = 'HPE';
        generation = 'Gen11';
        solFamily = 'DL385';
        desc = `HPE ProLiant DL385 Gen11 AMD optimized option for ${catName} Part ${i + 1}`;
      } else if (modelIndex === 2) {
        platforms = 'DL380a_G11';
        vendor = 'HPE';
        generation = 'Gen11';
        solFamily = 'DL380a';
        desc = `HPE ProLiant DL380a Gen11 Accelerator/GPU Node option for ${catName} Part ${i + 1}`;
      } else {
        platforms = 'PE_R760_16G';
        vendor = 'DELL';
        generation = '16G';
        solFamily = 'PE_R760';
        desc = `Dell PowerEdge R760 16G Enterprise option for ${catName} Part ${i + 1}`;
      }

      items.push({
        SKU: vendor === 'HPE' ? `P${generatedId}-B21` : `D${generatedId}-B21`,
        Description: desc,
        Category: catName as HardwareCategory,
        MSRP: i % 3 === 0 ? 120 * i : 180,
        Platforms: platforms,
        isTAA: i % 5 !== 0,
        isSovereign: i % 10 === 0,
        Vendor: vendor,
        SolutionFamily: solFamily,
        Generation: generation
      });
    }
  });

  // If we slightly under-produce or over-produce, crop or expand to strictly 712 items.
  while (items.length < 712) {
    generatedId++;
    items.push({
      SKU: `P${generatedId}-B21`,
      Description: `HPE ProLiant DL380 Gen12 Compiled Spec Option Universal Base Node`,
      Category: 'UNKNOWN',
      MSRP: 250,
      Platforms: 'DL380_G12',
      isTAA: true,
      Vendor: 'HPE',
      SolutionFamily: 'DL380',
      Generation: 'Gen12'
    });
  }

  // Also smart-tag any hardcoded base catalog elements in the final dataset
  const parsed = items.map(item => {
    if (item.Vendor && item.SolutionFamily && item.Generation) {
      return item;
    }
    // Parse base items
    let vendor = 'HPE';
    let generation = 'Gen11';
    let solFamily = 'DL380';

    const skuLower = item.SKU.toLowerCase();
    const descLower = item.Description.toLowerCase();
    const platLower = item.Platforms.toLowerCase();

    if (descLower.includes('dell') || skuLower.includes('boss') || platLower.includes('poweredge')) {
      vendor = 'DELL';
      generation = '16G';
      solFamily = 'PE_R760';
    } else if (item.isSovereign || descLower.includes('alletra')) {
      vendor = 'SOVEREIGN_CO';
      generation = 'Gen11';
      solFamily = 'Alletra4110';
    }

    if (descLower.includes('dl385') || platLower.includes('dl385')) {
      solFamily = 'DL385';
      generation = 'Gen11';
    } else if (descLower.includes('dl380a')) {
      solFamily = 'DL380a';
      generation = 'Gen12';
    } else if (descLower.includes('dl380') && (descLower.includes('g12') || descLower.includes('gen12') || platLower.includes('g12'))) {
      solFamily = 'DL380';
      generation = 'Gen12';
    } else if (descLower.includes('gen11') || descLower.includes('g11')) {
      generation = 'Gen11';
    }

    return {
      ...item,
      Vendor: vendor,
      Generation: generation,
      SolutionFamily: solFamily
    };
  });
  
  if (parsed.length > 712) {
    return parsed.slice(0, 712);
  }

  return parsed;
};

// ==========================================
// 4. MOCK AUDIT LOGS FOR CLINICAL VERIFICATION
// ==========================================

export const DEMO_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'AL-01', phase: 1, phaseName: 'Detection', severity: 'PASS', category: 'Platform Profile', message: 'HPE ProLiant structural DNA locks verified for chassis DL385.' },
  { id: 'AL-02', phase: 3, phaseName: 'Context Detection', severity: 'PASS', category: 'Architecture Context', message: 'Calculated baseline: Sapphire Rapids/Genoa step matches Gen11 requirements.' },
  { id: 'AL-03', phase: 8, phaseName: 'Socket Parity Check', severity: 'ADVICE', category: 'DDR5 Population', message: 'HPE DIMM population socket balance check warns:optimal memory population (1DPC) is 12 slots per CPU (24 total). Currently mapped: 16 DIMMs.', affectedPart: 'P64846-B21' },
  { id: 'AL-04', phase: 11, phaseName: 'Thermal Adequacy', severity: 'WARNING', category: 'PSU Sizing S5', message: 'PSU load warn: Dual 360W CPU TDP TDP combined with accelerator nodes might crash under peak 800W. Titanium 1600W+ supply recommended.', affectedPart: '800W-PSU' },
  { id: 'AL-05', phase: 11, phaseName: 'Electrical Infrastructure', severity: 'FATAL', category: 'Power Cable Validation', message: 'Power Sizing Warn: 1600W/2200W Titanium PSUs require heavy duty C19 power outlets. standard C13 outlet cords are rejected.', affectedPart: '800W-PSU' },
  { id: 'AL-06', phase: 15, phaseName: 'Forensic Blocking Gate', severity: 'FATAL', category: 'Secondary PCIe Riser Board', message: 'Chassis PCIe slots block: Double-width AI configuration misses secondary and tertiary riser board dependencies.', affectedPart: 'GHOST-RISER-CARD' },
  { id: 'AL-07', phase: 12, phaseName: 'Financial Recon', severity: 'FISCAL', category: 'Drift Valuation', message: 'Pricing calibrated: MSRP discrepancy of $700 calculated due to redundant memory RDIMMs.' }
];

// ==========================================
// 5. MOCK PIPELINE STEPS FOR LIVE TERMINAL
// ==========================================

export const SIMULATOR_MISSION_STEPS: MissionLog[] = [
  { timestamp: '11:07:05', type: 'INFO', ucid: 'GLOBAL', message: '🚀 Launching pre-flight simulation engine...' },
  { timestamp: '11:07:08', type: 'FORENSIC', ucid: 'GLOBAL', message: '[DNA] Detected HPE ProLiant Gen11 dual-processor profile.' },
  { timestamp: '11:07:11', type: 'INFO', ucid: 'GLOBAL', message: '🚀 Step 1: Siphoning (Data Extraction) - Siphoning Architectural Metadata...' },
  { timestamp: '11:07:13', type: 'PORTAL', ucid: 'GLOBAL', message: 'Partner Portal: Injected Chassis DL385 Enclosure (P50000-B21)' },
  { timestamp: '11:07:15', type: 'HEAL', ucid: 'GLOBAL', message: '🩹 [AUTO-HEAL] Fixed missing primary riser kit. Co-injecting item (GHOST-RISER-CARD).' },
  { timestamp: '11:07:18', type: 'SUCCESS', ucid: 'GLOBAL', message: '🏆 UCID CONFIRMED: MOCK-5080501412 — Graduation Certified ✅' }
];
