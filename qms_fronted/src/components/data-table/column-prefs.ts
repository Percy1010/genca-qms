import type {
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  VisibilityState,
} from "@tanstack/react-table"

export type TableColumnPrefs = {
  visibility: VisibilityState
  order: ColumnOrderState
  pinning: ColumnPinningState
  sizing: Record<string, number>
}

const STORAGE_PREFIX = "qms.table-prefs:"

function columnIds<TData, TValue>(columns: ColumnDef<TData, TValue>[]) {
  return columns
    .map((column) => {
      if (column.id) return column.id
      if ("accessorKey" in column && column.accessorKey != null) {
        return String(column.accessorKey)
      }
      return ""
    })
    .filter(Boolean)
}

export function tablePrefsKey<TData, TValue>(
  storageKey: string | undefined,
  columns: ColumnDef<TData, TValue>[],
) {
  if (storageKey) return `${STORAGE_PREFIX}${storageKey}`
  return `${STORAGE_PREFIX}${columnIds(columns).join("|")}`
}

const emptyPrefs = (): TableColumnPrefs => ({
  visibility: {},
  order: [],
  pinning: { left: [], right: [] },
  sizing: {},
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

export function loadTablePrefs(
  key: string,
  knownIds: string[],
): TableColumnPrefs {
  const known = new Set(knownIds)
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return emptyPrefs()
    const parsed = JSON.parse(raw) as unknown
    if (!isRecord(parsed)) return emptyPrefs()

    const visibility: VisibilityState = {}
    if (isRecord(parsed.visibility)) {
      for (const [id, hidden] of Object.entries(parsed.visibility)) {
        if (known.has(id) && typeof hidden === "boolean") visibility[id] = hidden
      }
    }

    const order = Array.isArray(parsed.order)
      ? parsed.order.filter(
          (id): id is string => typeof id === "string" && known.has(id),
        )
      : []
    for (const id of knownIds) {
      if (!order.includes(id)) order.push(id)
    }

    const pinningSrc = isRecord(parsed.pinning) ? parsed.pinning : {}
    const left = Array.isArray(pinningSrc.left)
      ? pinningSrc.left.filter(
          (id): id is string => typeof id === "string" && known.has(id),
        )
      : []
    const right = Array.isArray(pinningSrc.right)
      ? pinningSrc.right.filter(
          (id): id is string => typeof id === "string" && known.has(id),
        )
      : []

    const sizing: Record<string, number> = {}
    if (isRecord(parsed.sizing)) {
      const savedIds = Object.keys(parsed.sizing)
      /* 列被删掉后丢掉旧列宽，按当前列重新铺满；显隐/冻结不影响 */
      const structureChanged = savedIds.some((id) => !known.has(id))
      if (!structureChanged) {
        for (const [id, width] of Object.entries(parsed.sizing)) {
          if (typeof width === "number" && Number.isFinite(width)) {
            sizing[id] = width
          }
        }
      }
    }

    return { visibility, order, pinning: { left, right }, sizing }
  } catch {
    return emptyPrefs()
  }
}

export function saveTablePrefs(key: string, prefs: TableColumnPrefs) {
  const empty =
    Object.keys(prefs.visibility).length === 0 &&
    prefs.order.length === 0 &&
    (prefs.pinning.left?.length ?? 0) === 0 &&
    (prefs.pinning.right?.length ?? 0) === 0 &&
    Object.keys(prefs.sizing).length === 0
  try {
    if (empty) {
      window.localStorage.removeItem(key)
      return
    }
    window.localStorage.setItem(key, JSON.stringify(prefs))
  } catch {
    /* quota / private mode */
  }
}
