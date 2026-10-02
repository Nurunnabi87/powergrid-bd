"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { z } from "zod";
import type { FieldSpec } from "@/components/admin/network/resource-form-dialog";
import type { RelationKey } from "@/components/admin/network/use-relation-options";
import { AccountStatusBadge, StatusBadge } from "@/components/shared/status-badge";
import { formatNumber, humanize } from "@/lib/format";
import type { NetworkTab } from "@/lib/network-resources";
import {
  areaSchema,
  connectionSchema,
  feederSchema,
  substationSchema,
  zoneSchema,
} from "@/lib/validations/network";
import {
  CONNECTION_STATUSES,
  CONNECTION_TYPES,
  PRIORITY_TIERS,
  SUBSTATION_STATUSES,
  type Area,
  type Connection,
  type Feeder,
  type Substation,
  type Zone,
} from "@/types/domain";

export interface FilterSpec {
  param: string;
  label: string;
  options?: readonly string[];
  relation?: RelationKey;
}

export interface ResourceConfig<T extends { id: string }> {
  columns: ColumnDef<T, unknown>[];
  filters: FilterSpec[];
  fields: FieldSpec[];
  schema: z.ZodType<Record<string, unknown>>;
  defaults: Record<string, string>;
  toForm: (row: T) => Record<string, string>;
  label: (row: T) => string;
  searchPlaceholder: string;
}

const code = (value: string) => <span className="font-mono text-xs">{value}</span>;
const muted = (value: string) => <span className="text-sm text-muted-foreground">{value}</span>;
const titled = (title: string, subtitle: string) => (
  <div className="min-w-40">
    <p className="font-medium">{title}</p>
    <p className="text-xs text-muted-foreground">{subtitle}</p>
  </div>
);

const zones: ResourceConfig<Zone> = {
  searchPlaceholder: "Search name, code or city…",
  columns: [
    { id: "name", header: "Zone", cell: ({ row }) => titled(row.original.name, row.original.code) },
    { id: "city", header: "City", cell: ({ row }) => muted([row.original.city, row.original.district].filter(Boolean).join(", ")) },
    { id: "children", header: "Substations", cell: ({ row }) => row.original._count.substations },
  ],
  filters: [],
  fields: [
    { name: "name", label: "Name", kind: "text", placeholder: "Dhaka North" },
    { name: "code", label: "Code", kind: "text", placeholder: "DHK-N", description: "Unique; letters, numbers and dashes." },
    { name: "city", label: "City", kind: "text" },
    { name: "district", label: "District (optional)", kind: "text" },
  ],
  schema: zoneSchema,
  defaults: { name: "", code: "", city: "", district: "" },
  toForm: (row) => ({ name: row.name, code: row.code, city: row.city, district: row.district ?? "" }),
  label: (row) => row.name,
};

const substations: ResourceConfig<Substation> = {
  searchPlaceholder: "Search name or code…",
  columns: [
    { id: "name", header: "Substation", cell: ({ row }) => titled(row.original.name, row.original.code) },
    { id: "zone", header: "Zone", cell: ({ row }) => muted(row.original.zone.name) },
    { id: "capacity", header: "Capacity", cell: ({ row }) => `${formatNumber(row.original.capacityMva, 1)} MVA` },
    { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: "children", header: "Feeders", cell: ({ row }) => row.original._count.feeders },
  ],
  filters: [
    { param: "zoneId", label: "Zones", relation: "zones" },
    { param: "status", label: "Status", options: SUBSTATION_STATUSES },
  ],
  fields: [
    { name: "name", label: "Name", kind: "text" },
    { name: "code", label: "Code", kind: "text", placeholder: "SS-DHK-N-3" },
    { name: "zoneId", label: "Zone", kind: "relation", relation: "zones" },
    { name: "capacityMva", label: "Capacity (MVA)", kind: "number" },
    { name: "status", label: "Status", kind: "enum", options: SUBSTATION_STATUSES },
  ],
  schema: substationSchema,
  defaults: { name: "", code: "", zoneId: "", capacityMva: "", status: "OPERATIONAL" },
  toForm: (row) => ({ name: row.name, code: row.code, zoneId: row.zone.id, capacityMva: String(row.capacityMva), status: row.status }),
  label: (row) => row.name,
};

const feeders: ResourceConfig<Feeder> = {
  searchPlaceholder: "Search name, code or voltage…",
  columns: [
    { id: "name", header: "Feeder", cell: ({ row }) => titled(row.original.name, row.original.code) },
    { id: "substation", header: "Substation", cell: ({ row }) => titled(row.original.substation.name, row.original.substation.zone.name) },
    { id: "voltage", header: "Voltage", cell: ({ row }) => code(row.original.voltageLevel) },
    { id: "load", header: "Load", cell: ({ row }) => `${formatNumber(row.original.loadKw)} kW` },
    { id: "children", header: "Areas", cell: ({ row }) => row.original._count.areas },
  ],
  filters: [
    { param: "zoneId", label: "Zones", relation: "zones" },
    { param: "substationId", label: "Substations", relation: "substations" },
  ],
  fields: [
    { name: "name", label: "Name", kind: "text" },
    { name: "code", label: "Code", kind: "text", placeholder: "FD-DHK-N-13" },
    { name: "substationId", label: "Substation", kind: "relation", relation: "substations" },
    { name: "voltageLevel", label: "Voltage level", kind: "text", placeholder: "11kV" },
    { name: "loadKw", label: "Load (kW)", kind: "number", description: "Used to decide how much load shedding this feeder removes." },
  ],
  schema: feederSchema,
  defaults: { name: "", code: "", substationId: "", voltageLevel: "11kV", loadKw: "" },
  toForm: (row) => ({
    name: row.name,
    code: row.code,
    substationId: row.substation.id,
    voltageLevel: row.voltageLevel,
    loadKw: String(row.loadKw),
  }),
  label: (row) => row.name,
};

const areas: ResourceConfig<Area> = {
  searchPlaceholder: "Search name or code…",
  columns: [
    { id: "name", header: "Area", cell: ({ row }) => titled(row.original.name, row.original.code) },
    { id: "feeder", header: "Feeder", cell: ({ row }) => titled(row.original.feeder.name, row.original.feeder.substation.zone.name) },
    { id: "priority", header: "Priority", cell: ({ row }) => <StatusBadge status={row.original.priorityTier} kind="scale" /> },
    { id: "population", header: "Population", cell: ({ row }) => formatNumber(row.original.population) },
    { id: "children", header: "Meters", cell: ({ row }) => row.original._count.connections },
  ],
  filters: [
    { param: "zoneId", label: "Zones", relation: "zones" },
    { param: "priorityTier", label: "Priority", options: PRIORITY_TIERS },
  ],
  fields: [
    { name: "name", label: "Name", kind: "text" },
    { name: "code", label: "Code", kind: "text" },
    { name: "feederId", label: "Feeder", kind: "relation", relation: "feeders" },
    { name: "population", label: "Population", kind: "number" },
    {
      name: "priorityTier",
      label: "Priority tier",
      kind: "enum",
      options: PRIORITY_TIERS,
      description: "CRITICAL areas (hospitals, water pumps) are never load-shed.",
    },
  ],
  schema: areaSchema,
  defaults: { name: "", code: "", feederId: "", population: "0", priorityTier: "NORMAL" },
  toForm: (row) => ({
    name: row.name,
    code: row.code,
    feederId: row.feeder.id,
    population: String(row.population),
    priorityTier: row.priorityTier,
  }),
  label: (row) => row.name,
};

const connections: ResourceConfig<Connection> = {
  searchPlaceholder: "Search meter number…",
  columns: [
    { id: "meter", header: "Meter", cell: ({ row }) => titled(row.original.meterNo, humanize(row.original.connectionType)) },
    { id: "customer", header: "Customer", cell: ({ row }) => titled(row.original.customer.name, row.original.customer.email) },
    { id: "area", header: "Area", cell: ({ row }) => titled(row.original.area.name, row.original.area.feeder.name) },
    { id: "tariff", header: "Tariff", cell: ({ row }) => `${row.original.tariffRate} BDT/kWh` },
    { id: "status", header: "Status", cell: ({ row }) => <AccountStatusBadge status={row.original.status} /> },
  ],
  filters: [
    { param: "areaId", label: "Areas", relation: "areas" },
    { param: "connectionType", label: "Types", options: CONNECTION_TYPES },
    { param: "status", label: "Status", options: CONNECTION_STATUSES },
  ],
  fields: [
    { name: "meterNo", label: "Meter number", kind: "text", placeholder: "MTR-100014" },
    { name: "customerId", label: "Customer", kind: "relation", relation: "customers", createOnly: true },
    { name: "areaId", label: "Area", kind: "relation", relation: "areas" },
    { name: "connectionType", label: "Connection type", kind: "enum", options: CONNECTION_TYPES },
    { name: "tariffRate", label: "Tariff (BDT/kWh)", kind: "number" },
    { name: "status", label: "Status", kind: "enum", options: CONNECTION_STATUSES },
  ],
  schema: connectionSchema,
  defaults: { meterNo: "", customerId: "", areaId: "", connectionType: "RESIDENTIAL", tariffRate: "7.5", status: "ACTIVE" },
  toForm: (row) => ({
    meterNo: row.meterNo,
    customerId: row.customer.id,
    areaId: row.area.id,
    connectionType: row.connectionType,
    tariffRate: String(row.tariffRate),
    status: row.status,
  }),
  label: (row) => row.meterNo,
};

// Each config is typed to its own row; the table consumes them uniformly.
export const RESOURCE_CONFIGS = { zones, substations, feeders, areas, connections } as unknown as Record<
  NetworkTab,
  ResourceConfig<{ id: string }>
>;
