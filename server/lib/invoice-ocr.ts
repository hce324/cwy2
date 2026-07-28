import { signUrlForOcr } from './oss';

// 阿里云「增值税发票识别」(OCR) 抽象层。
// ───────────────────────────────────────────────────────────────
// 设计（2026-07-27 /grill-me 烤定，2026-07-27 修正产品线）：
//  - 部署=A2 公有云 API；模型=E1 阿里云「增值税发票识别」专用 OCR（非通用视觉大模型）。
//  - 正确产品线 = 文字识别(OCR) / 印刷文字识别 · 票据凭证识别，SDK 为 @alicloud/ocr-api20210707，
//    接口 RecognizeInvoice，endpoint 由 SDK 自动拼接为 ocr-api.{region}.aliyuncs.com（代码中只填地域域名）。
//    （注意：视觉智能开放平台的 @alicloud/ocr20191230/RecognizeVATInvoice 是另一条产品线，
//     账号未购买会报 "Purchased api is not purchased"，不可用。）
//  - 配置 INVOICE_OCR_ACCESS_KEY_ID / SECRET 时走真实 API；否则返回 mock 结构化结果，
//    保证未配 key 时「上传原图 → 点识别 → 字段回填 → 人核对」整条回路仍可演示。
//  - 真实调用需要的原图必须是阿里云可访问的公网地址（OSS 外链）；本地 /uploads 在真实模式下不可达。
//
// 说明：真实分支使用 @alicloud/ocr-api20210707（V1.0 SDK，官方 Node.js 文档同款）。
// 该包未列入依赖，仅在配置了 AK/SK 且已 `npm i` 后才会被动态加载，不影响 mock 模式。
// 真实响应的字段形状以线上凭证实测为准（下方 parser 为尽力映射）。

const AK = process.env.INVOICE_OCR_ACCESS_KEY_ID;
const SK = process.env.INVOICE_OCR_ACCESS_KEY_SECRET;
const REGION = process.env.INVOICE_OCR_REGION || 'cn-hangzhou';
// 阿里云 OCR API 端点：ocr-api.cn-hangzhou.aliyuncs.com（增值税发票识别仅部署在华东1杭州）。
// 格式：ocr-api.{region}.aliyuncs.com，region 必须是 cn-hangzhou（其他区域报 InvalidProduct.NotFound）。
const ENDPOINT = process.env.INVOICE_OCR_ENDPOINT || `ocr-api.${REGION}.aliyuncs.com`;

export function isInvoiceOcrConfigured(): boolean {
  return Boolean(AK && SK);
}

export interface RecognizedInvoice {
  invoiceCode?: string;
  invoiceNo?: string;
  invoiceDate?: string; // YYYY-MM-DD
  amount?: number; // 价税合计
  amountWithoutTax?: number; // 金额（不含税）
  tax?: number; // 税额
  taxRate?: string; // 税率，如 "13%"
  sellerName?: string; // 销售方名称
  sellerTaxNo?: string; // 销售方纳税人识别号
  buyerName?: string; // 购买方名称
  buyerTaxNo?: string; // 购买方纳税人识别号
  checkCode?: string; // 校验码
  machineNo?: string; // 机器编号
  remark?: string; // 备注
  itemName?: string; // 货物或应税劳务名称（摘要）
  title?: string; // 发票标题/类型
  raw: Record<string, unknown>;
}

// 主入口：传入可访问的文件 URL（OSS 公网地址）。fileUrl 为 null 时 mock 模式也能跑（生成演示数据）。
export async function recognizeInvoice(fileUrl?: string | null): Promise<RecognizedInvoice> {
  if (isInvoiceOcrConfigured()) {
    if (!fileUrl || !/^https?:\/\//i.test(fileUrl)) {
      throw new Error('真实识别模式需要可公网访问的原图地址（请配置 OSS），本地文件无法被阿里云访问');
    }
    return callAliyun(fileUrl);
  }
  return mockInvoice();
}

// ─── 真实调用（仅配置 AK/SK 时执行）──────────────────────────────
async function callAliyun(rawFileUrl: string): Promise<RecognizedInvoice> {
  const pkg = '@alicloud/ocr-api20210707';
  // 动态导入：未安装时不影响 mock 模式
  const imported: any = await import(pkg).catch(() => {
    throw new Error(`未安装 ${pkg}，请先执行 npm install @alicloud/ocr-api20210707 @alicloud/openapi-client @alicloud/tea-util`);
  });
  const openapiPkg = '@alicloud/openapi-client';
  const teaPkg = '@alicloud/tea-util';
  const OpenapiModule: any = await import(openapiPkg);
  const TeaModule: any = await import(teaPkg);

  // dara 框架导出形态兼容：默认导出可能是构造器本身，也可能是 { default: 构造器 } 的命名空间
  const ClientClass = typeof imported.default === 'function' ? imported.default : imported.default?.default;
  const RequestClass = imported.RecognizeInvoiceRequest ?? imported.default?.RecognizeInvoiceRequest;
  if (typeof ClientClass !== 'function' || typeof RequestClass !== 'function') {
    throw new Error('发票 OCR SDK 导出结构异常，请确认 @alicloud/ocr-api20210707 版本');
  }

  const config = new OpenapiModule.Config({ accessKeyId: AK, accessKeySecret: SK });
  config.endpoint = ENDPOINT;
  config.regionId = REGION;
  const client = new ClientClass(config);

  // 生成临时签名 URL（公开读 bucket 也能用；私有/跨地域更稳）。签名失败则退回原 URL。
  const fileUrl = signUrlForOcr(rawFileUrl);
  const request = new RequestClass({ url: fileUrl });
  const runtime = new TeaModule.RuntimeOptions({});
  const resp = await client.recognizeInvoiceWithOptions(request, runtime);

  return parseAliyunResponse(resp);
}

// ocr-api20210707 返回结构：
//   resp.body.data 是 JSON 字符串 → JSON.parse 后得到 { angle, data: { 发票字段... }, ... }
//   其中 data 对象里的英文字段：invoiceCode/invoiceNumber/invoiceDate/sellerName/sellerTaxNumber/
//   purchaserName/purchaserTaxNumber/totalAmount(价税合计)/invoiceTax(税额)/invoiceAmountPreTax(不含税)/
//   checkCode/machineCode/remarks/title/invoiceDetails[] ...
function parseAliyunResponse(resp: any): RecognizedInvoice {
  const dataStr = resp?.body?.data;
  const parsed = typeof dataStr === 'string' ? safeJson(dataStr) : dataStr ?? {};
  // data 是真实字段对象；个别情况下接口直接把字段拍平，做兼容
  const c: Record<string, any> = parsed?.data ?? parsed ?? {};

  const wot = toNum(c.invoiceAmountPreTax);
  const tax = toNum(c.invoiceTax);
  const taxRate =
    wot && tax != null && wot !== 0 ? `${Math.round((tax / wot) * 1000) / 10}%` : undefined;

  // 货物名称：优先取 invoiceDetails 数组里的 itemName 拼接，否则取顶层 itemName
  let itemName: string | undefined;
  if (Array.isArray(c.invoiceDetails) && c.invoiceDetails.length) {
    itemName = c.invoiceDetails
      .map((d: any) => d?.itemName)
      .filter(Boolean)
      .join('；');
  } else if (c.itemName) {
    itemName = c.itemName;
  }

  return {
    invoiceCode: c.invoiceCode,
    invoiceNo: c.invoiceNumber, // 注意是 invoiceNumber（非 invoiceNo）
    invoiceDate: normalizeDate(c.invoiceDate),
    amount: toNum(c.totalAmount), // 价税合计
    amountWithoutTax: wot,
    tax,
    taxRate,
    sellerName: c.sellerName,
    sellerTaxNo: c.sellerTaxNumber,
    buyerName: c.purchaserName,
    buyerTaxNo: c.purchaserTaxNumber,
    checkCode: c.checkCode,
    machineNo: c.machineCode,
    remark: c.remarks,
    itemName,
    title: c.title,
    raw: parsed,
  };
}

// ─── mock（无 key 时的演示数据）──────────────────────────────────
function mockInvoice(): RecognizedInvoice {
  const now = new Date();
  const invoiceNo = `0440019${(Date.now() % 100000000).toString().padStart(8, '0')}${Math.floor(Math.random() * 90 + 10)}`;
  const amountWithoutTax = 1000 + Math.floor(Math.random() * 9000);
  const taxRate = 0.13;
  const tax = Math.round(amountWithoutTax * taxRate * 100) / 100;
  const amount = Math.round((amountWithoutTax + tax) * 100) / 100;
  const raw: Record<string, unknown> = {
    invoiceCode: '044001900211',
    invoiceNumber: invoiceNo,
    invoiceDate: now.toISOString().slice(0, 10),
    checkCode: String(Math.floor(Math.random() * 1e6)).padStart(6, '0'),
    machineCode: '499099946829',
    purchaserName: '贝特瑞新材料集团股份有限公司',
    purchaserTaxNumber: '91440300192190047W',
    sellerName: '示例科技有限公司',
    sellerTaxNumber: '91310115MA1K35XX9X',
    totalAmount: amount.toFixed(2),
    invoiceAmountPreTax: amountWithoutTax.toFixed(2),
    invoiceTax: tax.toFixed(2),
    taxRate: '13%',
    itemName: '办公用品*打印纸',
    title: '增值税专用发票',
    remarks: 'mock 识别结果（未配置发票 OCR，仅用于演示）',
  };
  return {
    invoiceCode: raw.invoiceCode as string,
    invoiceNo,
    invoiceDate: now.toISOString().slice(0, 10),
    amount,
    amountWithoutTax,
    tax,
    taxRate: '13%',
    sellerName: raw.sellerName as string,
    sellerTaxNo: raw.sellerTaxNumber as string,
    buyerName: raw.purchaserName as string,
    buyerTaxNo: raw.purchaserTaxNumber as string,
    itemName: raw.itemName as string,
    title: raw.title as string,
    raw,
  };
}

// ─── helpers ─────────────────────────────────────────────────────
function safeJson(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

// 支持多种开票日期格式：YYYYMMDD / YYYY-MM-DD / YYYY/MM/DD / YYYY年MM月DD日
function normalizeDate(s?: string): string | undefined {
  if (!s) return undefined;
  const t = String(s).trim();
  if (/^\d{8}$/.test(t)) return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`;
  const m = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/.exec(t);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  const m2 = /^(\d{4})年(\d{1,2})月(\d{1,2})日/.exec(t);
  if (m2) return `${m2[1]}-${m2[2].padStart(2, '0')}-${m2[3].padStart(2, '0')}`;
  return undefined;
}

function toNum(s?: string): number | undefined {
  if (s == null) return undefined;
  const n = Number(String(s).replace(/[, ¥￥]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}
