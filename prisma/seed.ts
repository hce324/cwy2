// Prisma seed — Phase 2: base tables seed data
// Run with: pnpm prisma db seed
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Company ───
  const company = await prisma.company.upsert({
    where: { id: 1n },
    update: {},
    create: {
      id: 1n,
      name: '杭州星芒供应链有限公司',
      shortName: '星芒供应链',
      taxId: '91330100MA7XXXXXXX',
      status: 'active',
    },
  });
  console.log(`  ✓ Company: ${company.name}`);

  // ─── Departments ───
  const deptData = [
    { name: '财务部', sortOrder: 1 },
    { name: '采购部', sortOrder: 2 },
    { name: '仓储物流部', sortOrder: 3 },
    { name: '市场部', sortOrder: 4 },
    { name: '人力资源部', sortOrder: 5 },
    { name: '技术部', sortOrder: 6 },
  ];
  for (const d of deptData) {
    await prisma.department.upsert({
      where: { id: BigInt(deptData.indexOf(d) + 1) },
      update: {},
      create: {
        id: BigInt(deptData.indexOf(d) + 1),
        companyId: 1n,
        name: d.name,
        sortOrder: d.sortOrder,
      },
    });
  }
  console.log(`  ✓ Departments: ${deptData.length}`);

  // ─── Roles ───
  const roleData = [
    { name: '财务负责人', code: 'finance_director', description: '全部模块权限' },
    { name: '财务专员', code: 'finance_specialist', description: '日常核算操作权限' },
    { name: '出纳', code: 'cashier', description: '资金相关权限' },
  ];
  for (const r of roleData) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: {},
      create: r,
    });
  }
  console.log(`  ✓ Roles: ${roleData.length}`);

  // ─── Permissions (35 ViewIds) ───
  const viewIds = [
    'workbench', 'overview', 'cash', 'receivable', 'payable',
    'inventory', 'budget', 'profit', 'closing', 'risk', 'import',
    'blueprint', 'data', 'boundary',
    'hz-documents', 'hz-sourcevoucher', 'hz-cashmanagement', 'hz-voucher',
    'hz-voucherorganize', 'hz-vouchervoid', 'hz-voucherquery',
    'hz-reconcile', 'hz-bankrecon', 'hz-ledger', 'hz-balance',
    'subjects', 'opening-balance', 'business-entry',
    'asset-management', 'inventory-management',
    'accounting-check', 'hz-reports', 'hz-closing', 'hz-tax', 'hz-settings',
  ];
  for (const vid of viewIds) {
    await prisma.permission.upsert({
      where: { code: vid },
      update: {},
      create: { code: vid, name: vid },
    });
  }
  console.log(`  ✓ Permissions: ${viewIds.length}`);

  // ─── Role-Permission mappings ───
  // 财务负责人: all permissions
  const directorRole = await prisma.role.findUniqueOrThrow({ where: { code: 'finance_director' } });
  const allPerms = await prisma.permission.findMany();

  // 财务专员 permissions
  const specialistPermCodes = new Set([
    'workbench', 'receivable', 'profit', 'closing', 'import',
    'hz-documents', 'hz-sourcevoucher', 'hz-voucher', 'hz-voucherorganize',
    'hz-vouchervoid', 'hz-voucherquery', 'hz-ledger', 'hz-balance',
    'subjects', 'opening-balance', 'business-entry',
    'asset-management', 'inventory-management',
    'accounting-check', 'hz-reports', 'hz-closing', 'hz-tax',
    'blueprint', 'data', 'boundary',
  ]);

  // 出纳 permissions
  const cashierPermCodes = new Set([
    'workbench', 'cash', 'import',
    'hz-documents', 'hz-cashmanagement', 'hz-voucher',
    'hz-bankrecon', 'hz-ledger', 'business-entry',
    'blueprint', 'data', 'boundary',
  ]);

  for (const perm of allPerms) {
    // Director gets everything
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: directorRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: directorRole.id, permissionId: perm.id },
    });

    // Specialist
    if (specialistPermCodes.has(perm.code)) {
      const specRole = await prisma.role.findUniqueOrThrow({ where: { code: 'finance_specialist' } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: specRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: specRole.id, permissionId: perm.id },
      });
    }

    // Cashier
    if (cashierPermCodes.has(perm.code)) {
      const cashierRole = await prisma.role.findUniqueOrThrow({ where: { code: 'cashier' } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: cashierRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: cashierRole.id, permissionId: perm.id },
      });
    }
  }
  console.log('  ✓ Role-Permission mappings');

  // ─── Users (3 demo users, one per role) ───
  const userData = [
    { username: 'director', displayName: '林主管', role: '财务负责人' },
    { username: 'specialist', displayName: '周会计', role: '财务专员' },
    { username: 'cashier', displayName: '陈出纳', role: '出纳' },
  ];
  for (const u of userData) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        companyId: 1n,
        username: u.username,
        passwordHash: 'demo-hash-not-for-production',
        displayName: u.displayName,
        role: u.role,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ Users: ${userData.length}`);

  // ─── Fiscal Period (2026-07) ───
  await prisma.fiscalPeriod.upsert({
    where: { companyId_year_month: { companyId: 1n, year: 2026, month: 7 } },
    update: {},
    create: {
      companyId: 1n,
      year: 2026,
      month: 7,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-31'),
    },
  });
  console.log('  ✓ Fiscal Period: 2026-07');

  // ─── Settlement Entities (stores) ───
  const storeData = [
    { name: '杭州星芒抖音旗舰店', type: '店铺' },
    { name: '杭州星芒天猫旗舰店', type: '店铺' },
    { name: '杭州星芒京东自营', type: '店铺' },
  ];
  for (const s of storeData) {
    await prisma.settlementEntity.create({
      data: { companyId: 1n, name: s.name, type: s.type },
    });
  }
  console.log(`  ✓ Settlement Entities: ${storeData.length}`);

  // ─── Accounting Subjects (33 first-level + 34 detail) ───
  try {
    // First-level subjects
    const firstLevelSubjects = [
      // Asset accounts (资产)
      { code: '1001', name: '库存现金', direction: '借', category: '资产', level: 1, isLeaf: false },
      { code: '1002', name: '银行存款', direction: '借', category: '资产', level: 1, isLeaf: false },
      { code: '1122', name: '应收账款', direction: '借', category: '资产', level: 1, isLeaf: false },
      { code: '1123', name: '预付账款', direction: '借', category: '资产', level: 1, isLeaf: false },
      { code: '1221', name: '其他应收款', direction: '借', category: '资产', level: 1, isLeaf: false },
      { code: '1403', name: '原材料', direction: '借', category: '资产', level: 1, isLeaf: false },
      { code: '1405', name: '库存商品', direction: '借', category: '资产', level: 1, isLeaf: false },
      { code: '1406', name: '发出商品', direction: '借', category: '资产', level: 1, isLeaf: true },
      { code: '1407', name: '商品进销差价', direction: '借', category: '资产', level: 1, isLeaf: true },
      { code: '1408', name: '委托加工物资', direction: '借', category: '资产', level: 1, isLeaf: true },
      { code: '1601', name: '固定资产', direction: '借', category: '资产', level: 1, isLeaf: false },
      { code: '1602', name: '累计折旧', direction: '贷', category: '资产', level: 1, isLeaf: false },
      { code: '1701', name: '无形资产', direction: '借', category: '资产', level: 1, isLeaf: false },
      { code: '1801', name: '长期待摊费用', direction: '借', category: '资产', level: 1, isLeaf: false },
      // Liability accounts (负债)
      { code: '2001', name: '短期借款', direction: '贷', category: '负债', level: 1, isLeaf: false },
      { code: '2202', name: '应付账款', direction: '贷', category: '负债', level: 1, isLeaf: false },
      { code: '2203', name: '预收账款', direction: '贷', category: '负债', level: 1, isLeaf: false },
      { code: '2211', name: '应付职工薪酬', direction: '贷', category: '负债', level: 1, isLeaf: false },
      { code: '2221', name: '应交税费', direction: '贷', category: '负债', level: 1, isLeaf: false },
      { code: '2231', name: '应付利息', direction: '贷', category: '负债', level: 1, isLeaf: false },
      { code: '2241', name: '其他应付款', direction: '贷', category: '负债', level: 1, isLeaf: false },
      { code: '2501', name: '长期借款', direction: '贷', category: '负债', level: 1, isLeaf: false },
      // Equity accounts (权益)
      { code: '3001', name: '实收资本', direction: '贷', category: '权益', level: 1, isLeaf: true },
      { code: '3002', name: '资本公积', direction: '贷', category: '权益', level: 1, isLeaf: true },
      { code: '3101', name: '盈余公积', direction: '贷', category: '权益', level: 1, isLeaf: true },
      { code: '4103', name: '本年利润', direction: '贷', category: '权益', level: 1, isLeaf: true },
      { code: '4104', name: '利润分配', direction: '贷', category: '权益', level: 1, isLeaf: false },
      // Revenue accounts (收入)
      { code: '5001', name: '主营业务收入', direction: '贷', category: '收入', level: 1, isLeaf: false },
      { code: '5051', name: '其他业务收入', direction: '贷', category: '收入', level: 1, isLeaf: true },
      // Cost/Expense accounts (成本费用)
      { code: '6001', name: '主营业务成本', direction: '借', category: '费用', level: 1, isLeaf: false },
      { code: '6051', name: '其他业务成本', direction: '借', category: '费用', level: 1, isLeaf: true },
      { code: '6403', name: '税金及附加', direction: '借', category: '费用', level: 1, isLeaf: false },
      { code: '6601', name: '销售费用', direction: '借', category: '费用', level: 1, isLeaf: false },
      { code: '6602', name: '管理费用', direction: '借', category: '费用', level: 1, isLeaf: false },
      { code: '6603', name: '财务费用', direction: '借', category: '费用', level: 1, isLeaf: false },
    ];

    const subjectMap = new Map<string, bigint>();
    let fCount = 0;
    for (const s of firstLevelSubjects) {
      const { code, name, direction, category, level, isLeaf } = s;
      const subject = await prisma.accountingSubject.upsert({
        where: { companyId_code: { companyId: 1n, code } },
        update: {},
        create: { companyId: 1n, code, name, direction, category, level, isLeaf },
      });
      subjectMap.set(code, subject.id);
      fCount++;
    }

    // Detail-level subjects (34)
    const detailSubjects = [
      // 1001 库存现金 detail
      { code: '100101', name: '库存现金-人民币', parentCode: '1001', direction: '借', category: '资产', level: 2, isLeaf: true },
      { code: '100102', name: '库存现金-美元', parentCode: '1001', direction: '借', category: '资产', level: 2, isLeaf: true },
      // 1002 银行存款 detail
      { code: '100201', name: '银行存款-工商银行', parentCode: '1002', direction: '借', category: '资产', level: 2, isLeaf: true },
      { code: '100202', name: '银行存款-招商银行', parentCode: '1002', direction: '借', category: '资产', level: 2, isLeaf: true },
      { code: '100203', name: '银行存款-建设银行', parentCode: '1002', direction: '借', category: '资产', level: 2, isLeaf: true },
      // 1122 应收账款 detail
      { code: '112201', name: '应收账款-杭州美妆贸易有限公司', parentCode: '1122', direction: '借', category: '资产', level: 2, isLeaf: true },
      { code: '112202', name: '应收账款-北京科讯电子有限公司', parentCode: '1122', direction: '借', category: '资产', level: 2, isLeaf: true },
      // 1221 其他应收款 detail
      { code: '122101', name: '其他应收款-员工借款', parentCode: '1221', direction: '借', category: '资产', level: 2, isLeaf: true },
      { code: '122102', name: '其他应收款-保证金', parentCode: '1221', direction: '借', category: '资产', level: 2, isLeaf: true },
      // 1403 原材料 detail
      { code: '140301', name: '原材料-主料', parentCode: '1403', direction: '借', category: '资产', level: 2, isLeaf: true },
      { code: '140302', name: '原材料-辅料', parentCode: '1403', direction: '借', category: '资产', level: 2, isLeaf: true },
      // 1405 库存商品 detail
      { code: '140501', name: '库存商品-护肤品类', parentCode: '1405', direction: '借', category: '资产', level: 2, isLeaf: true },
      { code: '140502', name: '库存商品-彩妆类', parentCode: '1405', direction: '借', category: '资产', level: 2, isLeaf: true },
      // 1601 固定资产 detail
      { code: '160101', name: '固定资产-办公设备', parentCode: '1601', direction: '借', category: '资产', level: 2, isLeaf: true },
      { code: '160102', name: '固定资产-运输车辆', parentCode: '1601', direction: '借', category: '资产', level: 2, isLeaf: true },
      // 1701 无形资产 detail
      { code: '170101', name: '无形资产-软件著作权', parentCode: '1701', direction: '借', category: '资产', level: 2, isLeaf: true },
      { code: '170102', name: '无形资产-商标权', parentCode: '1701', direction: '借', category: '资产', level: 2, isLeaf: true },
      // 2202 应付账款 detail
      { code: '220201', name: '应付账款-供应商货款', parentCode: '2202', direction: '贷', category: '负债', level: 2, isLeaf: true },
      { code: '220202', name: '应付账款-服务费', parentCode: '2202', direction: '贷', category: '负债', level: 2, isLeaf: true },
      // 2211 应付职工薪酬 detail
      { code: '221101', name: '应付职工薪酬-工资', parentCode: '2211', direction: '贷', category: '负债', level: 2, isLeaf: true },
      { code: '221102', name: '应付职工薪酬-社保', parentCode: '2211', direction: '贷', category: '负债', level: 2, isLeaf: true },
      // 2221 应交税费 detail
      { code: '222101', name: '应交税费-应交增值税', parentCode: '2221', direction: '贷', category: '负债', level: 2, isLeaf: true },
      { code: '222102', name: '应交税费-应交企业所得税', parentCode: '2221', direction: '贷', category: '负债', level: 2, isLeaf: true },
      // 6601 销售费用 detail
      { code: '660101', name: '销售费用-广告推广费', parentCode: '6601', direction: '借', category: '费用', level: 2, isLeaf: true },
      { code: '660102', name: '销售费用-平台佣金', parentCode: '6601', direction: '借', category: '费用', level: 2, isLeaf: true },
      // 6602 管理费用 detail
      { code: '660201', name: '管理费用-工资薪酬', parentCode: '6602', direction: '借', category: '费用', level: 2, isLeaf: true },
      { code: '660202', name: '管理费用-办公费', parentCode: '6602', direction: '借', category: '费用', level: 2, isLeaf: true },
      { code: '660203', name: '管理费用-差旅费', parentCode: '6602', direction: '借', category: '费用', level: 2, isLeaf: true },
      { code: '660204', name: '管理费用-折旧费', parentCode: '6602', direction: '借', category: '费用', level: 2, isLeaf: true },
      // 6603 财务费用 detail
      { code: '660301', name: '财务费用-利息支出', parentCode: '6603', direction: '借', category: '费用', level: 2, isLeaf: true },
      { code: '660302', name: '财务费用-手续费', parentCode: '6603', direction: '借', category: '费用', level: 2, isLeaf: true },
      // 5001 主营业务收入 detail
      { code: '500101', name: '主营业务收入-护肤品', parentCode: '5001', direction: '贷', category: '收入', level: 2, isLeaf: true },
      { code: '500102', name: '主营业务收入-彩妆', parentCode: '5001', direction: '贷', category: '收入', level: 2, isLeaf: true },
      // 6001 主营业务成本 detail
      { code: '600101', name: '主营业务成本-护肤品', parentCode: '6001', direction: '借', category: '费用', level: 2, isLeaf: true },
    ];

    let dCount = 0;
    for (const ds of detailSubjects) {
      const { code, name, parentCode, direction, category, level, isLeaf } = ds;
      const parentId = subjectMap.get(parentCode);
      if (!parentId) {
        console.log(`  ⚠ Skip detail subject ${code}: parent ${parentCode} not found`);
        continue;
      }
      await prisma.accountingSubject.upsert({
        where: { companyId_code: { companyId: 1n, code } },
        update: {},
        create: { companyId: 1n, code, name, direction, category, level, isLeaf, parentId },
      });
      dCount++;
    }
    console.log(`  ✓ Accounting Subjects: ${fCount} first-level + ${dCount} detail`);
  } catch (e) {
    console.log(`  ⚠ Accounting Subjects failed: ${e}`);
  }

  // ─── Bank Accounts (3 accounts) ───
  try {
    const bankAccounts = [
      { accountName: '工商银行基本户', accountNo: '6222021202001234567', bankName: '中国工商银行', accountType: '基本户', balance: 5800000.00, currency: 'CNY', status: '正常' },
      { accountName: '招商银行一般户', accountNo: '6214830100123456', bankName: '招商银行', accountType: '一般户', balance: 2350000.00, currency: 'CNY', status: '正常' },
      { accountName: '建设银行贷款户', accountNo: '6227001541230001234', bankName: '中国建设银行', accountType: '贷款户', balance: 1200000.00, currency: 'CNY', status: '正常' },
    ];
    for (const ba of bankAccounts) {
      await prisma.bankAccount.create({
        data: { companyId: 1n, ...ba },
      });
    }
    console.log(`  ✓ Bank Accounts: ${bankAccounts.length}`);
  } catch (e) {
    console.log(`  ⚠ Bank Accounts failed: ${e}`);
  }

  // ─── Supplier data (3 suppliers) ───
  try {
    const suppliers = [
      { name: '供应商A-杭州美妆原料供应有限公司', contactPerson: '王经理', contactPhone: '13800001001', address: '杭州市西湖区文三路456号', taxId: '91330108MAXXXXXXX' },
      { name: '供应商B-宁波包装材料厂', contactPerson: '李主管', contactPhone: '13800001002', address: '宁波市鄞州区江南路789号', taxId: '91330212MAXXXXXXX' },
      { name: '供应商C-苏州化工原料厂', contactPerson: '张工', contactPhone: '13800001003', address: '苏州市工业园区苏虹路321号', taxId: '91320594MAXXXXXXX' },
    ];
    for (const sup of suppliers) {
      await prisma.supplier.create({
        data: { companyId: 1n, ...sup },
      });
    }
    console.log(`  ✓ Suppliers: ${suppliers.length}`);
  } catch (e) {
    console.log(`  ⚠ Suppliers failed: ${e}`);
  }

  // ─── Sample Voucher Data ───
  try {
    // Find settlement entity for reference
    const settlementEntity = await prisma.settlementEntity.findFirst({ where: { companyId: 1n } });
    const entityId = settlementEntity?.id ?? null;

    // Collected documents
    const collectedDoc1 = await prisma.collectedDocument.create({
      data: {
        companyId: 1n,
        settlementEntityId: entityId,
        name: '采购发票CN-2026-001',
        category: '采购发票',
        source: '供应商系统',
        amount: 50000.00,
        currency: 'CNY',
        documentDate: new Date('2026-07-10'),
        recognitionStatus: 'pending',
      },
    });
    const collectedDoc2 = await prisma.collectedDocument.create({
      data: {
        companyId: 1n,
        settlementEntityId: entityId,
        name: '银行回单BR-2026-001',
        category: '银行回单',
        source: '银行系统',
        amount: 30000.00,
        currency: 'CNY',
        documentDate: new Date('2026-07-12'),
        recognitionStatus: 'pending',
      },
    });
    console.log('  ✓ Collected Documents: 2');

    // Source vouchers (use upsert with unique voucherNo)
    await prisma.sourceVoucher.upsert({
      where: { voucherNo: 'SV-20260701' },
      update: {},
      create: {
        companyId: 1n,
        settlementEntityId: entityId,
        voucherNo: 'SV-20260701',
        itemDescription: '采购原材料，发票号CN-2026-001',
        businessDate: new Date('2026-07-10'),
        amount: 50000.00,
        includedDocuments: '采购发票CN-2026-001',
        businessEntity: '供应商A-杭州美妆原料供应有限公司',
        counterparty: '供应商A',
        handlerName: '周会计',
        handlerDepartment: '财务部',
        riskStatus: '待确认',
        status: '待处理',
      },
    });
    await prisma.sourceVoucher.upsert({
      where: { voucherNo: 'SV-20260702' },
      update: {},
      create: {
        companyId: 1n,
        settlementEntityId: entityId,
        voucherNo: 'SV-20260702',
        itemDescription: '支付货款，银行回单BR-2026-001',
        businessDate: new Date('2026-07-12'),
        amount: 30000.00,
        includedDocuments: '银行回单BR-2026-001',
        businessEntity: '供应商A-杭州美妆原料供应有限公司',
        counterparty: '供应商A',
        handlerName: '陈出纳',
        handlerDepartment: '财务部',
        riskStatus: '待确认',
        status: '待处理',
      },
    });
    console.log('  ✓ Source Vouchers: 2');

    // Accounting vouchers
    // 转字001号 - 计提费用 (draft)
    const voucher1 = await prisma.accountingVoucher.upsert({
      where: { voucherNo: '转字001号' },
      update: {},
      create: {
        companyId: 1n,
        fiscalPeriodId: 1n,
        voucherNo: '转字001号',
        voucherWord: '转字',
        voucherNumber: 1,
        voucherDate: new Date('2026-07-15'),
        summary: '计提7月办公费用',
        debitAmount: 25000.00,
        creditAmount: 25000.00,
        attachmentCount: 2,
        status: 'draft',
        auditStatus: 'pending',
        category: '转账',
        creatorId: 1n,
      },
    });

    // 付字001号 - 付款 (approved)
    const voucher2 = await prisma.accountingVoucher.upsert({
      where: { voucherNo: '付字001号' },
      update: {},
      create: {
        companyId: 1n,
        fiscalPeriodId: 1n,
        voucherNo: '付字001号',
        voucherWord: '付字',
        voucherNumber: 1,
        voucherDate: new Date('2026-07-20'),
        summary: '支付供应商货款',
        debitAmount: 30000.00,
        creditAmount: 30000.00,
        attachmentCount: 1,
        status: 'approved',
        auditStatus: 'approved',
        category: '付款',
        creatorId: 1n,
      },
    });

    // Query subject IDs for voucher entries
    const subj660202 = await prisma.accountingSubject.findUnique({ where: { companyId_code: { companyId: 1n, code: '660202' } } });
    const subj220201 = await prisma.accountingSubject.findUnique({ where: { companyId_code: { companyId: 1n, code: '220201' } } });
    const subj100201 = await prisma.accountingSubject.findUnique({ where: { companyId_code: { companyId: 1n, code: '100201' } } });

    // Voucher entries for 转字001号 (计提费用)
    if (subj660202 && subj220201) {
      await prisma.voucherEntry.createMany({
        data: [
          {
            voucherId: voucher1.id,
            subjectId: subj660202.id,
            summary: '计提7月办公费用-借',
            debitAmount: 25000.00,
            creditAmount: 0.00,
            direction: '借',
            sortOrder: 1,
          },
          {
            voucherId: voucher1.id,
            subjectId: subj220201.id,
            summary: '计提7月办公费用-贷',
            debitAmount: 0.00,
            creditAmount: 25000.00,
            direction: '贷',
            sortOrder: 2,
          },
        ],
      });
    }

    // Voucher entries for 付字001号 (付款)
    if (subj220201 && subj100201) {
      await prisma.voucherEntry.createMany({
        data: [
          {
            voucherId: voucher2.id,
            subjectId: subj220201.id,
            summary: '支付供应商货款-借',
            debitAmount: 30000.00,
            creditAmount: 0.00,
            direction: '借',
            sortOrder: 1,
          },
          {
            voucherId: voucher2.id,
            subjectId: subj100201.id,
            summary: '支付供应商货款-贷',
            debitAmount: 0.00,
            creditAmount: 30000.00,
            direction: '贷',
            sortOrder: 2,
          },
        ],
      });
    }
    console.log('  ✓ Accounting Vouchers: 2 with entries');
  } catch (e) {
    console.log(`  ⚠ Voucher Data failed: ${e}`);
  }

  // ─── Fixed Assets (2 assets) ───
  try {
    const assets = [
      {
        assetName: '办公设备',
        assetCode: 'FA-2026-001',
        category: '电子设备',
        departmentName: '财务部',
        originalValue: 120000.00,
        residualValue: 6000.00,
        usefulLifeYears: 5,
        depreciationMethod: 'straight_line',
        monthlyDepreciation: 1900.00,
        acquisitionDate: new Date('2026-01-15'),
        status: '在用',
      },
      {
        assetName: '运输车辆',
        assetCode: 'FA-2026-002',
        category: '运输设备',
        departmentName: '仓储物流部',
        originalValue: 350000.00,
        residualValue: 35000.00,
        usefulLifeYears: 10,
        depreciationMethod: 'straight_line',
        monthlyDepreciation: 2625.00,
        acquisitionDate: new Date('2026-03-01'),
        status: '在用',
      },
    ];
    for (const asset of assets) {
      await prisma.fixedAsset.create({
        data: {
          companyId: 1n,
          ...asset,
          accumulatedDepreciation: 0.00,
          netValue: asset.originalValue,
        },
      });
    }
    console.log(`  ✓ Fixed Assets: ${assets.length}`);
  } catch (e) {
    console.log(`  ⚠ Fixed Assets failed: ${e}`);
  }

  // ─── Budget (1 budget for 2026) ───
  try {
    await prisma.budget.upsert({
      where: {
        companyId_fiscalPeriodId_departmentName_budgetCategory: {
          companyId: 1n,
          fiscalPeriodId: 1n,
          departmentName: '财务部',
          budgetCategory: '日常运营',
        },
      },
      update: {},
      create: {
        companyId: 1n,
        fiscalPeriodId: 1n,
        departmentName: '财务部',
        annualBudget: 5000000.00,
        budgetCategory: '日常运营',
      },
    });
    console.log('  ✓ Budget: 1');
  } catch (e) {
    console.log(`  ⚠ Budget failed: ${e}`);
  }

  // ─── Inventory Items (3 items) ───
  try {
    const inventoryItems = [
      {
        skuCode: 'SKU-RWH-001',
        skuName: '补水精华液30ml',
        warehouse: '杭州主仓',
        quantity: 1500,
        safetyStock: 300,
        unitCost: 38.50,
        category: '护肤品',
        turnoverDays: 28.00,
      },
      {
        skuCode: 'SKU-CZH-001',
        skuName: '哑光口红3.5g',
        warehouse: '杭州主仓',
        quantity: 800,
        safetyStock: 150,
        unitCost: 22.00,
        category: '彩妆',
        turnoverDays: 42.00,
      },
      {
        skuCode: 'SKU-RWH-002',
        skuName: '防晒霜50ml',
        warehouse: '杭州主仓',
        quantity: 1200,
        safetyStock: 250,
        unitCost: 45.00,
        category: '护肤品',
        turnoverDays: 21.00,
      },
    ];
    for (const item of inventoryItems) {
      await prisma.inventoryItem.upsert({
        where: { skuCode: item.skuCode },
        update: {},
        create: { companyId: 1n, ...item },
      });
    }
    console.log(`  ✓ Inventory Items: ${inventoryItems.length}`);
  } catch (e) {
    console.log(`  ⚠ Inventory Items failed: ${e}`);
  }

  // ─── Full business-data SQL seed (65 tables, Beiterui 2025H1 demo) ───
  try {
    const sqlPath = path.resolve(__dirname, '..', 'scripts', 'seed-berry-2025h1.sql');
    console.log('🌱 Running full dataset SQL seed (65 tables)...');
    execSync(
      `mysql --default-character-set=utf8mb4 -uroot -p1234 -h 127.0.0.1 finance_cloud < "${sqlPath}"`,
      { stdio: 'inherit' },
    );
    console.log('  ✓ Full dataset SQL seed complete');
  } catch (e) {
    console.log('  ⚠ Full dataset SQL seed skipped (mysql CLI may not be in PATH)');
    console.log('     Run manually: mysql ... < scripts/seed-berry-2025h1.sql');
  }

  console.log('\n✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
