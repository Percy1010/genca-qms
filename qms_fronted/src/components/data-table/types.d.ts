import type { RowData } from "@tanstack/react-table"

/* eslint-disable @typescript-eslint/no-unused-vars -- 声明合并需与原始接口保持相同类型参数签名 */
/**
 * 扩展 ColumnMeta：支持在列定义中通过 meta.className 设置表头/单元格样式，
 * meta.title 设置正式列名（供「列设置」面板展示）。
 */
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    title?: string
  }
}
