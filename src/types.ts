/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HardwareCategory =
  | 'CHASSIS'
  | 'PROCESSOR'
  | 'MEMORY'
  | 'STORAGE_DRIVE'
  | 'NVME_DRIVE'
  | 'CABLE'
  | 'RISER'
  | 'NETWORKING'
  | 'STORAGE_CTRL'
  | 'GPU_NODE'
  | 'FAN'
  | 'FAN_STD'
  | 'POWER'
  | 'PSU_PLATINUM'
  | 'SUPPORT_SERVICE'
  | 'RAIL_MECH'
  | 'STORAGE_ENCLOSURE'
  | 'CHASSIS_CONFIG'
  | 'MECHANICAL'
  | 'MGMT_SOFTWARE'
  | 'SECURITY'
  | 'NODE'
  | 'UNKNOWN';

export interface BaseRow {
  id: string;
  part: string;
  qty: number;
  desc: string;
  category: HardwareCategory;
  price?: number;
  _parentPart?: string;
  _ucid?: string;
}

export type RowStatus =
  | 'MATCHED'
  | 'QTY_MISMATCH'
  | 'SKU_MISMATCH'
  | 'SIPHONED'
  | 'SUBSTITUTED'
  | 'MISSING_IN_BOM'
  | 'EXTRA_IN_BOM'
  | 'REJECTED';

export interface DiffRow {
  id: string;
  part: string;
  partKey: string;
  boqQty: number;
  bomQty: number;
  boqDesc: string;
  bomDesc: string;
  category: HardwareCategory;
  config: string;
  status: RowStatus;
  price: number;
  drift: number;
  reasoning?: string;
  trace?: string[];
  capabilities?: string[];
}

export interface AuditLogEntry {
  id: string;
  phase: number;
  phaseName: string;
  severity: 'FATAL' | 'WARNING' | 'ADVICE' | 'PASS' | 'FISCAL';
  category: string;
  message: string;
  affectedPart?: string;
}

export interface CatalogItem {
  SKU: string;
  Description: string;
  Category: HardwareCategory;
  MSRP: number;
  Platforms: string;
  Dependencies?: string;
  isTAA: boolean;
  isSovereign?: boolean;
  MaxQty?: number;
  Attributes?: Record<string, string | number | boolean>;
  Vendor?: string;
  SolutionFamily?: string;
  Generation?: string;
}

export interface MissionLog {
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'HEAL' | 'FORENSIC' | 'EXCEPTION' | 'PORTAL' | 'SYSTEM';
  ucid: string;
  message: string;
}

export interface ServerSpec {
  chassisName: string;
  family: 'HPE_PROLIANT' | 'DELL_POWEREDGE' | 'HIGH_DENSITY_ST';
  generation: string;
  tdpLimit: number;
  maxDimmSlots: number;
  maxDriveBays: number;
  formFactor: '1U' | '2U' | '4U';
}

export interface DealVersion {
  id: string;
  version: string;
  title: string;
  description: string;
  timestamp: string;
  ucid: string;
  totalCost: number;
  netDrift: number;
  rowCount: number;
  rows: DiffRow[];
  platform: string;
  author: string;
}
