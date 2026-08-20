/**
 * 逆向追溯 - 第一层「SPU 主数据」mock（基于 genca 生产库真实数据）。
 *
 * 逆向追溯改为按 SPU 查询：
 *   用户以「SPU 编码 / SPU 名称」远程搜索 SPU 主数据
 *   → 选中一个 SPU → 列出该 SPU 关联的 SKU 及批次 → 选择 SKU+批次 进行追溯。
 *
 * 数据来源（genca_prod）：
 *   product_spu_tbl                              —— SPU 主数据（spu_no / spu_name / brand / status）
 *   product_list_tbl                             —— SKU 档案（goods_no / spec_name / spu_id）
 * 第一层示例：正向追溯终点 DD25F0011A(荔枝卸妆膏 110ml) 所属 SPU = DDS24032 荔枝卸妆膏3.0，
 *   其 SPU 组共关联 16 个 SKU（真实 enumeration）。
 */

export interface SpuSku {
  /** 货品编码（SKU 编码），即逆向链路中 code 使用的编码 */
  code: string
  /** 规格 */
  spec: string
  /** 货品名称 */
  name: string
  /** 品牌 */
  brand: string
  /** 注册备案名称 */
  registrationName: string
  /** 注册备案编号 */
  registrationNo: string
  /** 是否正装成品（可用于逆向追溯起点 SKU） */
  isFinished: boolean
}

export interface SpuMaster {
  /** 当前 SPU 编码（spu_class=1） */
  spuNo: string
  /** 关联的 SPU 代际编码（spu_class=0, 3.0 代际） */
  generationSpuNo: string
  /** SPU 名称 */
  name: string
  /** 代际名称 */
  generationName: string
  /** 品牌 */
  brand: string
  /** 分类 */
  category: string
  /** 状态文本（status=40 正常） */
  statusText: string
  /** 关联 SKU 列表 */
  skus: SpuSku[]
}

/* ==================== SPU 主数据（真实） ==================== */

const SPU_LIZHI: SpuMaster = {
  spuNo: "DDH24039",
  generationSpuNo: "DDS24032",
  name: "荔枝卸妆膏",
  generationName: "荔枝卸妆膏3.0",
  brand: "ddg",
  category: "自有-化妆品",
  statusText: "正常",
  skus: [
    {
      code: "DD25F0011A",
      spec: "110ml",
      name: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏3.0",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）110ml",
      registrationNo: "沪G妆网备字2025004778",
      isFinished: true,
    },
    {
      code: "DD25F0011B",
      spec: "110ml 替换装",
      name: "ddg 净润卸妆膏（荔枝香）110ml 替换装 荔枝卸妆膏【001】",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）110ml 替换装",
      registrationNo: "-",
      isFinished: false,
    },
    {
      code: "DD25F0011C",
      spec: "50ml",
      name: "ddg 净润卸妆膏（荔枝香）50ml 荔枝卸妆膏【001】",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）50ml",
      registrationNo: "-",
      isFinished: true,
    },
    {
      code: "DD25F0011D",
      spec: "3ml",
      name: "ddg 净润卸妆膏（荔枝香）3ml 无包装裸支 荔枝卸妆膏3.0",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）3ml",
      registrationNo: "-",
      isFinished: false,
    },
    {
      code: "DD25F0011E",
      spec: "3ml*5",
      name: "ddg 净润卸妆膏（荔枝香）3ml*5 荔枝卸妆膏【001】",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）3ml*5",
      registrationNo: "-",
      isFinished: true,
    },
    {
      code: "DD25F0011F",
      spec: "3ml",
      name: "ddg 净润卸妆膏（荔枝香） 3ml 荔枝卸妆膏【001】",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）3ml",
      registrationNo: "-",
      isFinished: true,
    },
    {
      code: "DD25F0011G",
      spec: "3ml*3",
      name: "ddg 净润卸妆膏（荔枝香） 3ml*3 荔枝卸妆膏【001】",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）3ml*3",
      registrationNo: "-",
      isFinished: true,
    },
    {
      code: "DD25F0011H",
      spec: "3ml*6",
      name: "ddg 净润卸妆膏（荔枝香）3ml*6 pet盒装 荔枝卸妆膏3.0【001】",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）3ml*6",
      registrationNo: "-",
      isFinished: true,
    },
    {
      code: "DD25F0011J",
      spec: "3ml*6",
      name: "ddg 净润卸妆膏组合装（凤梨香+荔枝香）3ml*6 pet盒装【001】",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏组合装（凤梨香+荔枝香）3ml*6",
      registrationNo: "-",
      isFinished: true,
    },
    {
      code: "DD25F0011K",
      spec: "110ml*6pcs装",
      name: "ddg 净润卸妆膏（荔枝香）110ml 线下专供6pcs装【001】",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）110ml*6pcs装",
      registrationNo: "沪G妆网备字2025004778",
      isFinished: true,
    },
    {
      code: "DD25F0011L",
      spec: "3ml*6",
      name: "ddg 净润卸妆膏（荔枝香）3ml*6 PET盒装线下专供6pcs装",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）3ml*6",
      registrationNo: "-",
      isFinished: true,
    },
    {
      code: "DD25F0011P",
      spec: "110ml裸瓶半成品",
      name: "ddg 净润卸妆膏（荔枝香）110ml 裸瓶半成品 荔枝卸妆膏3.0",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）110ml裸瓶半成品",
      registrationNo: "沪G妆网备字2025004778",
      isFinished: false,
    },
    {
      code: "DD25F0011Q",
      spec: "3ml*6*6pcs装",
      name: "ddg 净润卸妆膏（荔枝香）3ml*6 PET盒装线下专供6pcs装 荔枝卸妆膏3.0",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）3ml*6*6pcs装",
      registrationNo: "沪G妆网备字2025004778",
      isFinished: true,
    },
    {
      code: "DD25F0011R",
      spec: "100ml正装+100ml替换装",
      name: "ddg 净润卸妆膏（荔枝香）100ml正装+100ml替换装 荔枝卸妆膏3.0【001】",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）100ml正装+100ml替换装",
      registrationNo: "沪G妆网备字2025004778",
      isFinished: true,
    },
    {
      code: "DD25F0011S",
      spec: "100ml",
      name: "ddg 净润卸妆膏（荔枝香）100ml正装 裸瓶半成品  荔枝卸妆膏3.0",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）100ml",
      registrationNo: "沪G妆网备字2025004778",
      isFinished: false,
    },
    {
      code: "DD25F0011T",
      spec: "100ml",
      name: "ddg 净润卸妆膏（荔枝香）100ml替换装 裸瓶半成品 荔枝卸妆膏3.0",
      brand: "ddg",
      registrationName: "ddg净润卸妆膏（荔枝香）100ml",
      registrationNo: "沪G妆网备字2025004778",
      isFinished: false,
    },
  ],
}

/** SPU 主数据集合（按当前 spu_no 与代际 spu_no 均可检索） */
export const spuMasters: SpuMaster[] = [SPU_LIZHI]

/* ==================== 查询函数（远程搜索模拟） ==================== */

/**
 * 按「SPU 编码 或 SPU 名称」远程搜索 SPU 主数据。
 * 支持输入当前编码、代际编码，或名称片段（含编码片段）。
 */
export async function searchSpusRemote(query: string): Promise<SpuMaster[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return spuMasters.filter((s) => {
    const haystack = `${s.spuNo} ${s.generationSpuNo} ${s.name} ${s.generationName} ${s.brand} ${s.category}`.toLowerCase()
    return haystack.includes(q)
  })
}

/** 返回某 SPU 关联的全部 SKU */
export function getSpuSkus(spuNo: string): SpuSku[] {
  const spu = findSpu(spuNo)
  return spu ? spu.skus : []
}

/** 按产品编码查找关联 SKU（跨 SPU） */
export function findSpuSku(code: string): SpuSku | undefined {
  const key = code.trim().toUpperCase()
  for (const spu of spuMasters) {
    const hit = spu.skus.find((s) => s.code.toUpperCase() === key)
    if (hit) return hit
  }
  return undefined
}

/** 按当前编码或代际编码查找 SPU */
export function findSpu(spuNo: string): SpuMaster | undefined {
  const s = (spuNo || "").trim().toLocaleUpperCase()
  return spuMasters.find(
    (m) => m.spuNo.toLocaleUpperCase() === s || m.generationSpuNo.toLocaleUpperCase() === s,
  )
}