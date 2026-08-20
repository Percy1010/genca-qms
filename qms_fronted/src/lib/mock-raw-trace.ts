/**
 * 原料编码（多对多）追溯 - 演示数据。
 *
 * 业务模型：一个原料编码下有多个原料批次；每个原料批次投入多个半成品批次；
 * 每个半成品批次灌装多个成品批次；每个成品批次发往多个出货渠道。
 * 即 原料编码 → 原料批次 → 半成品 → 成品 → 出货 的四层扇出。
 *
 * 正式版将由后端 /api/trace/** 提供，此处为可交互前端原型（三种展示样式共用）。
 */

export type RawItemType = "raw" | "semi" | "finished" | "shipment"

export interface RawItem {
  id: string
  type: RawItemType
  batchNo: string
  name: string
  spec: string
  date: string
  quantity: string
  status: "合格" | "待检" | "不合格"
  detail: { label: string; value: string }[]
  /** 该节点的直接下游（半成品、成品、出货） */
  children?: RawItem[]
}

export interface RawMaterialResult {
  /** 原料编码 */
  code: string
  /** 原料名称 */
  name: string
  /** 该编码下原料批次清单 */
  rawBatches: RawItem[]
  /** 波及统计：各层批次总数（不含去重） */
  summary: {
    raw: number
    semi: number
    finished: number
    shipment: number
    /** 波及成品批次数（去重后的实际成品批次数） */
    finishedUnique: number
  }
}

/* ==================== 原料字典 ==================== */

export const rawMaterialOptions = [
  { code: "M-1021", name: "透明质酸钠" },
  { code: "M-2011", name: "甘油（化妆级）" },
  { code: "M-3051", name: "卡波姆 940" },
]

/* ==================== 数据 ==================== */

/** M-1021 透明质酸钠：3 个原料批次，每个扇出 2-3 个半成品 → 多个成品 */
const transparentData: RawMaterialResult = {
  code: "M-1021",
  name: "透明质酸钠",
  rawBatches: [
    {
      id: "rm-0081",
      type: "raw",
      batchNo: "RM-2607-0081",
      name: "透明质酸钠",
      spec: "化妆级 · HA≥95% · 50kg/袋",
      date: "2026-07-06",
      quantity: "200 kg",
      status: "合格",
      detail: [
        { label: "供应商", value: "华熙生物科技" },
        { label: "采购单号", value: "PO-2026-0512" },
        { label: "IQC 检验", value: "合格" },
        { label: "COA", value: "已归档" },
      ],
      children: [
        {
          id: "sf-0211",
          type: "semi",
          batchNo: "SF-2607-0211",
          name: "玻尿酸精华液料体",
          spec: "乳化线2# · 甲班",
          date: "2026-07-08",
          quantity: "投料 8.5kg",
          status: "合格",
          detail: [{ label: "过程检验 IPQC", value: "合格" }],
          children: [
            {
              id: "fp-0351",
              type: "finished",
              batchNo: "FP-2607-0351",
              name: "玻尿酸精华液 30ml",
              spec: "30ml/支 · 12支/盒",
              date: "2026-07-11",
              quantity: "13,000 支",
              status: "合格",
              detail: [{ label: "出厂检验 OQC", value: "合格" }],
              children: [
                {
                  id: "sh-0188",
                  type: "shipment",
                  batchNo: "SH-2607-0188",
                  name: "华东区域经销商 · 上海xx商贸",
                  spec: "区域分销",
                  date: "2026-07-18",
                  quantity: "8,000 支",
                  status: "合格",
                  detail: [],
                },
                {
                  id: "sh-0201",
                  type: "shipment",
                  batchNo: "SH-2607-0201",
                  name: "电商自营旗舰店",
                  spec: "电商自营",
                  date: "2026-07-20",
                  quantity: "5,000 支",
                  status: "合格",
                  detail: [],
                },
              ],
            },
            {
              id: "fp-0352",
              type: "finished",
              batchNo: "FP-2607-0352",
              name: "玻尿酸精华液 50ml",
              spec: "50ml/支 · 12支/盒",
              date: "2026-07-11",
              quantity: "9,000 支",
              status: "合格",
              detail: [],
              children: [
                {
                  id: "sh-0202",
                  type: "shipment",
                  batchNo: "SH-2607-0202",
                  name: "电商自营旗舰店",
                  spec: "电商自营",
                  date: "2026-07-20",
                  quantity: "9,000 支",
                  status: "合格",
                  detail: [],
                },
              ],
            },
          ],
        },
        {
          id: "sf-0218",
          type: "semi",
          batchNo: "SF-2607-0218",
          name: "玻尿酸精华液料体",
          spec: "乳化线2# · 乙班",
          date: "2026-07-10",
          quantity: "投料 10kg",
          status: "合格",
          detail: [],
          children: [
            {
              id: "fp-0362",
              type: "finished",
              batchNo: "FP-2607-0362",
              name: "玻尿酸精华液 30ml",
              spec: "30ml/支 · 12支/盒",
              date: "2026-07-13",
              quantity: "15,000 支",
              status: "合格",
              detail: [],
              children: [
                {
                  id: "sh-0203",
                  type: "shipment",
                  batchNo: "SH-2607-0203",
                  name: "华南区域经销商 · 广州xx贸易",
                  spec: "区域分销",
                  date: "2026-07-22",
                  quantity: "10,000 支",
                  status: "合格",
                  detail: [],
                },
                {
                  id: "sh-0204",
                  type: "shipment",
                  batchNo: "SH-2607-0204",
                  name: "电商自营旗舰店",
                  spec: "电商自营",
                  date: "2026-07-24",
                  quantity: "5,000 支",
                  status: "合格",
                  detail: [],
                },
              ],
            },
          ],
        },
        {
          id: "sf-0225",
          type: "semi",
          batchNo: "SF-2607-0225",
          name: "胶原蛋白面霜料体",
          spec: "乳化线3# · 甲班",
          date: "2026-07-12",
          quantity: "投料 4kg",
          status: "合格",
          detail: [],
          children: [
            {
              id: "fp-0370",
              type: "finished",
              batchNo: "FP-2607-0370",
              name: "胶原蛋白面霜 50g",
              spec: "50g/瓶 · 12瓶/盒",
              date: "2026-07-14",
              quantity: "10,000 瓶",
              status: "合格",
              detail: [],
              children: [
                {
                  id: "sh-0215",
                  type: "shipment",
                  batchNo: "SH-2607-0215",
                  name: "华南区域经销商 · 广州xx贸易",
                  spec: "区域分销",
                  date: "2026-07-22",
                  quantity: "6,000 瓶",
                  status: "合格",
                  detail: [],
                },
                {
                  id: "sh-0216",
                  type: "shipment",
                  batchNo: "SH-2607-0216",
                  name: "电商自营旗舰店",
                  spec: "电商自营",
                  date: "2026-07-25",
                  quantity: "4,000 瓶",
                  status: "合格",
                  detail: [],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "rm-0093",
      type: "raw",
      batchNo: "RM-2607-0093",
      name: "透明质酸钠",
      spec: "化妆级 · HA≥95% · 50kg/袋",
      date: "2026-07-09",
      quantity: "150 kg",
      status: "合格",
      detail: [
        { label: "供应商", value: "华熙生物科技" },
        { label: "采购单号", value: "PO-2026-0519" },
        { label: "IQC 检验", value: "合格" },
      ],
      children: [
        {
          id: "sf-0229",
          type: "semi",
          batchNo: "SF-2607-0229",
          name: "玻尿酸精华液料体",
          spec: "乳化线2# · 甲班",
          date: "2026-07-13",
          quantity: "投料 9kg",
          status: "合格",
          detail: [],
          children: [
            {
              id: "fp-0375",
              type: "finished",
              batchNo: "FP-2607-0375",
              name: "玻尿酸精华液 30ml",
              spec: "30ml/支",
              date: "2026-07-15",
              quantity: "12,000 支",
              status: "合格",
              detail: [],
              children: [
                {
                  id: "sh-0218",
                  type: "shipment",
                  batchNo: "SH-2607-0218",
                  name: "华东区域经销商",
                  spec: "区域分销",
                  date: "2026-07-26",
                  quantity: "12,000 支",
                  status: "合格",
                  detail: [],
                },
              ],
            },
          ],
        },
        {
          id: "sf-0231",
          type: "semi",
          batchNo: "SF-2607-0231",
          name: "玻尿酸精华液料体",
          spec: "乳化线2# · 乙班",
          date: "2026-07-14",
          quantity: "投料 7.5kg",
          status: "不合格",
          detail: [{ label: "不合格原因", value: "乳化温度超标" }],
          children: [
            {
              id: "fp-0378",
              type: "finished",
              batchNo: "FP-2607-0378",
              name: "玻尿酸精华液 30ml",
              spec: "30ml/支",
              date: "2026-07-16",
              quantity: "0 支",
              status: "不合格",
              detail: [{ label: "说明", value: "料体不合格，成品未放行" }],
            },
          ],
        },
      ],
    },
    {
      id: "rm-0104",
      type: "raw",
      batchNo: "RM-2607-0104",
      name: "透明质酸钠",
      spec: "化妆级 · HA≥95% · 50kg/袋",
      date: "2026-07-12",
      quantity: "100 kg",
      status: "待检",
      detail: [
        { label: "供应商", value: "华熙生物科技" },
        { label: "采购单号", value: "PO-2026-0533" },
        { label: "IQC 检验", value: "检验中" },
      ],
      children: [],
    },
  ],
  summary: {
    raw: 3,
    semi: 4,
    finished: 5,
    shipment: 7,
    finishedUnique: 5,
  },
}

/** M-2011 甘油：原料批次较少、扇出较多成品 */
const glycerinData: RawMaterialResult = {
  code: "M-2011",
  name: "甘油（化妆级）",
  rawBatches: [
    {
      id: "rm-0093",
      type: "raw",
      batchNo: "RM-2607-0093",
      name: "甘油（化妆级）",
      spec: "化妆级 · 99.5% · 250kg/桶",
      date: "2026-07-05",
      quantity: "1,000 kg",
      status: "合格",
      detail: [
        { label: "供应商", value: "丰益国际" },
        { label: "采购单号", value: "PO-2026-0488" },
        { label: "IQC 检验", value: "合格" },
      ],
      children: [
        {
          id: "sf-0211g",
          type: "semi",
          batchNo: "SF-2607-0211",
          name: "玻尿酸精华液料体",
          spec: "乳化线2# · 甲班",
          date: "2026-07-08",
          quantity: "投料 350kg",
          status: "合格",
          detail: [],
          children: [
            {
              id: "fp-0351g",
              type: "finished",
              batchNo: "FP-2607-0351",
              name: "玻尿酸精华液 30ml",
              spec: "30ml/支",
              date: "2026-07-11",
              quantity: "13,000 支",
              status: "合格",
              detail: [],
              children: [
                {
                  id: "sh-0188g",
                  type: "shipment",
                  batchNo: "SH-2607-0188",
                  name: "华东区域经销商",
                  spec: "区域分销",
                  date: "2026-07-18",
                  quantity: "8,000 支",
                  status: "合格",
                  detail: [],
                },
              ],
            },
            {
              id: "fp-0352g",
              type: "finished",
              batchNo: "FP-2607-0352",
              name: "玻尿酸精华液 50ml",
              spec: "50ml/支",
              date: "2026-07-11",
              quantity: "9,000 支",
              status: "合格",
              detail: [],
              children: [
                {
                  id: "sh-0202g",
                  type: "shipment",
                  batchNo: "SH-2607-0202",
                  name: "电商自营旗舰店",
                  spec: "电商自营",
                  date: "2026-07-20",
                  quantity: "9,000 支",
                  status: "合格",
                  detail: [],
                },
              ],
            },
            {
              id: "fp-0375g",
              type: "finished",
              batchNo: "FP-2607-0375",
              name: "玻尿酸精华液 30ml",
              spec: "30ml/支",
              date: "2026-07-15",
              quantity: "12,000 支",
              status: "合格",
              detail: [],
              children: [],
            },
          ],
        },
        {
          id: "sf-0225g",
          type: "semi",
          batchNo: "SF-2607-0225",
          name: "胶原蛋白面霜料体",
          spec: "乳化线3# · 甲班",
          date: "2026-07-12",
          quantity: "投料 500kg",
          status: "合格",
          detail: [],
          children: [
            {
              id: "fp-0370g",
              type: "finished",
              batchNo: "FP-2607-0370",
              name: "胶原蛋白面霜 50g",
              spec: "50g/瓶",
              date: "2026-07-14",
              quantity: "10,000 瓶",
              status: "合格",
              detail: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "rm-0119",
      type: "raw",
      batchNo: "RM-2607-0119",
      name: "甘油（化妆级）",
      spec: "化妆级 · 99.5% · 250kg/桶",
      date: "2026-07-10",
      quantity: "750 kg",
      status: "合格",
      detail: [
        { label: "供应商", value: "丰益国际" },
        { label: "采购单号", value: "PO-2026-0521" },
      ],
      children: [
        {
          id: "sf-0231g",
          type: "semi",
          batchNo: "SF-2607-0231",
          name: "玻尿酸精华液料体",
          spec: "乳化线2# · 乙班",
          date: "2026-07-14",
          quantity: "投料 300kg",
          status: "不合格",
          detail: [{ label: "不合格原因", value: "料体外观异常" }],
          children: [
            {
              id: "fp-0378g",
              type: "finished",
              batchNo: "FP-2607-0378",
              name: "玻尿酸精华液 30ml",
              spec: "30ml/支",
              date: "2026-07-16",
              quantity: "0 支",
              status: "不合格",
              detail: [],
            },
          ],
        },
      ],
    },
  ],
  summary: {
    raw: 2,
    semi: 3,
    finished: 4,
    shipment: 3,
    finishedUnique: 4,
  },
}

/** M-3051 卡波姆 940：单批次、单成品链 */
const carbomerData: RawMaterialResult = {
  code: "M-3051",
  name: "卡波姆 940",
  rawBatches: [
    {
      id: "rm-0104c",
      type: "raw",
      batchNo: "RM-2607-0104",
      name: "卡波姆 940",
      spec: "化妆级 · 20kg/桶",
      date: "2026-07-07",
      quantity: "120 kg",
      status: "合格",
      detail: [
        { label: "供应商", value: "路博润" },
        { label: "采购单号", value: "PO-2026-0520" },
      ],
      children: [
        {
          id: "sf-0211c",
          type: "semi",
          batchNo: "SF-2607-0211",
          name: "玻尿酸精华液料体",
          spec: "乳化线2# · 甲班",
          date: "2026-07-08",
          quantity: "投料 30kg",
          status: "合格",
          detail: [],
          children: [
            {
              id: "fp-0351c",
              type: "finished",
              batchNo: "FP-2607-0351",
              name: "玻尿酸精华液 30ml",
              spec: "30ml/支",
              date: "2026-07-11",
              quantity: "13,000 支",
              status: "合格",
              detail: [],
              children: [],
            },
          ],
        },
      ],
    },
  ],
  summary: {
    raw: 1,
    semi: 1,
    finished: 1,
    shipment: 0,
    finishedUnique: 1,
  },
}

const datasets: Record<string, RawMaterialResult> = {
  "M-1021": transparentData,
  "M-2011": glycerinData,
  "M-3051": carbomerData,
}

/** 按原料编码查询多对多追溯数据 */
export function queryRawMaterial(code: string): RawMaterialResult | null {
  return datasets[code.trim().toUpperCase()] ?? null
}
