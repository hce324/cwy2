#!/usr/bin/env node
/**
 * 一键导入数据库（finance_cloud 全量 dump）
 *
 * 从项目根目录的 .env 读取 DATABASE_URL，自动建库并灌入 scripts/finance_cloud_dump.sql。
 * 用法：
 *   npm run db:import
 *   # 或
 *   node scripts/import-db.mjs
 *
 * 前置条件：
 *   - 本机已安装 MySQL 客户端（mysql）并在 PATH 中；
 *   - 项目根目录已存在 .env，且配置了正确的 DATABASE_URL。
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function fail(msg) {
  console.error('❌ ' + msg);
  process.exit(1);
}

// 1) 解析 .env
const envPath = resolve(root, '.env');
if (!existsSync(envPath)) {
  fail('找不到 .env。请先执行 `cp .env.example .env` 并填入数据库连接信息。');
}
const env = {};
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*"?([^"\n]*?)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const url = env.DATABASE_URL;
if (!url) fail('.env 中缺少 DATABASE_URL。');

const m = url.match(/^mysql:\/\/([^:/@]+):([^@]*)@([^:/@]+)(?::(\d+))?\/([^?/\s]+)/);
if (!m) fail('无法解析 DATABASE_URL：' + url);
const [, user, password, host, port = '3306', database] = m;

// 2) dump 文件
const dumpPath = resolve(root, 'scripts', 'finance_cloud_dump.sql');
if (!existsSync(dumpPath)) fail('找不到 dump 文件：' + dumpPath);

// 3) 组装 mysql 鉴权参数（密码为空时省略 -p，避免交互式卡住）
const authArgs = [`-h${host}`, `-P${port}`, `-u${user}`];
if (password) authArgs.push(`-p${password}`);

console.log(`🔧 准备导入数据库「${database}」→ ${host}:${port}`);

// 4) 建库（若不存在）
const createRes = spawnSync('mysql', [
  ...authArgs,
  `-e`, `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
], { stdio: 'inherit' });
if (createRes.error) {
  fail('执行 mysql 失败：' + createRes.error.message + '\n   请确认 MySQL 客户端（mysql）已在 PATH 中。');
}
if (createRes.status !== 0) process.exit(createRes.status);

// 5) 灌入 dump
console.log(`📥 正在导入 ${dumpPath} ...`);
const sql = readFileSync(dumpPath);
const importRes = spawnSync('mysql', [
  ...authArgs,
  '--default-character-set=utf8mb4',
  database,
], { input: sql, stdio: ['pipe', 'inherit', 'inherit'] });
if (importRes.error) {
  fail('执行 mysql 失败：' + importRes.error.message + '\n   请确认 MySQL 客户端（mysql）已在 PATH 中。');
}
if (importRes.status !== 0) process.exit(importRes.status);

console.log('✅ 数据库导入完成。运行 `npm run dev` 启动项目。');
