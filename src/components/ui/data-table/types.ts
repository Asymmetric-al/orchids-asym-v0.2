import type { Column, ColumnDef, Row, Table } from "@tanstack/react-table"

export type DataTableFilterVariant =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "date"
  | "date-range"
  | "boolean"

export interface DataTableFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}

export interface DataTableFilterField<TData> {
  id: keyof TData | string
  label: string
  placeholder?: string
  variant?: DataTableFilterVariant
  options?: DataTableFilterOption[]
}

export interface DataTableAdvancedFilterField<TData>
  extends DataTableFilterField<TData> {
  isMulti?: boolean
}

export interface DataTableRowAction<TData> {
  row: Row<TData>
  type: "update" | "delete"
}

export interface DataTableConfig {
  enableRowSelection?: boolean
  enableMultiSort?: boolean
  enableColumnResizing?: boolean
  enableColumnPinning?: boolean
  enableGlobalFilter?: boolean
  enableColumnVisibility?: boolean
  enablePagination?: boolean
  enableFilters?: boolean
  enableAdvancedFilters?: boolean
  enableSorting?: boolean
  enableFullscreen?: boolean
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
}

export const DEFAULT_PAGE_SIZES = [10, 20, 30, 50, 100] as const

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filterVariant?: DataTableFilterVariant
    filterOptions?: DataTableFilterOption[]
    label?: string
    headerClassName?: string
    cellClassName?: string
  }
}

export type {
  Column,
  ColumnDef,
  Row,
  Table,
}
