// 原图存储抽象层：优先阿里云 OSS，未配置时自动落到本地 public/uploads。
// 这样「智能采集」原图功能在 OSS 就绪前后都能跑通，配好 .env 即自动切换，代码不变。
import OSS from 'ali-oss';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const REGION = process.env.OSS_REGION;
const BUCKET = process.env.OSS_BUCKET;
const AK = process.env.OSS_ACCESS_KEY_ID;
const SK = process.env.OSS_ACCESS_KEY_SECRET;
const ENDPOINT = process.env.OSS_ENDPOINT || undefined;
const PUBLIC_BASE = process.env.OSS_PUBLIC_BASE_URL;

export function isOssConfigured(): boolean {
  return Boolean(REGION && BUCKET && AK && SK);
}

let client: OSS | null = null;
function getClient(): OSS | null {
  if (!isOssConfigured()) return null;
  if (!client) {
    client = new OSS({
      region: REGION,
      accessKeyId: AK!,
      accessKeySecret: SK!,
      bucket: BUCKET!,
      endpoint: ENDPOINT,
      secure: true,
    });
  }
  return client;
}

// dataUrl 形如 "data:image/png;base64,...."
export async function uploadFile(dataUrl: string, folder = 'collected-documents'): Promise<string> {
  const [meta, b64] = String(dataUrl).split(',');
  const mime = /data:(.*?);/.exec(meta)?.[1] || 'application/octet-stream';
  const ext = (mime.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '');
  const buffer = Buffer.from(b64, 'base64');
  const key = `${folder}/${randomUUID()}.${ext}`;

  const oss = getClient();
  if (oss) {
    await oss.put(key, buffer, { headers: { 'Content-Type': mime } });
    if (PUBLIC_BASE) return `${PUBLIC_BASE.replace(/\/$/, '')}/${key}`;
    return `https://${BUCKET}.${REGION}.aliyuncs.com/${key}`;
  }

  // 本地兜底：写入 public/uploads，fileUrl 存站点相对路径
  const dir = join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(dir, { recursive: true });
  const fileName = `${randomUUID()}.${ext}`;
  await writeFile(join(dir, fileName), buffer);
  return `/uploads/${folder}/${fileName}`;
}

// 为 OCR 等服务生成临时可访问 URL：若为本 bucket 的 OSS 公网链，返回带签名的临时 URL
// （规避私有 bucket / 跨地域 OCR 拉取问题）；否则原样返回。
export function signUrlForOcr(fileUrl: string, expires = 600): string {
  const oss = getClient();
  if (!oss) return fileUrl;
  const prefix = `https://${BUCKET}.${REGION}.aliyuncs.com/`;
  if (fileUrl.startsWith(prefix)) {
    const key = decodeURIComponent(fileUrl.slice(prefix.length));
    try {
      return oss.signatureUrl(key, { expires });
    } catch {
      return fileUrl;
    }
  }
  return fileUrl;
}
