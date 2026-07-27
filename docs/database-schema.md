# 财务云 · 财务管理协同平台 — 数据库设计文档

> **数据库引擎**：MySQL 8.0+（InnoDB）  
> **字符集**：`utf8mb4` / `utf8mb4_unicode_ci`  
> **设计依据**：前端 35 个视图文件中内联的 Mock 数据、TypeScript 接口、Zustand Store 及导航配置  
> **文档版本**：v1.0 / 2026-07-24

---

## 目录

1. [命名规范](#1-命名规范)
2. [通用约定](#2-通用约定)
3. [基础表（跨模块共享）](#3-基础表跨模块共享)
4. [智能采集](#4-智能采集)
5. [原始凭证](#5-原始凭证)
6. [记账凭证](#6-记账凭证)
7. [资金收付](#7-资金收付)
8. [平台结算对账](#8-平台结算对账)
9. [银行对账](#9-银行对账)
10. [会计账簿](#10-会计账簿)
11. [科目余额表](#11-科目余额表)
12. [报表管理](#12-报表管理)
13. [纳税申报](#13-纳税申报)
14. [月结管理](#14-月结管理)
15. [期末结转](#15-期末结转)
16. [应收账款](#16-应收账款)
17. [应付账款](#17-应付账款)
18. [预算管理](#18-预算管理)
19. [固定资产](#19-固定资产)
20. [库存管理](#20-库存管理)
21. [产销经营](#21-产销经营)
22. [费用报销](#22-费用报销)
23. [工资管理](#23-工资管理)
24. [风险与异常](#24-风险与异常)
25. [系统设置](#25-系统设置)
26. [数据导入](#26-数据导入)
27. [AI 助手](#27-ai-助手)
28. [审计日志](#28-审计日志)
29. [数据字典](#29-数据字典)
30. [实体关系概要](#30-实体关系概要)
31. [预估规模](#31-预估规模)

---

## 1. 命名规范

| 规则 | 示例 |
|:---|:---|
| 表名：小写蛇形、复数形式 | `accounting_vouchers`、`bank_accounts` |
| 列名：小写蛇形 | `created_at`、`voucher_no`、`is_deleted` |
| 主键：`id`（`BIGINT UNSIGNED AUTO_INCREMENT`） | `id` |
| 外键：`{关联表单数名}_id` | `company_id`、`voucher_id`、`creator_id` |
| 索引：`idx_{表名简写}_{列名}` | `idx_vouchers_status` |
| 唯一索引：`uq_{表名简写}_{列名}` | `uq_users_phone` |
| 时间戳：统一 `created_at` / `updated_at` / `deleted_at` | — |
| 金额：`DECIMAL(18,2)` | `amount`、`debit_amount`、`credit_amount` |
| 百分比/比率：`DECIMAL(10,4)` | `tax_rate`、`execution_rate` |
| 布尔：`TINYINT(1)` | `is_active`、`is_balanced` |

---

## 2. 通用约定

**每一张业务表必须包含以下标准列：**

```sql
id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
deleted_at DATETIME NULL DEFAULT NULL COMMENT '软删除时间'
```

- 所有表引擎 `InnoDB`，字符集 `utf8mb4`，排序规则 `utf8mb4_unicode_ci`
- 所有外键列类型 `BIGINT UNSIGNED NOT NULL`
- 金额统一 `DECIMAL(18,2)`（万元展示由前端格式化，存储以元为单位）
- 比例统一 `DECIMAL(10,4)`（如 `0.1690` 表示 16.90%）
- 枚举值不使用 MySQL `ENUM` 类型，改用 `VARCHAR` + `COMMENT` 注释约束（便于扩展）

---

## 3. 基础表（跨模块共享）

### 3.1 公司/租户

```sql
CREATE TABLE companies (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255) NOT NULL COMMENT '公司名称',
  short_name      VARCHAR(100) NULL COMMENT '公司简称',
  tax_id          VARCHAR(50) NULL COMMENT '纳税人识别号',
  legal_person    VARCHAR(100) NULL COMMENT '法定代表人',
  registered_addr VARCHAR(512) NULL COMMENT '注册地址',
  contact_phone   VARCHAR(30) NULL COMMENT '联系电话',
  status          VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态: active|inactive',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  UNIQUE KEY uq_companies_tax_id (tax_id),
  INDEX idx_companies_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公司/租户';
```

### 3.2 部门

```sql
CREATE TABLE departments (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id  BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  name        VARCHAR(255) NOT NULL COMMENT '部门名称',
  parent_id   BIGINT UNSIGNED NULL COMMENT '上级部门ID',
  manager_id  BIGINT UNSIGNED NULL COMMENT '部门负责人',
  sort_order  INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME NULL DEFAULT NULL,
  INDEX idx_departments_company (company_id),
  INDEX idx_departments_parent (parent_id),
  CONSTRAINT fk_departments_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门';
```

### 3.3 员工

```sql
CREATE TABLE employees (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  department_id   BIGINT UNSIGNED NULL COMMENT '所属部门',
  user_id         BIGINT UNSIGNED NULL COMMENT '关联登录用户',
  employee_no     VARCHAR(50) NOT NULL COMMENT '工号',
  name            VARCHAR(100) NOT NULL COMMENT '姓名',
  phone           VARCHAR(30) NULL COMMENT '手机号',
  email           VARCHAR(255) NULL COMMENT '邮箱',
  position        VARCHAR(100) NULL COMMENT '岗位/职位',
  status          VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态: active|inactive|resigned',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  UNIQUE KEY uq_employees_no (employee_no),
  INDEX idx_employees_company (company_id),
  INDEX idx_employees_department (department_id),
  INDEX idx_employees_user (user_id),
  CONSTRAINT fk_employees_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工';
```

### 3.4 用户

```sql
CREATE TABLE users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  employee_id     BIGINT UNSIGNED NULL COMMENT '关联员工',
  username        VARCHAR(100) NOT NULL COMMENT '登录用户名',
  password_hash   VARCHAR(255) NOT NULL COMMENT '密码哈希',
  display_name    VARCHAR(100) NOT NULL COMMENT '显示名称',
  role            VARCHAR(20) NOT NULL COMMENT '角色: 财务负责人|财务专员|出纳',
  avatar_url      VARCHAR(512) NULL COMMENT '头像地址',
  last_login_at   DATETIME NULL COMMENT '最后登录时间',
  is_active       TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  UNIQUE KEY uq_users_username (username),
  INDEX idx_users_company (company_id),
  INDEX idx_users_role (role),
  CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户';
```

### 3.5 角色与权限

```sql
CREATE TABLE roles (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50) NOT NULL COMMENT '角色名称（中文）',
  code        VARCHAR(50) NOT NULL COMMENT '角色编码',
  description VARCHAR(512) NULL COMMENT '角色描述',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_roles_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色';

CREATE TABLE permissions (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(100) NOT NULL COMMENT '权限编码（对应 ViewId）',
  name        VARCHAR(100) NOT NULL COMMENT '权限名称',
  group_name  VARCHAR(50) NULL COMMENT '权限分组',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_permissions_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限（视图/功能）';

CREATE TABLE role_permissions (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id       BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_role_permission (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联';
```

### 3.6 会计期间

```sql
CREATE TABLE fiscal_periods (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id  BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  year        SMALLINT UNSIGNED NOT NULL COMMENT '会计年度',
  month       TINYINT UNSIGNED NOT NULL COMMENT '会计月份 1-12',
  start_date  DATE NOT NULL COMMENT '期间开始日期',
  end_date    DATE NOT NULL COMMENT '期间结束日期',
  is_closed   TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已关账',
  closed_at   DATETIME NULL COMMENT '关账时间',
  closed_by   BIGINT UNSIGNED NULL COMMENT '关账人',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_periods_company_ym (company_id, year, month),
  INDEX idx_periods_closed (is_closed),
  CONSTRAINT fk_periods_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会计期间';
```

### 3.7 会计科目

```sql
CREATE TABLE accounting_subjects (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id  BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  code        VARCHAR(20) NOT NULL COMMENT '科目编码（层级编码，如 1001、100201）',
  name        VARCHAR(255) NOT NULL COMMENT '科目名称',
  full_name   VARCHAR(512) NULL COMMENT '科目全称',
  direction   VARCHAR(2) NOT NULL COMMENT '余额方向: 借|贷',
  category    VARCHAR(50) NOT NULL COMMENT '科目类别: 资产|负债|所有者权益|成本|损益',
  parent_id   BIGINT UNSIGNED NULL COMMENT '上级科目ID',
  level       TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '层级深度',
  status      VARCHAR(10) NOT NULL DEFAULT '启用' COMMENT '状态: 启用|停用',
  is_leaf     TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否为叶子科目',
  sort_order  INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME NULL DEFAULT NULL,
  UNIQUE KEY uq_subjects_company_code (company_id, code),
  INDEX idx_subjects_parent (parent_id),
  INDEX idx_subjects_category (category),
  INDEX idx_subjects_status (status),
  CONSTRAINT fk_subjects_parent FOREIGN KEY (parent_id) REFERENCES accounting_subjects(id),
  CONSTRAINT fk_subjects_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会计科目表';
```

### 3.8 期初余额

```sql
CREATE TABLE opening_balances (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  subject_id      BIGINT UNSIGNED NOT NULL COMMENT '会计科目',
  amount          DECIMAL(18,2) NOT NULL COMMENT '期初余额',
  direction       VARCHAR(2) NOT NULL COMMENT '余额方向: 借|贷',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ob_period_subject (fiscal_period_id, subject_id),
  INDEX idx_ob_company (company_id),
  INDEX idx_ob_subject (subject_id),
  CONSTRAINT fk_ob_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_ob_subject FOREIGN KEY (subject_id) REFERENCES accounting_subjects(id),
  CONSTRAINT fk_ob_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='期初余额';
```

### 3.9 附件

```sql
CREATE TABLE attachments (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  attachable_type VARCHAR(50) NOT NULL COMMENT '关联实体类型（多态）',
  attachable_id   BIGINT UNSIGNED NOT NULL COMMENT '关联实体ID',
  file_name       VARCHAR(512) NOT NULL COMMENT '文件名',
  file_url        VARCHAR(1024) NOT NULL COMMENT '文件存储地址',
  file_size       INT UNSIGNED NULL COMMENT '文件大小（字节）',
  mime_type       VARCHAR(100) NULL COMMENT 'MIME类型',
  sort_order      INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_attachments_entity (attachable_type, attachable_id),
  INDEX idx_attachments_company (company_id),
  CONSTRAINT fk_attachments_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='附件/文件';
```

### 3.10 结算主体

```sql
CREATE TABLE settlement_entities (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id  BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  name        VARCHAR(255) NOT NULL COMMENT '结算主体名称',
  type        VARCHAR(50) NOT NULL COMMENT '类型: 公司|店铺|平台',
  status      VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME NULL DEFAULT NULL,
  INDEX idx_se_company (company_id),
  CONSTRAINT fk_se_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='结算主体/店铺';
```

---

## 4. 智能采集

对应视图：`DocumentsView`（`hz-documents`）

### 4.1 采集单据

```sql
CREATE TABLE collected_documents (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  settlement_entity_id BIGINT UNSIGNED NULL COMMENT '结算主体',
  name            VARCHAR(255) NOT NULL COMMENT '单据名称',
  sub_description VARCHAR(512) NULL COMMENT '辅助描述',
  category        VARCHAR(50) NOT NULL COMMENT '类别: 发票|平台结算|银行回单|采购订单|入库单|付款审批|报销单',
  source          VARCHAR(255) NOT NULL COMMENT '来源系统（如: 税务数字账户、天猫接口、银行流水导入）',
  amount          DECIMAL(18,2) NOT NULL COMMENT '金额',
  currency        VARCHAR(10) NOT NULL DEFAULT 'CNY' COMMENT '币种',
  document_date   DATE NULL COMMENT '单据日期',
  recognition_status VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT '识别状态: pending|success|partial|failed',
  ai_result       VARCHAR(255) NULL COMMENT 'AI识别结果（如: 资料完整、补贴待确认、缺主管审批）',
  is_abnormal     TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否异常',
  is_read         TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读',
  raw_data_json   JSON NULL COMMENT '原始识别数据JSON',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_cd_company (company_id),
  INDEX idx_cd_category (category),
  INDEX idx_cd_recognition (recognition_status),
  INDEX idx_cd_date (document_date),
  INDEX idx_cd_entity (settlement_entity_id),
  CONSTRAINT fk_cd_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_cd_entity FOREIGN KEY (settlement_entity_id) REFERENCES settlement_entities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='智能采集原始单据';
```

---

## 5. 原始凭证

对应视图：`SourceVoucherView`（`hz-sourcevoucher`）

### 5.1 原始凭证

```sql
CREATE TABLE source_vouchers (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id          BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  settlement_entity_id BIGINT UNSIGNED NULL COMMENT '结算主体',
  voucher_no          VARCHAR(30) NOT NULL COMMENT '凭证编号（如: YSPZ-202607-00128）',
  item_description    VARCHAR(512) NOT NULL COMMENT '业务事项摘要',
  business_date       DATE NOT NULL COMMENT '业务日期',
  amount              DECIMAL(18,2) NOT NULL COMMENT '金额',
  included_documents  VARCHAR(512) NULL COMMENT '所附原始资料清单',
  risk_status         VARCHAR(50) NOT NULL DEFAULT '待确认' COMMENT '风险/资料状态: 资料完整|补贴待确认|缺主管审批|无异常',
  business_entity     VARCHAR(255) NULL COMMENT '业务主体',
  counterparty        VARCHAR(255) NULL COMMENT '交易对方',
  handler_name        VARCHAR(100) NULL COMMENT '经办人',
  handler_department  VARCHAR(100) NULL COMMENT '经办部门',
  status              VARCHAR(50) NOT NULL DEFAULT '待处理' COMMENT '处理状态: 待处理|处理中|已完成|已归档',
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          DATETIME NULL DEFAULT NULL,
  UNIQUE KEY uq_sv_no (voucher_no),
  INDEX idx_sv_company (company_id),
  INDEX idx_sv_status (status),
  INDEX idx_sv_date (business_date),
  INDEX idx_sv_entity (settlement_entity_id),
  CONSTRAINT fk_sv_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_sv_entity FOREIGN KEY (settlement_entity_id) REFERENCES settlement_entities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='原始凭证';
```

### 5.2 凭证业务事实

```sql
CREATE TABLE voucher_business_facts (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  voucher_id            BIGINT UNSIGNED NOT NULL COMMENT '原始凭证ID',
  purchase_content      VARCHAR(512) NULL COMMENT '采购/业务内容',
  quantity              VARCHAR(100) NULL COMMENT '数量',
  delivery_location     VARCHAR(255) NULL COMMENT '交货/交付地点',
  contract_order_no     VARCHAR(100) NULL COMMENT '合同/订单编号',
  inspection_receipt_no VARCHAR(100) NULL COMMENT '验收入库单号',
  invoice_no            VARCHAR(100) NULL COMMENT '发票号码',
  tax_total             DECIMAL(18,2) NULL COMMENT '价税合计',
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vbf_voucher (voucher_id),
  CONSTRAINT fk_vbf_voucher FOREIGN KEY (voucher_id) REFERENCES source_vouchers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='原始凭证-业务事实明细';
```

### 5.3 凭证校验结果

```sql
CREATE TABLE voucher_verification_results (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  voucher_id  BIGINT UNSIGNED NOT NULL COMMENT '原始凭证ID',
  check_item  VARCHAR(512) NOT NULL COMMENT '校验项描述',
  is_passed   TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否通过',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vvr_voucher (voucher_id),
  CONSTRAINT fk_vvr_voucher FOREIGN KEY (voucher_id) REFERENCES source_vouchers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='原始凭证-资料校验结果';
```

---

## 6. 记账凭证

对应视图：`VoucherView`、`VoucherQueryView`、`VoucherOrganizeView`、`VoucherVoidView`

### 6.1 记账凭证

```sql
CREATE TABLE accounting_vouchers (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id        BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id  BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  source_voucher_id BIGINT UNSIGNED NULL COMMENT '关联原始凭证',
  voucher_no        VARCHAR(30) NOT NULL COMMENT '凭证字号（如: 转字128号）',
  voucher_word      VARCHAR(10) NOT NULL COMMENT '字: 收|付|转',
  voucher_number    INT UNSIGNED NOT NULL COMMENT '号',
  voucher_date      DATE NOT NULL COMMENT '凭证日期',
  summary           VARCHAR(512) NOT NULL COMMENT '摘要',
  debit_amount      DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '借方合计',
  credit_amount     DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '贷方合计',
  attachment_count  INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '附件张数',
  status            VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT '状态: draft|pending|approved|voided|posted',
  audit_status      VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '审核状态: pending|approved|rejected|posted',
  category          VARCHAR(50) NULL COMMENT '凭证类别',
  creator_id        BIGINT UNSIGNED NULL COMMENT '制单人',
  reviewer_id       BIGINT UNSIGNED NULL COMMENT '审核人',
  signer_id         BIGINT UNSIGNED NULL COMMENT '签字人（出纳）',
  is_voided         TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否作废',
  void_reason       VARCHAR(512) NULL COMMENT '作废原因',
  source_type       VARCHAR(50) NULL COMMENT '来源类型: 手动|AI生成|原始凭证导入',
  flow_no           VARCHAR(50) NULL COMMENT '流程编号',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME NULL DEFAULT NULL,
  UNIQUE KEY uq_av_no (voucher_no),
  INDEX idx_av_company (company_id),
  INDEX idx_av_period (fiscal_period_id),
  INDEX idx_av_status (status),
  INDEX idx_av_date (voucher_date),
  INDEX idx_av_creator (creator_id),
  INDEX idx_av_source (source_voucher_id),
  CONSTRAINT fk_av_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_av_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='记账凭证';
```

### 6.2 凭证分录

```sql
CREATE TABLE voucher_entries (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  voucher_id      BIGINT UNSIGNED NOT NULL COMMENT '凭证ID',
  subject_id      BIGINT UNSIGNED NOT NULL COMMENT '会计科目',
  summary         VARCHAR(512) NULL COMMENT '分录摘要',
  debit_amount    DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '借方金额',
  credit_amount   DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '贷方金额',
  direction       VARCHAR(2) NOT NULL COMMENT '方向: 借|贷',
  sort_order      INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分录序号',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ve_voucher (voucher_id),
  INDEX idx_ve_subject (subject_id),
  CONSTRAINT fk_ve_voucher FOREIGN KEY (voucher_id) REFERENCES accounting_vouchers(id),
  CONSTRAINT fk_ve_subject FOREIGN KEY (subject_id) REFERENCES accounting_subjects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='凭证分录';
```

### 6.3 出纳签字记录

```sql
CREATE TABLE voucher_signatures (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  voucher_id      BIGINT UNSIGNED NOT NULL COMMENT '凭证ID',
  signer_id       BIGINT UNSIGNED NOT NULL COMMENT '签字人',
  signed_at       DATETIME NOT NULL COMMENT '签字时间',
  payment_status  VARCHAR(20) NULL COMMENT '收付状态: 已到账|已支付|未支付',
  note            VARCHAR(512) NULL COMMENT '备注',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vs_voucher (voucher_id),
  INDEX idx_vs_signer (signer_id),
  CONSTRAINT fk_vs_voucher FOREIGN KEY (voucher_id) REFERENCES accounting_vouchers(id),
  CONSTRAINT fk_vs_signer FOREIGN KEY (signer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='出纳签字记录';
```

---

## 7. 资金收付

对应视图：`CashView`、`CashManagementView`（`hz-cashmanagement`）

### 7.1 银行账户

```sql
CREATE TABLE bank_accounts (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id    BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  account_name  VARCHAR(255) NOT NULL COMMENT '账户名称',
  account_no    VARCHAR(100) NOT NULL COMMENT '账号',
  bank_name     VARCHAR(255) NOT NULL COMMENT '开户行名称',
  account_type  VARCHAR(50) NOT NULL COMMENT '类型: 基本户|一般户|专户|支付宝|微信',
  currency      VARCHAR(10) NOT NULL DEFAULT 'CNY' COMMENT '币种',
  balance       DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '当前余额（万元）',
  status        VARCHAR(20) NOT NULL DEFAULT '正常' COMMENT '状态: 正常|冻结|销户',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME NULL DEFAULT NULL,
  INDEX idx_ba_company (company_id),
  CONSTRAINT fk_ba_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='银行账户';
```

### 7.2 资金交易流水

```sql
CREATE TABLE fund_transactions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  bank_account_id BIGINT UNSIGNED NOT NULL COMMENT '银行账户',
  voucher_id      BIGINT UNSIGNED NULL COMMENT '关联凭证',
  transaction_date DATE NOT NULL COMMENT '交易日期',
  type            VARCHAR(20) NOT NULL COMMENT '类型: inflow|outflow',
  amount          DECIMAL(18,2) NOT NULL COMMENT '金额',
  counterparty    VARCHAR(255) NULL COMMENT '对方单位',
  summary         VARCHAR(512) NULL COMMENT '摘要',
  is_cash_flow    TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否现金流',
  cash_flow_category VARCHAR(50) NULL COMMENT '现金流量类别: 经营|投资|筹资',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ft_account (bank_account_id),
  INDEX idx_ft_date (transaction_date),
  INDEX idx_ft_type (type),
  INDEX idx_ft_company (company_id),
  CONSTRAINT fk_ft_account FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
  CONSTRAINT fk_ft_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资金交易流水';
```

### 7.3 收付款任务

```sql
CREATE TABLE payment_tasks (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  bank_account_id BIGINT UNSIGNED NULL COMMENT '付款账户',
  payee           VARCHAR(255) NOT NULL COMMENT '收款/付款方',
  payee_account   VARCHAR(100) NULL COMMENT '对方账号',
  amount          DECIMAL(18,2) NOT NULL COMMENT '金额',
  approval_status VARCHAR(20) NOT NULL COMMENT '审批状态: pending|approved|rejected',
  check_status    VARCHAR(20) NOT NULL COMMENT '合规校验: passed|warning|failed',
  payment_status  VARCHAR(20) NOT NULL COMMENT '支付状态: pending|processing|completed|failed',
  priority        VARCHAR(10) NOT NULL DEFAULT '中' COMMENT '优先级: 高|中|低',
  due_date        DATE NULL COMMENT '到期日/预计付款日',
  category        VARCHAR(50) NULL COMMENT '类别: 供应商付款|费用报销|薪资发放|税费缴纳',
  created_by      BIGINT UNSIGNED NULL COMMENT '创建人',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_pt_account (bank_account_id),
  INDEX idx_pt_status (payment_status),
  INDEX idx_pt_company (company_id),
  CONSTRAINT fk_pt_account FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
  CONSTRAINT fk_pt_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收付款任务';
```

### 7.4 资金预测

```sql
CREATE TABLE cash_flow_predictions (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id  BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  period_id   BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  day_label   VARCHAR(50) NOT NULL COMMENT '预测日标签（如: D+5、D+15）',
  day_offset  INT UNSIGNED NOT NULL COMMENT '偏移天数',
  balance     DECIMAL(18,2) NOT NULL COMMENT '预测余额',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cfp_period (period_id),
  CONSTRAINT fk_cfp_period FOREIGN KEY (period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_cfp_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资金余额预测';
```

---

## 8. 平台结算对账

对应视图：`ReconcileView`（`hz-reconcile`）

### 8.1 平台结算批次

```sql
CREATE TABLE platform_settlements (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id          BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  settlement_entity_id BIGINT UNSIGNED NOT NULL COMMENT '结算主体/店铺',
  platform            VARCHAR(50) NOT NULL COMMENT '平台: 抖音|天猫|京东|拼多多',
  fiscal_period_id    BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  batch_no            VARCHAR(100) NOT NULL COMMENT '结算批次号',
  total_orders        INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总订单数',
  matched_orders      INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '已匹配订单数',
  match_rate          DECIMAL(10,4) NULL COMMENT '匹配率',
  total_amount        DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '结算总额',
  diff_count          INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '差异笔数',
  diff_amount         DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '差异金额',
  status              VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending|matched|confirmed',
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ps_platform (platform),
  INDEX idx_ps_period (fiscal_period_id),
  INDEX idx_ps_entity (settlement_entity_id),
  CONSTRAINT fk_ps_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_ps_entity FOREIGN KEY (settlement_entity_id) REFERENCES settlement_entities(id),
  CONSTRAINT fk_ps_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台结算批次';
```

### 8.2 平台对账差异明细

```sql
CREATE TABLE platform_reconciliation_items (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  settlement_id   BIGINT UNSIGNED NOT NULL COMMENT '结算批次ID',
  order_no        VARCHAR(100) NULL COMMENT '平台订单号',
  platform_amount DECIMAL(18,2) NOT NULL COMMENT '平台金额',
  system_amount   DECIMAL(18,2) NOT NULL COMMENT '系统金额',
  diff_amount     DECIMAL(18,2) NOT NULL COMMENT '差异金额',
  diff_reason     VARCHAR(512) NULL COMMENT '差异原因',
  resolution      VARCHAR(512) NULL COMMENT '处理方式',
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '处理状态: pending|resolved|confirmed',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pri_settlement (settlement_id),
  INDEX idx_pri_status (status),
  CONSTRAINT fk_pri_settlement FOREIGN KEY (settlement_id) REFERENCES platform_settlements(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台对账差异明细';
```

---

## 9. 银行对账

对应视图：`BankReconView`（`hz-bankrecon`）

### 9.1 银行对账单

```sql
CREATE TABLE bank_statements (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  bank_account_id BIGINT UNSIGNED NOT NULL COMMENT '银行账户',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  statement_no    VARCHAR(100) NULL COMMENT '对账单编号',
  total_entries   INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '流水笔数',
  total_debit     DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '借方合计',
  total_credit    DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '贷方合计',
  import_status   VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '导入状态: pending|imported|matched',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bs_account (bank_account_id),
  INDEX idx_bs_period (fiscal_period_id),
  CONSTRAINT fk_bs_account FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
  CONSTRAINT fk_bs_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_bs_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='银行对账单';
```

### 9.2 银行对账明细/未达账项

```sql
CREATE TABLE bank_reconciliation_items (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  statement_id      BIGINT UNSIGNED NOT NULL COMMENT '对账单ID',
  bank_account_id   BIGINT UNSIGNED NOT NULL COMMENT '银行账户',
  voucher_id        BIGINT UNSIGNED NULL COMMENT '关联记账凭证',
  entry_date        DATE NOT NULL COMMENT '发生日期',
  summary           VARCHAR(512) NULL COMMENT '摘要',
  bank_amount       DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '银行方金额',
  book_amount       DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '企业方金额',
  diff_amount       DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '差异金额',
  type              VARCHAR(20) NOT NULL COMMENT '类型: bank_only|book_only|both|diff',
  is_matched        TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否勾对',
  matched_at        DATETIME NULL COMMENT '勾对时间',
  outstanding_reason VARCHAR(512) NULL COMMENT '未达原因',
  status            VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '处理状态',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bri_statement (statement_id),
  INDEX idx_bri_account (bank_account_id),
  INDEX idx_bri_matched (is_matched),
  INDEX idx_bri_type (type),
  CONSTRAINT fk_bri_statement FOREIGN KEY (statement_id) REFERENCES bank_statements(id),
  CONSTRAINT fk_bri_account FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='银行对账明细/未达账项';
```

---

## 10. 会计账簿

对应视图：`LedgerView`（`hz-ledger`）

### 10.1 日记账 / 分类账 / 备查账（统一定义）

> 三种账簿（日记账 `journal`、分类账 `classify`、备查账 `memo`）共享同一表结构，通过 `book_type` 区分。

```sql
CREATE TABLE ledger_entries (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  subject_id      BIGINT UNSIGNED NOT NULL COMMENT '会计科目',
  voucher_id      BIGINT UNSIGNED NULL COMMENT '关联凭证',
  entry_date      DATE NOT NULL COMMENT '日期',
  voucher_word    VARCHAR(10) NULL COMMENT '凭证字',
  voucher_number  INT UNSIGNED NULL COMMENT '凭证号',
  summary         VARCHAR(512) NOT NULL COMMENT '摘要',
  debit_amount    DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '借方发生额',
  credit_amount   DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '贷方发生额',
  direction       VARCHAR(2) NOT NULL COMMENT '余额方向: 借|贷',
  balance         DECIMAL(18,2) NOT NULL COMMENT '余额',
  book_type       VARCHAR(20) NOT NULL DEFAULT 'journal' COMMENT '账簿类型: journal|classify|memo',
  flag            VARCHAR(10) NULL COMMENT '行标识: header|total|footer',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_le_period (fiscal_period_id),
  INDEX idx_le_subject (subject_id),
  INDEX idx_le_date (entry_date),
  INDEX idx_le_type (book_type),
  INDEX idx_le_voucher (voucher_id),
  INDEX idx_le_company (company_id),
  CONSTRAINT fk_le_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_le_subject FOREIGN KEY (subject_id) REFERENCES accounting_subjects(id),
  CONSTRAINT fk_le_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会计账簿分录';
```

---

## 11. 科目余额表

对应视图：`BalanceView`（`hz-balance`）

### 11.1 科目余额表（试算平衡）

```sql
CREATE TABLE trial_balances (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id        BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id  BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  subject_id        BIGINT UNSIGNED NOT NULL COMMENT '会计科目',
  opening_debit     DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '期初借方余额',
  opening_credit    DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '期初贷方余额',
  current_debit     DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '本期借方发生额',
  current_credit    DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '本期贷方发生额',
  accum_debit       DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '本年累计借方',
  accum_credit      DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '本年累计贷方',
  ending_debit      DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '期末借方余额',
  ending_credit     DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '期末贷方余额',
  ending_direction  VARCHAR(2) NOT NULL COMMENT '期末余额方向: 借|贷',
  is_parent         TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为父级汇总行',
  is_balanced       TINYINT(1) NOT NULL DEFAULT 1 COMMENT '借贷是否平衡',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tb_period_subject (fiscal_period_id, subject_id),
  INDEX idx_tb_subject (subject_id),
  INDEX idx_tb_company (company_id),
  CONSTRAINT fk_tb_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_tb_subject FOREIGN KEY (subject_id) REFERENCES accounting_subjects(id),
  CONSTRAINT fk_tb_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='科目余额表/试算平衡表';
```

---

## 12. 报表管理

对应视图：`ReportsView`（`hz-reports`）、`ProfitView`（`profit`）、`OverviewView`（`overview`）

### 12.1 月度财务快照（KPI 底层数据）

```sql
CREATE TABLE monthly_financial_snapshots (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  revenue         DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '确认收入',
  revenue_yoy     DECIMAL(18,2) NULL COMMENT '收入同比',
  cost_of_goods   DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '商品成本',
  platform_commission DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '平台佣金',
  marketing_cost  DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '投流营销费用',
  logistics_cost  DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '物流售后费用',
  net_profit      DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '净利润',
  net_profit_yoy  DECIMAL(18,2) NULL COMMENT '净利润同比',
  net_margin      DECIMAL(10,4) NULL COMMENT '净利率',
  gross_margin    DECIMAL(10,4) NULL COMMENT '毛利率',
  gross_margin_benchmark DECIMAL(10,4) NULL COMMENT '毛利率基准',
  operating_cash_flow DECIMAL(18,2) NULL COMMENT '经营活动现金流',
  opening_cash    DECIMAL(18,2) NULL COMMENT '期初现金',
  cash_inflow     DECIMAL(18,2) NULL COMMENT '现金流入',
  cash_outflow    DECIMAL(18,2) NULL COMMENT '现金流出',
  closing_cash    DECIMAL(18,2) NULL COMMENT '期末现金',
  overdue_ratio   DECIMAL(10,4) NULL COMMENT '逾期应收占比',
  fund_coverage   DECIMAL(10,4) NULL COMMENT '资金覆盖率',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_mfs_period (fiscal_period_id),
  INDEX idx_mfs_company (company_id),
  CONSTRAINT fk_mfs_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_mfs_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='月度财务快照（KPI指标）';
```

### 12.2 利润明细

```sql
CREATE TABLE profit_details (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  section         VARCHAR(50) NOT NULL COMMENT '大类: 收入构成|成本与费用构成',
  item_label      VARCHAR(255) NOT NULL COMMENT '明细项目名称',
  amount          DECIMAL(18,2) NOT NULL COMMENT '金额',
  percentage      DECIMAL(10,4) NULL COMMENT '占比',
  parent_id       BIGINT UNSIGNED NULL COMMENT '上级项目（支持二级钻取）',
  sort_order      INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pd_period (fiscal_period_id),
  INDEX idx_pd_parent (parent_id),
  INDEX idx_pd_company (company_id),
  CONSTRAINT fk_pd_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_pd_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='利润明细（收入/成本/费用钻取）';
```

---

## 13. 纳税申报

对应视图：`TaxView`（`hz-tax`）

### 13.1 税务申报表

```sql
CREATE TABLE tax_filings (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  tax_type        VARCHAR(10) NOT NULL COMMENT '税种标识: 增|企|印|个',
  form_name       VARCHAR(255) NOT NULL COMMENT '申报表名称',
  form_detail     VARCHAR(512) NULL COMMENT '申报表详情（附表数量等）',
  tax_period_from DATE NOT NULL COMMENT '税款所属期起',
  tax_period_to   DATE NOT NULL COMMENT '税款所属期止',
  filing_deadline DATE NOT NULL COMMENT '申报截止日期',
  output_tax      DECIMAL(18,2) NULL COMMENT '销项税额',
  input_tax       DECIMAL(18,2) NULL COMMENT '进项税额',
  tax_payable     DECIMAL(18,2) NULL COMMENT '应补（退）税额',
  tax_diff        DECIMAL(18,2) NULL COMMENT '账票差异',
  diff_note       VARCHAR(512) NULL COMMENT '差异说明',
  status          VARCHAR(20) NOT NULL DEFAULT '待复核' COMMENT '状态: 待复核|校验通过|待提交|已申报',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_tf_period (fiscal_period_id),
  INDEX idx_tf_status (status),
  INDEX idx_tf_type (tax_type),
  INDEX idx_tf_company (company_id),
  CONSTRAINT fk_tf_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_tf_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='纳税申报表';
```

---

## 14. 月结管理

对应视图：`ClosingView`（`closing`）

### 14.1 月结任务

```sql
CREATE TABLE closing_tasks (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  role_target     VARCHAR(20) NOT NULL COMMENT '目标角色: 财务负责人|财务专员|出纳',
  priority        VARCHAR(10) NOT NULL COMMENT '优先级: 高|中|低',
  title           VARCHAR(512) NOT NULL COMMENT '任务标题',
  module          VARCHAR(255) NULL COMMENT '所属模块',
  deadline        VARCHAR(100) NULL COMMENT '截止时间描述',
  is_completed    TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否完成',
  completed_at    DATETIME NULL COMMENT '完成时间',
  completed_by    BIGINT UNSIGNED NULL COMMENT '完成人',
  sort_order      INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ct_period (fiscal_period_id),
  INDEX idx_ct_role (role_target),
  INDEX idx_ct_company (company_id),
  CONSTRAINT fk_ct_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_ct_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='月结任务清单';
```

---

## 15. 期末结转

对应视图：`PeriodEndView`（`hz-closing`）

### 15.1 期末结转步骤

```sql
CREATE TABLE period_end_steps (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  step_label      VARCHAR(50) NOT NULL COMMENT '步骤名称: 业务入账|账实核对|自动结转|报表检查|月末结账',
  status          VARCHAR(20) NOT NULL COMMENT '状态: done|pending|not_started',
  detail          VARCHAR(255) NULL COMMENT '详情',
  sort_order      INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pes_period (fiscal_period_id),
  INDEX idx_pes_company (company_id),
  CONSTRAINT fk_pes_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_pes_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='期末结转步骤';
```

### 15.2 结转项目

```sql
CREATE TABLE period_end_transfers (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  transfer_type   VARCHAR(10) NOT NULL COMMENT '结转类型: 折|摊|税|损',
  name            VARCHAR(50) NOT NULL COMMENT '结转项目名称: 折旧|摊销|税费|损益结转',
  description     VARCHAR(512) NULL COMMENT '说明',
  amount          DECIMAL(18,2) NOT NULL COMMENT '金额',
  status          VARCHAR(20) NOT NULL COMMENT '状态: 已计算|待生成|已完成',
  voucher_id      BIGINT UNSIGNED NULL COMMENT '生成凭证ID',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pet_period (fiscal_period_id),
  INDEX idx_pet_type (transfer_type),
  INDEX idx_pet_company (company_id),
  CONSTRAINT fk_pet_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_pet_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='期末结转项目';
```

---

## 16. 应收账款

对应视图：`ReceivableView`（`receivable`）

### 16.1 客户应收

```sql
CREATE TABLE customer_receivables (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  customer_name   VARCHAR(255) NOT NULL COMMENT '客户名称',
  amount          DECIMAL(18,2) NOT NULL COMMENT '应收金额',
  overdue_days    INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逾期天数',
  risk_level      VARCHAR(10) NOT NULL COMMENT '风险等级: high|mid|low',
  contact_info    VARCHAR(255) NULL COMMENT '联系方式',
  collector_name  VARCHAR(100) NULL COMMENT '催收人',
  tags_json       JSON NULL COMMENT '标签（如: ["逾期","本周到期"]）',
  invoice_no      VARCHAR(100) NULL COMMENT '发票号',
  due_date        DATE NULL COMMENT '到期日',
  status          VARCHAR(20) NOT NULL DEFAULT 'open' COMMENT '状态: open|partial|closed',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_cr_customer (customer_name),
  INDEX idx_cr_risk (risk_level),
  INDEX idx_cr_collector (collector_name),
  INDEX idx_cr_company (company_id),
  CONSTRAINT fk_cr_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户应收账款';
```

### 16.2 催收记录

```sql
CREATE TABLE collection_records (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  receivable_id   BIGINT UNSIGNED NOT NULL COMMENT '应收记录ID',
  collector_id    BIGINT UNSIGNED NULL COMMENT '催收人',
  action_result   VARCHAR(50) NOT NULL COMMENT '催收结果: 客户已承诺回款|客户暂时无法回款|未联系上客户|存在账款争议',
  promise_date    DATE NULL COMMENT '承诺回款日期',
  notes           TEXT NULL COMMENT '沟通记录',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_clr_receivable (receivable_id),
  INDEX idx_clr_collector (collector_id),
  CONSTRAINT fk_clr_receivable FOREIGN KEY (receivable_id) REFERENCES customer_receivables(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='催收记录';
```

### 16.3 应收账龄快照

```sql
CREATE TABLE receivable_aging_snapshots (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  aging_bucket    VARCHAR(50) NOT NULL COMMENT '账龄区间: 未到期|1-30天|31-60天|60天以上',
  amount          DECIMAL(18,2) NOT NULL COMMENT '金额',
  turnover_days   DECIMAL(10,2) NULL COMMENT '周转天数',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ras_period (fiscal_period_id),
  INDEX idx_ras_company (company_id),
  CONSTRAINT fk_ras_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_ras_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应收账龄快照';
```

### 16.4 催收员 KPI

```sql
CREATE TABLE collector_kpis (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  collector_name  VARCHAR(100) NOT NULL COMMENT '催收员姓名',
  managed_amount  DECIMAL(18,2) NOT NULL COMMENT '管理应收总额',
  overdue_amount  DECIMAL(18,2) NOT NULL COMMENT '逾期金额',
  recovery_rate   DECIMAL(10,4) NOT NULL COMMENT '回款率',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ck_period (fiscal_period_id),
  INDEX idx_ck_company (company_id),
  CONSTRAINT fk_ck_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_ck_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='催收员KPI';
```

---

## 17. 应付账款

对应视图：`PayableView`（`payable`）

### 17.1 供应商

```sql
CREATE TABLE suppliers (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  name            VARCHAR(255) NOT NULL COMMENT '供应商名称',
  contact_person  VARCHAR(100) NULL COMMENT '联系人',
  contact_phone   VARCHAR(30) NULL COMMENT '联系电话',
  address         VARCHAR(512) NULL COMMENT '地址',
  tax_id          VARCHAR(50) NULL COMMENT '纳税人识别号',
  status          VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_suppliers_company (company_id),
  CONSTRAINT fk_suppliers_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='供应商';
```

### 17.2 应付账款

```sql
CREATE TABLE supplier_payables (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  supplier_id     BIGINT UNSIGNED NOT NULL COMMENT '供应商',
  amount          DECIMAL(18,2) NOT NULL COMMENT '应付金额',
  due_date        DATE NULL COMMENT '到期日',
  overdue_days    INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '逾期天数',
  aging_bucket    VARCHAR(50) NULL COMMENT '账龄区间',
  status          VARCHAR(20) NOT NULL DEFAULT 'open' COMMENT '状态',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_sp_supplier (supplier_id),
  INDEX idx_sp_company (company_id),
  CONSTRAINT fk_sp_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  CONSTRAINT fk_sp_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应付账款';
```

### 17.3 付款申请

```sql
CREATE TABLE payment_applications (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  supplier_id     BIGINT UNSIGNED NOT NULL COMMENT '供应商',
  amount          DECIMAL(18,2) NOT NULL COMMENT '申请金额',
  purpose         VARCHAR(512) NOT NULL COMMENT '付款事由',
  applicant_name  VARCHAR(100) NOT NULL COMMENT '申请人',
  application_date DATE NOT NULL COMMENT '申请日期',
  status          VARCHAR(20) NOT NULL DEFAULT '待处理' COMMENT '状态: 待处理|审核中|已批准|已驳回|已完成',
  contract_no     VARCHAR(100) NULL COMMENT '合同编号',
  invoice_no      VARCHAR(100) NULL COMMENT '发票号',
  budget_item     VARCHAR(255) NULL COMMENT '预算科目',
  budget_remain   DECIMAL(18,2) NULL COMMENT '预算余额',
  is_repeat       TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否重复申请',
  contract_check  TINYINT(1) NOT NULL DEFAULT 0 COMMENT '合同校验通过',
  invoice_check   TINYINT(1) NOT NULL DEFAULT 0 COMMENT '发票校验通过',
  budget_check    TINYINT(1) NOT NULL DEFAULT 0 COMMENT '预算校验通过',
  repeat_check    TINYINT(1) NOT NULL DEFAULT 0 COMMENT '去重校验通过',
  reviewer_id     BIGINT UNSIGNED NULL COMMENT '审核人',
  approved_at     DATETIME NULL COMMENT '批准时间',
  payment_task_id BIGINT UNSIGNED NULL COMMENT '关联付款任务',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_pa_supplier (supplier_id),
  INDEX idx_pa_status (status),
  INDEX idx_pa_company (company_id),
  CONSTRAINT fk_pa_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  CONSTRAINT fk_pa_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='付款申请';
```

### 17.4 偿付能力指标

```sql
CREATE TABLE solvency_indicators (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  indicator_name  VARCHAR(50) NOT NULL COMMENT '指标名称: 速动比率|流动比率|资产负债率|到期应付覆盖率',
  indicator_value VARCHAR(50) NOT NULL COMMENT '指标值',
  status          VARCHAR(20) NOT NULL COMMENT '评估结果: 达标|偏高|充足',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_si_period (fiscal_period_id),
  INDEX idx_si_company (company_id),
  CONSTRAINT fk_si_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_si_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='偿付能力指标';
```

---

## 18. 预算管理

对应视图：`BudgetView`（`budget`）

### 18.1 预算方案

```sql
CREATE TABLE budgets (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间（年度预算）',
  department_name VARCHAR(255) NOT NULL COMMENT '部门名称',
  annual_budget   DECIMAL(18,2) NOT NULL COMMENT '年度预算总额',
  budget_category VARCHAR(50) NOT NULL COMMENT '预算类别: 市场推广|仓储物流|人员费用|信息技术|办公费用|其他',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_budgets_dept_category (company_id, fiscal_period_id, department_name, budget_category),
  INDEX idx_budgets_period (fiscal_period_id),
  INDEX idx_budgets_company (company_id),
  CONSTRAINT fk_budgets_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_budgets_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预算方案';
```

### 18.2 预算执行

```sql
CREATE TABLE budget_executions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  budget_id       BIGINT UNSIGNED NOT NULL COMMENT '预算方案ID',
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  department_name VARCHAR(255) NOT NULL COMMENT '部门名称',
  used_amount     DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '已执行金额',
  reserved_amount DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '已预留金额',
  remaining_amount DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '剩余金额',
  execution_rate  DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '执行率',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_be_budget (budget_id),
  INDEX idx_be_period (fiscal_period_id),
  INDEX idx_be_company (company_id),
  CONSTRAINT fk_be_budget FOREIGN KEY (budget_id) REFERENCES budgets(id),
  CONSTRAINT fk_be_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_be_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预算执行记录';
```

---

## 19. 固定资产

对应视图：`AssetManagementView`（`asset-management`）

### 19.1 资产卡片

```sql
CREATE TABLE fixed_assets (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  asset_name      VARCHAR(255) NOT NULL COMMENT '资产名称',
  asset_code      VARCHAR(100) NULL COMMENT '资产编码',
  category        VARCHAR(50) NOT NULL COMMENT '资产类别',
  department_name VARCHAR(255) NULL COMMENT '使用部门',
  original_value  DECIMAL(18,2) NOT NULL COMMENT '资产原值',
  accumulated_depreciation DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '累计折旧',
  net_value       DECIMAL(18,2) NULL COMMENT '资产净值',
  useful_life_years INT UNSIGNED NOT NULL COMMENT '使用年限',
  depreciation_method VARCHAR(50) NOT NULL DEFAULT 'straight_line' COMMENT '折旧方法: straight_line|accelerated',
  monthly_depreciation DECIMAL(18,2) NULL COMMENT '月折旧额',
  acquisition_date DATE NULL COMMENT '购置日期',
  status          VARCHAR(20) NOT NULL COMMENT '使用状态: 在用|闲置|报废',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_fa_category (category),
  INDEX idx_fa_status (status),
  INDEX idx_fa_company (company_id),
  CONSTRAINT fk_fa_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='固定资产卡片';
```

### 19.2 折旧记录

```sql
CREATE TABLE depreciation_records (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asset_id        BIGINT UNSIGNED NOT NULL COMMENT '资产卡片ID',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  amount          DECIMAL(18,2) NOT NULL COMMENT '本期折旧额',
  accumulated    DECIMAL(18,2) NOT NULL COMMENT '累计折旧',
  net_value       DECIMAL(18,2) NOT NULL COMMENT '折旧后净值',
  voucher_id      BIGINT UNSIGNED NULL COMMENT '关联凭证',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dr_asset (asset_id),
  INDEX idx_dr_period (fiscal_period_id),
  CONSTRAINT fk_dr_asset FOREIGN KEY (asset_id) REFERENCES fixed_assets(id),
  CONSTRAINT fk_dr_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='折旧记录';
```

---

## 20. 库存管理

对应视图：`InventoryManagementView`（`inventory-management`）

### 20.1 库存台账

```sql
CREATE TABLE inventory_items (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  sku_code        VARCHAR(50) NOT NULL COMMENT 'SKU编码（如: SKU-HP-001）',
  sku_name        VARCHAR(255) NOT NULL COMMENT '商品名称',
  warehouse       VARCHAR(255) NOT NULL COMMENT '仓库名称',
  quantity        INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '当前库存量',
  safety_stock    INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '安全库存量',
  unit_cost       DECIMAL(18,2) NOT NULL COMMENT '单位成本',
  category        VARCHAR(50) NOT NULL COMMENT '品类: 电子产品|日用品|化妆品',
  turnover_days   DECIMAL(10,2) NULL COMMENT '库存周转天数',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  UNIQUE KEY uq_ii_sku (sku_code),
  INDEX idx_ii_warehouse (warehouse),
  INDEX idx_ii_category (category),
  INDEX idx_ii_company (company_id),
  CONSTRAINT fk_ii_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存商品台账';
```

### 20.2 入库单

```sql
CREATE TABLE inventory_inbound (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  doc_no          VARCHAR(50) NOT NULL COMMENT '入库单号（如: RK-20260715-01）',
  type            VARCHAR(50) NOT NULL COMMENT '入库类型: 采购入库|退货入库|盘盈入库|调拨入库',
  inbound_date    DATE NOT NULL COMMENT '入库日期',
  warehouse       VARCHAR(255) NOT NULL COMMENT '仓库',
  item_count      INT UNSIGNED NOT NULL COMMENT '品种数',
  total_amount    DECIMAL(18,2) NOT NULL COMMENT '总金额',
  status          VARCHAR(20) NOT NULL COMMENT '状态: 已审核|待审核|待执行',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_ii_type (type),
  INDEX idx_ii_status (status),
  INDEX idx_ii_company (company_id),
  CONSTRAINT fk_ii_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='入库单';
```

### 20.3 出库单

```sql
CREATE TABLE inventory_outbound (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  doc_no          VARCHAR(50) NOT NULL COMMENT '出库单号（如: CK-20260715-01）',
  type            VARCHAR(50) NOT NULL COMMENT '出库类型: 销售出库|领料出库|盘亏出库|调拨出库',
  outbound_date   DATE NOT NULL COMMENT '出库日期',
  warehouse       VARCHAR(255) NOT NULL COMMENT '仓库',
  item_count      INT UNSIGNED NOT NULL COMMENT '品种数',
  total_amount    DECIMAL(18,2) NOT NULL COMMENT '总金额',
  status          VARCHAR(20) NOT NULL COMMENT '状态: 已审核|待审核|待执行',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_io_type (type),
  INDEX idx_io_status (status),
  INDEX idx_io_company (company_id),
  CONSTRAINT fk_io_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='出库单';
```

---

## 21. 产销经营

对应视图：`InventoryView`（`inventory`）

### 21.1 直播间排名/利润

```sql
CREATE TABLE live_room_profit_ranking (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  rank            INT UNSIGNED NOT NULL COMMENT '排名',
  room_name       VARCHAR(255) NOT NULL COMMENT '直播间名称',
  profit          DECIMAL(18,2) NOT NULL COMMENT '利润',
  margin          DECIMAL(10,4) NOT NULL COMMENT '利润率',
  trend           VARCHAR(10) NOT NULL COMMENT '趋势: up|down',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lr_period (fiscal_period_id),
  INDEX idx_lr_company (company_id),
  CONSTRAINT fk_lr_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_lr_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='直播间利润排名';
```

### 21.2 商品排名/利润

```sql
CREATE TABLE product_profit_ranking (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  rank            INT UNSIGNED NOT NULL COMMENT '排名',
  product_name    VARCHAR(255) NOT NULL COMMENT '商品名称',
  profit          DECIMAL(18,2) NOT NULL COMMENT '利润',
  margin          DECIMAL(10,4) NOT NULL COMMENT '利润率',
  trend           VARCHAR(10) NOT NULL COMMENT '趋势: up|down',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pp_period (fiscal_period_id),
  INDEX idx_pp_company (company_id),
  CONSTRAINT fk_pp_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_pp_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品利润排名';
```

### 21.3 业务财务穿透指标

```sql
CREATE TABLE business_finance_penetration (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  indicator_label VARCHAR(50) NOT NULL COMMENT '指标名称: 业务回款穿透|业务付款穿透|费用管控穿透|利润穿透',
  indicator_value VARCHAR(50) NOT NULL COMMENT '指标值（如: 86%）',
  description     VARCHAR(512) NULL COMMENT '说明',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bfp_period (fiscal_period_id),
  INDEX idx_bfp_company (company_id),
  CONSTRAINT fk_bfp_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_bfp_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务财务穿透指标';
```

---

## 22. 费用报销

对应视图：`BusinessEntryView`（`business-entry`）中包含报销相关数据

### 22.1 费用报销单

```sql
CREATE TABLE expense_reports (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  applicant_id    BIGINT UNSIGNED NULL COMMENT '申请人',
  department_name VARCHAR(255) NULL COMMENT '所属部门',
  expense_type    VARCHAR(50) NOT NULL COMMENT '费用类型: 差旅费|办公费|业务招待费|物流费|其他',
  amount          DECIMAL(18,2) NOT NULL COMMENT '报销金额',
  expense_date    DATE NOT NULL COMMENT '费用发生日期',
  description     VARCHAR(512) NOT NULL COMMENT '费用说明',
  attachment_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '票据张数',
  approval_status VARCHAR(20) NOT NULL DEFAULT '待审批' COMMENT '审批状态: 待审批|审批中|已批准|已驳回',
  payment_status  VARCHAR(20) NULL COMMENT '支付状态',
  voucher_id      BIGINT UNSIGNED NULL COMMENT '关联凭证',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_er_applicant (applicant_id),
  INDEX idx_er_status (approval_status),
  INDEX idx_er_company (company_id),
  CONSTRAINT fk_er_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='费用报销单';
```

---

## 23. 工资管理

对应视图：未创建独立视图，但工作台和系统设置中有薪资相关数据

### 23.1 薪资记录

```sql
CREATE TABLE payroll_records (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  employee_id     BIGINT UNSIGNED NOT NULL COMMENT '员工',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  base_salary     DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '基本工资',
  bonus           DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '奖金',
  allowance       DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '补贴',
  deduction       DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '扣款',
  social_insurance DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '社保（公司部分）',
  tax_deducted    DECIMAL(18,2) NOT NULL DEFAULT 0 COMMENT '代扣个税',
  net_pay         DECIMAL(18,2) NOT NULL COMMENT '实发金额',
  voucher_id      BIGINT UNSIGNED NULL COMMENT '关联凭证',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pr_employee (employee_id),
  INDEX idx_pr_period (fiscal_period_id),
  INDEX idx_pr_company (company_id),
  CONSTRAINT fk_pr_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
  CONSTRAINT fk_pr_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_pr_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工资记录';
```

---

## 24. 风险与异常

对应视图：`RiskView`（`risk`）、`OverviewView`（`overview`）中的风险卡片

### 24.1 异常事件

```sql
CREATE TABLE risk_exceptions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  exception_type  VARCHAR(50) NOT NULL COMMENT '异常类型: 应收逾期|资金风险|付款异常|数据迟报|产销偏差|直播ROI|SKU经营|供应链',
  title           VARCHAR(512) NOT NULL COMMENT '异常标题',
  description     TEXT NOT NULL COMMENT '异常描述',
  risk_level      VARCHAR(10) NOT NULL COMMENT '风险等级: high|mid|low',
  detected_at     DATETIME NOT NULL COMMENT '发现时间',
  assignee        VARCHAR(100) NULL COMMENT '责任人',
  status          VARCHAR(20) NOT NULL DEFAULT 'open' COMMENT '处理状态: open|processing|resolved|closed',
  resolution      TEXT NULL COMMENT '处理结果',
  resolved_at     DATETIME NULL COMMENT '解决时间',
  resolved_by     BIGINT UNSIGNED NULL COMMENT '解决人',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_re_type (exception_type),
  INDEX idx_re_level (risk_level),
  INDEX idx_re_status (status),
  INDEX idx_re_company (company_id),
  CONSTRAINT fk_re_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='风险异常事件';
```

### 24.2 风险指标监控

```sql
CREATE TABLE risk_indicators (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  indicator_group VARCHAR(50) NOT NULL COMMENT '指标组: 偿债能力|营运能力|盈利能力',
  indicator_name  VARCHAR(50) NOT NULL COMMENT '指标名称',
  indicator_value VARCHAR(50) NOT NULL COMMENT '实际值',
  target_range    VARCHAR(50) NULL COMMENT '目标范围',
  assessment      VARCHAR(20) NOT NULL COMMENT '评估: 达标|偏慢|偏高|充足',
  is_warning      TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否预警',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ri_period (fiscal_period_id),
  INDEX idx_ri_company (company_id),
  CONSTRAINT fk_ri_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_ri_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='风险指标监控';
```

---

## 25. 系统设置

对应视图：`SettingsView`（`hz-settings`）

### 25.1 系统连接/集成

```sql
CREATE TABLE system_connections (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  connection_name VARCHAR(255) NOT NULL COMMENT '连接名称: 用友U8|金蝶云星空|天猫/淘宝|抖音电商',
  connection_type VARCHAR(50) NOT NULL COMMENT '类型: erp|ecommerce|bank',
  status          VARCHAR(50) NOT NULL COMMENT '状态: 正常|已授权|需续期',
  status_tone     VARCHAR(10) NOT NULL COMMENT '状态色调: success|warning',
  subtitle        VARCHAR(512) NULL COMMENT '详细信息',
  sync_label      VARCHAR(255) NULL COMMENT '同步状态文字',
  sync_tone       VARCHAR(10) NOT NULL COMMENT '同步色调: success|warning',
  action_label    VARCHAR(50) NULL COMMENT '操作按钮文字',
  last_sync_at    DATETIME NULL COMMENT '最后同步时间',
  auth_expires_at DATE NULL COMMENT '授权到期日',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_sc_company (company_id),
  CONSTRAINT fk_sc_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统连接/集成';
```

---

## 26. 数据导入

对应视图：`ImportView`（`import`）

### 26.1 导入模板

```sql
CREATE TABLE import_templates (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  name            VARCHAR(255) NOT NULL COMMENT '模板名称',
  usage_description VARCHAR(512) NULL COMMENT '用途说明',
  frequency       VARCHAR(50) NOT NULL COMMENT '使用频率: 每日|每周|按需',
  file_url        VARCHAR(512) NULL COMMENT '模板文件下载地址',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME NULL DEFAULT NULL,
  INDEX idx_it_company (company_id),
  CONSTRAINT fk_it_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据导入模板';
```

### 26.2 导入记录

```sql
CREATE TABLE import_records (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  template_id     BIGINT UNSIGNED NULL COMMENT '关联模板',
  file_name       VARCHAR(255) NOT NULL COMMENT '导入文件名',
  uploader_name   VARCHAR(100) NOT NULL COMMENT '上传人',
  uploader_id     BIGINT UNSIGNED NULL COMMENT '上传人ID',
  status          VARCHAR(20) NOT NULL COMMENT '导入结果: success|warning|error',
  record_count    INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '导入行数',
  error_count     INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '错误行数',
  error_details   JSON NULL COMMENT '错误详情',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ir_company (company_id),
  INDEX idx_ir_template (template_id),
  INDEX idx_ir_status (status),
  CONSTRAINT fk_ir_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据导入记录';
```

---

## 27. AI 助手

对应视图：Zustand Store `chatHistory` + 内联 AI 面板

### 27.1 聊天消息

```sql
CREATE TABLE chat_messages (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  user_id         BIGINT UNSIGNED NOT NULL COMMENT '用户',
  session_id      VARCHAR(64) NOT NULL COMMENT '会话ID',
  role            VARCHAR(10) NOT NULL COMMENT '角色: user|ai',
  content         TEXT NOT NULL COMMENT '消息内容',
  timestamp_ms    BIGINT NOT NULL COMMENT '时间戳（毫秒）',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cm_session (session_id),
  INDEX idx_cm_user (user_id),
  INDEX idx_cm_company (company_id),
  CONSTRAINT fk_cm_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI助手聊天消息';
```

### 27.2 AI 诊断结果

```sql
CREATE TABLE ai_analysis_results (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  module          VARCHAR(100) NOT NULL COMMENT '分析模块',
  status          VARCHAR(20) NOT NULL COMMENT '健康状态: 健康|需关注|预警',
  conclusion      TEXT NOT NULL COMMENT '分析结论',
  analysis_count  INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分析项数',
  warning_count   INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '预警项数',
  findings_json   JSON NULL COMMENT '发现明细',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_aar_period (fiscal_period_id),
  INDEX idx_aar_company (company_id),
  CONSTRAINT fk_aar_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_aar_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI诊断分析结果';
```

---

## 28. 审计日志

对应视图：`AccountingCheckView`（`accounting-check`），生成通用审计追踪

### 28.1 审计日志

```sql
CREATE TABLE audit_logs (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  user_id         BIGINT UNSIGNED NULL COMMENT '操作用户',
  action          VARCHAR(50) NOT NULL COMMENT '操作类型: CREATE|UPDATE|DELETE|LOGIN|EXPORT|APPROVE|VOID',
  entity_type     VARCHAR(50) NOT NULL COMMENT '实体类型',
  entity_id       BIGINT UNSIGNED NULL COMMENT '实体ID',
  old_value_json  JSON NULL COMMENT '变更前值',
  new_value_json  JSON NULL COMMENT '变更后值',
  ip_address      VARCHAR(50) NULL COMMENT 'IP地址',
  user_agent      VARCHAR(512) NULL COMMENT 'User Agent',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_al_entity (entity_type, entity_id),
  INDEX idx_al_user (user_id),
  INDEX idx_al_action (action),
  INDEX idx_al_company (company_id),
  INDEX idx_al_created (created_at),
  CONSTRAINT fk_al_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志';
```

### 28.2 凭证与期间控制校验记录

```sql
CREATE TABLE accounting_checks (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  fiscal_period_id BIGINT UNSIGNED NOT NULL COMMENT '会计期间',
  check_type      VARCHAR(50) NOT NULL COMMENT '校验类型: 凭证完整性|试算平衡|关账检查|报表勾稽',
  is_passed       TINYINT(1) NOT NULL COMMENT '是否通过',
  details         TEXT NULL COMMENT '校验详情',
  checked_at      DATETIME NOT NULL COMMENT '校验时间',
  checked_by      BIGINT UNSIGNED NULL COMMENT '校验人',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ac_period (fiscal_period_id),
  INDEX idx_ac_check (check_type),
  INDEX idx_ac_company (company_id),
  CONSTRAINT fk_ac_period FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
  CONSTRAINT fk_ac_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='凭证与期间控制校验';
```

---

## 29. 数据字典

对应视图：`DataView`（`data`）

```sql
CREATE TABLE data_dictionary (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id          BIGINT UNSIGNED NOT NULL COMMENT '所属公司',
  module              VARCHAR(100) NOT NULL COMMENT '业务模块: 财务总览|资金管理|应收管理|应付付款|预算执行|库存管理|月结任务|风险异常',
  indicators          TEXT NULL COMMENT '核心指标（逗号分隔）',
  key_fields          TEXT NULL COMMENT '关键字段（逗号分隔）',
  source_systems      TEXT NULL COMMENT '数据来源系统',
  responsible_person  VARCHAR(100) NULL COMMENT '数据责任人',
  update_frequency    VARCHAR(50) NULL COMMENT '更新频率',
  collection_method   VARCHAR(100) NULL COMMENT '采集方式',
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dd_module (module),
  INDEX idx_dd_company (company_id),
  CONSTRAINT fk_dd_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据字典';
```

---

## 30. 实体关系概要

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  companies  │────<│ departments │────<│  employees  │
│  (公司)     │     │  (部门)     │     │  (员工)     │
└──────┬──────┘     └─────────────┘     └──────┬──────┘
       │                                        │
       ├──< users (用户) ──< chat_messages       │
       ├──< settlement_entities                  │
       ├──< fiscal_periods (会计期间)            │
       ├──< accounting_subjects (科目)           │
       ├──< bank_accounts                        │
       ├──< suppliers ──< supplier_payables      │
       │              └──< payment_applications   │
       │                                         │
       ├── collected_documents ──< attachments    │
       │       │                                  │
       │       v                                  │
       ├── source_vouchers ──< voucher_business_facts
       │       │              voucher_verification_results
       │       v
       ├── accounting_vouchers ──< voucher_entries >── accounting_subjects
       │       │                   voucher_signatures
       │       v
       ├── ledger_entries >── accounting_subjects
       ├── trial_balances >── accounting_subjects
       ├── fund_transactions >── bank_accounts
       ├── payment_tasks
       ├── bank_statements ──< bank_reconciliation_items
       ├── platform_settlements ──< platform_reconciliation_items
       ├── monthly_financial_snapshots
       ├── profit_details
       ├── tax_filings
       ├── closing_tasks
       ├── period_end_steps / period_end_transfers
       ├── customer_receivables ──< collection_records
       ├── budgets ──< budget_executions
       ├── fixed_assets ──< depreciation_records
       ├── inventory_items
       ├── risk_exceptions / risk_indicators
       ├── system_connections
       ├── audit_logs
       └── ai_analysis_results
```

### 核心关联路径

```
原始单据 → 原始凭证 → 记账凭证（分录→科目）→ 账簿 → 科目余额表 → 报表
                │
                ├─→ 付款申请 → 资金交易 → 银行对账
                ├─→ 应收 → 催收 → 回款
                ├─→ 应付 → 付款
                ├─→ 预算执行
                ├─→ 固定资产折旧
                └─→ 税务申报
```

---

## 31. 预估规模

| 指标 | 预估值 |
|:---|:---|
| **表总数** | **55 张** |
| 基础共享表 | 10 张 |
| 智能采集 | 1 张 |
| 凭证相关 | 7 张 |
| 资金/银行/平台 | 8 张 |
| 账簿/余额/报表 | 4 张 |
| 税务 | 1 张 |
| 月结/结转 | 3 张 |
| 应收/应付 | 8 张 |
| 预算/资产/库存 | 7 张 |
| 产销/费用/工资 | 4 张 |
| 风险/AI/审计/系统 | 8 张 |
| **预估列总数** | ~500+ 列 |
| **预估初始数据量** | < 10,000 行（演示规模） |
| **日均增量** | ~100–500 行（中等业务量） |

---

