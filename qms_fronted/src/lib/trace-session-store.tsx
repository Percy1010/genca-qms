"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react"
import type { ComboboxOption } from "@/components/trace/remote-combobox"
import type {
  ForwardNode,
  ForwardPathStep,
} from "@/lib/forward-trace-model"
import type {
  ReverseMaterialNode,
  ReverseProductNode,
} from "@/lib/reverse-trace-model"

/* ==================== 正向追溯会话状态 ==================== */

export interface ForwardTraceSession {
  /** 已选中的起点物料编码 */
  originCode: string | null
  /** 远程搜索结果候选 */
  skuOptions: ComboboxOption[]
  searching: boolean
  /** 批次编号多选过滤：空数组表示显示全部批次；选中后结果仅显示这些批次 */
  selectedBatches: string[]
  /** 逐层下钻路径（当前层为最后一步） */
  path: ForwardPathStep[]
  /** 当前节点查询结果 */
  result: ForwardNode | null
  error: string | null
}

export const emptyForwardTraceSession: ForwardTraceSession = {
  originCode: null,
  skuOptions: [],
  searching: false,
  selectedBatches: [],
  path: [],
  result: null,
  error: null,
}

/* ==================== 逆向追溯会话状态 ==================== */

export interface BackwardPathStep {
  code: string
  batchNo?: string
  name?: string
  category?: string
}

export interface BackwardTraceSession {
  spuOptions: ComboboxOption[]
  spuSearching: boolean
  selectedSpuNo: string | null
  skuOptions: ComboboxOption[]
  selectedSkuCode: string | null
  batchKeyword: string
  selectedBatch: string | null
  path: BackwardPathStep[]
  productNode: ReverseProductNode | null
  materialNode: ReverseMaterialNode | null
  searched: boolean
  error: string | null
}

export const emptyBackwardTraceSession: BackwardTraceSession = {
  spuOptions: [],
  spuSearching: false,
  selectedSpuNo: null,
  skuOptions: [],
  selectedSkuCode: null,
  batchKeyword: "",
  selectedBatch: null,
  path: [],
  productNode: null,
  materialNode: null,
  searched: false,
  error: null,
}

/* ==================== 上下文 ==================== */

interface TraceSessionContextType {
  /** 正向追溯会话（跨页签/导航保留，应用级 Provider 存活） */
  forward: ForwardTraceSession
  setForward: Dispatch<SetStateAction<ForwardTraceSession>>
  /** 逆向追溯会话 */
  backward: BackwardTraceSession
  setBackward: Dispatch<SetStateAction<BackwardTraceSession>>
  /** 重置指定方向的会话 */
  resetForward: () => void
  resetBackward: () => void
}

const TraceSessionContext = createContext<TraceSessionContextType | null>(null)

/**
 * 追溯会话存储：将「正向/逆向追溯」页面在查询过程中的状态（搜索词、已选批次、
 * 追溯路径、查询结果等）提升到应用级 Provider。
 *
 * 由于该 Provider 挂载于路由重挂载边界（ContentFrame 的 key）之上，在页签/路由
 * 之间切换时不会重新挂载，从而使追溯页面切走再切回后仍保留之前的查询结果。
 */
export function TraceSessionProvider({ children }: { children: ReactNode }) {
  const [forward, setForward] = useState<ForwardTraceSession>(
    emptyForwardTraceSession,
  )
  const [backward, setBackward] = useState<BackwardTraceSession>(
    emptyBackwardTraceSession,
  )

  const resetForward = useCallback(() => setForward(emptyForwardTraceSession), [])
  const resetBackward = useCallback(
    () => setBackward(emptyBackwardTraceSession),
    [],
  )

  return (
    <TraceSessionContext.Provider
      value={{
        forward,
        setForward,
        backward,
        setBackward,
        resetForward,
        resetBackward,
      }}
    >
      {children}
    </TraceSessionContext.Provider>
  )
}

export function useTraceSession() {
  const ctx = useContext(TraceSessionContext)
  if (!ctx) throw new Error("useTraceSession must be used within TraceSessionProvider")
  return ctx
}