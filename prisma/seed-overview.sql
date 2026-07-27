-- ============================================================================
-- 财务云 · Overview / 经营驾驶舱 演示数据（幂等版）
-- 说明：fiscal_periods / monthly_financial_snapshots 有 updated_at 列；
--       profit_details / cash_flow_predictions / *_ranking 无 updated_at，
--       且 created_at 有 DEFAULT CURRENT_TIMESTAMP，由 DB 自动填充。
-- 幂等：已存在的用 IGNORE 跳过；无 unique 的表先 DELETE(company_id=1) 再 INSERT。
-- ============================================================================

-- 1) 补足 2026-01 ~ 2026-06 会计期间（07 已存在 id=1）
INSERT IGNORE INTO fiscal_periods
  (id, company_id, year, month, start_date, end_date, is_closed, created_at, updated_at)
VALUES
  (2, 1, 2026, 1, '2026-01-01', '2026-01-31', 0, NOW(), NOW()),
  (3, 1, 2026, 2, '2026-02-01', '2026-02-28', 0, NOW(), NOW()),
  (4, 1, 2026, 3, '2026-03-01', '2026-03-31', 0, NOW(), NOW()),
  (5, 1, 2026, 4, '2026-04-01', '2026-04-30', 0, NOW(), NOW()),
  (6, 1, 2026, 5, '2026-05-01', '2026-05-31', 0, NOW(), NOW()),
  (7, 1, 2026, 6, '2026-06-01', '2026-06-30', 0, NOW(), NOW());

-- 2) 月度财务快照（驾驶舱卡片 + 趋势图）
INSERT IGNORE INTO monthly_financial_snapshots
  (company_id, fiscal_period_id, revenue, revenue_yoy,
   cost_of_goods, platform_commission, marketing_cost, logistics_cost,
   net_profit, net_profit_yoy, net_margin, gross_margin, gross_margin_benchmark,
   operating_cash_flow, opening_cash, cash_inflow, cash_outflow, closing_cash,
   overdue_ratio, fund_coverage, created_at, updated_at)
VALUES
  (1, 2,  8200000, 0.1210, 4520000, 738000, 1560000, 640000, 620000,  0.0900, 0.0756, 0.4488, 0.4200, 520000, 2800000, 6400000, 5880000, 3320000, 0.0410, 1.62, NOW(), NOW()),
  (1, 3,  7600000, 0.0980, 4180000, 684000, 1480000, 590000, 540000,  0.0710, 0.0711, 0.4500, 0.4200, 480000, 3320000, 5900000, 5420000, 3380000, 0.0380, 1.70, NOW(), NOW()),
  (1, 4,  9800000, 0.1530, 5360000, 882000, 1980000, 760000, 880000,  0.1180, 0.0898, 0.4531, 0.4200, 690000, 3380000, 7800000, 7110000, 4070000, 0.0360, 1.78, NOW(), NOW()),
  (1, 5, 10500000, 0.1610, 5780000, 945000, 2120000, 820000, 950000,  0.1320, 0.0905, 0.4495, 0.4200, 740000, 4070000, 8300000, 7560000, 4810000, 0.0350, 1.81, NOW(), NOW()),
  (1, 6, 11800000, 0.1740, 6480000, 1062000, 2380000, 920000, 1060000, 0.1460, 0.0898, 0.4508, 0.4200, 810000, 4810000, 9200000, 8400000, 5610000, 0.0340, 1.84, NOW(), NOW()),
  (1, 7, 12500000, 0.1820, 6850000, 1125000, 2380000, 980000, 1120000, 0.1540, 0.0896, 0.4516, 0.4200, 860000, 5610000, 9800000, 8940000, 6470000, 0.0340, 1.85, NOW(), NOW()),
  (1, 1, 12500000, 0.1820, 6850000, 1125000, 2380000, 980000, 1120000, 0.1540, 0.0896, 0.4516, 0.4200, 860000, 5610000, 9800000, 8940000, 6470000, 0.0340, 1.85, NOW(), NOW());

-- 3) 利润结构（瀑布图），2026-07。无 updated_at，created_at 走 DEFAULT。
DELETE FROM profit_details WHERE company_id = 1;
INSERT INTO profit_details
  (company_id, fiscal_period_id, section, item_label, amount, percentage, parent_id, sort_order)
VALUES
  (1, 1, 'revenue',  '主营业务收入',       12500000, 1.0000, NULL, 1),
  (1, 1, 'revenue',  '其他业务收入',         380000, 0.0304, NULL, 2),
  (1, 1, 'cost',     '主营业务成本',        6850000, 0.5480, NULL, 3),
  (1, 1, 'cost',     '平台佣金',            1125000, 0.0900, NULL, 4),
  (1, 1, 'cost',     '营销费用',            2380000, 0.1904, NULL, 5),
  (1, 1, 'cost',     '物流费用',             980000, 0.0784, NULL, 6),
  (1, 1, 'tax',      '税金及附加',           320000, 0.0256, NULL, 7),
  (1, 1, 'expense',  '销售费用',            1450000, 0.1160, NULL, 8),
  (1, 1, 'expense',  '管理费用',             980000, 0.0784, NULL, 9),
  (1, 1, 'expense',  '财务费用',             120000, 0.0096, NULL, 10),
  (1, 1, 'profit',   '营业利润',            1380000, 0.1104, NULL, 11),
  (1, 1, 'profit',   '净利润',              1120000, 0.0896, NULL, 12);

-- 4) 现金流 30 天预测 (period_id=1)
DELETE FROM cash_flow_predictions WHERE company_id = 1 AND period_id = 1;
INSERT INTO cash_flow_predictions (company_id, period_id, day_label, day_offset, balance)
WITH RECURSIVE d(n) AS (
  SELECT 0 UNION ALL SELECT n + 1 FROM d WHERE n < 29
)
SELECT 1, 1, CONCAT('D', n), n,
       6470000 + n * 12000 + (n % 7) * 8000 - (n % 5) * 15000
FROM d;

-- 5) 直播间利润排名 (fiscal_period_id=1)
DELETE FROM live_room_profit_ranking WHERE company_id = 1;
INSERT INTO live_room_profit_ranking
  (company_id, fiscal_period_id, `rank`, room_name, profit, margin, trend)
VALUES
  (1, 1, 1, '星芒官方旗舰直播间',  420000, 0.1120, 'up'),
  (1, 1, 2, '星芒美妆专属直播间',  310000, 0.0980, 'up'),
  (1, 1, 3, '星芒日用百货直播间',  180000, 0.0760, 'down'),
  (1, 1, 4, '星芒食品生鲜直播间',   95000, 0.0610, 'up');

-- 6) 商品利润排名 (fiscal_period_id=1)
DELETE FROM product_profit_ranking WHERE company_id = 1;
INSERT INTO product_profit_ranking
  (company_id, fiscal_period_id, `rank`, product_name, profit, margin, trend)
VALUES
  (1, 1, 1, '臻颜精华液套装',    260000, 0.2140, 'up'),
  (1, 1, 2, '鲜萃面膜 30片装',   195000, 0.1820, 'up'),
  (1, 1, 3, '氨基酸洁面乳',      142000, 0.1560, 'down'),
  (1, 1, 4, '玻尿酸保湿水',      118000, 0.1410, 'up'),
  (1, 1, 5, '轻润防晒霜 SPF50',   88000, 0.1280, 'down');
