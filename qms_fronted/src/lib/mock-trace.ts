/**
 * 化妆品产品追溯 - 演示数据与查询函数。
 *
 * 追溯链业务模型（化妆品行业）：
 *   原料批次 → 半成品批次（乳化/料体） → 成品批次（灌装/包装） → 出货记录（渠道/客户）
 *
 * 正式版将由后端 /api/trace/** 提供，此处为可交互前端原型。
 */

export type TraceNodeType = "raw" | "semi" | "finished" | "shipment"

export interface TraceNode {
  id: string
  type: TraceNodeType
  /** 批次号 */
  batchNo: string
  /** 名称 */
  name: string
  /** 规格 */
  spec: string
  /** 关键日期 */
  date: string
  /** 数量/用量 */
  quantity: string
  status: "合格" | "待检" | "不合格"
  /** 点击展开后的明细字段 */
  detail: { label: string; value: string }[]
}

export interface TraceLevel {
  title: string
  type: TraceNodeType
  nodes: TraceNode[]
}

export interface ForwardResult {
  /** 查询起点描述 */
  queryLabel: string
  levels: TraceLevel[]
}

export interface TraceReportData {
  reportNo: string
  productName: string
  productSpec: string
  batchNo: string
  quantity: string
  produceDate: string
  line: string
  /** 追溯链：原料 → 半成品 → 成品 */
  rawLevels: TraceLevel[]
  /** 成品 → 出货去向 */
  shipmentNodes: TraceNode[]
  inspections: { stage: string; recordNo: string; result: string; inspector: string; date: string }[]
  suppliers: { material: string; batch: string; supplier: string; cert: string }[]
  generatedBy: string
  generatedAt: string
}

/** ==================== 节点构造 ==================== */

type NodeInput = Partial<Omit<TraceNode, "type">> & Pick<TraceNode, "id">

const withDefaults =
  (type: TraceNodeType) =>
  (n: NodeInput): TraceNode =>
    ({
      type,
      ...n,
      batchNo: n.batchNo ?? "",
      name: n.name ?? "",
      spec: n.spec ?? "—",
      status: n.status ?? "合格",
      detail: n.detail ?? [],
    }) as TraceNode

const rawNode = withDefaults("raw")
const semiNode = withDefaults("semi")
const finishedNode = withDefaults("finished")
const shipmentNode = withDefaults("shipment")

/** ==================== 正向追溯数据 ==================== */

const forwardDatasets: Record<string, ForwardResult> = {
  "RM-2607-0081": {
    queryLabel: "原料批次 RM-2607-0081（透明质酸钠）",
    levels: [
      {
        title: "原料批次",
        type: "raw",
        nodes: [
          rawNode({
            id: "rm-0081",
            batchNo: "RM-2607-0081",
            name: "透明质酸钠",
            spec: "化妆级 · HA≥95% · 50kg/袋",
            date: "2026-07-06 到货",
            quantity: "200 kg",
            status: "合格",
            detail: [
              { label: "物料编码", value: "M-1021" },
              { label: "供应商", value: "华熙生物科技" },
              { label: "采购单号", value: "PO-2026-0512" },
              { label: "检验方式", value: "IQC 全检 · AQLⅡ" },
              { label: "检验结果", value: "合格" },
              { label: "检验员", value: "张检验" },
              { label: "COA 附件", value: "已归档" },
              { label: "留样编号", value: "LY-2607-0021" },
            ],
          }),
        ],
      },
      {
        title: "半成品批次（投料）",
        type: "semi",
        nodes: [
          semiNode({
            id: "sf-0211",
            batchNo: "SF-2607-0211",
            name: "玻尿酸精华液料体",
            spec: "1,000kg/乳化罐",
            date: "2026-07-08 生产",
            quantity: "投料 8.5 kg",
            status: "合格",
            detail: [
              { label: "投料占比", value: "0.5%（配方）" },
              { label: "乳化线 / 班次", value: "乳化线2# · 甲班" },
              { label: "操作工", value: "王操作" },
              { label: "过程检验 IPQC", value: "合格" },
              { label: "检验员", value: "李检验" },
              { label: "料体留样", value: "LY-2607-0028" },
            ],
          }),
          semiNode({
            id: "sf-0218",
            batchNo: "SF-2607-0218",
            name: "玻尿酸精华液料体",
            spec: "1,000kg/乳化罐",
            date: "2026-07-10 生产",
            quantity: "投料 10.0 kg",
            status: "合格",
            detail: [
              { label: "投料占比", value: "0.5%（配方）" },
              { label: "乳化线 / 班次", value: "乳化线2# · 乙班" },
              { label: "操作工", value: "陈操作" },
              { label: "过程检验 IPQC", value: "合格" },
              { label: "检验员", value: "李检验" },
            ],
          }),
        ],
      },
      {
        title: "成品批次（灌装）",
        type: "finished",
        nodes: [
          finishedNode({
            id: "fp-0351",
            batchNo: "FP-2607-0351",
            name: "玻尿酸精华液 30ml",
            spec: "30ml/支 · 12支/盒",
            date: "2026-07-11 灌装",
            quantity: "13,000 支",
            status: "合格",
            detail: [
              { label: "灌装线", value: "灌装线1#" },
              { label: "灌装自料体", value: "SF-2607-0211" },
              { label: "出厂检验 OQC", value: "合格" },
              { label: "检验员", value: "赵检验" },
              { label: "成品留样", value: "LY-2607-0035" },
            ],
          }),
          finishedNode({
            id: "fp-0362",
            batchNo: "FP-2607-0362",
            name: "玻尿酸精华液 30ml",
            spec: "30ml/支 · 12支/盒",
            date: "2026-07-13 灌装",
            quantity: "15,000 支",
            status: "合格",
            detail: [
              { label: "灌装线", value: "灌装线1#" },
              { label: "灌装自料体", value: "SF-2607-0218" },
              { label: "出厂检验 OQC", value: "合格" },
              { label: "检验员", value: "赵检验" },
            ],
          }),
        ],
      },
      {
        title: "出货记录（去向）",
        type: "shipment",
        nodes: [
          shipmentNode({
            id: "sh-0188",
            batchNo: "SH-2607-0188",
            name: "华东区域经销商 · 上海xx商贸",
            spec: "区域分销",
            date: "2026-07-18 出货",
            quantity: "8,000 支",
            status: "合格",
            detail: [
              { label: "出货单号", value: "SH-2607-0188" },
              { label: "客户类型", value: "区域分销" },
              { label: "物流单号", value: "YD-20260718-0056" },
              { label: "收货联系人", value: "王经销" },
              { label: "放行确认", value: "成品放行已确认" },
            ],
          }),
          shipmentNode({
            id: "sh-0201",
            batchNo: "SH-2607-0201",
            name: "电商自营旗舰店 · 直营仓",
            spec: "电商自营",
            date: "2026-07-20 出货",
            quantity: "6,000 支",
            status: "合格",
            detail: [
              { label: "出货单号", value: "SH-2607-0201" },
              { label: "客户类型", value: "电商自营" },
              { label: "物流单号", value: "SF-20260720-1120" },
              { label: "放行确认", value: "成品放行已确认" },
            ],
          }),
        ],
      },
    ],
  },

  "RM-2607-0093": {
    queryLabel: "原料批次 RM-2607-0093（甘油）",
    levels: [
      {
        title: "原料批次",
        type: "raw",
        nodes: [
          rawNode({
            id: "rm-0093",
            batchNo: "RM-2607-0093",
            name: "甘油（化妆级）",
            spec: "化妆级 · 99.5% · 250kg/桶",
            date: "2026-07-05 到货",
            quantity: "1,000 kg",
            status: "合格",
            detail: [
              { label: "物料编码", value: "M-2011" },
              { label: "供应商", value: "丰益国际" },
              { label: "采购单号", value: "PO-2026-0488" },
              { label: "检验结果", value: "IQC 合格" },
              { label: "检验员", value: "张检验" },
            ],
          }),
        ],
      },
      {
        title: "半成品批次（投料）",
        type: "semi",
        nodes: [
          semiNode({
            id: "sf-0211b",
            batchNo: "SF-2607-0211",
            name: "玻尿酸精华液料体",
            spec: "1,000kg/乳化罐",
            date: "2026-07-08 生产",
            quantity: "投料 350 kg",
            status: "合格",
            detail: [{ label: "投料占比", value: "20%（配方）" }],
          }),
          semiNode({
            id: "sf-0218b",
            batchNo: "SF-2607-0218",
            name: "玻尿酸精华液料体",
            spec: "1,000kg/乳化罐",
            date: "2026-07-10 生产",
            quantity: "投料 400 kg",
            status: "合格",
            detail: [{ label: "投料占比", value: "20%（配方）" }],
          }),
          semiNode({
            id: "sf-0225",
            batchNo: "SF-2607-0225",
            name: "胶原蛋白面霜料体",
            spec: "2,000kg/乳化罐",
            date: "2026-07-12 生产",
            quantity: "投料 500 kg",
            status: "合格",
            detail: [{ label: "投料占比", value: "25%（配方）" }],
          }),
        ],
      },
      {
        title: "成品批次（灌装）",
        type: "finished",
        nodes: [
          finishedNode({
            id: "fp-0351b",
            batchNo: "FP-2607-0351",
            name: "玻尿酸精华液 30ml",
            spec: "30ml/支",
            date: "2026-07-11 灌装",
            quantity: "13,000 支",
            status: "合格",
            detail: [{ label: "灌装自料体", value: "SF-2607-0211" }],
          }),
          finishedNode({
            id: "fp-0362b",
            batchNo: "FP-2607-0362",
            name: "玻尿酸精华液 30ml",
            spec: "30ml/支",
            date: "2026-07-13 灌装",
            quantity: "15,000 支",
            status: "合格",
            detail: [{ label: "灌装自料体", value: "SF-2607-0218" }],
          }),
          finishedNode({
            id: "fp-0370",
            batchNo: "FP-2607-0370",
            name: "胶原蛋白面霜 50g",
            spec: "50g/瓶",
            date: "2026-07-14 灌装",
            quantity: "10,000 瓶",
            status: "合格",
            detail: [{ label: "灌装自料体", value: "SF-2607-0225" }],
          }),
        ],
      },
      {
        title: "出货记录（去向）",
        type: "shipment",
        nodes: [
          shipmentNode({
            id: "sh-0188b",
            batchNo: "SH-2607-0188",
            name: "华东区域经销商",
            spec: "区域分销",
            date: "2026-07-18",
            quantity: "8,000 支",
            status: "合格",
            detail: [],
          }),
          shipmentNode({
            id: "sh-0201b",
            batchNo: "SH-2607-0201",
            name: "电商自营旗舰店",
            spec: "电商自营",
            date: "2026-07-20",
            quantity: "6,000 支",
            status: "合格",
            detail: [],
          }),
          shipmentNode({
            id: "sh-0215",
            batchNo: "SH-2607-0215",
            name: "华南区域经销商 · 广州xx贸易",
            spec: "区域分销",
            date: "2026-07-22",
            quantity: "4,000 瓶",
            status: "合格",
            detail: [],
          }),
        ],
      },
    ],
  },

  "RM-2607-0104": {
    queryLabel: "原料批次 RM-2607-0104（卡波姆）",
    levels: [
      {
        title: "原料批次",
        type: "raw",
        nodes: [
          rawNode({
            id: "rm-0104",
            batchNo: "RM-2607-0104",
            name: "卡波姆 940",
            spec: "化妆级 · 20kg/桶",
            date: "2026-07-07 到货",
            quantity: "120 kg",
            status: "合格",
            detail: [
              { label: "物料编码", value: "M-3051" },
              { label: "供应商", value: "路博润" },
              { label: "采购单号", value: "PO-2026-0520" },
              { label: "检验结果", value: "IQC 合格" },
              { label: "检验员", value: "张检验" },
            ],
          }),
        ],
      },
      {
        title: "半成品批次（投料）",
        type: "semi",
        nodes: [
          semiNode({
            id: "sf-0211c",
            batchNo: "SF-2607-0211",
            name: "玻尿酸精华液料体",
            spec: "1,000kg/乳化罐",
            date: "2026-07-08 生产",
            quantity: "投料 30 kg",
            status: "合格",
            detail: [{ label: "投料占比", value: "1.8%（配方）" }],
          }),
          semiNode({
            id: "sf-0218c",
            batchNo: "SF-2607-0218",
            name: "玻尿酸精华液料体",
            spec: "1,000kg/乳化罐",
            date: "2026-07-10 生产",
            quantity: "投料 36 kg",
            status: "合格",
            detail: [{ label: "投料占比", value: "1.8%（配方）" }],
          }),
        ],
      },
      {
        title: "成品批次（灌装）",
        type: "finished",
        nodes: [
          finishedNode({
            id: "fp-0351c",
            batchNo: "FP-2607-0351",
            name: "玻尿酸精华液 30ml",
            spec: "30ml/支",
            date: "2026-07-11 灌装",
            quantity: "13,000 支",
            status: "合格",
            detail: [{ label: "灌装自料体", value: "SF-2607-0211" }],
          }),
          finishedNode({
            id: "fp-0362c",
            batchNo: "FP-2607-0362",
            name: "玻尿酸精华液 30ml",
            spec: "30ml/支",
            date: "2026-07-13 灌装",
            quantity: "15,000 支",
            status: "合格",
            detail: [{ label: "灌装自料体", value: "SF-2607-0218" }],
          }),
        ],
      },
      {
        title: "出货记录（去向）",
        type: "shipment",
        nodes: [
          shipmentNode({
            id: "sh-0188c",
            batchNo: "SH-2607-0188",
            name: "华东区域经销商",
            spec: "区域分销",
            date: "2026-07-18",
            quantity: "8,000 支",
            status: "合格",
            detail: [],
          }),
          shipmentNode({
            id: "sh-0201c",
            batchNo: "SH-2607-0201",
            name: "电商自营旗舰店",
            spec: "电商自营",
            date: "2026-07-20",
            quantity: "6,000 支",
            status: "合格",
            detail: [],
          }),
        ],
      },
    ],
  },
}

/** 正向追溯：输入原料批次号，返回下游链路 */
export function forwardQuery(batchNo: string): ForwardResult | null {
  return forwardDatasets[batchNo.trim().toUpperCase()] ?? null
}

export const forwardBatchOptions = Object.keys(forwardDatasets)

/** 正向追溯：原料物料选项（编码 + 名称 + 对应批次） */
export interface RawMaterialOption {
  code: string
  name: string
  batch: string
}

export const forwardMaterialOptions: RawMaterialOption[] = [
  { code: "M-1021", name: "透明质酸钠", batch: "RM-2607-0081" },
  { code: "M-2011", name: "甘油（化妆级）", batch: "RM-2607-0093" },
  { code: "M-3051", name: "卡波姆 940", batch: "RM-2607-0104" },
]

/** ==================== 逆向追溯数据 ==================== */

const backwardDatasets: Record<string, ForwardResult> = {
  "FP-2607-0351": {
    queryLabel: "成品批次 FP-2607-0351（玻尿酸精华液 30ml）",
    levels: [
      {
        title: "成品批次",
        type: "finished",
        nodes: [
          finishedNode({
            id: "fp-0351",
            batchNo: "FP-2607-0351",
            name: "玻尿酸精华液 30ml",
            spec: "30ml/支 · 12支/盒",
            date: "2026-07-11 灌装",
            quantity: "13,000 支",
            status: "合格",
            detail: [
              { label: "灌装线", value: "灌装线1#" },
              { label: "灌装自料体", value: "SF-2607-0211" },
              { label: "出厂检验 OQC", value: "合格" },
              { label: "检验员", value: "赵检验" },
              { label: "成品留样", value: "LY-2607-0035" },
            ],
          }),
        ],
      },
      {
        title: "半成品批次（料体）",
        type: "semi",
        nodes: [
          semiNode({
            id: "sf-0211",
            batchNo: "SF-2607-0211",
            name: "玻尿酸精华液料体",
            spec: "1,000kg/乳化罐",
            date: "2026-07-08 生产",
            quantity: "2,000 kg",
            status: "合格",
            detail: [
              { label: "乳化线 / 班次", value: "乳化线2# · 甲班" },
              { label: "操作工", value: "王操作" },
              { label: "过程检验 IPQC", value: "合格" },
              { label: "料体留样", value: "LY-2607-0028" },
            ],
          }),
        ],
      },
      {
        title: "原料批次（溯源）",
        type: "raw",
        nodes: [
          rawNode({
            id: "rm-0081",
            batchNo: "RM-2607-0081",
            name: "透明质酸钠",
            spec: "化妆级 · HA≥95%",
            date: "2026-07-06 到货",
            quantity: "用量 8.5 kg",
            status: "合格",
            detail: [
              { label: "供应商", value: "华熙生物科技" },
              { label: "采购单号", value: "PO-2026-0512" },
              { label: "IQC 结果", value: "合格" },
              { label: "COA", value: "已归档" },
            ],
          }),
          rawNode({
            id: "rm-0093",
            batchNo: "RM-2607-0093",
            name: "甘油（化妆级）",
            spec: "99.5%",
            date: "2026-07-05 到货",
            quantity: "用量 350 kg",
            status: "合格",
            detail: [
              { label: "供应商", value: "丰益国际" },
              { label: "采购单号", value: "PO-2026-0488" },
              { label: "IQC 结果", value: "合格" },
            ],
          }),
          rawNode({
            id: "rm-0104",
            batchNo: "RM-2607-0104",
            name: "卡波姆 940",
            spec: "化妆级 · 20kg/桶",
            date: "2026-07-07 到货",
            quantity: "用量 30 kg",
            status: "合格",
            detail: [
              { label: "供应商", value: "路博润" },
              { label: "采购单号", value: "PO-2026-0520" },
              { label: "IQC 结果", value: "合格" },
            ],
          }),
          rawNode({
            id: "rm-0112",
            batchNo: "RM-2607-0112",
            name: "去离子水（自制）",
            spec: "电导率≤1μS/cm",
            date: "2026-07-08 制水",
            quantity: "用量 1,601.5 kg",
            status: "合格",
            detail: [
              { label: "来源", value: "水处理车间 · 自制" },
              { label: "水质检测", value: "合格" },
              { label: "检测员", value: "刘检验" },
            ],
          }),
        ],
      },
    ],
  },

  "FP-2607-0362": {
    queryLabel: "成品批次 FP-2607-0362（玻尿酸精华液 30ml）",
    levels: [
      {
        title: "成品批次",
        type: "finished",
        nodes: [
          finishedNode({
            id: "fp-0362",
            batchNo: "FP-2607-0362",
            name: "玻尿酸精华液 30ml",
            spec: "30ml/支 · 12支/盒",
            date: "2026-07-13 灌装",
            quantity: "15,000 支",
            status: "合格",
            detail: [
              { label: "灌装线", value: "灌装线1#" },
              { label: "灌装自料体", value: "SF-2607-0218" },
              { label: "出厂检验 OQC", value: "合格" },
            ],
          }),
        ],
      },
      {
        title: "半成品批次（料体）",
        type: "semi",
        nodes: [
          semiNode({
            id: "sf-0218",
            batchNo: "SF-2607-0218",
            name: "玻尿酸精华液料体",
            spec: "1,000kg/乳化罐",
            date: "2026-07-10 生产",
            quantity: "2,000 kg",
            status: "合格",
            detail: [{ label: "乳化线 / 班次", value: "乳化线2# · 乙班" }],
          }),
        ],
      },
      {
        title: "原料批次（溯源）",
        type: "raw",
        nodes: [
          rawNode({
            id: "rm-0081",
            batchNo: "RM-2607-0081",
            name: "透明质酸钠",
            spec: "化妆级 · HA≥95%",
            date: "2026-07-06 到货",
            quantity: "用量 10.0 kg",
            status: "合格",
            detail: [{ label: "供应商", value: "华熙生物科技" }],
          }),
          rawNode({
            id: "rm-0093",
            batchNo: "RM-2607-0093",
            name: "甘油（化妆级）",
            spec: "99.5%",
            date: "2026-07-05 到货",
            quantity: "用量 400 kg",
            status: "合格",
            detail: [{ label: "供应商", value: "丰益国际" }],
          }),
          rawNode({
            id: "rm-0104",
            batchNo: "RM-2607-0104",
            name: "卡波姆 940",
            spec: "化妆级",
            date: "2026-07-07 到货",
            quantity: "用量 36 kg",
            status: "合格",
            detail: [{ label: "供应商", value: "路博润" }],
          }),
          rawNode({
            id: "rm-0145",
            batchNo: "RM-2607-0145",
            name: "苯氧乙醇（防腐）",
            spec: "化妆级 · 25kg/桶",
            date: "2026-07-08 到货",
            quantity: "用量 4.0 kg",
            status: "合格",
            detail: [{ label: "供应商", value: "陶氏化学" }],
          }),
        ],
      },
    ],
  },
}

/** 逆向追溯：输入成品批次号，返回上游链路 */
export function backwardQuery(batchNo: string): ForwardResult | null {
  return backwardDatasets[batchNo.trim().toUpperCase()] ?? null
}

export const backwardBatchOptions = Object.keys(backwardDatasets)

/** ==================== 追溯报告数据 ==================== */

function buildReport(batchNo: string): TraceReportData {
  const backward = backwardDatasets[batchNo]
  const productNode = backward!.levels[0].nodes[0]
  const semiLevel = backward!.levels[1]
  const rawLevel = backward!.levels[2]
  const shipmentNodes = batchNo === "FP-2607-0351"
    ? forwardDatasets["RM-2607-0081"].levels[3].nodes
    : forwardDatasets["RM-2607-0093"].levels[3].nodes

  return {
    reportNo: batchNo === "FP-2607-0351" ? "TR-2026-00012" : "TR-2026-00013",
    productName: productNode.name,
    productSpec: productNode.spec,
    batchNo,
    quantity: productNode.quantity,
    produceDate: productNode.date,
    line: productNode.detail.find((d) => d.label === "灌装线")?.value ?? "—",
    rawLevels: [rawLevel, semiLevel, backward!.levels[0]],
    shipmentNodes,
    inspections: [
      { stage: "原料 IQC", recordNo: "IQC-2607-0088", result: "合格", inspector: "张检验", date: "2026-07-06" },
      { stage: "半成品 IPQC", recordNo: "IPQC-2607-0031", result: "合格", inspector: "李检验", date: "2026-07-08" },
      { stage: "成品 OQC", recordNo: "OQC-2607-0022", result: "合格", inspector: "赵检验", date: "2026-07-11" },
    ],
    suppliers: rawLevel.nodes.map((n) => ({
      material: n.name,
      batch: n.batchNo,
      supplier: n.detail.find((d) => d.label === "供应商")?.value ?? "—",
      cert: n.detail.find((d) => d.label === "COA")?.value ?? "已归档",
    })),
    generatedBy: "质量部 · 系统生成",
    generatedAt: "2026-08-02 14:30",
  }
}

export function reportQuery(batchNo: string): TraceReportData | null {
  const normalized = batchNo.trim().toUpperCase()
  if (!backwardDatasets[normalized]) return null
  return buildReport(normalized)
}

export const reportBatchOptions = backwardBatchOptions
