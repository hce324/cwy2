-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: finance_cloud
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounting_checks`
--

DROP TABLE IF EXISTS `accounting_checks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounting_checks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `check_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_passed` tinyint(1) NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `checked_at` datetime(3) NOT NULL,
  `checked_by` bigint DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `accounting_checks_fiscal_period_id_idx` (`fiscal_period_id`),
  KEY `accounting_checks_check_type_idx` (`check_type`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounting_checks`
--

LOCK TABLES `accounting_checks` WRITE;
/*!40000 ALTER TABLE `accounting_checks` DISABLE KEYS */;
INSERT INTO `accounting_checks` VALUES (1,1,1,'凭证完整性',1,'全部业务凭证已归档，无缺失','2025-07-10 10:00:00.000',2,'2026-07-24 12:14:08.427'),(2,1,1,'试算平衡',1,'借方合计=贷方合计=34,960,513,514.55','2025-07-10 10:30:00.000',2,'2026-07-24 12:14:08.427'),(3,1,1,'报表勾稽',1,'资产负债表与利润表、现金流量表勾稽一致','2025-07-10 11:00:00.000',2,'2026-07-24 12:14:08.427');
/*!40000 ALTER TABLE `accounting_checks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounting_subjects`
--

DROP TABLE IF EXISTS `accounting_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounting_subjects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direction` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `level` int NOT NULL DEFAULT '1',
  `status` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '启用',
  `is_leaf` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounting_subjects_company_id_code_key` (`company_id`,`code`),
  KEY `accounting_subjects_parent_id_idx` (`parent_id`),
  KEY `accounting_subjects_category_idx` (`category`),
  KEY `accounting_subjects_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounting_subjects`
--

LOCK TABLES `accounting_subjects` WRITE;
/*!40000 ALTER TABLE `accounting_subjects` DISABLE KEYS */;
INSERT INTO `accounting_subjects` VALUES (1,1,'1001','库存现金','库存现金','借','资产',NULL,1,'启用',1,1,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(2,1,'1002','银行存款（货币资金）','银行存款（货币资金）','借','资产',NULL,1,'启用',1,2,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(3,1,'1101','交易性金融资产','交易性金融资产','借','资产',NULL,1,'启用',1,3,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(4,1,'1121','应收票据','应收票据','借','资产',NULL,1,'启用',1,4,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(5,1,'1122','应收账款','应收账款','借','资产',NULL,1,'启用',1,5,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(6,1,'1123','应收款项融资','应收款项融资','借','资产',NULL,1,'启用',1,6,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(7,1,'1124','预付款项','预付款项','借','资产',NULL,1,'启用',1,7,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(8,1,'1221','其他应收款','其他应收款','借','资产',NULL,1,'启用',1,8,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(9,1,'1405','存货','存货','借','资产',NULL,1,'启用',1,9,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(10,1,'1406','其他流动资产','其他流动资产','借','资产',NULL,1,'启用',1,10,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(11,1,'1511','长期股权投资','长期股权投资','借','资产',NULL,1,'启用',1,11,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(12,1,'1512','其他非流动金融资产','其他非流动金融资产','借','资产',NULL,1,'启用',1,12,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(13,1,'1521','投资性房地产','投资性房地产','借','资产',NULL,1,'启用',1,13,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(14,1,'1601','固定资产','固定资产','借','资产',NULL,1,'启用',1,14,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(15,1,'1604','在建工程','在建工程','借','资产',NULL,1,'启用',1,15,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(16,1,'1605','使用权资产','使用权资产','借','资产',NULL,1,'启用',1,16,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(17,1,'1701','无形资产','无形资产','借','资产',NULL,1,'启用',1,17,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(18,1,'1801','长期待摊费用','长期待摊费用','借','资产',NULL,1,'启用',1,18,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(19,1,'1811','递延所得税资产','递延所得税资产','借','资产',NULL,1,'启用',1,19,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(20,1,'1901','其他非流动资产','其他非流动资产','借','资产',NULL,1,'启用',1,20,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(21,1,'2001','短期借款','短期借款','贷','负债',NULL,1,'启用',1,21,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(22,1,'2201','衍生金融负债','衍生金融负债','贷','负债',NULL,1,'启用',1,22,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(23,1,'2202','应付票据','应付票据','贷','负债',NULL,1,'启用',1,23,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(24,1,'2203','应付账款','应付账款','贷','负债',NULL,1,'启用',1,24,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(25,1,'2204','预收款项','预收款项','贷','负债',NULL,1,'启用',1,25,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(26,1,'2205','合同负债','合同负债','贷','负债',NULL,1,'启用',1,26,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(27,1,'2211','应付职工薪酬','应付职工薪酬','贷','负债',NULL,1,'启用',1,27,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(28,1,'2221','应交税费','应交税费','贷','负债',NULL,1,'启用',1,28,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(29,1,'2241','其他应付款','其他应付款','贷','负债',NULL,1,'启用',1,29,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(30,1,'2501','一年内到期的非流动负债','一年内到期的非流动负债','贷','负债',NULL,1,'启用',1,30,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(31,1,'2502','其他流动负债','其他流动负债','贷','负债',NULL,1,'启用',1,31,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(32,1,'2503','长期借款','长期借款','贷','负债',NULL,1,'启用',1,32,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(33,1,'2701','租赁负债','租赁负债','贷','负债',NULL,1,'启用',1,33,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(34,1,'2702','预计负债','预计负债','贷','负债',NULL,1,'启用',1,34,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(35,1,'2703','递延收益','递延收益','贷','负债',NULL,1,'启用',1,35,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(36,1,'2704','递延所得税负债','递延所得税负债','贷','负债',NULL,1,'启用',1,36,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(37,1,'2705','其他非流动负债','其他非流动负债','贷','负债',NULL,1,'启用',1,37,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(38,1,'3001','股本','股本','贷','所有者权益',NULL,1,'启用',1,38,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(39,1,'3002','资本公积','资本公积','贷','所有者权益',NULL,1,'启用',1,39,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(40,1,'3003','减：库存股','减：库存股','借','所有者权益',NULL,1,'启用',1,40,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(41,1,'3004','其他综合收益','其他综合收益','贷','所有者权益',NULL,1,'启用',1,41,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(42,1,'3005','专项储备','专项储备','贷','所有者权益',NULL,1,'启用',1,42,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(43,1,'3006','盈余公积','盈余公积','贷','所有者权益',NULL,1,'启用',1,43,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(44,1,'3007','未分配利润','未分配利润','贷','所有者权益',NULL,1,'启用',1,44,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(45,1,'3008','少数股东权益','少数股东权益','贷','所有者权益',NULL,1,'启用',1,45,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(46,1,'6001','主营业务收入','主营业务收入','贷','损益',NULL,1,'启用',1,46,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(47,1,'6002','主营业务成本','主营业务成本','借','损益',NULL,1,'启用',1,47,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(48,1,'6401','税金及附加','税金及附加','借','损益',NULL,1,'启用',1,48,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(49,1,'6601','销售费用','销售费用','借','损益',NULL,1,'启用',1,49,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(50,1,'6602','管理费用','管理费用','借','损益',NULL,1,'启用',1,50,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(51,1,'6603','财务费用','财务费用','借','损益',NULL,1,'启用',1,51,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(52,1,'6604','研发费用','研发费用','借','损益',NULL,1,'启用',1,52,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(53,1,'6111','投资收益','投资收益','贷','损益',NULL,1,'启用',1,53,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(54,1,'6301','营业外收入','营业外收入','贷','损益',NULL,1,'启用',1,54,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(55,1,'6711','营业外支出','营业外支出','借','损益',NULL,1,'启用',1,55,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL),(56,1,'6801','所得税费用','所得税费用','借','损益',NULL,1,'启用',1,56,'2026-07-24 12:14:08.350','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `accounting_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounting_vouchers`
--

DROP TABLE IF EXISTS `accounting_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounting_vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `voucher_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_word` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_number` int NOT NULL,
  `voucher_date` date NOT NULL,
  `summary` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `debit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `credit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `attachment_count` int NOT NULL DEFAULT '0',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `audit_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creator_id` bigint DEFAULT NULL,
  `reviewer_id` bigint DEFAULT NULL,
  `signer_id` bigint DEFAULT NULL,
  `is_voided` tinyint(1) NOT NULL DEFAULT '0',
  `void_reason` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `flow_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `source_voucher_ids` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounting_vouchers_voucher_no_key` (`voucher_no`),
  KEY `accounting_vouchers_company_id_idx` (`company_id`),
  KEY `accounting_vouchers_fiscal_period_id_idx` (`fiscal_period_id`),
  KEY `accounting_vouchers_status_idx` (`status`),
  KEY `accounting_vouchers_voucher_date_idx` (`voucher_date`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounting_vouchers`
--

LOCK TABLES `accounting_vouchers` WRITE;
/*!40000 ALTER TABLE `accounting_vouchers` DISABLE KEYS */;
INSERT INTO `accounting_vouchers` VALUES (15,1,1,'记-2025-0001','收',1,'2025-06-12','收回负极材料销售货款',56300000.00,56300000.00,3,'posted','posted','收款',3,2,3,0,NULL,'原始凭证导入',NULL,'2026-07-24 12:14:08.361','2025-06-30 18:00:00.000',NULL,NULL),(16,1,1,'记-2025-0002','付',2,'2025-05-28','支付针状焦采购款',86000000.00,86000000.00,2,'posted','posted','付款',3,2,3,0,NULL,'原始凭证导入',NULL,'2026-07-24 12:14:08.361','2025-06-30 18:00:00.000',NULL,NULL),(17,1,1,'记-2025-0003','转',3,'2025-06-30','计提6月固定资产折旧',58300000.00,58300000.00,1,'posted','posted','计提',8,2,NULL,0,NULL,'AI生成',NULL,'2026-07-24 12:14:08.361','2025-06-30 18:00:00.000',NULL,NULL),(18,1,1,'记-2025-0004','转',4,'2025-06-30','计提6月职工薪酬',261299265.54,261299265.54,1,'posted','posted','计提',8,2,NULL,0,NULL,'手动',NULL,'2026-07-24 12:14:08.361','2025-06-30 18:00:00.000',NULL,NULL),(19,1,1,'记-2025-0005','转',5,'2025-06-30','结转主营业务成本（H1）',6066650863.45,6066650863.45,1,'posted','posted','结转',8,2,NULL,0,NULL,'AI生成',NULL,'2026-07-24 12:14:08.361','2025-06-30 18:00:00.000',NULL,NULL),(20,1,1,'记-2025-0006','付',6,'2025-06-20','缴纳增值税及附加',90000000.00,90000000.00,1,'posted','posted','缴税',3,2,3,0,NULL,'手动',NULL,'2026-07-24 12:14:08.361','2025-06-30 18:00:00.000',NULL,NULL),(21,1,12,'转字001号','转',1,'2026-07-27','图片1.png',11.00,11.00,0,'voided','approved',NULL,1,1,NULL,1,'用户主动作废',NULL,NULL,'2026-07-27 05:22:39.525','2026-07-27 15:35:14.069',NULL,NULL),(22,1,12,'收字001号','收',1,'2026-07-27','图片1.png',11.00,11.00,0,'voided','approved',NULL,1,1,NULL,1,'用户主动作废',NULL,NULL,'2026-07-27 05:43:38.517','2026-07-27 15:35:14.452',NULL,NULL),(23,1,12,'转字002号','转',2,'2026-07-27','汇总生成（1 张原始凭证）',12.00,12.00,0,'voided','approved',NULL,1,1,NULL,1,'用户主动作废',NULL,NULL,'2026-07-27 07:11:08.063','2026-07-27 15:35:09.408',NULL,'[18]'),(24,1,12,'转字003号','转',3,'2026-07-27','2222',12.00,12.00,0,'voided','approved',NULL,1,1,NULL,1,'用户主动作废',NULL,NULL,'2026-07-27 07:13:18.820','2026-07-27 15:35:13.008',NULL,'[19]'),(25,1,12,'转字004号','转',4,'2026-07-27','汇总生成（1 张原始凭证）',458.89,458.89,0,'voided','approved',NULL,1,1,NULL,1,'用户主动作废',NULL,NULL,'2026-07-27 14:30:29.074','2026-07-27 15:35:11.682',NULL,'[21]'),(26,1,12,'转字005号','转',5,'2026-07-27','*烟草制品*烟',225.00,225.00,0,'approved','approved',NULL,1,1,NULL,0,NULL,NULL,NULL,'2026-07-27 15:51:18.406','2026-07-27 15:51:37.337',NULL,'[23]');
/*!40000 ALTER TABLE `accounting_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_analysis_results`
--

DROP TABLE IF EXISTS `ai_analysis_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_analysis_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `module` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conclusion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `analysis_count` int NOT NULL DEFAULT '0',
  `warning_count` int NOT NULL DEFAULT '0',
  `findings_json` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ai_analysis_results_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_analysis_results`
--

LOCK TABLES `ai_analysis_results` WRITE;
/*!40000 ALTER TABLE `ai_analysis_results` DISABLE KEYS */;
INSERT INTO `ai_analysis_results` VALUES (1,1,1,'财务报表','预警','2025H1营收78.38亿(+11.36%)，归母净利4.79亿(-2.88%)，毛利率升至22.60%，但经营现金流转负需关注。',8,2,'[{\"name\": \"经营现金流\", \"level\": \"warning\"}, {\"name\": \"应收账款周转\", \"level\": \"normal\"}]','2026-07-24 12:14:08.423'),(2,1,1,'税务风险','健康','增值税、企业所得税申报与利润表勾稽一致，无重大差异。',4,0,'[]','2026-07-24 12:14:08.423');
/*!40000 ALTER TABLE `ai_analysis_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attachments`
--

DROP TABLE IF EXISTS `attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `attachable_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachable_id` bigint NOT NULL,
  `file_name` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attachments_attachable_type_attachable_id_idx` (`attachable_type`,`attachable_id`),
  KEY `attachments_company_id_idx` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachments`
--

LOCK TABLES `attachments` WRITE;
/*!40000 ALTER TABLE `attachments` DISABLE KEYS */;
INSERT INTO `attachments` VALUES (9,1,'source_vouchers',1,'增值税专用发票-负极材料.pdf','https://oss.btr.com/att/inv-202506-001.pdf',245760,'application/pdf',0,'2026-07-24 12:14:08.355','2025-06-30 18:00:00.000',NULL),(10,1,'collected_documents',1,'银行回单-工行20250630.jpg','https://oss.btr.com/att/bank-20250630.jpg',512000,'image/jpeg',0,'2026-07-24 12:14:08.355','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` bigint DEFAULT NULL,
  `old_value_json` json DEFAULT NULL,
  `new_value_json` json DEFAULT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_entity_type_entity_id_idx` (`entity_type`,`entity_id`),
  KEY `audit_logs_user_id_idx` (`user_id`),
  KEY `audit_logs_action_idx` (`action`),
  KEY `audit_logs_created_at_idx` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,2,'APPROVE','accounting_vouchers',1,NULL,NULL,'10.20.1.15','Mozilla/5.0 WorkBuddy','2026-07-24 12:14:08.425'),(2,1,3,'EXPORT','trial_balances',1,NULL,NULL,'10.20.1.22','Mozilla/5.0 WorkBuddy','2026-07-24 12:14:08.425'),(3,1,2,'VOID','accounting_vouchers',6,NULL,NULL,'10.20.1.15','Mozilla/5.0 WorkBuddy','2026-07-24 12:14:08.425'),(4,1,1,'CREATE','collected_document',20,NULL,'{\"name\": \"1\", \"amount\": 1212, \"category\": \"发票\"}',NULL,NULL,'2026-07-26 16:11:44.480'),(5,1,1,'CREATE','collected_document',21,NULL,'{\"name\": \"图片1.png\", \"amount\": 11}',NULL,NULL,'2026-07-27 05:18:53.447'),(6,1,1,'CREATE','accounting_voucher',21,NULL,'{\"summary\": \"图片1.png\", \"voucherNo\": \"转字001号\", \"fromDocumentId\": 21}',NULL,NULL,'2026-07-27 05:22:39.556'),(7,1,1,'CREATE','collected_document',22,NULL,'{\"name\": \"图片1.png\", \"amount\": 11}',NULL,NULL,'2026-07-27 05:31:21.320'),(8,1,1,'CREATE','collected_document',23,NULL,'{\"name\": \"图片1.png\", \"amount\": 212}',NULL,NULL,'2026-07-27 05:42:44.305'),(9,1,1,'CREATE','accounting_voucher',22,NULL,'{\"summary\": \"图片1.png\", \"voucherNo\": \"收字001号\", \"fromDocumentId\": 22}',NULL,NULL,'2026-07-27 05:43:38.528'),(10,1,1,'CREATE','source_voucher',18,NULL,'{\"voucherNo\": \"YS1785136083363\", \"itemDescription\": \"微信图片_20250201191043.jpg\"}',NULL,NULL,'2026-07-27 07:08:03.394'),(11,1,1,'VERIFY','source_voucher',18,NULL,'{\"results\": [{\"isPassed\": true, \"checkItem\": \"资料完整，所有单据核对一致\"}], \"riskStatus\": \"资料完整\"}',NULL,NULL,'2026-07-27 07:08:25.898'),(12,1,1,'CREATE','accounting_voucher',23,NULL,'{\"summary\": \"汇总生成（1 张原始凭证）\", \"voucherNo\": \"转字002号\", \"fromSourceVoucherIds\": [18]}',NULL,NULL,'2026-07-27 07:11:08.074'),(13,1,1,'CREATE','source_voucher',19,NULL,'{\"voucherNo\": \"YS1785136329935\", \"itemDescription\": \"微信图片_20250202191806.jpg\"}',NULL,NULL,'2026-07-27 07:12:09.939'),(14,1,1,'CREATE','accounting_voucher',24,NULL,'{\"summary\": \"2222\", \"voucherNo\": \"转字003号\", \"fromSourceVoucherIds\": [19]}',NULL,NULL,'2026-07-27 07:13:18.828'),(15,1,1,'CREATE','source_voucher',20,NULL,'{\"voucherNo\": \"YS1785141787304\", \"itemDescription\": \"_26332000004021728676 2.pdf\"}',NULL,NULL,'2026-07-27 08:43:07.348'),(16,1,1,'CREATE','source_voucher',21,NULL,'{\"voucherNo\": \"YS1785158772317\", \"itemDescription\": \"发票1\"}',NULL,NULL,'2026-07-27 13:26:12.358'),(17,1,1,'RECOGNIZE','source_voucher',21,NULL,'{\"fields\": {\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"叶飞花\", \"remarks\": \"天猫光威4798514666125731904\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"52.79\", \"sellerName\": \"杭州新易联科技有限公司\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年05月15日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"458.89\", \"passwordArea\": \"\", \"invoiceNumber\": \"26332000004021728676\", \"purchaserName\": \"浙江农林大学\", \"invoiceDetails\": [{\"tax\": \"52.79\", \"unit\": \"条\", \"amount\": \"406.10\", \"taxRate\": \"13%\", \"itemName\": \"*计算机配套产品*内存条\", \"quantity\": \"1\", \"unitPrice\": \"406.0973451327434\", \"specification\": \"5600DDR524GB(12GBx2)\"}], \"sellerTaxNumber\": \"91330106MAD2L33G5A\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"123300004700050170\", \"totalAmountInWords\": \"肆佰伍拾捌圆捌角玖分\", \"invoiceAmountPreTax\": \"406.10\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26332000004021728676,458.89,20260515,,3050\", \"type\": \"QRcode\", \"points\": [{\"x\": 35, \"y\": 32}, {\"x\": 150, \"y\": 32}, {\"x\": 150, \"y\": 149}, {\"x\": 35, \"y\": 149}]}], \"ftype\": 0, \"width\": 1190, \"height\": 793, \"orgWidth\": 1190, \"orgHeight\": 793, \"sliceRect\": {\"x0\": 17, \"x1\": 1168, \"x2\": 1171, \"x3\": 15, \"y0\": 26, \"y1\": 27, \"y2\": 761, \"y3\": 761}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26332000004021728676\", \"keyProb\": 99, \"valuePos\": [{\"x\": 944, \"y\": 34}, {\"x\": 1128, \"y\": 35}, {\"x\": 1128, \"y\": 55}, {\"x\": 944, \"y\": 54}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年05月15日\", \"keyProb\": 99, \"valuePos\": [{\"x\": 945, \"y\": 70}, {\"x\": 1073, \"y\": 70}, {\"x\": 1073, \"y\": 90}, {\"x\": 945, \"y\": 90}], \"valueProb\": 99}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"浙江农林大学\", \"keyProb\": 100, \"valuePos\": [{\"x\": 95, \"y\": 162}, {\"x\": 205, \"y\": 162}, {\"x\": 205, \"y\": 182}, {\"x\": 95, \"y\": 182}], \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"123300004700050170\", \"keyProb\": 99, \"valuePos\": [{\"x\": 288, \"y\": 217}, {\"x\": 551, \"y\": 217}, {\"x\": 551, \"y\": 246}, {\"x\": 288, \"y\": 246}], \"valueProb\": 99}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"406.10\", \"keyProb\": 99, \"valuePos\": [{\"x\": 784, \"y\": 492}, {\"x\": 856, \"y\": 492}, {\"x\": 856, \"y\": 511}, {\"x\": 784, \"y\": 511}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"52.79\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1087, \"y\": 492}, {\"x\": 1148, \"y\": 492}, {\"x\": 1148, \"y\": 511}, {\"x\": 1087, \"y\": 511}], \"valueProb\": 100}, {\"key\": \"totalAmountInWords\", \"value\": \"肆佰伍拾捌圆捌角玖分\", \"keyProb\": 100, \"valuePos\": [{\"x\": 336, \"y\": 526}, {\"x\": 522, \"y\": 525}, {\"x\": 522, \"y\": 548}, {\"x\": 337, \"y\": 550}], \"valueProb\": 100}, {\"key\": \"totalAmount\", \"value\": \"458.89\", \"keyProb\": 99, \"valuePos\": [{\"x\": 862, \"y\": 527}, {\"x\": 946, \"y\": 524}, {\"x\": 947, \"y\": 547}, {\"x\": 862, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"杭州新易联科技有限公司\", \"keyProb\": 100, \"valuePos\": [{\"x\": 659, \"y\": 161}, {\"x\": 863, \"y\": 161}, {\"x\": 863, \"y\": 185}, {\"x\": 659, \"y\": 185}], \"valueProb\": 100}, {\"key\": \"sellerTaxNumber\", \"value\": \"91330106MAD2L33G5A\", \"keyProb\": 99, \"valuePos\": [{\"x\": 858, \"y\": 218}, {\"x\": 1121, \"y\": 218}, {\"x\": 1121, \"y\": 246}, {\"x\": 858, \"y\": 246}], \"valueProb\": 99}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"叶飞花\", \"keyProb\": 99, \"valuePos\": [{\"x\": 161, \"y\": 705}, {\"x\": 223, \"y\": 705}, {\"x\": 223, \"y\": 729}, {\"x\": 161, \"y\": 729}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"天猫光威4798514666125731904\", \"keyProb\": 99, \"valuePos\": [{\"x\": 43, \"y\": 564}, {\"x\": 294, \"y\": 564}, {\"x\": 294, \"y\": 584}, {\"x\": 43, \"y\": 584}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 370, \"y\": 16}, {\"x\": 747, \"y\": 17}, {\"x\": 747, \"y\": 59}, {\"x\": 370, \"y\": 58}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 370, \"y\": 16}, {\"x\": 747, \"y\": 17}, {\"x\": 747, \"y\": 59}, {\"x\": 370, \"y\": 58}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*计算机配套产品*内存条\\\",\\\"specification\\\":\\\"5600DDR524GB(12GBx2)\\\",\\\"unit\\\":\\\"条\\\",\\\"quantity\\\":\\\"1\\\",\\\"unitPrice\\\":\\\"406.0973451327434\\\",\\\"amount\\\":\\\"406.10\\\",\\\"taxRate\\\":\\\"13%\\\",\\\"tax\\\":\\\"52.79\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}, \"recognitionStatus\": \"待核对\"}',NULL,NULL,'2026-07-27 14:25:28.502'),(18,1,1,'UPDATE','source_voucher',21,NULL,'{\"amount\": 458.89, \"voucherNo\": \"26332000004021728676\", \"rawDataJson\": {\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"叶飞花\", \"remarks\": \"天猫光威4798514666125731904\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"52.79\", \"sellerName\": \"杭州新易联科技有限公司\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年05月15日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"458.89\", \"passwordArea\": \"\", \"invoiceNumber\": \"26332000004021728676\", \"purchaserName\": \"浙江农林大学\", \"invoiceDetails\": [{\"tax\": \"52.79\", \"unit\": \"条\", \"amount\": \"406.10\", \"taxRate\": \"13%\", \"itemName\": \"*计算机配套产品*内存条\", \"quantity\": \"1\", \"unitPrice\": \"406.0973451327434\", \"specification\": \"5600DDR524GB(12GBx2)\"}], \"sellerTaxNumber\": \"91330106MAD2L33G5A\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"123300004700050170\", \"totalAmountInWords\": \"肆佰伍拾捌圆捌角玖分\", \"invoiceAmountPreTax\": \"406.10\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26332000004021728676,458.89,20260515,,3050\", \"type\": \"QRcode\", \"points\": [{\"x\": 35, \"y\": 32}, {\"x\": 150, \"y\": 32}, {\"x\": 150, \"y\": 149}, {\"x\": 35, \"y\": 149}]}], \"ftype\": 0, \"width\": 1190, \"height\": 793, \"orgWidth\": 1190, \"orgHeight\": 793, \"sliceRect\": {\"x0\": 17, \"x1\": 1168, \"x2\": 1171, \"x3\": 15, \"y0\": 26, \"y1\": 27, \"y2\": 761, \"y3\": 761}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26332000004021728676\", \"keyProb\": 99, \"valuePos\": [{\"x\": 944, \"y\": 34}, {\"x\": 1128, \"y\": 35}, {\"x\": 1128, \"y\": 55}, {\"x\": 944, \"y\": 54}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年05月15日\", \"keyProb\": 99, \"valuePos\": [{\"x\": 945, \"y\": 70}, {\"x\": 1073, \"y\": 70}, {\"x\": 1073, \"y\": 90}, {\"x\": 945, \"y\": 90}], \"valueProb\": 99}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"浙江农林大学\", \"keyProb\": 100, \"valuePos\": [{\"x\": 95, \"y\": 162}, {\"x\": 205, \"y\": 162}, {\"x\": 205, \"y\": 182}, {\"x\": 95, \"y\": 182}], \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"123300004700050170\", \"keyProb\": 99, \"valuePos\": [{\"x\": 288, \"y\": 217}, {\"x\": 551, \"y\": 217}, {\"x\": 551, \"y\": 246}, {\"x\": 288, \"y\": 246}], \"valueProb\": 99}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"406.10\", \"keyProb\": 99, \"valuePos\": [{\"x\": 784, \"y\": 492}, {\"x\": 856, \"y\": 492}, {\"x\": 856, \"y\": 511}, {\"x\": 784, \"y\": 511}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"52.79\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1087, \"y\": 492}, {\"x\": 1148, \"y\": 492}, {\"x\": 1148, \"y\": 511}, {\"x\": 1087, \"y\": 511}], \"valueProb\": 100}, {\"key\": \"totalAmountInWords\", \"value\": \"肆佰伍拾捌圆捌角玖分\", \"keyProb\": 100, \"valuePos\": [{\"x\": 336, \"y\": 526}, {\"x\": 522, \"y\": 525}, {\"x\": 522, \"y\": 548}, {\"x\": 337, \"y\": 550}], \"valueProb\": 100}, {\"key\": \"totalAmount\", \"value\": \"458.89\", \"keyProb\": 99, \"valuePos\": [{\"x\": 862, \"y\": 527}, {\"x\": 946, \"y\": 524}, {\"x\": 947, \"y\": 547}, {\"x\": 862, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"杭州新易联科技有限公司\", \"keyProb\": 100, \"valuePos\": [{\"x\": 659, \"y\": 161}, {\"x\": 863, \"y\": 161}, {\"x\": 863, \"y\": 185}, {\"x\": 659, \"y\": 185}], \"valueProb\": 100}, {\"key\": \"sellerTaxNumber\", \"value\": \"91330106MAD2L33G5A\", \"keyProb\": 99, \"valuePos\": [{\"x\": 858, \"y\": 218}, {\"x\": 1121, \"y\": 218}, {\"x\": 1121, \"y\": 246}, {\"x\": 858, \"y\": 246}], \"valueProb\": 99}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"叶飞花\", \"keyProb\": 99, \"valuePos\": [{\"x\": 161, \"y\": 705}, {\"x\": 223, \"y\": 705}, {\"x\": 223, \"y\": 729}, {\"x\": 161, \"y\": 729}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"天猫光威4798514666125731904\", \"keyProb\": 99, \"valuePos\": [{\"x\": 43, \"y\": 564}, {\"x\": 294, \"y\": 564}, {\"x\": 294, \"y\": 584}, {\"x\": 43, \"y\": 584}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 370, \"y\": 16}, {\"x\": 747, \"y\": 17}, {\"x\": 747, \"y\": 59}, {\"x\": 370, \"y\": 58}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 370, \"y\": 16}, {\"x\": 747, \"y\": 17}, {\"x\": 747, \"y\": 59}, {\"x\": 370, \"y\": 58}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*计算机配套产品*内存条\\\",\\\"specification\\\":\\\"5600DDR524GB(12GBx2)\\\",\\\"unit\\\":\\\"条\\\",\\\"quantity\\\":\\\"1\\\",\\\"unitPrice\\\":\\\"406.0973451327434\\\",\\\"amount\\\":\\\"406.10\\\",\\\"taxRate\\\":\\\"13%\\\",\\\"tax\\\":\\\"52.79\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}, \"businessDate\": \"2026-05-15T00:00:00.000Z\", \"counterparty\": \"杭州新易联科技有限公司\", \"itemDescription\": \"*计算机配套产品*内存条\", \"recognitionStatus\": \"已确认\"}',NULL,NULL,'2026-07-27 14:26:06.180'),(19,1,1,'VERIFY','source_voucher',21,NULL,'{\"results\": [{\"isPassed\": true, \"checkItem\": \"资料完整，所有单据核对一致\"}], \"riskStatus\": \"资料完整\"}',NULL,NULL,'2026-07-27 14:26:28.171'),(20,1,1,'RECOGNIZE','source_voucher',21,NULL,'{\"fields\": {\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"叶飞花\", \"remarks\": \"天猫光威4798514666125731904\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"52.79\", \"sellerName\": \"杭州新易联科技有限公司\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年05月15日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"458.89\", \"passwordArea\": \"\", \"invoiceNumber\": \"26332000004021728676\", \"purchaserName\": \"浙江农林大学\", \"invoiceDetails\": [{\"tax\": \"52.79\", \"unit\": \"条\", \"amount\": \"406.10\", \"taxRate\": \"13%\", \"itemName\": \"*计算机配套产品*内存条\", \"quantity\": \"1\", \"unitPrice\": \"406.0973451327434\", \"specification\": \"5600DDR524GB(12GBx2)\"}], \"sellerTaxNumber\": \"91330106MAD2L33G5A\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"123300004700050170\", \"totalAmountInWords\": \"肆佰伍拾捌圆捌角玖分\", \"invoiceAmountPreTax\": \"406.10\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26332000004021728676,458.89,20260515,,3050\", \"type\": \"QRcode\", \"points\": [{\"x\": 35, \"y\": 32}, {\"x\": 150, \"y\": 32}, {\"x\": 150, \"y\": 149}, {\"x\": 35, \"y\": 149}]}], \"ftype\": 0, \"width\": 1190, \"height\": 793, \"orgWidth\": 1190, \"orgHeight\": 793, \"sliceRect\": {\"x0\": 17, \"x1\": 1168, \"x2\": 1171, \"x3\": 15, \"y0\": 26, \"y1\": 27, \"y2\": 761, \"y3\": 761}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26332000004021728676\", \"keyProb\": 99, \"valuePos\": [{\"x\": 944, \"y\": 34}, {\"x\": 1128, \"y\": 35}, {\"x\": 1128, \"y\": 55}, {\"x\": 944, \"y\": 54}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年05月15日\", \"keyProb\": 99, \"valuePos\": [{\"x\": 945, \"y\": 70}, {\"x\": 1073, \"y\": 70}, {\"x\": 1073, \"y\": 90}, {\"x\": 945, \"y\": 90}], \"valueProb\": 99}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"浙江农林大学\", \"keyProb\": 100, \"valuePos\": [{\"x\": 95, \"y\": 162}, {\"x\": 205, \"y\": 162}, {\"x\": 205, \"y\": 182}, {\"x\": 95, \"y\": 182}], \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"123300004700050170\", \"keyProb\": 99, \"valuePos\": [{\"x\": 288, \"y\": 217}, {\"x\": 551, \"y\": 217}, {\"x\": 551, \"y\": 246}, {\"x\": 288, \"y\": 246}], \"valueProb\": 99}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"406.10\", \"keyProb\": 99, \"valuePos\": [{\"x\": 784, \"y\": 492}, {\"x\": 856, \"y\": 492}, {\"x\": 856, \"y\": 511}, {\"x\": 784, \"y\": 511}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"52.79\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1087, \"y\": 492}, {\"x\": 1148, \"y\": 492}, {\"x\": 1148, \"y\": 511}, {\"x\": 1087, \"y\": 511}], \"valueProb\": 100}, {\"key\": \"totalAmountInWords\", \"value\": \"肆佰伍拾捌圆捌角玖分\", \"keyProb\": 100, \"valuePos\": [{\"x\": 336, \"y\": 526}, {\"x\": 522, \"y\": 525}, {\"x\": 522, \"y\": 548}, {\"x\": 337, \"y\": 550}], \"valueProb\": 100}, {\"key\": \"totalAmount\", \"value\": \"458.89\", \"keyProb\": 99, \"valuePos\": [{\"x\": 862, \"y\": 527}, {\"x\": 946, \"y\": 524}, {\"x\": 947, \"y\": 547}, {\"x\": 862, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"杭州新易联科技有限公司\", \"keyProb\": 100, \"valuePos\": [{\"x\": 659, \"y\": 161}, {\"x\": 863, \"y\": 161}, {\"x\": 863, \"y\": 185}, {\"x\": 659, \"y\": 185}], \"valueProb\": 100}, {\"key\": \"sellerTaxNumber\", \"value\": \"91330106MAD2L33G5A\", \"keyProb\": 99, \"valuePos\": [{\"x\": 858, \"y\": 218}, {\"x\": 1121, \"y\": 218}, {\"x\": 1121, \"y\": 246}, {\"x\": 858, \"y\": 246}], \"valueProb\": 99}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"叶飞花\", \"keyProb\": 99, \"valuePos\": [{\"x\": 161, \"y\": 705}, {\"x\": 223, \"y\": 705}, {\"x\": 223, \"y\": 729}, {\"x\": 161, \"y\": 729}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"天猫光威4798514666125731904\", \"keyProb\": 99, \"valuePos\": [{\"x\": 43, \"y\": 564}, {\"x\": 294, \"y\": 564}, {\"x\": 294, \"y\": 584}, {\"x\": 43, \"y\": 584}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 370, \"y\": 16}, {\"x\": 747, \"y\": 17}, {\"x\": 747, \"y\": 59}, {\"x\": 370, \"y\": 58}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 370, \"y\": 16}, {\"x\": 747, \"y\": 17}, {\"x\": 747, \"y\": 59}, {\"x\": 370, \"y\": 58}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*计算机配套产品*内存条\\\",\\\"specification\\\":\\\"5600DDR524GB(12GBx2)\\\",\\\"unit\\\":\\\"条\\\",\\\"quantity\\\":\\\"1\\\",\\\"unitPrice\\\":\\\"406.0973451327434\\\",\\\"amount\\\":\\\"406.10\\\",\\\"taxRate\\\":\\\"13%\\\",\\\"tax\\\":\\\"52.79\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}, \"recognitionStatus\": \"待核对\"}',NULL,NULL,'2026-07-27 14:29:28.673'),(21,1,1,'UPDATE','source_voucher',21,NULL,'{\"amount\": 458.89, \"category\": \"哈哈\", \"voucherNo\": \"26332000004021728676\", \"rawDataJson\": {\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"叶飞花\", \"remarks\": \"天猫光威4798514666125731904\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"52.79\", \"sellerName\": \"杭州新易联科技有限公司\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年05月15日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"458.89\", \"passwordArea\": \"\", \"invoiceNumber\": \"26332000004021728676\", \"purchaserName\": \"浙江农林大学\", \"invoiceDetails\": [{\"tax\": \"52.79\", \"unit\": \"条\", \"amount\": \"406.10\", \"taxRate\": \"13%\", \"itemName\": \"*计算机配套产品*内存条\", \"quantity\": \"1\", \"unitPrice\": \"406.0973451327434\", \"specification\": \"5600DDR524GB(12GBx2)\"}], \"sellerTaxNumber\": \"91330106MAD2L33G5A\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"123300004700050170\", \"totalAmountInWords\": \"肆佰伍拾捌圆捌角玖分\", \"invoiceAmountPreTax\": \"406.10\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26332000004021728676,458.89,20260515,,3050\", \"type\": \"QRcode\", \"points\": [{\"x\": 35, \"y\": 32}, {\"x\": 150, \"y\": 32}, {\"x\": 150, \"y\": 149}, {\"x\": 35, \"y\": 149}]}], \"ftype\": 0, \"width\": 1190, \"height\": 793, \"orgWidth\": 1190, \"orgHeight\": 793, \"sliceRect\": {\"x0\": 17, \"x1\": 1168, \"x2\": 1171, \"x3\": 15, \"y0\": 26, \"y1\": 27, \"y2\": 761, \"y3\": 761}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26332000004021728676\", \"keyProb\": 99, \"valuePos\": [{\"x\": 944, \"y\": 34}, {\"x\": 1128, \"y\": 35}, {\"x\": 1128, \"y\": 55}, {\"x\": 944, \"y\": 54}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年05月15日\", \"keyProb\": 99, \"valuePos\": [{\"x\": 945, \"y\": 70}, {\"x\": 1073, \"y\": 70}, {\"x\": 1073, \"y\": 90}, {\"x\": 945, \"y\": 90}], \"valueProb\": 99}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"浙江农林大学\", \"keyProb\": 100, \"valuePos\": [{\"x\": 95, \"y\": 162}, {\"x\": 205, \"y\": 162}, {\"x\": 205, \"y\": 182}, {\"x\": 95, \"y\": 182}], \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"123300004700050170\", \"keyProb\": 99, \"valuePos\": [{\"x\": 288, \"y\": 217}, {\"x\": 551, \"y\": 217}, {\"x\": 551, \"y\": 246}, {\"x\": 288, \"y\": 246}], \"valueProb\": 99}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"406.10\", \"keyProb\": 99, \"valuePos\": [{\"x\": 784, \"y\": 492}, {\"x\": 856, \"y\": 492}, {\"x\": 856, \"y\": 511}, {\"x\": 784, \"y\": 511}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"52.79\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1087, \"y\": 492}, {\"x\": 1148, \"y\": 492}, {\"x\": 1148, \"y\": 511}, {\"x\": 1087, \"y\": 511}], \"valueProb\": 100}, {\"key\": \"totalAmountInWords\", \"value\": \"肆佰伍拾捌圆捌角玖分\", \"keyProb\": 100, \"valuePos\": [{\"x\": 336, \"y\": 526}, {\"x\": 522, \"y\": 525}, {\"x\": 522, \"y\": 548}, {\"x\": 337, \"y\": 550}], \"valueProb\": 100}, {\"key\": \"totalAmount\", \"value\": \"458.89\", \"keyProb\": 99, \"valuePos\": [{\"x\": 862, \"y\": 527}, {\"x\": 946, \"y\": 524}, {\"x\": 947, \"y\": 547}, {\"x\": 862, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"杭州新易联科技有限公司\", \"keyProb\": 100, \"valuePos\": [{\"x\": 659, \"y\": 161}, {\"x\": 863, \"y\": 161}, {\"x\": 863, \"y\": 185}, {\"x\": 659, \"y\": 185}], \"valueProb\": 100}, {\"key\": \"sellerTaxNumber\", \"value\": \"91330106MAD2L33G5A\", \"keyProb\": 99, \"valuePos\": [{\"x\": 858, \"y\": 218}, {\"x\": 1121, \"y\": 218}, {\"x\": 1121, \"y\": 246}, {\"x\": 858, \"y\": 246}], \"valueProb\": 99}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"叶飞花\", \"keyProb\": 99, \"valuePos\": [{\"x\": 161, \"y\": 705}, {\"x\": 223, \"y\": 705}, {\"x\": 223, \"y\": 729}, {\"x\": 161, \"y\": 729}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"天猫光威4798514666125731904\", \"keyProb\": 99, \"valuePos\": [{\"x\": 43, \"y\": 564}, {\"x\": 294, \"y\": 564}, {\"x\": 294, \"y\": 584}, {\"x\": 43, \"y\": 584}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 370, \"y\": 16}, {\"x\": 747, \"y\": 17}, {\"x\": 747, \"y\": 59}, {\"x\": 370, \"y\": 58}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 370, \"y\": 16}, {\"x\": 747, \"y\": 17}, {\"x\": 747, \"y\": 59}, {\"x\": 370, \"y\": 58}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*计算机配套产品*内存条\\\",\\\"specification\\\":\\\"5600DDR524GB(12GBx2)\\\",\\\"unit\\\":\\\"条\\\",\\\"quantity\\\":\\\"1\\\",\\\"unitPrice\\\":\\\"406.0973451327434\\\",\\\"amount\\\":\\\"406.10\\\",\\\"taxRate\\\":\\\"13%\\\",\\\"tax\\\":\\\"52.79\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}, \"businessDate\": \"2026-05-15T00:00:00.000Z\", \"counterparty\": \"杭州新易联科技有限公司\", \"itemDescription\": \"*计算机配套产品*内存条\", \"recognitionStatus\": \"已确认\"}',NULL,NULL,'2026-07-27 14:29:39.058'),(22,1,1,'CREATE','accounting_voucher',25,NULL,'{\"summary\": \"汇总生成（1 张原始凭证）\", \"voucherNo\": \"转字004号\", \"fromSourceVoucherIds\": [21]}',NULL,NULL,'2026-07-27 14:30:29.085'),(23,1,1,'CREATE','source_voucher',22,NULL,'{\"voucherNo\": \"YS1785166414010\", \"itemDescription\": \"发票2.pdf\"}',NULL,NULL,'2026-07-27 15:33:34.016'),(24,1,1,'CREATE','source_voucher',23,NULL,'{\"voucherNo\": \"YS1785167388220\", \"itemDescription\": \"开定额发票_1_A努力_来自小红书网页版.jpg\"}',NULL,NULL,'2026-07-27 15:49:48.226'),(25,1,1,'RECOGNIZE','source_voucher',23,NULL,'{\"fields\": {\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"王淮\", \"remarks\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"2.23\", \"sellerName\": \"宽城区鼎欣便利店\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年04月07日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"225.00\", \"passwordArea\": \"\", \"invoiceNumber\": \"26222000000278215261\", \"purchaserName\": \"\", \"invoiceDetails\": [{\"tax\": \"2.23\", \"unit\": \"\", \"amount\": \"222.77\", \"taxRate\": \"1%\", \"itemName\": \"*烟草制品*烟\", \"quantity\": \"\", \"unitPrice\": \"\", \"specification\": \"\"}], \"sellerTaxNumber\": \"92220103MA150LA12D\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"\", \"totalAmountInWords\": \"贰佰贰拾伍圆整\", \"invoiceAmountPreTax\": \"222.77\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26222000000278215261,225.00,20260407,,CBC1\", \"type\": \"QRcode\", \"points\": [{\"x\": 38, \"y\": 227}, {\"x\": 164, \"y\": 227}, {\"x\": 164, \"y\": 353}, {\"x\": 38, \"y\": 353}]}], \"ftype\": 0, \"width\": 1254, \"height\": 1032, \"orgWidth\": 1254, \"orgHeight\": 1032, \"sliceRect\": {\"x0\": 16, \"x1\": 1246, \"x2\": 1246, \"x3\": 16, \"y0\": 213, \"y1\": 210, \"y2\": 997, \"y3\": 999}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26222000000278215261\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1001, \"y\": 47}, {\"x\": 1194, \"y\": 48}, {\"x\": 1194, \"y\": 68}, {\"x\": 1001, \"y\": 67}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年04月07日\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1001, \"y\": 82}, {\"x\": 1139, \"y\": 82}, {\"x\": 1139, \"y\": 106}, {\"x\": 1001, \"y\": 106}], \"valueProb\": 100}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"222.77\", \"keyProb\": 99, \"valuePos\": [{\"x\": 833, \"y\": 529}, {\"x\": 907, \"y\": 529}, {\"x\": 907, \"y\": 549}, {\"x\": 833, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"2.23\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1164, \"y\": 530}, {\"x\": 1218, \"y\": 530}, {\"x\": 1218, \"y\": 549}, {\"x\": 1164, \"y\": 549}], \"valueProb\": 100}, {\"key\": \"totalAmountInWords\", \"value\": \"贰佰贰拾伍圆整\", \"keyProb\": 99, \"valuePos\": [{\"x\": 361, \"y\": 563}, {\"x\": 499, \"y\": 563}, {\"x\": 499, \"y\": 589}, {\"x\": 361, \"y\": 589}], \"valueProb\": 99}, {\"key\": \"totalAmount\", \"value\": \"225.00\", \"keyProb\": 99, \"valuePos\": [{\"x\": 914, \"y\": 565}, {\"x\": 1005, \"y\": 563}, {\"x\": 1005, \"y\": 587}, {\"x\": 915, \"y\": 588}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"宽城区鼎欣便利店\", \"keyProb\": 99, \"valuePos\": [{\"x\": 703, \"y\": 181}, {\"x\": 860, \"y\": 181}, {\"x\": 860, \"y\": 206}, {\"x\": 703, \"y\": 206}], \"valueProb\": 99}, {\"key\": \"sellerTaxNumber\", \"value\": \"92220103MA150LA12D\", \"keyProb\": 100, \"valuePos\": [{\"x\": 911, \"y\": 240}, {\"x\": 1189, \"y\": 240}, {\"x\": 1189, \"y\": 270}, {\"x\": 911, \"y\": 270}], \"valueProb\": 100}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"王淮\", \"keyProb\": 99, \"valuePos\": [{\"x\": 176, \"y\": 754}, {\"x\": 219, \"y\": 754}, {\"x\": 219, \"y\": 778}, {\"x\": 176, \"y\": 778}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"keyProb\": 99, \"valuePos\": [{\"x\": 51, \"y\": 602}, {\"x\": 831, \"y\": 602}, {\"x\": 831, \"y\": 645}, {\"x\": 51, \"y\": 645}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*烟草制品*烟\\\",\\\"specification\\\":\\\"\\\",\\\"unit\\\":\\\"\\\",\\\"quantity\\\":\\\"\\\",\\\"unitPrice\\\":\\\"\\\",\\\"amount\\\":\\\"222.77\\\",\\\"taxRate\\\":\\\"1%\\\",\\\"tax\\\":\\\"2.23\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}, \"recognitionStatus\": \"待核对\"}',NULL,NULL,'2026-07-27 15:50:07.294'),(26,1,1,'UPDATE','source_voucher',23,NULL,'{\"amount\": 225, \"voucherNo\": \"26222000000278215261\", \"rawDataJson\": {\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"王淮\", \"remarks\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"2.23\", \"sellerName\": \"宽城区鼎欣便利店\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年04月07日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"225.00\", \"passwordArea\": \"\", \"invoiceNumber\": \"26222000000278215261\", \"purchaserName\": \"\", \"invoiceDetails\": [{\"tax\": \"2.23\", \"unit\": \"\", \"amount\": \"222.77\", \"taxRate\": \"1%\", \"itemName\": \"*烟草制品*烟\", \"quantity\": \"\", \"unitPrice\": \"\", \"specification\": \"\"}], \"sellerTaxNumber\": \"92220103MA150LA12D\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"\", \"totalAmountInWords\": \"贰佰贰拾伍圆整\", \"invoiceAmountPreTax\": \"222.77\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26222000000278215261,225.00,20260407,,CBC1\", \"type\": \"QRcode\", \"points\": [{\"x\": 38, \"y\": 227}, {\"x\": 164, \"y\": 227}, {\"x\": 164, \"y\": 353}, {\"x\": 38, \"y\": 353}]}], \"ftype\": 0, \"width\": 1254, \"height\": 1032, \"orgWidth\": 1254, \"orgHeight\": 1032, \"sliceRect\": {\"x0\": 16, \"x1\": 1246, \"x2\": 1246, \"x3\": 16, \"y0\": 213, \"y1\": 210, \"y2\": 997, \"y3\": 999}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26222000000278215261\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1001, \"y\": 47}, {\"x\": 1194, \"y\": 48}, {\"x\": 1194, \"y\": 68}, {\"x\": 1001, \"y\": 67}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年04月07日\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1001, \"y\": 82}, {\"x\": 1139, \"y\": 82}, {\"x\": 1139, \"y\": 106}, {\"x\": 1001, \"y\": 106}], \"valueProb\": 100}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"222.77\", \"keyProb\": 99, \"valuePos\": [{\"x\": 833, \"y\": 529}, {\"x\": 907, \"y\": 529}, {\"x\": 907, \"y\": 549}, {\"x\": 833, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"2.23\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1164, \"y\": 530}, {\"x\": 1218, \"y\": 530}, {\"x\": 1218, \"y\": 549}, {\"x\": 1164, \"y\": 549}], \"valueProb\": 100}, {\"key\": \"totalAmountInWords\", \"value\": \"贰佰贰拾伍圆整\", \"keyProb\": 99, \"valuePos\": [{\"x\": 361, \"y\": 563}, {\"x\": 499, \"y\": 563}, {\"x\": 499, \"y\": 589}, {\"x\": 361, \"y\": 589}], \"valueProb\": 99}, {\"key\": \"totalAmount\", \"value\": \"225.00\", \"keyProb\": 99, \"valuePos\": [{\"x\": 914, \"y\": 565}, {\"x\": 1005, \"y\": 563}, {\"x\": 1005, \"y\": 587}, {\"x\": 915, \"y\": 588}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"宽城区鼎欣便利店\", \"keyProb\": 99, \"valuePos\": [{\"x\": 703, \"y\": 181}, {\"x\": 860, \"y\": 181}, {\"x\": 860, \"y\": 206}, {\"x\": 703, \"y\": 206}], \"valueProb\": 99}, {\"key\": \"sellerTaxNumber\", \"value\": \"92220103MA150LA12D\", \"keyProb\": 100, \"valuePos\": [{\"x\": 911, \"y\": 240}, {\"x\": 1189, \"y\": 240}, {\"x\": 1189, \"y\": 270}, {\"x\": 911, \"y\": 270}], \"valueProb\": 100}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"王淮\", \"keyProb\": 99, \"valuePos\": [{\"x\": 176, \"y\": 754}, {\"x\": 219, \"y\": 754}, {\"x\": 219, \"y\": 778}, {\"x\": 176, \"y\": 778}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"keyProb\": 99, \"valuePos\": [{\"x\": 51, \"y\": 602}, {\"x\": 831, \"y\": 602}, {\"x\": 831, \"y\": 645}, {\"x\": 51, \"y\": 645}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*烟草制品*烟\\\",\\\"specification\\\":\\\"\\\",\\\"unit\\\":\\\"\\\",\\\"quantity\\\":\\\"\\\",\\\"unitPrice\\\":\\\"\\\",\\\"amount\\\":\\\"222.77\\\",\\\"taxRate\\\":\\\"1%\\\",\\\"tax\\\":\\\"2.23\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}, \"businessDate\": \"2026-04-07T00:00:00.000Z\", \"counterparty\": \"宽城区鼎欣便利店\", \"itemDescription\": \"*烟草制品*烟\", \"recognitionStatus\": \"已确认\"}',NULL,NULL,'2026-07-27 15:50:14.627'),(27,1,1,'CREATE','accounting_voucher',26,NULL,'{\"summary\": \"*烟草制品*烟\", \"voucherNo\": \"转字005号\", \"fromSourceVoucherIds\": [23]}',NULL,NULL,'2026-07-27 15:51:18.413'),(28,1,1,'CREATE','source_voucher',24,NULL,'{\"voucherNo\": \"YS1785205578526\", \"itemDescription\": \"开定额发票.jpg\"}',NULL,NULL,'2026-07-28 02:26:18.574'),(29,1,1,'RECOGNIZE','source_voucher',24,NULL,'{\"fields\": {\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"王淮\", \"remarks\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"2.23\", \"sellerName\": \"宽城区鼎欣便利店\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年04月07日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"225.00\", \"passwordArea\": \"\", \"invoiceNumber\": \"26222000000278215261\", \"purchaserName\": \"\", \"invoiceDetails\": [{\"tax\": \"2.23\", \"unit\": \"\", \"amount\": \"222.77\", \"taxRate\": \"1%\", \"itemName\": \"*烟草制品*烟\", \"quantity\": \"\", \"unitPrice\": \"\", \"specification\": \"\"}], \"sellerTaxNumber\": \"92220103MA150LA12D\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"\", \"totalAmountInWords\": \"贰佰贰拾伍圆整\", \"invoiceAmountPreTax\": \"222.77\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26222000000278215261,225.00,20260407,,CBC1\", \"type\": \"QRcode\", \"points\": [{\"x\": 38, \"y\": 227}, {\"x\": 164, \"y\": 227}, {\"x\": 164, \"y\": 353}, {\"x\": 38, \"y\": 353}]}], \"ftype\": 0, \"width\": 1254, \"height\": 1032, \"orgWidth\": 1254, \"orgHeight\": 1032, \"sliceRect\": {\"x0\": 16, \"x1\": 1246, \"x2\": 1246, \"x3\": 16, \"y0\": 213, \"y1\": 210, \"y2\": 997, \"y3\": 999}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26222000000278215261\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1001, \"y\": 47}, {\"x\": 1194, \"y\": 48}, {\"x\": 1194, \"y\": 68}, {\"x\": 1001, \"y\": 67}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年04月07日\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1001, \"y\": 82}, {\"x\": 1139, \"y\": 82}, {\"x\": 1139, \"y\": 106}, {\"x\": 1001, \"y\": 106}], \"valueProb\": 100}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"222.77\", \"keyProb\": 99, \"valuePos\": [{\"x\": 833, \"y\": 529}, {\"x\": 907, \"y\": 529}, {\"x\": 907, \"y\": 549}, {\"x\": 833, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"2.23\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1164, \"y\": 530}, {\"x\": 1218, \"y\": 530}, {\"x\": 1218, \"y\": 549}, {\"x\": 1164, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"totalAmountInWords\", \"value\": \"贰佰贰拾伍圆整\", \"keyProb\": 99, \"valuePos\": [{\"x\": 361, \"y\": 563}, {\"x\": 499, \"y\": 563}, {\"x\": 499, \"y\": 589}, {\"x\": 361, \"y\": 589}], \"valueProb\": 99}, {\"key\": \"totalAmount\", \"value\": \"225.00\", \"keyProb\": 99, \"valuePos\": [{\"x\": 914, \"y\": 565}, {\"x\": 1005, \"y\": 563}, {\"x\": 1005, \"y\": 587}, {\"x\": 915, \"y\": 588}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"宽城区鼎欣便利店\", \"keyProb\": 99, \"valuePos\": [{\"x\": 703, \"y\": 181}, {\"x\": 860, \"y\": 181}, {\"x\": 860, \"y\": 206}, {\"x\": 703, \"y\": 206}], \"valueProb\": 99}, {\"key\": \"sellerTaxNumber\", \"value\": \"92220103MA150LA12D\", \"keyProb\": 99, \"valuePos\": [{\"x\": 911, \"y\": 240}, {\"x\": 1189, \"y\": 240}, {\"x\": 1189, \"y\": 270}, {\"x\": 911, \"y\": 270}], \"valueProb\": 99}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"王淮\", \"keyProb\": 99, \"valuePos\": [{\"x\": 176, \"y\": 754}, {\"x\": 219, \"y\": 754}, {\"x\": 219, \"y\": 778}, {\"x\": 176, \"y\": 778}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"keyProb\": 99, \"valuePos\": [{\"x\": 51, \"y\": 602}, {\"x\": 831, \"y\": 602}, {\"x\": 831, \"y\": 645}, {\"x\": 51, \"y\": 645}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*烟草制品*烟\\\",\\\"specification\\\":\\\"\\\",\\\"unit\\\":\\\"\\\",\\\"quantity\\\":\\\"\\\",\\\"unitPrice\\\":\\\"\\\",\\\"amount\\\":\\\"222.77\\\",\\\"taxRate\\\":\\\"1%\\\",\\\"tax\\\":\\\"2.23\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}, \"recognitionStatus\": \"待核对\"}',NULL,NULL,'2026-07-28 02:26:31.444'),(30,1,1,'UPDATE','source_voucher',24,NULL,'{\"amount\": 225, \"voucherNo\": \"26222000000278215261\", \"rawDataJson\": {\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"王淮\", \"remarks\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"2.23\", \"sellerName\": \"宽城区鼎欣便利店\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年04月07日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"225.00\", \"passwordArea\": \"\", \"invoiceNumber\": \"26222000000278215261\", \"purchaserName\": \"\", \"invoiceDetails\": [{\"tax\": \"2.23\", \"unit\": \"\", \"amount\": \"222.77\", \"taxRate\": \"1%\", \"itemName\": \"*烟草制品*烟\", \"quantity\": \"\", \"unitPrice\": \"\", \"specification\": \"\"}], \"sellerTaxNumber\": \"92220103MA150LA12D\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"\", \"totalAmountInWords\": \"贰佰贰拾伍圆整\", \"invoiceAmountPreTax\": \"222.77\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26222000000278215261,225.00,20260407,,CBC1\", \"type\": \"QRcode\", \"points\": [{\"x\": 38, \"y\": 227}, {\"x\": 164, \"y\": 227}, {\"x\": 164, \"y\": 353}, {\"x\": 38, \"y\": 353}]}], \"ftype\": 0, \"width\": 1254, \"height\": 1032, \"orgWidth\": 1254, \"orgHeight\": 1032, \"sliceRect\": {\"x0\": 16, \"x1\": 1246, \"x2\": 1246, \"x3\": 16, \"y0\": 213, \"y1\": 210, \"y2\": 997, \"y3\": 999}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26222000000278215261\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1001, \"y\": 47}, {\"x\": 1194, \"y\": 48}, {\"x\": 1194, \"y\": 68}, {\"x\": 1001, \"y\": 67}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年04月07日\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1001, \"y\": 82}, {\"x\": 1139, \"y\": 82}, {\"x\": 1139, \"y\": 106}, {\"x\": 1001, \"y\": 106}], \"valueProb\": 100}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"222.77\", \"keyProb\": 99, \"valuePos\": [{\"x\": 833, \"y\": 529}, {\"x\": 907, \"y\": 529}, {\"x\": 907, \"y\": 549}, {\"x\": 833, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"2.23\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1164, \"y\": 530}, {\"x\": 1218, \"y\": 530}, {\"x\": 1218, \"y\": 549}, {\"x\": 1164, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"totalAmountInWords\", \"value\": \"贰佰贰拾伍圆整\", \"keyProb\": 99, \"valuePos\": [{\"x\": 361, \"y\": 563}, {\"x\": 499, \"y\": 563}, {\"x\": 499, \"y\": 589}, {\"x\": 361, \"y\": 589}], \"valueProb\": 99}, {\"key\": \"totalAmount\", \"value\": \"225.00\", \"keyProb\": 99, \"valuePos\": [{\"x\": 914, \"y\": 565}, {\"x\": 1005, \"y\": 563}, {\"x\": 1005, \"y\": 587}, {\"x\": 915, \"y\": 588}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"宽城区鼎欣便利店\", \"keyProb\": 99, \"valuePos\": [{\"x\": 703, \"y\": 181}, {\"x\": 860, \"y\": 181}, {\"x\": 860, \"y\": 206}, {\"x\": 703, \"y\": 206}], \"valueProb\": 99}, {\"key\": \"sellerTaxNumber\", \"value\": \"92220103MA150LA12D\", \"keyProb\": 99, \"valuePos\": [{\"x\": 911, \"y\": 240}, {\"x\": 1189, \"y\": 240}, {\"x\": 1189, \"y\": 270}, {\"x\": 911, \"y\": 270}], \"valueProb\": 99}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"王淮\", \"keyProb\": 99, \"valuePos\": [{\"x\": 176, \"y\": 754}, {\"x\": 219, \"y\": 754}, {\"x\": 219, \"y\": 778}, {\"x\": 176, \"y\": 778}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"keyProb\": 99, \"valuePos\": [{\"x\": 51, \"y\": 602}, {\"x\": 831, \"y\": 602}, {\"x\": 831, \"y\": 645}, {\"x\": 51, \"y\": 645}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*烟草制品*烟\\\",\\\"specification\\\":\\\"\\\",\\\"unit\\\":\\\"\\\",\\\"quantity\\\":\\\"\\\",\\\"unitPrice\\\":\\\"\\\",\\\"amount\\\":\\\"222.77\\\",\\\"taxRate\\\":\\\"1%\\\",\\\"tax\\\":\\\"2.23\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}, \"businessDate\": \"2026-04-07T00:00:00.000Z\", \"counterparty\": \"宽城区鼎欣便利店\", \"itemDescription\": \"*烟草制品*烟\", \"recognitionStatus\": \"已确认\"}',NULL,NULL,'2026-07-28 02:26:37.720'),(31,1,1,'CREATE','source_voucher',25,NULL,'{\"voucherNo\": \"YS1785205635230\", \"itemDescription\": \"开定额发票_1_A努力_来自小红书网页版.jpg\"}',NULL,NULL,'2026-07-28 02:27:15.235'),(32,1,1,'RECOGNIZE','source_voucher',25,NULL,'{\"fields\": {\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"王淮\", \"remarks\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"2.23\", \"sellerName\": \"宽城区鼎欣便利店\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年04月07日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"225.00\", \"passwordArea\": \"\", \"invoiceNumber\": \"26222000000278215261\", \"purchaserName\": \"\", \"invoiceDetails\": [{\"tax\": \"2.23\", \"unit\": \"\", \"amount\": \"222.77\", \"taxRate\": \"1%\", \"itemName\": \"*烟草制品*烟\", \"quantity\": \"\", \"unitPrice\": \"\", \"specification\": \"\"}], \"sellerTaxNumber\": \"92220103MA150LA12D\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"\", \"totalAmountInWords\": \"贰佰贰拾伍圆整\", \"invoiceAmountPreTax\": \"222.77\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26222000000278215261,225.00,20260407,,CBC1\", \"type\": \"QRcode\", \"points\": [{\"x\": 38, \"y\": 227}, {\"x\": 164, \"y\": 227}, {\"x\": 164, \"y\": 353}, {\"x\": 38, \"y\": 353}]}], \"ftype\": 0, \"width\": 1254, \"height\": 1032, \"orgWidth\": 1254, \"orgHeight\": 1032, \"sliceRect\": {\"x0\": 16, \"x1\": 1246, \"x2\": 1246, \"x3\": 16, \"y0\": 213, \"y1\": 210, \"y2\": 997, \"y3\": 999}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26222000000278215261\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1001, \"y\": 47}, {\"x\": 1194, \"y\": 48}, {\"x\": 1194, \"y\": 68}, {\"x\": 1001, \"y\": 67}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年04月07日\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1001, \"y\": 82}, {\"x\": 1139, \"y\": 82}, {\"x\": 1139, \"y\": 106}, {\"x\": 1001, \"y\": 106}], \"valueProb\": 100}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"222.77\", \"keyProb\": 99, \"valuePos\": [{\"x\": 833, \"y\": 529}, {\"x\": 907, \"y\": 529}, {\"x\": 907, \"y\": 549}, {\"x\": 833, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"2.23\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1164, \"y\": 530}, {\"x\": 1218, \"y\": 530}, {\"x\": 1218, \"y\": 549}, {\"x\": 1164, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"totalAmountInWords\", \"value\": \"贰佰贰拾伍圆整\", \"keyProb\": 99, \"valuePos\": [{\"x\": 361, \"y\": 563}, {\"x\": 499, \"y\": 563}, {\"x\": 499, \"y\": 589}, {\"x\": 361, \"y\": 589}], \"valueProb\": 99}, {\"key\": \"totalAmount\", \"value\": \"225.00\", \"keyProb\": 99, \"valuePos\": [{\"x\": 914, \"y\": 565}, {\"x\": 1005, \"y\": 563}, {\"x\": 1005, \"y\": 587}, {\"x\": 915, \"y\": 588}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"宽城区鼎欣便利店\", \"keyProb\": 99, \"valuePos\": [{\"x\": 703, \"y\": 181}, {\"x\": 860, \"y\": 181}, {\"x\": 860, \"y\": 206}, {\"x\": 703, \"y\": 206}], \"valueProb\": 99}, {\"key\": \"sellerTaxNumber\", \"value\": \"92220103MA150LA12D\", \"keyProb\": 99, \"valuePos\": [{\"x\": 911, \"y\": 240}, {\"x\": 1189, \"y\": 240}, {\"x\": 1189, \"y\": 270}, {\"x\": 911, \"y\": 270}], \"valueProb\": 99}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"王淮\", \"keyProb\": 99, \"valuePos\": [{\"x\": 176, \"y\": 754}, {\"x\": 219, \"y\": 754}, {\"x\": 219, \"y\": 778}, {\"x\": 176, \"y\": 778}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"keyProb\": 99, \"valuePos\": [{\"x\": 51, \"y\": 602}, {\"x\": 831, \"y\": 602}, {\"x\": 831, \"y\": 645}, {\"x\": 51, \"y\": 645}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*烟草制品*烟\\\",\\\"specification\\\":\\\"\\\",\\\"unit\\\":\\\"\\\",\\\"quantity\\\":\\\"\\\",\\\"unitPrice\\\":\\\"\\\",\\\"amount\\\":\\\"222.77\\\",\\\"taxRate\\\":\\\"1%\\\",\\\"tax\\\":\\\"2.23\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}, \"recognitionStatus\": \"待核对\"}',NULL,NULL,'2026-07-28 02:27:45.760'),(33,1,1,'CREATE','source_voucher',26,NULL,'{\"voucherNo\": \"YS1785205756296\", \"itemDescription\": \"_1_徐xx_来自小红书网页版.jpg\"}',NULL,NULL,'2026-07-28 02:29:16.301'),(34,1,1,'RECOGNIZE','source_voucher',26,NULL,'{\"fields\": {\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"黄建轮\", \"remarks\": \"\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"1.22\", \"sellerName\": \"泉州市达芬崎电子商务有限公司\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年05月08日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"123.00\", \"passwordArea\": \"\", \"invoiceNumber\": \"26352000001124849656\", \"purchaserName\": \"徐彬\", \"invoiceDetails\": [{\"tax\": \"1.22\", \"unit\": \"\", \"amount\": \"121.78\", \"taxRate\": \"1%\", \"itemName\": \"*信息化学品*拍立得相纸胶卷\", \"quantity\": \"\", \"unitPrice\": \"\", \"specification\": \"FUJIFILM富士mini\"}], \"sellerTaxNumber\": \"91350503MAK6675L48\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"\", \"totalAmountInWords\": \"壹佰贰拾叁圆整\", \"invoiceAmountPreTax\": \"121.78\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26352000001124849656,123.00,20260508,,940E\", \"type\": \"QRcode\", \"points\": [{\"x\": 31, \"y\": 841}, {\"x\": 137, \"y\": 841}, {\"x\": 137, \"y\": 947}, {\"x\": 31, \"y\": 947}]}], \"ftype\": 0, \"width\": 1080, \"height\": 2347, \"orgWidth\": 1080, \"orgHeight\": 2347, \"sliceRect\": {\"x0\": 3, \"x1\": 1080, \"x2\": 1080, \"x3\": 2, \"y0\": 819, \"y1\": 820, \"y2\": 1518, \"y3\": 1519}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26352000001124849656\", \"keyProb\": 99, \"valuePos\": [{\"x\": 867, \"y\": 49}, {\"x\": 1035, \"y\": 50}, {\"x\": 1035, \"y\": 68}, {\"x\": 867, \"y\": 68}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年05月08日\", \"keyProb\": 100, \"valuePos\": [{\"x\": 868, \"y\": 81}, {\"x\": 985, \"y\": 81}, {\"x\": 985, \"y\": 99}, {\"x\": 868, \"y\": 99}], \"valueProb\": 100}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"徐彬\", \"keyProb\": 100, \"valuePos\": [{\"x\": 98, \"y\": 165}, {\"x\": 133, \"y\": 165}, {\"x\": 133, \"y\": 184}, {\"x\": 98, \"y\": 184}], \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"121.78\", \"keyProb\": 99, \"valuePos\": [{\"x\": 723, \"y\": 465}, {\"x\": 787, \"y\": 465}, {\"x\": 787, \"y\": 482}, {\"x\": 723, \"y\": 482}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"1.22\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1006, \"y\": 465}, {\"x\": 1054, \"y\": 465}, {\"x\": 1054, \"y\": 482}, {\"x\": 1006, \"y\": 482}], \"valueProb\": 100}, {\"key\": \"totalAmountInWords\", \"value\": \"壹佰贰拾叁圆整\", \"keyProb\": 99, \"valuePos\": [{\"x\": 319, \"y\": 495}, {\"x\": 437, \"y\": 495}, {\"x\": 437, \"y\": 517}, {\"x\": 319, \"y\": 517}], \"valueProb\": 99}, {\"key\": \"totalAmount\", \"value\": \"123.00\", \"keyProb\": 99, \"valuePos\": [{\"x\": 794, \"y\": 496}, {\"x\": 870, \"y\": 496}, {\"x\": 870, \"y\": 515}, {\"x\": 794, \"y\": 515}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"泉州市达芬崎电子商务有限公司\", \"keyProb\": 99, \"valuePos\": [{\"x\": 611, \"y\": 165}, {\"x\": 843, \"y\": 165}, {\"x\": 843, \"y\": 185}, {\"x\": 611, \"y\": 185}], \"valueProb\": 99}, {\"key\": \"sellerTaxNumber\", \"value\": \"91350503MAK6675L48\", \"keyProb\": 100, \"valuePos\": [{\"x\": 790, \"y\": 217}, {\"x\": 1027, \"y\": 217}, {\"x\": 1027, \"y\": 241}, {\"x\": 790, \"y\": 241}], \"valueProb\": 100}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"黄建轮\", \"keyProb\": 99, \"valuePos\": [{\"x\": 159, \"y\": 659}, {\"x\": 212, \"y\": 659}, {\"x\": 212, \"y\": 679}, {\"x\": 159, \"y\": 679}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 346, \"y\": 34}, {\"x\": 690, \"y\": 33}, {\"x\": 690, \"y\": 71}, {\"x\": 347, \"y\": 73}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 346, \"y\": 34}, {\"x\": 690, \"y\": 33}, {\"x\": 690, \"y\": 71}, {\"x\": 347, \"y\": 73}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*信息化学品*拍立得相纸胶卷\\\",\\\"specification\\\":\\\"FUJIFILM富士mini\\\",\\\"unit\\\":\\\"\\\",\\\"quantity\\\":\\\"\\\",\\\"unitPrice\\\":\\\"\\\",\\\"amount\\\":\\\"121.78\\\",\\\"taxRate\\\":\\\"1%\\\",\\\"tax\\\":\\\"1.22\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}, \"recognitionStatus\": \"待核对\"}',NULL,NULL,'2026-07-28 02:29:20.551'),(35,1,1,'UPDATE','source_voucher',26,NULL,'{\"amount\": 123, \"voucherNo\": \"26352000001124849656\", \"rawDataJson\": {\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"黄建轮\", \"remarks\": \"\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"1.22\", \"sellerName\": \"泉州市达芬崎电子商务有限公司\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年05月08日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"123.00\", \"passwordArea\": \"\", \"invoiceNumber\": \"26352000001124849656\", \"purchaserName\": \"徐彬\", \"invoiceDetails\": [{\"tax\": \"1.22\", \"unit\": \"\", \"amount\": \"121.78\", \"taxRate\": \"1%\", \"itemName\": \"*信息化学品*拍立得相纸胶卷\", \"quantity\": \"\", \"unitPrice\": \"\", \"specification\": \"FUJIFILM富士mini\"}], \"sellerTaxNumber\": \"91350503MAK6675L48\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"\", \"totalAmountInWords\": \"壹佰贰拾叁圆整\", \"invoiceAmountPreTax\": \"121.78\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26352000001124849656,123.00,20260508,,940E\", \"type\": \"QRcode\", \"points\": [{\"x\": 31, \"y\": 841}, {\"x\": 137, \"y\": 841}, {\"x\": 137, \"y\": 947}, {\"x\": 31, \"y\": 947}]}], \"ftype\": 0, \"width\": 1080, \"height\": 2347, \"orgWidth\": 1080, \"orgHeight\": 2347, \"sliceRect\": {\"x0\": 3, \"x1\": 1080, \"x2\": 1080, \"x3\": 2, \"y0\": 819, \"y1\": 820, \"y2\": 1518, \"y3\": 1519}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26352000001124849656\", \"keyProb\": 99, \"valuePos\": [{\"x\": 867, \"y\": 49}, {\"x\": 1035, \"y\": 50}, {\"x\": 1035, \"y\": 68}, {\"x\": 867, \"y\": 68}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年05月08日\", \"keyProb\": 100, \"valuePos\": [{\"x\": 868, \"y\": 81}, {\"x\": 985, \"y\": 81}, {\"x\": 985, \"y\": 99}, {\"x\": 868, \"y\": 99}], \"valueProb\": 100}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"徐彬\", \"keyProb\": 100, \"valuePos\": [{\"x\": 98, \"y\": 165}, {\"x\": 133, \"y\": 165}, {\"x\": 133, \"y\": 184}, {\"x\": 98, \"y\": 184}], \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"121.78\", \"keyProb\": 99, \"valuePos\": [{\"x\": 723, \"y\": 465}, {\"x\": 787, \"y\": 465}, {\"x\": 787, \"y\": 482}, {\"x\": 723, \"y\": 482}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"1.22\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1006, \"y\": 465}, {\"x\": 1054, \"y\": 465}, {\"x\": 1054, \"y\": 482}, {\"x\": 1006, \"y\": 482}], \"valueProb\": 100}, {\"key\": \"totalAmountInWords\", \"value\": \"壹佰贰拾叁圆整\", \"keyProb\": 99, \"valuePos\": [{\"x\": 319, \"y\": 495}, {\"x\": 437, \"y\": 495}, {\"x\": 437, \"y\": 517}, {\"x\": 319, \"y\": 517}], \"valueProb\": 99}, {\"key\": \"totalAmount\", \"value\": \"123.00\", \"keyProb\": 99, \"valuePos\": [{\"x\": 794, \"y\": 496}, {\"x\": 870, \"y\": 496}, {\"x\": 870, \"y\": 515}, {\"x\": 794, \"y\": 515}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"泉州市达芬崎电子商务有限公司\", \"keyProb\": 99, \"valuePos\": [{\"x\": 611, \"y\": 165}, {\"x\": 843, \"y\": 165}, {\"x\": 843, \"y\": 185}, {\"x\": 611, \"y\": 185}], \"valueProb\": 99}, {\"key\": \"sellerTaxNumber\", \"value\": \"91350503MAK6675L48\", \"keyProb\": 100, \"valuePos\": [{\"x\": 790, \"y\": 217}, {\"x\": 1027, \"y\": 217}, {\"x\": 1027, \"y\": 241}, {\"x\": 790, \"y\": 241}], \"valueProb\": 100}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"黄建轮\", \"keyProb\": 99, \"valuePos\": [{\"x\": 159, \"y\": 659}, {\"x\": 212, \"y\": 659}, {\"x\": 212, \"y\": 679}, {\"x\": 159, \"y\": 679}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 346, \"y\": 34}, {\"x\": 690, \"y\": 33}, {\"x\": 690, \"y\": 71}, {\"x\": 347, \"y\": 73}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 346, \"y\": 34}, {\"x\": 690, \"y\": 33}, {\"x\": 690, \"y\": 71}, {\"x\": 347, \"y\": 73}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*信息化学品*拍立得相纸胶卷\\\",\\\"specification\\\":\\\"FUJIFILM富士mini\\\",\\\"unit\\\":\\\"\\\",\\\"quantity\\\":\\\"\\\",\\\"unitPrice\\\":\\\"\\\",\\\"amount\\\":\\\"121.78\\\",\\\"taxRate\\\":\\\"1%\\\",\\\"tax\\\":\\\"1.22\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}, \"businessDate\": \"2026-05-08T00:00:00.000Z\", \"counterparty\": \"泉州市达芬崎电子商务有限公司\", \"itemDescription\": \"*信息化学品*拍立得相纸胶卷\", \"recognitionStatus\": \"已确认\"}',NULL,NULL,'2026-07-28 02:29:23.139'),(36,1,1,'REVERT','source_voucher',19,NULL,'{\"status\": \"待制证\"}',NULL,NULL,'2026-07-28 02:31:13.574');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CNY',
  `balance` decimal(18,2) NOT NULL DEFAULT '0.00',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '正常',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bank_accounts_company_id_idx` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_accounts`
--

LOCK TABLES `bank_accounts` WRITE;
/*!40000 ALTER TABLE `bank_accounts` DISABLE KEYS */;
INSERT INTO `bank_accounts` VALUES (14,1,'贝特瑞基本户','4000023019200123456','工商银行深圳分行','基本户','CNY',1164551545.94,'正常','2026-07-24 12:14:08.365','2025-06-30 18:00:00.000',NULL),(15,1,'贝特瑞一般户','7445310108888778899','中国银行深圳分行','一般户','CNY',1164551545.94,'正常','2026-07-24 12:14:08.365','2025-06-30 18:00:00.000',NULL),(16,1,'募集资金专户','4420156200009988776','建设银行深圳分行','专户','CNY',1164551545.93,'正常','2026-07-24 12:14:08.365','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_reconciliation_items`
--

DROP TABLE IF EXISTS `bank_reconciliation_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_reconciliation_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `statement_id` bigint NOT NULL,
  `bank_account_id` bigint NOT NULL,
  `voucher_id` bigint DEFAULT NULL,
  `entry_date` date NOT NULL,
  `summary` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `book_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `diff_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_matched` tinyint(1) NOT NULL DEFAULT '0',
  `matched_at` datetime(3) DEFAULT NULL,
  `outstanding_reason` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bank_reconciliation_items_statement_id_idx` (`statement_id`),
  KEY `bank_reconciliation_items_bank_account_id_idx` (`bank_account_id`),
  KEY `bank_reconciliation_items_is_matched_idx` (`is_matched`),
  KEY `bank_reconciliation_items_type_idx` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_reconciliation_items`
--

LOCK TABLES `bank_reconciliation_items` WRITE;
/*!40000 ALTER TABLE `bank_reconciliation_items` DISABLE KEYS */;
INSERT INTO `bank_reconciliation_items` VALUES (7,1,1,1,'2025-06-12','负极材料货款回款',56300000.00,56300000.00,0.00,'both',1,NULL,'','pending','2026-07-24 12:14:08.374','2025-06-30 18:00:00.000'),(8,1,1,NULL,'2025-06-28','在途收款（银行已收企业未收）',1200000.00,0.00,1200000.00,'bank_only',0,NULL,'月末在途资金','pending','2026-07-24 12:14:08.374','2025-06-30 18:00:00.000'),(9,2,2,2,'2025-05-28','支付针状焦采购款',86000000.00,86000000.00,0.00,'both',1,NULL,'','pending','2026-07-24 12:14:08.374','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `bank_reconciliation_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_statements`
--

DROP TABLE IF EXISTS `bank_statements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_statements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `bank_account_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `statement_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_entries` int NOT NULL DEFAULT '0',
  `total_debit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `total_credit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `import_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bank_statements_bank_account_id_idx` (`bank_account_id`),
  KEY `bank_statements_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_statements`
--

LOCK TABLES `bank_statements` WRITE;
/*!40000 ALTER TABLE `bank_statements` DISABLE KEYS */;
INSERT INTO `bank_statements` VALUES (5,1,1,1,'STM-ICBC-202506',64,452000000.00,508000000.00,'matched','2026-07-24 12:14:08.372','2025-06-30 18:00:00.000'),(6,1,2,1,'STM-BOC-202506',38,226000000.00,198000000.00,'matched','2026-07-24 12:14:08.372','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `bank_statements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budget_executions`
--

DROP TABLE IF EXISTS `budget_executions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_executions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `budget_id` bigint NOT NULL,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `department_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `used_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `reserved_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `remaining_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `execution_rate` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `budget_executions_budget_id_idx` (`budget_id`),
  KEY `budget_executions_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget_executions`
--

LOCK TABLES `budget_executions` WRITE;
/*!40000 ALTER TABLE `budget_executions` DISABLE KEYS */;
INSERT INTO `budget_executions` VALUES (10,1,1,1,'总部财务部',27000000.00,6000000.00,27000000.00,0.4500,'2026-07-24 12:14:08.396','2025-06-30 18:00:00.000'),(11,2,1,1,'负极材料事业部',18000000.00,4000000.00,18000000.00,0.4500,'2026-07-24 12:14:08.396','2025-06-30 18:00:00.000'),(12,3,1,1,'正极材料事业部',11250000.00,2500000.00,11250000.00,0.4500,'2026-07-24 12:14:08.396','2025-06-30 18:00:00.000'),(13,4,1,1,'采购部',9000000.00,2000000.00,9000000.00,0.4500,'2026-07-24 12:14:08.396','2025-06-30 18:00:00.000'),(14,5,1,1,'销售部',13500000.00,3000000.00,13500000.00,0.4500,'2026-07-24 12:14:08.396','2025-06-30 18:00:00.000'),(15,6,1,1,'研究院',22500000.00,5000000.00,22500000.00,0.4500,'2026-07-24 12:14:08.396','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `budget_executions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budgets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `department_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `annual_budget` decimal(18,2) NOT NULL,
  `budget_category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `budgets_company_id_fiscal_period_id_department_name_budget_c_key` (`company_id`,`fiscal_period_id`,`department_name`,`budget_category`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budgets`
--

LOCK TABLES `budgets` WRITE;
/*!40000 ALTER TABLE `budgets` DISABLE KEYS */;
INSERT INTO `budgets` VALUES (10,1,1,'总部财务部',60000000.00,'人员费用','2026-07-24 12:14:08.395','2025-06-30 18:00:00.000'),(11,1,1,'负极材料事业部',40000000.00,'市场推广','2026-07-24 12:14:08.395','2025-06-30 18:00:00.000'),(12,1,1,'正极材料事业部',25000000.00,'市场推广','2026-07-24 12:14:08.395','2025-06-30 18:00:00.000'),(13,1,1,'采购部',20000000.00,'其他','2026-07-24 12:14:08.395','2025-06-30 18:00:00.000'),(14,1,1,'销售部',30000000.00,'仓储物流','2026-07-24 12:14:08.395','2025-06-30 18:00:00.000'),(15,1,1,'研究院',50000000.00,'信息技术','2026-07-24 12:14:08.395','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `budgets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_finance_penetration`
--

DROP TABLE IF EXISTS `business_finance_penetration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_finance_penetration` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `indicator_label` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `indicator_value` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `business_finance_penetration_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_finance_penetration`
--

LOCK TABLES `business_finance_penetration` WRITE;
/*!40000 ALTER TABLE `business_finance_penetration` DISABLE KEYS */;
INSERT INTO `business_finance_penetration` VALUES (1,1,1,'业务回款穿透','86%','销售回款与财务到账匹配度','2026-07-24 12:14:08.406'),(2,1,1,'业务付款穿透','92%','采购付款与合同匹配度','2026-07-24 12:14:08.406'),(3,1,1,'费用管控穿透','78%','费用报销合规率','2026-07-24 12:14:08.406'),(4,1,1,'利润穿透','81%','业务利润与财务报表勾稽度','2026-07-24 12:14:08.406');
/*!40000 ALTER TABLE `business_finance_penetration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_flow_predictions`
--

DROP TABLE IF EXISTS `cash_flow_predictions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_flow_predictions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `period_id` bigint NOT NULL,
  `day_label` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `day_offset` int NOT NULL,
  `balance` decimal(18,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `cash_flow_predictions_period_id_idx` (`period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_flow_predictions`
--

LOCK TABLES `cash_flow_predictions` WRITE;
/*!40000 ALTER TABLE `cash_flow_predictions` DISABLE KEYS */;
INSERT INTO `cash_flow_predictions` VALUES (100,1,1,'D+5',5,3410000000.00,'2026-07-24 12:14:08.369'),(101,1,1,'D+15',15,3360000000.00,'2026-07-24 12:14:08.369'),(102,1,1,'D+30',30,3290000000.00,'2026-07-24 12:14:08.369');
/*!40000 ALTER TABLE `cash_flow_predictions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `session_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp_ms` bigint NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `chat_messages_session_id_idx` (`session_id`),
  KEY `chat_messages_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,1,2,'sess-20250630-001','user','请分析2025上半年经营现金流为负的原因',1751289600000,'2026-07-24 12:14:08.422'),(2,1,2,'sess-20250630-001','ai','2025H1经营现金流-3.39亿元，主要因正极材料按账期回款同比减少，建议加强应收账期管理。',1751289660000,'2026-07-24 12:14:08.422'),(3,1,3,'sess-20250630-002','user','帮我核对6月银行对账差异',1751290000000,'2026-07-24 12:14:08.422'),(4,1,3,'sess-20250630-002','ai','已识别1笔在途收款120万元（银行已收企业未收），建议月末调整后勾对。',1751290060000,'2026-07-24 12:14:08.422');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `closing_tasks`
--

DROP TABLE IF EXISTS `closing_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `closing_tasks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `role_target` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deadline` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `completed_at` datetime(3) DEFAULT NULL,
  `completed_by` bigint DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `closing_tasks_fiscal_period_id_idx` (`fiscal_period_id`),
  KEY `closing_tasks_role_target_idx` (`role_target`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `closing_tasks`
--

LOCK TABLES `closing_tasks` WRITE;
/*!40000 ALTER TABLE `closing_tasks` DISABLE KEYS */;
INSERT INTO `closing_tasks` VALUES (9,1,1,'出纳','高','银行流水导入与对账','资金收付','2025-07-03 18:00',1,'2025-07-03 16:20:00.000',3,0,'2026-07-24 12:14:08.382','2025-06-30 18:00:00.000'),(10,1,1,'财务专员','高','凭证录入与审核','记账凭证','2025-07-05 18:00',1,'2025-07-05 17:10:00.000',8,0,'2026-07-24 12:14:08.382','2025-06-30 18:00:00.000'),(11,1,1,'财务负责人','中','报表编制与勾稽检查','报表管理','2025-07-08 18:00',1,'2025-07-08 15:40:00.000',2,0,'2026-07-24 12:14:08.382','2025-06-30 18:00:00.000'),(12,1,1,'财务负责人','高','H1 关账审批','月结管理','2025-07-10 18:00',1,'2025-07-10 11:00:00.000',2,0,'2026-07-24 12:14:08.382','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `closing_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collection_records`
--

DROP TABLE IF EXISTS `collection_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `receivable_id` bigint NOT NULL,
  `collector_id` bigint DEFAULT NULL,
  `action_result` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `promise_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `collection_records_receivable_id_idx` (`receivable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collection_records`
--

LOCK TABLES `collection_records` WRITE;
/*!40000 ALTER TABLE `collection_records` DISABLE KEYS */;
INSERT INTO `collection_records` VALUES (5,4,6,'客户已承诺回款','2025-08-10','已电话沟通，下月安排回款','2026-07-24 12:14:08.386'),(6,5,6,'存在账款争议',NULL,'对账金额存在分歧，待法务介入','2026-07-24 12:14:08.386');
/*!40000 ALTER TABLE `collection_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collector_kpis`
--

DROP TABLE IF EXISTS `collector_kpis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collector_kpis` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `collector_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `managed_amount` decimal(18,2) NOT NULL,
  `overdue_amount` decimal(18,2) NOT NULL,
  `recovery_rate` decimal(10,4) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `collector_kpis_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collector_kpis`
--

LOCK TABLES `collector_kpis` WRITE;
/*!40000 ALTER TABLE `collector_kpis` DISABLE KEYS */;
INSERT INTO `collector_kpis` VALUES (5,1,1,'陈静',3200000000.00,300000000.00,0.9000,'2026-07-24 12:14:08.389','2025-06-30 18:00:00.000'),(6,1,1,'王强',1791807009.35,291807009.35,0.8400,'2026-07-24 12:14:08.389','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `collector_kpis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `legal_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registered_addr` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'贝特瑞新材料集团股份有限公司','贝特瑞','914403007084597639','贺雪琴','广东省深圳市光明区公明办事处西田社区高新技术工业园第1栋','0755-12345678','active','2026-07-24 12:14:08.341','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_receivables`
--

DROP TABLE IF EXISTS `customer_receivables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_receivables` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `overdue_days` int NOT NULL DEFAULT '0',
  `risk_level` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `collector_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags_json` json DEFAULT NULL,
  `invoice_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_receivables_customer_name_idx` (`customer_name`),
  KEY `customer_receivables_risk_level_idx` (`risk_level`),
  KEY `customer_receivables_collector_name_idx` (`collector_name`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_receivables`
--

LOCK TABLES `customer_receivables` WRITE;
/*!40000 ALTER TABLE `customer_receivables` DISABLE KEYS */;
INSERT INTO `customer_receivables` VALUES (18,1,'宁德时代新能源科技股份有限公司',998361401.87,0,'low','021-58000088','陈静',NULL,'441392000000001','2025-03-15','closed','2026-07-24 12:14:08.385','2025-06-30 18:00:00.000',NULL),(19,1,'比亚迪股份有限公司',998361401.87,0,'low','021-58100188','陈静',NULL,'441392001001001','2025-04-15','closed','2026-07-24 12:14:08.385','2025-06-30 18:00:00.000',NULL),(20,1,'LG新能源（南京）有限公司',998361401.87,0,'low','021-58200288','陈静',NULL,'441392002002001','2025-05-15','closed','2026-07-24 12:14:08.385','2025-06-30 18:00:00.000',NULL),(21,1,'惠州亿纬锂能股份有限公司',998361401.87,35,'mid','021-58300388','陈静',NULL,'441392003003001','2025-06-15','open','2026-07-24 12:14:08.385','2025-06-30 18:00:00.000',NULL),(22,1,'国轩高科股份有限公司',998361401.87,72,'high','021-58400488','陈静',NULL,'441392004004001','2025-07-15','open','2026-07-24 12:14:08.385','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `customer_receivables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_dictionary`
--

DROP TABLE IF EXISTS `data_dictionary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_dictionary` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `module` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `indicators` text COLLATE utf8mb4_unicode_ci,
  `key_fields` text COLLATE utf8mb4_unicode_ci,
  `source_systems` text COLLATE utf8mb4_unicode_ci,
  `responsible_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `update_frequency` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `collection_method` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `data_dictionary_module_idx` (`module`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_dictionary`
--

LOCK TABLES `data_dictionary` WRITE;
/*!40000 ALTER TABLE `data_dictionary` DISABLE KEYS */;
INSERT INTO `data_dictionary` VALUES (1,1,'财务总览','营收,净利,毛利率,经营现金流','revenue,net_profit,gross_margin','总账系统/财报','黄友元','月度','自动+手动录入','2026-07-24 12:14:08.429','2025-06-30 18:00:00.000'),(2,1,'应收管理','应收账款,逾期率,账龄','amount,overdue_days,aging_bucket','销售系统/对账','陈静','每日','系统同步','2026-07-24 12:14:08.429','2025-06-30 18:00:00.000'),(3,1,'资金管理','账户余额,资金预测','balance,day_offset','银企直连','李娜','实时','API同步','2026-07-24 12:14:08.429','2025-06-30 18:00:00.000'),(4,1,'预算执行','预算执行率,剩余额度','execution_rate,remaining_amount','预算系统','孙明','月度','手动维护','2026-07-24 12:14:08.429','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `data_dictionary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `manager_id` bigint DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `departments_company_id_idx` (`company_id`),
  KEY `departments_parent_id_idx` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,1,'总部财务部',NULL,2,1,'2026-07-24 12:14:08.342','2025-06-30 18:00:00.000',NULL),(2,1,'负极材料事业部',NULL,7,2,'2026-07-24 12:14:08.342','2025-06-30 18:00:00.000',NULL),(3,1,'正极材料事业部',NULL,6,3,'2026-07-24 12:14:08.342','2025-06-30 18:00:00.000',NULL),(4,1,'采购部',NULL,6,4,'2026-07-24 12:14:08.342','2025-06-30 18:00:00.000',NULL),(5,1,'销售部',NULL,7,5,'2026-07-24 12:14:08.342','2025-06-30 18:00:00.000',NULL),(6,1,'研究院',NULL,8,6,'2026-07-24 12:14:08.342','2025-06-30 18:00:00.000',NULL),(7,1,'印尼贝特瑞财务部',1,5,7,'2026-07-24 12:14:08.342','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `depreciation_records`
--

DROP TABLE IF EXISTS `depreciation_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `depreciation_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `asset_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `accumulated` decimal(18,2) NOT NULL,
  `net_value` decimal(18,2) NOT NULL,
  `voucher_id` bigint DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `depreciation_records_asset_id_idx` (`asset_id`),
  KEY `depreciation_records_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `depreciation_records`
--

LOCK TABLES `depreciation_records` WRITE;
/*!40000 ALTER TABLE `depreciation_records` DISABLE KEYS */;
INSERT INTO `depreciation_records` VALUES (6,1,1,43013481.98,780387458.72,1677525797.08,3,'2026-07-24 12:14:08.399'),(7,2,1,43013481.98,780387458.72,1677525797.08,NULL,'2026-07-24 12:14:08.399'),(8,3,1,43013481.98,780387458.72,1677525797.08,NULL,'2026-07-24 12:14:08.399'),(9,4,1,43013481.98,780387458.72,1677525797.08,NULL,'2026-07-24 12:14:08.399'),(10,5,1,43013481.98,780387458.72,1677525797.08,NULL,'2026-07-24 12:14:08.399');
/*!40000 ALTER TABLE `depreciation_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `department_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `employee_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employees_employee_no_key` (`employee_no`),
  KEY `employees_company_id_idx` (`company_id`),
  KEY `employees_department_id_idx` (`department_id`),
  KEY `employees_user_id_idx` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,1,1,NULL,'EMP0001','贺雪琴','13800000001','zhaoxq@btr.com','董事长','active','2026-07-24 12:14:08.343','2025-06-30 18:00:00.000',NULL),(2,1,2,1,'EMP0002','黄友元','13800000002','huangyy@btr.com','财务负责人','active','2026-07-24 12:14:08.343','2025-06-30 18:00:00.000',NULL),(3,1,2,2,'EMP0003','刘志文','13800000003','liuzw@btr.com','会计机构负责人','active','2026-07-24 12:14:08.343','2025-06-30 18:00:00.000',NULL),(4,1,2,3,'EMP0004','李娜','13800000004','lina@btr.com','出纳','active','2026-07-24 12:14:08.343','2025-06-30 18:00:00.000',NULL),(5,1,7,NULL,'EMP0005','王强','13800000005','wangq@btr.com','采购经理','active','2026-07-24 12:14:08.343','2025-06-30 18:00:00.000',NULL),(6,1,5,NULL,'EMP0006','陈静','13800000006','chenj@btr.com','销售经理','active','2026-07-24 12:14:08.343','2025-06-30 18:00:00.000',NULL),(7,1,1,NULL,'EMP0007','赵磊','13800000007','zhaol@btr.com','研发总监','active','2026-07-24 12:14:08.343','2025-06-30 18:00:00.000',NULL),(8,1,2,NULL,'EMP0008','孙明','13800000008','sunm@btr.com','财务专员','active','2026-07-24 12:14:08.343','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense_reports`
--

DROP TABLE IF EXISTS `expense_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `applicant_id` bigint DEFAULT NULL,
  `department_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expense_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `expense_date` date NOT NULL,
  `description` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachment_count` int NOT NULL DEFAULT '0',
  `approval_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待审批',
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `voucher_id` bigint DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expense_reports_applicant_id_idx` (`applicant_id`),
  KEY `expense_reports_approval_status_idx` (`approval_status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_reports`
--

LOCK TABLES `expense_reports` WRITE;
/*!40000 ALTER TABLE `expense_reports` DISABLE KEYS */;
INSERT INTO `expense_reports` VALUES (1,1,6,'销售部','差旅费',18600.00,'2025-06-08','华东客户走访差旅',5,'已批准','completed',4,'2026-07-24 12:14:08.407','2025-06-30 18:00:00.000',NULL),(2,1,5,'采购部','业务招待费',9800.00,'2025-06-12','供应商技术交流招待',3,'已批准','completed',4,'2026-07-24 12:14:08.407','2025-06-30 18:00:00.000',NULL),(3,1,8,'总部财务部','办公费',4300.00,'2025-06-20','财务系统年费分摊',2,'审批中',NULL,NULL,'2026-07-24 12:14:08.407','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `expense_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fiscal_periods`
--

DROP TABLE IF EXISTS `fiscal_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fiscal_periods` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  `closed_at` datetime(3) DEFAULT NULL,
  `closed_by` bigint DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fiscal_periods_company_id_year_month_key` (`company_id`,`year`,`month`),
  KEY `fiscal_periods_is_closed_idx` (`is_closed`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fiscal_periods`
--

LOCK TABLES `fiscal_periods` WRITE;
/*!40000 ALTER TABLE `fiscal_periods` DISABLE KEYS */;
INSERT INTO `fiscal_periods` VALUES (1,1,2025,6,'2025-06-01','2025-06-30',1,NULL,2,'2026-07-24 12:14:08.349','2025-06-30 18:00:00.000'),(8,1,2025,1,'2025-01-01','2025-01-31',0,NULL,NULL,'2026-07-24 14:31:52.000','2026-07-24 14:31:52.000'),(9,1,2025,2,'2025-02-01','2025-02-28',0,NULL,NULL,'2026-07-24 14:31:52.000','2026-07-24 14:31:52.000'),(10,1,2025,3,'2025-03-01','2025-03-31',0,NULL,NULL,'2026-07-24 14:31:52.000','2026-07-24 14:31:52.000'),(11,1,2025,4,'2025-04-01','2025-04-30',0,NULL,NULL,'2026-07-24 14:31:52.000','2026-07-24 14:31:52.000'),(12,1,2025,5,'2025-05-01','2025-05-31',0,NULL,NULL,'2026-07-24 14:31:52.000','2026-07-24 14:31:52.000');
/*!40000 ALTER TABLE `fiscal_periods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fixed_assets`
--

DROP TABLE IF EXISTS `fixed_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fixed_assets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `asset_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `original_value` decimal(18,2) NOT NULL,
  `accumulated_depreciation` decimal(18,2) NOT NULL DEFAULT '0.00',
  `net_value` decimal(18,2) DEFAULT NULL,
  `useful_life_years` int NOT NULL,
  `depreciation_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'straight_line',
  `monthly_depreciation` decimal(18,2) DEFAULT NULL,
  `acquisition_date` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `residual_value` decimal(18,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `fixed_assets_category_idx` (`category`),
  KEY `fixed_assets_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fixed_assets`
--

LOCK TABLES `fixed_assets` WRITE;
/*!40000 ALTER TABLE `fixed_assets` DISABLE KEYS */;
INSERT INTO `fixed_assets` VALUES (15,1,'惠州负极材料生产基地','FA-2025-001','房屋及建筑物','总部财务部',2457913255.80,737373976.74,1720539279.06,20,'straight_line',7168913.66,'2021-01-15','在用','2026-07-24 12:14:08.397','2025-06-30 18:00:00.000',NULL,0.00),(16,1,'常州正极材料生产基地','FA-2025-002','房屋及建筑物','总部财务部',2457913255.80,737373976.74,1720539279.06,20,'straight_line',7168913.66,'2021-02-15','在用','2026-07-24 12:14:08.397','2025-06-30 18:00:00.000',NULL,0.00),(17,1,'天津负极材料生产基地','FA-2025-003','机器设备','总部财务部',2457913255.80,737373976.74,1720539279.06,20,'straight_line',7168913.66,'2021-03-15','在用','2026-07-24 12:14:08.397','2025-06-30 18:00:00.000',NULL,0.00),(18,1,'印尼负极材料基地','FA-2025-004','机器设备','总部财务部',2457913255.80,737373976.74,1720539279.06,20,'straight_line',7168913.66,'2021-04-15','在用','2026-07-24 12:14:08.397','2025-06-30 18:00:00.000',NULL,0.00),(19,1,'深圳研发中心大楼','FA-2025-005','房屋及建筑物','总部财务部',2457913255.80,737373976.74,1720539279.06,20,'straight_line',7168913.66,'2021-05-15','在用','2026-07-24 12:14:08.397','2025-06-30 18:00:00.000',NULL,0.00);
/*!40000 ALTER TABLE `fixed_assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fund_transactions`
--

DROP TABLE IF EXISTS `fund_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fund_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `bank_account_id` bigint NOT NULL,
  `voucher_id` bigint DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `counterparty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summary` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_cash_flow` tinyint(1) NOT NULL DEFAULT '1',
  `cash_flow_category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fund_transactions_bank_account_id_idx` (`bank_account_id`),
  KEY `fund_transactions_transaction_date_idx` (`transaction_date`),
  KEY `fund_transactions_type_idx` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fund_transactions`
--

LOCK TABLES `fund_transactions` WRITE;
/*!40000 ALTER TABLE `fund_transactions` DISABLE KEYS */;
INSERT INTO `fund_transactions` VALUES (20,1,1,1,'2025-06-12','inflow',56300000.00,'宁德时代新能源科技股份有限公司','负极材料货款回款',1,'经营','2026-07-24 12:14:08.366','2025-06-30 18:00:00.000'),(21,1,2,2,'2025-05-28','outflow',86000000.00,'江西紫宸科技有限公司','支付针状焦采购款',1,'经营','2026-07-24 12:14:08.366','2025-06-30 18:00:00.000'),(22,1,1,6,'2025-06-20','outflow',90000000.00,'国家税务总局深圳市光明区税务局','缴纳增值税及附加',1,'经营','2026-07-24 12:14:08.366','2025-06-30 18:00:00.000'),(23,1,3,NULL,'2025-06-30','inflow',3546137.81,'募集资金拨入','募集资金专户入款',1,'筹资','2026-07-24 12:14:08.366','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `fund_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_records`
--

DROP TABLE IF EXISTS `import_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `template_id` bigint DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploader_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploader_id` bigint DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_count` int NOT NULL DEFAULT '0',
  `error_count` int NOT NULL DEFAULT '0',
  `error_details` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `import_records_company_id_idx` (`company_id`),
  KEY `import_records_template_id_idx` (`template_id`),
  KEY `import_records_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_records`
--

LOCK TABLES `import_records` WRITE;
/*!40000 ALTER TABLE `import_records` DISABLE KEYS */;
INSERT INTO `import_records` VALUES (1,1,1,'2025-06凭证.xlsx','孙明',8,'success',1280,0,NULL,'2026-07-24 12:14:08.416'),(2,1,2,'工行202506流水.csv','李娜',3,'warning',64,2,'[{\"msg\": \"金额解析失败\", \"row\": 12}, {\"msg\": \"日期格式错误\", \"row\": 38}]','2026-07-24 12:14:08.416');
/*!40000 ALTER TABLE `import_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `import_templates`
--

DROP TABLE IF EXISTS `import_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `import_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usage_description` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frequency` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `import_templates_company_id_idx` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `import_templates`
--

LOCK TABLES `import_templates` WRITE;
/*!40000 ALTER TABLE `import_templates` DISABLE KEYS */;
INSERT INTO `import_templates` VALUES (1,1,'记账凭证导入模板','从Excel批量导入记账凭证','每日','https://oss.btr.com/tpl/voucher.xlsx','2026-07-24 12:14:08.414','2025-06-30 18:00:00.000',NULL),(2,1,'银行流水导入模板','从网银导出文件导入资金流水','每日','https://oss.btr.com/tpl/bankflow.xlsx','2026-07-24 12:14:08.414','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `import_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_inbound`
--

DROP TABLE IF EXISTS `inventory_inbound`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_inbound` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `doc_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `inbound_date` date NOT NULL,
  `warehouse` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_count` int NOT NULL,
  `total_amount` decimal(18,2) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_inbound_type_idx` (`type`),
  KEY `inventory_inbound_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_inbound`
--

LOCK TABLES `inventory_inbound` WRITE;
/*!40000 ALTER TABLE `inventory_inbound` DISABLE KEYS */;
INSERT INTO `inventory_inbound` VALUES (3,1,'RK-20250615-01','采购入库','2025-06-15','惠州中心仓',3,15600000.00,'已审核','2026-07-24 12:14:08.401','2025-06-30 18:00:00.000',NULL),(4,1,'RK-20250622-02','采购入库','2025-06-22','常州正极仓',2,9800000.00,'已审核','2026-07-24 12:14:08.401','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `inventory_inbound` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `sku_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouse` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `safety_stock` int NOT NULL DEFAULT '0',
  `unit_cost` decimal(18,2) NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `turnover_days` decimal(10,2) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_items_sku_code_key` (`sku_code`),
  KEY `inventory_items_warehouse_idx` (`warehouse`),
  KEY `inventory_items_category_idx` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

LOCK TABLES `inventory_items` WRITE;
/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
INSERT INTO `inventory_items` VALUES (8,1,'SKU-ANODE-001','人造石墨负极材料','惠州中心仓',8600,2000,35000.00,'电子产品',48.50,'2026-07-24 12:14:08.400','2025-06-30 18:00:00.000',NULL),(9,1,'SKU-ANODE-002','硅基负极材料','惠州中心仓',3200,800,88000.00,'电子产品',55.20,'2026-07-24 12:14:08.400','2025-06-30 18:00:00.000',NULL),(10,1,'SKU-CATHODE-001','磷酸铁锂正极材料','常州正极仓',5400,1500,52000.00,'电子产品',41.30,'2026-07-24 12:14:08.400','2025-06-30 18:00:00.000',NULL),(11,1,'SKU-CATHODE-002','三元正极材料','天津正极仓',4100,1000,71000.00,'电子产品',46.80,'2026-07-24 12:14:08.400','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_outbound`
--

DROP TABLE IF EXISTS `inventory_outbound`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_outbound` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `doc_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `outbound_date` date NOT NULL,
  `warehouse` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_count` int NOT NULL,
  `total_amount` decimal(18,2) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_outbound_type_idx` (`type`),
  KEY `inventory_outbound_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_outbound`
--

LOCK TABLES `inventory_outbound` WRITE;
/*!40000 ALTER TABLE `inventory_outbound` DISABLE KEYS */;
INSERT INTO `inventory_outbound` VALUES (3,1,'CK-20250618-01','销售出库','2025-06-18','惠州中心仓',4,22300000.00,'已审核','2026-07-24 12:14:08.402','2025-06-30 18:00:00.000',NULL),(4,1,'CK-20250625-02','销售出库','2025-06-25','天津正极仓',2,11200000.00,'已审核','2026-07-24 12:14:08.402','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `inventory_outbound` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ledger_entries`
--

DROP TABLE IF EXISTS `ledger_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ledger_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `voucher_id` bigint DEFAULT NULL,
  `entry_date` date NOT NULL,
  `voucher_word` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `voucher_number` int DEFAULT NULL,
  `summary` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `debit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `credit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `direction` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` decimal(18,2) NOT NULL,
  `book_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'journal',
  `flag` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ledger_entries_fiscal_period_id_idx` (`fiscal_period_id`),
  KEY `ledger_entries_subject_id_idx` (`subject_id`),
  KEY `ledger_entries_entry_date_idx` (`entry_date`),
  KEY `ledger_entries_book_type_idx` (`book_type`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ledger_entries`
--

LOCK TABLES `ledger_entries` WRITE;
/*!40000 ALTER TABLE `ledger_entries` DISABLE KEYS */;
INSERT INTO `ledger_entries` VALUES (9,1,1,5,1,'2025-06-12','收',1,'收回货款',0.00,56300000.00,'借',4936177009.35,'journal',NULL,'2026-07-24 12:14:08.375','2025-06-30 18:00:00.000'),(10,1,1,2,1,'2025-06-12','收',1,'货款入账',56300000.00,0.00,'借',3544784637.81,'journal',NULL,'2026-07-24 12:14:08.375','2025-06-30 18:00:00.000'),(11,1,1,24,2,'2025-05-28','付',2,'支付采购款',86000000.00,0.00,'贷',4775039030.19,'journal',NULL,'2026-07-24 12:14:08.375','2025-06-30 18:00:00.000'),(12,1,1,46,5,'2025-06-30','转',5,'H1主营业务收入',0.00,7837646228.04,'贷',7837646228.04,'classify',NULL,'2026-07-24 12:14:08.375','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `ledger_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `live_room_profit_ranking`
--

DROP TABLE IF EXISTS `live_room_profit_ranking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `live_room_profit_ranking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `rank` int NOT NULL,
  `room_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profit` decimal(18,2) NOT NULL,
  `margin` decimal(10,4) NOT NULL,
  `trend` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `live_room_profit_ranking_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `live_room_profit_ranking`
--

LOCK TABLES `live_room_profit_ranking` WRITE;
/*!40000 ALTER TABLE `live_room_profit_ranking` DISABLE KEYS */;
INSERT INTO `live_room_profit_ranking` VALUES (9,1,1,1,'贝特瑞官方旗舰直播间',1800000.00,0.1500,'up','2026-07-24 12:14:08.403'),(10,1,1,2,'负极材料科普专场',950000.00,0.1200,'up','2026-07-24 12:14:08.403'),(11,1,1,3,'正极材料技术研讨',620000.00,0.1000,'down','2026-07-24 12:14:08.403');
/*!40000 ALTER TABLE `live_room_profit_ranking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monthly_financial_snapshots`
--

DROP TABLE IF EXISTS `monthly_financial_snapshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_financial_snapshots` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `revenue` decimal(18,2) NOT NULL DEFAULT '0.00',
  `revenue_yoy` decimal(18,2) DEFAULT NULL,
  `cost_of_goods` decimal(18,2) NOT NULL DEFAULT '0.00',
  `platform_commission` decimal(18,2) NOT NULL DEFAULT '0.00',
  `marketing_cost` decimal(18,2) NOT NULL DEFAULT '0.00',
  `logistics_cost` decimal(18,2) NOT NULL DEFAULT '0.00',
  `net_profit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `net_profit_yoy` decimal(18,2) DEFAULT NULL,
  `net_margin` decimal(10,4) DEFAULT NULL,
  `gross_margin` decimal(10,4) DEFAULT NULL,
  `gross_margin_benchmark` decimal(10,4) DEFAULT NULL,
  `operating_cash_flow` decimal(18,2) DEFAULT NULL,
  `opening_cash` decimal(18,2) DEFAULT NULL,
  `cash_inflow` decimal(18,2) DEFAULT NULL,
  `cash_outflow` decimal(18,2) DEFAULT NULL,
  `closing_cash` decimal(18,2) DEFAULT NULL,
  `overdue_ratio` decimal(10,4) DEFAULT NULL,
  `fund_coverage` decimal(10,4) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `monthly_financial_snapshots_fiscal_period_id_key` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monthly_financial_snapshots`
--

LOCK TABLES `monthly_financial_snapshots` WRITE;
/*!40000 ALTER TABLE `monthly_financial_snapshots` DISABLE KEYS */;
INSERT INTO `monthly_financial_snapshots` VALUES (45,1,1,1488000000.00,11.36,1147000000.00,0.00,8229000.00,3400000.00,113000000.00,-2.88,0.0760,0.2300,0.2100,-109000000.00,2497000000.00,1250000000.00,614000000.00,3133000000.00,0.0800,1.4500,'2026-07-24 12:14:08.378','2025-06-30 18:00:00.000'),(51,1,8,1150000000.00,9.50,900000000.00,0.00,3000000.00,2500000.00,82000000.00,-1.20,0.0720,0.2200,0.2100,50000000.00,2557000000.00,1050000000.00,1080000000.00,2527000000.00,0.0600,1.3000,'2026-07-24 14:33:18.000','2026-07-24 14:33:18.000'),(52,1,9,1200000000.00,10.20,930000000.00,0.00,4000000.00,2800000.00,88000000.00,-2.00,0.0730,0.2250,0.2100,-30000000.00,2527000000.00,1080000000.00,1100000000.00,2507000000.00,0.0700,1.3500,'2026-07-24 14:33:18.000','2026-07-24 14:33:18.000'),(53,1,10,1280000000.00,10.80,990000000.00,0.00,5000000.00,3000000.00,95000000.00,-2.50,0.0740,0.2280,0.2100,-80000000.00,2507000000.00,1100000000.00,1130000000.00,2477000000.00,0.0750,1.3800,'2026-07-24 14:33:18.000','2026-07-24 14:33:18.000'),(54,1,11,1320000000.00,11.00,1020000000.00,0.00,5500000.00,3000000.00,100000000.00,-2.80,0.0760,0.2300,0.2100,-70000000.00,2477000000.00,1150000000.00,1150000000.00,2477000000.00,0.0800,1.4200,'2026-07-24 14:33:18.000','2026-07-24 14:33:18.000'),(55,1,12,1400000000.00,11.50,1080000000.00,0.00,7000000.00,3300000.00,110000000.00,-2.90,0.0790,0.2320,0.2100,-100000000.00,2477000000.00,1200000000.00,1180000000.00,2497000000.00,0.0850,1.4500,'2026-07-24 14:33:18.000','2026-07-24 14:33:18.000');
/*!40000 ALTER TABLE `monthly_financial_snapshots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opening_balances`
--

DROP TABLE IF EXISTS `opening_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opening_balances` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `direction` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `opening_balances_fiscal_period_id_subject_id_key` (`fiscal_period_id`,`subject_id`),
  KEY `opening_balances_company_id_idx` (`company_id`),
  KEY `opening_balances_subject_id_idx` (`subject_id`)
) ENGINE=InnoDB AUTO_INCREMENT=226 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opening_balances`
--

LOCK TABLES `opening_balances` WRITE;
/*!40000 ALTER TABLE `opening_balances` DISABLE KEYS */;
INSERT INTO `opening_balances` VALUES (181,1,1,1,1800000.00,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(182,1,1,2,3113828975.55,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(183,1,1,3,126296319.60,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(184,1,1,4,4790734.11,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(185,1,1,5,4169717392.38,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(186,1,1,6,1004383984.94,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(187,1,1,7,191862995.02,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(188,1,1,8,84473444.55,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(189,1,1,9,3344069009.74,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(190,1,1,10,1857657812.16,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(191,1,1,11,303108727.44,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(192,1,1,12,404315013.57,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(193,1,1,13,117546591.65,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(194,1,1,14,11882458935.48,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(195,1,1,15,3408550065.42,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(196,1,1,16,331275123.83,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(197,1,1,17,1123324624.00,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(198,1,1,18,167396493.99,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(199,1,1,19,490297604.67,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(200,1,1,20,1220106591.79,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(201,1,1,21,1555513972.57,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(202,1,1,22,0.00,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(203,1,1,23,1165286653.83,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(204,1,1,24,5670846838.74,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(205,1,1,25,1298893.14,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(206,1,1,26,34961420.26,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(207,1,1,27,250819556.06,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(208,1,1,28,225638118.12,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(209,1,1,29,462668587.98,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(210,1,1,30,1653067879.38,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(211,1,1,31,3384885.92,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(212,1,1,32,5839502399.27,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(213,1,1,33,272061787.90,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(214,1,1,34,5887397.03,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(215,1,1,35,807941773.53,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(216,1,1,36,189650572.56,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(217,1,1,37,813449667.51,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(218,1,1,38,1127338649.00,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(219,1,1,39,3938319863.99,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(220,1,1,40,173201681.53,'借','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(221,1,1,41,570261.45,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(222,1,1,42,4964798.13,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(223,1,1,43,412285589.68,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(224,1,1,44,6916983854.51,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000'),(225,1,1,45,2168018700.86,'贷','2026-07-24 12:14:08.352','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `opening_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_applications`
--

DROP TABLE IF EXISTS `payment_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_applications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `supplier_id` bigint NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `purpose` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicant_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `application_date` date NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待处理',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget_item` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget_remain` decimal(18,2) DEFAULT NULL,
  `is_repeat` tinyint(1) NOT NULL DEFAULT '0',
  `contract_check` tinyint(1) NOT NULL DEFAULT '0',
  `invoice_check` tinyint(1) NOT NULL DEFAULT '0',
  `budget_check` tinyint(1) NOT NULL DEFAULT '0',
  `repeat_check` tinyint(1) NOT NULL DEFAULT '0',
  `reviewer_id` bigint DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `payment_task_id` bigint DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_applications_supplier_id_idx` (`supplier_id`),
  KEY `payment_applications_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_applications`
--

LOCK TABLES `payment_applications` WRITE;
/*!40000 ALTER TABLE `payment_applications` DISABLE KEYS */;
INSERT INTO `payment_applications` VALUES (5,1,1,972207806.04,'支付针状焦采购款','王强','2025-05-25','已完成','PO-2025-COKE-0188','44139200012890','原材料-负极前驱体',NULL,0,1,1,1,1,NULL,NULL,NULL,'2026-07-24 12:14:08.392','2025-06-30 18:00:00.000',NULL),(6,1,2,972207806.04,'支付石墨负极材料款','王强','2025-06-15','已批准','PO-2025-GRA-0201','44139200013012','原材料-负极',NULL,0,1,1,1,1,NULL,NULL,NULL,'2026-07-24 12:14:08.392','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `payment_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_tasks`
--

DROP TABLE IF EXISTS `payment_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_tasks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `bank_account_id` bigint DEFAULT NULL,
  `payee` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payee_account` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `approval_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `check_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '中',
  `due_date` date DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_tasks_bank_account_id_idx` (`bank_account_id`),
  KEY `payment_tasks_payment_status_idx` (`payment_status`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_tasks`
--

LOCK TABLES `payment_tasks` WRITE;
/*!40000 ALTER TABLE `payment_tasks` DISABLE KEYS */;
INSERT INTO `payment_tasks` VALUES (7,1,1,'江西紫宸科技有限公司','360200000001234',86000000.00,'approved','passed','completed','高','2025-05-30','供应商付款',2,'2026-07-24 12:14:08.368','2025-06-30 18:00:00.000',NULL),(8,1,2,'上海杉杉科技有限公司','980700000002345',45000000.00,'approved','passed','processing','中','2025-07-10','供应商付款',2,'2026-07-24 12:14:08.368','2025-06-30 18:00:00.000',NULL),(9,1,1,'李娜','621700000003456',1200000.00,'approved','passed','completed','中','2025-06-10','薪资发放',2,'2026-07-24 12:14:08.368','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `payment_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll_records`
--

DROP TABLE IF EXISTS `payroll_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `employee_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `base_salary` decimal(18,2) NOT NULL DEFAULT '0.00',
  `bonus` decimal(18,2) NOT NULL DEFAULT '0.00',
  `allowance` decimal(18,2) NOT NULL DEFAULT '0.00',
  `deduction` decimal(18,2) NOT NULL DEFAULT '0.00',
  `social_insurance` decimal(18,2) NOT NULL DEFAULT '0.00',
  `tax_deducted` decimal(18,2) NOT NULL DEFAULT '0.00',
  `net_pay` decimal(18,2) NOT NULL,
  `voucher_id` bigint DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `payroll_records_employee_id_idx` (`employee_id`),
  KEY `payroll_records_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll_records`
--

LOCK TABLES `payroll_records` WRITE;
/*!40000 ALTER TABLE `payroll_records` DISABLE KEYS */;
INSERT INTO `payroll_records` VALUES (1,1,2,1,85000.00,40000.00,5000.00,3000.00,18000.00,12000.00,86500.00,4,'2026-07-24 12:14:08.409','2025-06-30 18:00:00.000'),(2,1,3,1,60000.00,25000.00,4000.00,2000.00,14000.00,8000.00,65000.00,4,'2026-07-24 12:14:08.409','2025-06-30 18:00:00.000'),(3,1,4,1,38000.00,8000.00,2000.00,1000.00,9000.00,4200.00,33800.00,4,'2026-07-24 12:14:08.409','2025-06-30 18:00:00.000'),(4,1,6,1,42000.00,10000.00,2000.00,1200.00,9800.00,5000.00,38000.00,4,'2026-07-24 12:14:08.409','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `payroll_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `period_end_steps`
--

DROP TABLE IF EXISTS `period_end_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `period_end_steps` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `step_label` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `period_end_steps_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `period_end_steps`
--

LOCK TABLES `period_end_steps` WRITE;
/*!40000 ALTER TABLE `period_end_steps` DISABLE KEYS */;
INSERT INTO `period_end_steps` VALUES (11,1,1,'业务入账','done','全部业务凭证已录入',1,'2026-07-24 12:14:08.383','2025-06-30 18:00:00.000'),(12,1,1,'账实核对','done','银行/库存已核对',2,'2026-07-24 12:14:08.383','2025-06-30 18:00:00.000'),(13,1,1,'自动结转','done','折旧/损益已结转',3,'2026-07-24 12:14:08.383','2025-06-30 18:00:00.000'),(14,1,1,'报表检查','done','三大报表勾稽平衡',4,'2026-07-24 12:14:08.383','2025-06-30 18:00:00.000'),(15,1,1,'月末结账','done','2025-06 期已关账',5,'2026-07-24 12:14:08.383','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `period_end_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `period_end_transfers`
--

DROP TABLE IF EXISTS `period_end_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `period_end_transfers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `transfer_type` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_id` bigint DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `period_end_transfers_fiscal_period_id_idx` (`fiscal_period_id`),
  KEY `period_end_transfers_transfer_type_idx` (`transfer_type`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `period_end_transfers`
--

LOCK TABLES `period_end_transfers` WRITE;
/*!40000 ALTER TABLE `period_end_transfers` DISABLE KEYS */;
INSERT INTO `period_end_transfers` VALUES (9,1,1,'折','折旧','H1 固定资产折旧计提',349800000.00,'已完成',3,'2026-07-24 12:14:08.384','2025-06-30 18:00:00.000'),(10,1,1,'摊','摊销','无形资产/长期待摊费用摊销',42000000.00,'已完成',NULL,'2026-07-24 12:14:08.384','2025-06-30 18:00:00.000'),(11,1,1,'税','税费','企业所得税预缴',39367256.90,'已完成',NULL,'2026-07-24 12:14:08.384','2025-06-30 18:00:00.000'),(12,1,1,'损','损益结转','收入成本费用结转本年利润',587766457.53,'已完成',5,'2026-07-24 12:14:08.384','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `period_end_transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'dashboard','财务总览','财务总览','2026-07-24 12:14:08.347'),(2,'voucher','记账凭证','凭证管理','2026-07-24 12:14:08.347'),(3,'receivable','应收管理','应收管理','2026-07-24 12:14:08.347'),(4,'payable','应付付款','应付管理','2026-07-24 12:14:08.347'),(5,'report','报表管理','报表管理','2026-07-24 12:14:08.347'),(6,'tax','纳税申报','税务管理','2026-07-24 12:14:08.347');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_reconciliation_items`
--

DROP TABLE IF EXISTS `platform_reconciliation_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_reconciliation_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `settlement_id` bigint NOT NULL,
  `order_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform_amount` decimal(18,2) NOT NULL,
  `system_amount` decimal(18,2) NOT NULL,
  `diff_amount` decimal(18,2) NOT NULL,
  `diff_reason` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolution` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `platform_reconciliation_items_settlement_id_idx` (`settlement_id`),
  KEY `platform_reconciliation_items_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_reconciliation_items`
--

LOCK TABLES `platform_reconciliation_items` WRITE;
/*!40000 ALTER TABLE `platform_reconciliation_items` DISABLE KEYS */;
INSERT INTO `platform_reconciliation_items` VALUES (7,1,'TB20250600123',2999.00,2999.00,0.00,'无差异','自动匹配','resolved','2026-07-24 12:14:08.371','2025-06-30 18:00:00.000'),(8,1,'TB20250600188',1580.00,1280.00,300.00,'优惠券分摊差异','人工复核确认','resolved','2026-07-24 12:14:08.371','2025-06-30 18:00:00.000'),(9,2,'DY20250600765',899.00,899.00,0.00,'无差异','自动匹配','resolved','2026-07-24 12:14:08.371','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `platform_reconciliation_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_settlements`
--

DROP TABLE IF EXISTS `platform_settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_settlements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `settlement_entity_id` bigint NOT NULL,
  `platform` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `batch_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_orders` int NOT NULL DEFAULT '0',
  `matched_orders` int NOT NULL DEFAULT '0',
  `match_rate` decimal(10,4) DEFAULT NULL,
  `total_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `diff_count` int NOT NULL DEFAULT '0',
  `diff_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `platform_settlements_platform_idx` (`platform`),
  KEY `platform_settlements_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_settlements`
--

LOCK TABLES `platform_settlements` WRITE;
/*!40000 ALTER TABLE `platform_settlements` DISABLE KEYS */;
INSERT INTO `platform_settlements` VALUES (5,1,8,'天猫',1,'TB-2025H1-001',1820,1795,0.9900,15600000.00,25,4200.00,'confirmed','2026-07-24 12:14:08.370','2025-06-30 18:00:00.000'),(6,1,9,'抖音',1,'DY-2025H1-001',940,918,0.9800,8800000.00,22,3100.00,'confirmed','2026-07-24 12:14:08.370','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `platform_settlements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_profit_ranking`
--

DROP TABLE IF EXISTS `product_profit_ranking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_profit_ranking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `rank` int NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profit` decimal(18,2) NOT NULL,
  `margin` decimal(10,4) NOT NULL,
  `trend` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `product_profit_ranking_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_profit_ranking`
--

LOCK TABLES `product_profit_ranking` WRITE;
/*!40000 ALTER TABLE `product_profit_ranking` DISABLE KEYS */;
INSERT INTO `product_profit_ranking` VALUES (11,1,1,1,'人造石墨负极材料',1600000000.00,0.2600,'up','2026-07-24 12:14:08.405'),(12,1,1,2,'硅基负极材料',220000000.00,0.3100,'up','2026-07-24 12:14:08.405'),(13,1,1,3,'磷酸铁锂正极材料',165000000.00,0.1200,'down','2026-07-24 12:14:08.405');
/*!40000 ALTER TABLE `product_profit_ranking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profit_details`
--

DROP TABLE IF EXISTS `profit_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profit_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `section` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `percentage` decimal(10,4) DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `profit_details_fiscal_period_id_idx` (`fiscal_period_id`),
  KEY `profit_details_parent_id_idx` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profit_details`
--

LOCK TABLES `profit_details` WRITE;
/*!40000 ALTER TABLE `profit_details` DISABLE KEYS */;
INSERT INTO `profit_details` VALUES (78,1,1,'收入构成','负极材料',6279269956.85,0.8000,NULL,1,'2026-07-24 12:14:08.379'),(79,1,1,'收入构成','正极材料',1417670665.23,0.1800,NULL,2,'2026-07-24 12:14:08.379'),(80,1,1,'收入构成','其他品种',64368860.00,0.0100,NULL,3,'2026-07-24 12:14:08.379'),(81,1,1,'收入构成','其他业务收入',76336745.96,0.0100,NULL,4,'2026-07-24 12:14:08.379'),(82,1,1,'成本与费用构成','营业成本',6066650863.45,0.7700,NULL,10,'2026-07-24 12:14:08.379'),(83,1,1,'成本与费用构成','税金及附加',45331896.31,0.0100,NULL,11,'2026-07-24 12:14:08.379'),(84,1,1,'成本与费用构成','销售费用',32729045.44,0.0000,NULL,12,'2026-07-24 12:14:08.379'),(85,1,1,'成本与费用构成','管理费用',402108911.92,0.0500,NULL,13,'2026-07-24 12:14:08.379'),(86,1,1,'成本与费用构成','研发费用',400677909.46,0.0500,NULL,14,'2026-07-24 12:14:08.379'),(87,1,1,'成本与费用构成','财务费用',224157149.77,0.0300,NULL,15,'2026-07-24 12:14:08.379'),(88,1,1,'成本与费用构成','所得税费用',102715045.62,0.0100,NULL,16,'2026-07-24 12:14:08.379');
/*!40000 ALTER TABLE `profit_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receivable_aging_snapshots`
--

DROP TABLE IF EXISTS `receivable_aging_snapshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receivable_aging_snapshots` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `aging_bucket` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `turnover_days` decimal(10,2) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `receivable_aging_snapshots_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receivable_aging_snapshots`
--

LOCK TABLES `receivable_aging_snapshots` WRITE;
/*!40000 ALTER TABLE `receivable_aging_snapshots` DISABLE KEYS */;
INSERT INTO `receivable_aging_snapshots` VALUES (13,1,1,'未到期',3000000000.00,45.20,'2026-07-24 12:14:08.388'),(14,1,1,'1-30天',1200000000.00,18.50,'2026-07-24 12:14:08.388'),(15,1,1,'31-60天',500000000.00,42.10,'2026-07-24 12:14:08.388'),(16,1,1,'60天以上',291807009.35,75.30,'2026-07-24 12:14:08.388');
/*!40000 ALTER TABLE `receivable_aging_snapshots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `risk_exceptions`
--

DROP TABLE IF EXISTS `risk_exceptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `risk_exceptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `exception_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `risk_level` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detected_at` datetime(3) NOT NULL,
  `assignee` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `resolution` text COLLATE utf8mb4_unicode_ci,
  `resolved_at` datetime(3) DEFAULT NULL,
  `resolved_by` bigint DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `risk_exceptions_exception_type_idx` (`exception_type`),
  KEY `risk_exceptions_risk_level_idx` (`risk_level`),
  KEY `risk_exceptions_status_idx` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `risk_exceptions`
--

LOCK TABLES `risk_exceptions` WRITE;
/*!40000 ALTER TABLE `risk_exceptions` DISABLE KEYS */;
INSERT INTO `risk_exceptions` VALUES (4,1,'应收逾期','部分客户账款逾期超60天','国轩高科等客户应收账款逾期，存在回收风险','high','2025-06-30 09:00:00.000','陈静','processing',NULL,NULL,NULL,'2026-07-24 12:14:08.410','2025-06-30 18:00:00.000',NULL),(5,1,'资金风险','经营活动现金流净额为负','2025H1经营现金流-3.39亿元，需关注资金周转','mid','2025-06-30 10:00:00.000','黄友元','open',NULL,NULL,NULL,'2026-07-24 12:14:08.410','2025-06-30 18:00:00.000',NULL),(6,1,'存货','存货规模同比上升','存货42.42亿元，较期初增26.9%，关注跌价风险','mid','2025-06-30 11:00:00.000','孙明','open',NULL,NULL,NULL,'2026-07-24 12:14:08.410','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `risk_exceptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `risk_indicators`
--

DROP TABLE IF EXISTS `risk_indicators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `risk_indicators` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `indicator_group` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `indicator_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `indicator_value` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_range` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assessment` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_warning` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `risk_indicators_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `risk_indicators`
--

LOCK TABLES `risk_indicators` WRITE;
/*!40000 ALTER TABLE `risk_indicators` DISABLE KEYS */;
INSERT INTO `risk_indicators` VALUES (10,1,1,'偿债能力','资产负债率','57.75%','≤65%','达标',0,'2026-07-24 12:14:08.412'),(11,1,1,'营运能力','应收账款周转率','1.7110','≥1.5','达标',0,'2026-07-24 12:14:08.412'),(12,1,1,'盈利能力','销售净利率','7.50%','≥8%','偏慢',1,'2026-07-24 12:14:08.412'),(13,1,1,'偿债能力','到期应付覆盖率','-14.11%','≥100%','偏高',1,'2026-07-24 12:14:08.412');
/*!40000 ALTER TABLE `risk_indicators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_permissions_role_id_permission_id_key` (`role_id`,`permission_id`)
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (125,1,1,'2026-07-24 12:14:08.348'),(126,1,2,'2026-07-24 12:14:08.348'),(127,1,3,'2026-07-24 12:14:08.348'),(128,1,4,'2026-07-24 12:14:08.348'),(129,1,5,'2026-07-24 12:14:08.348'),(130,1,6,'2026-07-24 12:14:08.348'),(131,2,1,'2026-07-24 12:14:08.348'),(132,2,2,'2026-07-24 12:14:08.348'),(133,2,3,'2026-07-24 12:14:08.348'),(134,2,4,'2026-07-24 12:14:08.348'),(135,2,5,'2026-07-24 12:14:08.348'),(136,3,2,'2026-07-24 12:14:08.348'),(137,3,3,'2026-07-24 12:14:08.348');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_code_key` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'财务负责人','finance_lead','集团财务负责人，拥有全部财务权限','2026-07-24 12:14:08.346','2025-06-30 18:00:00.000'),(2,'财务专员','finance_clerk','日常制单、凭证录入','2026-07-24 12:14:08.346','2025-06-30 18:00:00.000'),(3,'出纳','cashier','收付款、银行对账','2026-07-24 12:14:08.346','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settlement_entities`
--

DROP TABLE IF EXISTS `settlement_entities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settlement_entities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `settlement_entities_company_id_idx` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settlement_entities`
--

LOCK TABLES `settlement_entities` WRITE;
/*!40000 ALTER TABLE `settlement_entities` DISABLE KEYS */;
INSERT INTO `settlement_entities` VALUES (1,1,'江苏新能源','公司','active','2026-07-24 12:14:08.354','2025-06-30 18:00:00.000',NULL),(2,1,'常州贝特瑞','公司','active','2026-07-24 12:14:08.354','2025-06-30 18:00:00.000',NULL),(3,1,'惠州贝特瑞','公司','active','2026-07-24 12:14:08.354','2025-06-30 18:00:00.000',NULL),(4,1,'四川瑞鞍','公司','active','2026-07-24 12:14:08.354','2025-06-30 18:00:00.000',NULL),(5,1,'天津贝特瑞','公司','active','2026-07-24 12:14:08.354','2025-06-30 18:00:00.000',NULL),(6,1,'印尼贝特瑞','公司','active','2026-07-24 12:14:08.354','2025-06-30 18:00:00.000',NULL),(7,1,'地中海负极','公司','active','2026-07-24 12:14:08.354','2025-06-30 18:00:00.000',NULL),(8,1,'天猫贝特瑞旗舰店','平台','active','2026-07-24 12:14:08.354','2025-06-30 18:00:00.000',NULL),(9,1,'抖音贝特瑞官方店','平台','active','2026-07-24 12:14:08.354','2025-06-30 18:00:00.000',NULL),(10,1,'贝特瑞官方商城','店铺','active','2026-07-24 12:14:08.354','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `settlement_entities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solvency_indicators`
--

DROP TABLE IF EXISTS `solvency_indicators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solvency_indicators` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `indicator_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `indicator_value` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `solvency_indicators_fiscal_period_id_idx` (`fiscal_period_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solvency_indicators`
--

LOCK TABLES `solvency_indicators` WRITE;
/*!40000 ALTER TABLE `solvency_indicators` DISABLE KEYS */;
INSERT INTO `solvency_indicators` VALUES (16,1,1,'流动比率','1.4220','充足','2026-07-24 12:14:08.394'),(17,1,1,'速动比率','1.0425','充足','2026-07-24 12:14:08.394'),(18,1,1,'资产负债率','0.5775','达标','2026-07-24 12:14:08.394'),(19,1,1,'到期应付覆盖率','-0.1411','偏高','2026-07-24 12:14:08.394');
/*!40000 ALTER TABLE `solvency_indicators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `source_vouchers`
--

DROP TABLE IF EXISTS `source_vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `source_vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `settlement_entity_id` bigint DEFAULT NULL,
  `voucher_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_description` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `business_date` date NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `included_documents` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `risk_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待确认',
  `business_entity` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `counterparty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `handler_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `handler_department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待制证',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CNY',
  `file_url` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raw_data_json` json DEFAULT NULL,
  `recognition_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `source` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'smart',
  `voucher_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `source_vouchers_company_id_idx` (`company_id`),
  KEY `source_vouchers_status_idx` (`status`),
  KEY `source_vouchers_business_date_idx` (`business_date`),
  KEY `source_vouchers_recognition_status_idx` (`recognition_status`),
  KEY `source_vouchers_voucher_id_idx` (`voucher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `source_vouchers`
--

LOCK TABLES `source_vouchers` WRITE;
/*!40000 ALTER TABLE `source_vouchers` DISABLE KEYS */;
INSERT INTO `source_vouchers` VALUES (15,1,5,'YSPZ-202506-00128','负极材料销售收款-天津贝特瑞','2025-06-12',56300000.00,'发票1张/出库单1张','资料完整','天津贝特瑞','宁德时代新能源科技股份有限公司','陈静','销售部','已完成','2026-07-24 12:14:08.358','2025-06-30 18:00:00.000',NULL,NULL,'CNY',NULL,NULL,'pending','smart',NULL),(16,1,4,'YSPZ-202506-00145','针状焦采购付款-四川瑞鞍','2025-05-28',86000000.00,'采购订单/增值税专用发票','补贴待确认','四川瑞鞍','江西紫宸科技有限公司','王强','采购部','已完成','2026-07-24 12:14:08.358','2025-06-30 18:00:00.000',NULL,NULL,'CNY',NULL,NULL,'pending','smart',NULL),(17,1,3,'YSPZ-202506-00160','惠州基地设备折旧计提','2025-06-30',58300000.00,'资产卡片清单','资料完整','惠州贝特瑞','内部结转','孙明','总部财务部','已归档','2026-07-24 12:14:08.358','2025-06-30 18:00:00.000',NULL,NULL,'CNY',NULL,NULL,'pending','smart',NULL),(18,1,NULL,'YS1785136083363','微信图片_20250201191043.jpg','2026-07-27',12.00,NULL,'资料完整',NULL,NULL,NULL,NULL,'已制证','2026-07-27 07:08:03.373','2026-07-27 07:11:08.070',NULL,NULL,'CNY','https://java-hce.oss-cn-beijing.aliyuncs.com/collected-documents/720875ea-2c8d-49e3-974b-27421fb20ed5.jpeg','{\"币种\": \"CNY\", \"金额\": \"12\", \"单据编号\": \"微信图片_20250201191043.jpg\", \"发生日期\": \"2026-07-27\", \"对方单位\": \"\"}','recognized','smart',23),(19,1,NULL,'YS1785136329935','微信图片_20250202191806.jpg','2026-07-27',12.00,NULL,'待确认',NULL,NULL,NULL,NULL,'待制证','2026-07-27 07:12:09.937','2026-07-28 02:31:13.572',NULL,NULL,'CNY','https://java-hce.oss-cn-beijing.aliyuncs.com/collected-documents/ca769ece-f174-4300-8a04-4e9ca3d060be.jpeg','{\"币种\": \"CNY\", \"金额\": \"12\", \"单据编号\": \"微信图片_20250202191806.jpg\", \"发生日期\": \"2026-07-27\", \"对方单位\": \"\"}','recognized','smart',NULL),(20,1,NULL,'YS1785141787304','_26332000004021728676 2.pdf','2026-07-27',12.00,NULL,'待确认',NULL,NULL,NULL,NULL,'待制证','2026-07-27 08:43:07.315','2026-07-27 08:43:07.315',NULL,NULL,'CNY','https://java-hce.oss-cn-beijing.aliyuncs.com/collected-documents/80a9fd59-335c-4aac-8778-cd7a05586700.pdf','{\"币种\": \"CNY\", \"金额\": \"12\", \"单据编号\": \"_26332000004021728676 2.pdf\", \"发生日期\": \"2026-07-27\", \"对方单位\": \"\"}','recognized','smart',NULL),(21,1,NULL,'26332000004021728676','*计算机配套产品*内存条','2026-05-15',458.89,NULL,'资料完整',NULL,'杭州新易联科技有限公司',NULL,NULL,'已制证','2026-07-27 13:26:12.333','2026-07-27 14:30:29.081',NULL,'哈哈','CNY','https://java-hce.oss-cn-beijing.aliyuncs.com/collected-documents/04138ec6-41e6-4514-8ce2-7f13815edcfa.png','{\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"叶飞花\", \"remarks\": \"天猫光威4798514666125731904\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"52.79\", \"sellerName\": \"杭州新易联科技有限公司\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年05月15日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"458.89\", \"passwordArea\": \"\", \"invoiceNumber\": \"26332000004021728676\", \"purchaserName\": \"浙江农林大学\", \"invoiceDetails\": [{\"tax\": \"52.79\", \"unit\": \"条\", \"amount\": \"406.10\", \"taxRate\": \"13%\", \"itemName\": \"*计算机配套产品*内存条\", \"quantity\": \"1\", \"unitPrice\": \"406.0973451327434\", \"specification\": \"5600DDR524GB(12GBx2)\"}], \"sellerTaxNumber\": \"91330106MAD2L33G5A\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"123300004700050170\", \"totalAmountInWords\": \"肆佰伍拾捌圆捌角玖分\", \"invoiceAmountPreTax\": \"406.10\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26332000004021728676,458.89,20260515,,3050\", \"type\": \"QRcode\", \"points\": [{\"x\": 35, \"y\": 32}, {\"x\": 150, \"y\": 32}, {\"x\": 150, \"y\": 149}, {\"x\": 35, \"y\": 149}]}], \"ftype\": 0, \"width\": 1190, \"height\": 793, \"orgWidth\": 1190, \"orgHeight\": 793, \"sliceRect\": {\"x0\": 17, \"x1\": 1168, \"x2\": 1171, \"x3\": 15, \"y0\": 26, \"y1\": 27, \"y2\": 761, \"y3\": 761}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26332000004021728676\", \"keyProb\": 99, \"valuePos\": [{\"x\": 944, \"y\": 34}, {\"x\": 1128, \"y\": 35}, {\"x\": 1128, \"y\": 55}, {\"x\": 944, \"y\": 54}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年05月15日\", \"keyProb\": 99, \"valuePos\": [{\"x\": 945, \"y\": 70}, {\"x\": 1073, \"y\": 70}, {\"x\": 1073, \"y\": 90}, {\"x\": 945, \"y\": 90}], \"valueProb\": 99}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"浙江农林大学\", \"keyProb\": 100, \"valuePos\": [{\"x\": 95, \"y\": 162}, {\"x\": 205, \"y\": 162}, {\"x\": 205, \"y\": 182}, {\"x\": 95, \"y\": 182}], \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"123300004700050170\", \"keyProb\": 99, \"valuePos\": [{\"x\": 288, \"y\": 217}, {\"x\": 551, \"y\": 217}, {\"x\": 551, \"y\": 246}, {\"x\": 288, \"y\": 246}], \"valueProb\": 99}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"406.10\", \"keyProb\": 99, \"valuePos\": [{\"x\": 784, \"y\": 492}, {\"x\": 856, \"y\": 492}, {\"x\": 856, \"y\": 511}, {\"x\": 784, \"y\": 511}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"52.79\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1087, \"y\": 492}, {\"x\": 1148, \"y\": 492}, {\"x\": 1148, \"y\": 511}, {\"x\": 1087, \"y\": 511}], \"valueProb\": 100}, {\"key\": \"totalAmountInWords\", \"value\": \"肆佰伍拾捌圆捌角玖分\", \"keyProb\": 100, \"valuePos\": [{\"x\": 336, \"y\": 526}, {\"x\": 522, \"y\": 525}, {\"x\": 522, \"y\": 548}, {\"x\": 337, \"y\": 550}], \"valueProb\": 100}, {\"key\": \"totalAmount\", \"value\": \"458.89\", \"keyProb\": 99, \"valuePos\": [{\"x\": 862, \"y\": 527}, {\"x\": 946, \"y\": 524}, {\"x\": 947, \"y\": 547}, {\"x\": 862, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"杭州新易联科技有限公司\", \"keyProb\": 100, \"valuePos\": [{\"x\": 659, \"y\": 161}, {\"x\": 863, \"y\": 161}, {\"x\": 863, \"y\": 185}, {\"x\": 659, \"y\": 185}], \"valueProb\": 100}, {\"key\": \"sellerTaxNumber\", \"value\": \"91330106MAD2L33G5A\", \"keyProb\": 99, \"valuePos\": [{\"x\": 858, \"y\": 218}, {\"x\": 1121, \"y\": 218}, {\"x\": 1121, \"y\": 246}, {\"x\": 858, \"y\": 246}], \"valueProb\": 99}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"叶飞花\", \"keyProb\": 99, \"valuePos\": [{\"x\": 161, \"y\": 705}, {\"x\": 223, \"y\": 705}, {\"x\": 223, \"y\": 729}, {\"x\": 161, \"y\": 729}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"天猫光威4798514666125731904\", \"keyProb\": 99, \"valuePos\": [{\"x\": 43, \"y\": 564}, {\"x\": 294, \"y\": 564}, {\"x\": 294, \"y\": 584}, {\"x\": 43, \"y\": 584}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 370, \"y\": 16}, {\"x\": 747, \"y\": 17}, {\"x\": 747, \"y\": 59}, {\"x\": 370, \"y\": 58}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 370, \"y\": 16}, {\"x\": 747, \"y\": 17}, {\"x\": 747, \"y\": 59}, {\"x\": 370, \"y\": 58}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*计算机配套产品*内存条\\\",\\\"specification\\\":\\\"5600DDR524GB(12GBx2)\\\",\\\"unit\\\":\\\"条\\\",\\\"quantity\\\":\\\"1\\\",\\\"unitPrice\\\":\\\"406.0973451327434\\\",\\\"amount\\\":\\\"406.10\\\",\\\"taxRate\\\":\\\"13%\\\",\\\"tax\\\":\\\"52.79\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}','已确认','smart',25),(22,1,NULL,'26332000004021728676','*计算机配套产品*内存条','2026-05-15',458.89,NULL,'待确认',NULL,'杭州新易联科技有限公司',NULL,NULL,'待制证','2026-07-27 15:33:34.013','2026-07-27 15:37:30.832',NULL,NULL,'CNY','https://java-hce.oss-cn-beijing.aliyuncs.com/collected-documents/f58cd259-e01e-4ce9-9990-27955025c093.png','{\"test\": true}','已确认','smart',NULL),(23,1,NULL,'26222000000278215261','*烟草制品*烟','2026-04-07',225.00,NULL,'待确认',NULL,'宽城区鼎欣便利店',NULL,NULL,'已制证','2026-07-27 15:49:48.223','2026-07-27 15:51:18.411',NULL,NULL,'CNY','https://java-hce.oss-cn-beijing.aliyuncs.com/collected-documents/5adc74e5-8fae-4502-8202-a94c9f3d265d.jpeg','{\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"王淮\", \"remarks\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"2.23\", \"sellerName\": \"宽城区鼎欣便利店\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年04月07日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"225.00\", \"passwordArea\": \"\", \"invoiceNumber\": \"26222000000278215261\", \"purchaserName\": \"\", \"invoiceDetails\": [{\"tax\": \"2.23\", \"unit\": \"\", \"amount\": \"222.77\", \"taxRate\": \"1%\", \"itemName\": \"*烟草制品*烟\", \"quantity\": \"\", \"unitPrice\": \"\", \"specification\": \"\"}], \"sellerTaxNumber\": \"92220103MA150LA12D\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"\", \"totalAmountInWords\": \"贰佰贰拾伍圆整\", \"invoiceAmountPreTax\": \"222.77\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26222000000278215261,225.00,20260407,,CBC1\", \"type\": \"QRcode\", \"points\": [{\"x\": 38, \"y\": 227}, {\"x\": 164, \"y\": 227}, {\"x\": 164, \"y\": 353}, {\"x\": 38, \"y\": 353}]}], \"ftype\": 0, \"width\": 1254, \"height\": 1032, \"orgWidth\": 1254, \"orgHeight\": 1032, \"sliceRect\": {\"x0\": 16, \"x1\": 1246, \"x2\": 1246, \"x3\": 16, \"y0\": 213, \"y1\": 210, \"y2\": 997, \"y3\": 999}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26222000000278215261\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1001, \"y\": 47}, {\"x\": 1194, \"y\": 48}, {\"x\": 1194, \"y\": 68}, {\"x\": 1001, \"y\": 67}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年04月07日\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1001, \"y\": 82}, {\"x\": 1139, \"y\": 82}, {\"x\": 1139, \"y\": 106}, {\"x\": 1001, \"y\": 106}], \"valueProb\": 100}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"222.77\", \"keyProb\": 99, \"valuePos\": [{\"x\": 833, \"y\": 529}, {\"x\": 907, \"y\": 529}, {\"x\": 907, \"y\": 549}, {\"x\": 833, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"2.23\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1164, \"y\": 530}, {\"x\": 1218, \"y\": 530}, {\"x\": 1218, \"y\": 549}, {\"x\": 1164, \"y\": 549}], \"valueProb\": 100}, {\"key\": \"totalAmountInWords\", \"value\": \"贰佰贰拾伍圆整\", \"keyProb\": 99, \"valuePos\": [{\"x\": 361, \"y\": 563}, {\"x\": 499, \"y\": 563}, {\"x\": 499, \"y\": 589}, {\"x\": 361, \"y\": 589}], \"valueProb\": 99}, {\"key\": \"totalAmount\", \"value\": \"225.00\", \"keyProb\": 99, \"valuePos\": [{\"x\": 914, \"y\": 565}, {\"x\": 1005, \"y\": 563}, {\"x\": 1005, \"y\": 587}, {\"x\": 915, \"y\": 588}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"宽城区鼎欣便利店\", \"keyProb\": 99, \"valuePos\": [{\"x\": 703, \"y\": 181}, {\"x\": 860, \"y\": 181}, {\"x\": 860, \"y\": 206}, {\"x\": 703, \"y\": 206}], \"valueProb\": 99}, {\"key\": \"sellerTaxNumber\", \"value\": \"92220103MA150LA12D\", \"keyProb\": 100, \"valuePos\": [{\"x\": 911, \"y\": 240}, {\"x\": 1189, \"y\": 240}, {\"x\": 1189, \"y\": 270}, {\"x\": 911, \"y\": 270}], \"valueProb\": 100}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"王淮\", \"keyProb\": 99, \"valuePos\": [{\"x\": 176, \"y\": 754}, {\"x\": 219, \"y\": 754}, {\"x\": 219, \"y\": 778}, {\"x\": 176, \"y\": 778}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"keyProb\": 99, \"valuePos\": [{\"x\": 51, \"y\": 602}, {\"x\": 831, \"y\": 602}, {\"x\": 831, \"y\": 645}, {\"x\": 51, \"y\": 645}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*烟草制品*烟\\\",\\\"specification\\\":\\\"\\\",\\\"unit\\\":\\\"\\\",\\\"quantity\\\":\\\"\\\",\\\"unitPrice\\\":\\\"\\\",\\\"amount\\\":\\\"222.77\\\",\\\"taxRate\\\":\\\"1%\\\",\\\"tax\\\":\\\"2.23\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}','已确认','smart',26),(24,1,NULL,'26222000000278215261','*烟草制品*烟','2026-04-07',225.00,NULL,'待确认',NULL,'宽城区鼎欣便利店',NULL,NULL,'待制证','2026-07-28 02:26:18.535','2026-07-28 02:26:37.714',NULL,NULL,'CNY','https://java-hce.oss-cn-beijing.aliyuncs.com/collected-documents/da3c85f7-1941-4e91-a713-1816cfe8a0dc.jpeg','{\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"王淮\", \"remarks\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"2.23\", \"sellerName\": \"宽城区鼎欣便利店\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年04月07日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"225.00\", \"passwordArea\": \"\", \"invoiceNumber\": \"26222000000278215261\", \"purchaserName\": \"\", \"invoiceDetails\": [{\"tax\": \"2.23\", \"unit\": \"\", \"amount\": \"222.77\", \"taxRate\": \"1%\", \"itemName\": \"*烟草制品*烟\", \"quantity\": \"\", \"unitPrice\": \"\", \"specification\": \"\"}], \"sellerTaxNumber\": \"92220103MA150LA12D\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"\", \"totalAmountInWords\": \"贰佰贰拾伍圆整\", \"invoiceAmountPreTax\": \"222.77\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26222000000278215261,225.00,20260407,,CBC1\", \"type\": \"QRcode\", \"points\": [{\"x\": 38, \"y\": 227}, {\"x\": 164, \"y\": 227}, {\"x\": 164, \"y\": 353}, {\"x\": 38, \"y\": 353}]}], \"ftype\": 0, \"width\": 1254, \"height\": 1032, \"orgWidth\": 1254, \"orgHeight\": 1032, \"sliceRect\": {\"x0\": 16, \"x1\": 1246, \"x2\": 1246, \"x3\": 16, \"y0\": 213, \"y1\": 210, \"y2\": 997, \"y3\": 999}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26222000000278215261\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1001, \"y\": 47}, {\"x\": 1194, \"y\": 48}, {\"x\": 1194, \"y\": 68}, {\"x\": 1001, \"y\": 67}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年04月07日\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1001, \"y\": 82}, {\"x\": 1139, \"y\": 82}, {\"x\": 1139, \"y\": 106}, {\"x\": 1001, \"y\": 106}], \"valueProb\": 100}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"222.77\", \"keyProb\": 99, \"valuePos\": [{\"x\": 833, \"y\": 529}, {\"x\": 907, \"y\": 529}, {\"x\": 907, \"y\": 549}, {\"x\": 833, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"2.23\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1164, \"y\": 530}, {\"x\": 1218, \"y\": 530}, {\"x\": 1218, \"y\": 549}, {\"x\": 1164, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"totalAmountInWords\", \"value\": \"贰佰贰拾伍圆整\", \"keyProb\": 99, \"valuePos\": [{\"x\": 361, \"y\": 563}, {\"x\": 499, \"y\": 563}, {\"x\": 499, \"y\": 589}, {\"x\": 361, \"y\": 589}], \"valueProb\": 99}, {\"key\": \"totalAmount\", \"value\": \"225.00\", \"keyProb\": 99, \"valuePos\": [{\"x\": 914, \"y\": 565}, {\"x\": 1005, \"y\": 563}, {\"x\": 1005, \"y\": 587}, {\"x\": 915, \"y\": 588}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"宽城区鼎欣便利店\", \"keyProb\": 99, \"valuePos\": [{\"x\": 703, \"y\": 181}, {\"x\": 860, \"y\": 181}, {\"x\": 860, \"y\": 206}, {\"x\": 703, \"y\": 206}], \"valueProb\": 99}, {\"key\": \"sellerTaxNumber\", \"value\": \"92220103MA150LA12D\", \"keyProb\": 99, \"valuePos\": [{\"x\": 911, \"y\": 240}, {\"x\": 1189, \"y\": 240}, {\"x\": 1189, \"y\": 270}, {\"x\": 911, \"y\": 270}], \"valueProb\": 99}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"王淮\", \"keyProb\": 99, \"valuePos\": [{\"x\": 176, \"y\": 754}, {\"x\": 219, \"y\": 754}, {\"x\": 219, \"y\": 778}, {\"x\": 176, \"y\": 778}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"keyProb\": 99, \"valuePos\": [{\"x\": 51, \"y\": 602}, {\"x\": 831, \"y\": 602}, {\"x\": 831, \"y\": 645}, {\"x\": 51, \"y\": 645}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*烟草制品*烟\\\",\\\"specification\\\":\\\"\\\",\\\"unit\\\":\\\"\\\",\\\"quantity\\\":\\\"\\\",\\\"unitPrice\\\":\\\"\\\",\\\"amount\\\":\\\"222.77\\\",\\\"taxRate\\\":\\\"1%\\\",\\\"tax\\\":\\\"2.23\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}','已确认','smart',NULL),(25,1,NULL,'26222000000278215261','*烟草制品*烟','2026-04-07',225.00,NULL,'待确认',NULL,'宽城区鼎欣便利店',NULL,NULL,'待制证','2026-07-28 02:27:15.233','2026-07-28 02:27:45.754',NULL,NULL,'CNY','https://java-hce.oss-cn-beijing.aliyuncs.com/collected-documents/ec40a86a-ca01-4774-903f-bc88407172a4.jpeg','{\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"王淮\", \"remarks\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"2.23\", \"sellerName\": \"宽城区鼎欣便利店\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年04月07日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"225.00\", \"passwordArea\": \"\", \"invoiceNumber\": \"26222000000278215261\", \"purchaserName\": \"\", \"invoiceDetails\": [{\"tax\": \"2.23\", \"unit\": \"\", \"amount\": \"222.77\", \"taxRate\": \"1%\", \"itemName\": \"*烟草制品*烟\", \"quantity\": \"\", \"unitPrice\": \"\", \"specification\": \"\"}], \"sellerTaxNumber\": \"92220103MA150LA12D\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"\", \"totalAmountInWords\": \"贰佰贰拾伍圆整\", \"invoiceAmountPreTax\": \"222.77\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26222000000278215261,225.00,20260407,,CBC1\", \"type\": \"QRcode\", \"points\": [{\"x\": 38, \"y\": 227}, {\"x\": 164, \"y\": 227}, {\"x\": 164, \"y\": 353}, {\"x\": 38, \"y\": 353}]}], \"ftype\": 0, \"width\": 1254, \"height\": 1032, \"orgWidth\": 1254, \"orgHeight\": 1032, \"sliceRect\": {\"x0\": 16, \"x1\": 1246, \"x2\": 1246, \"x3\": 16, \"y0\": 213, \"y1\": 210, \"y2\": 997, \"y3\": 999}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26222000000278215261\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1001, \"y\": 47}, {\"x\": 1194, \"y\": 48}, {\"x\": 1194, \"y\": 68}, {\"x\": 1001, \"y\": 67}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年04月07日\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1001, \"y\": 82}, {\"x\": 1139, \"y\": 82}, {\"x\": 1139, \"y\": 106}, {\"x\": 1001, \"y\": 106}], \"valueProb\": 100}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"222.77\", \"keyProb\": 99, \"valuePos\": [{\"x\": 833, \"y\": 529}, {\"x\": 907, \"y\": 529}, {\"x\": 907, \"y\": 549}, {\"x\": 833, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"2.23\", \"keyProb\": 99, \"valuePos\": [{\"x\": 1164, \"y\": 530}, {\"x\": 1218, \"y\": 530}, {\"x\": 1218, \"y\": 549}, {\"x\": 1164, \"y\": 549}], \"valueProb\": 99}, {\"key\": \"totalAmountInWords\", \"value\": \"贰佰贰拾伍圆整\", \"keyProb\": 99, \"valuePos\": [{\"x\": 361, \"y\": 563}, {\"x\": 499, \"y\": 563}, {\"x\": 499, \"y\": 589}, {\"x\": 361, \"y\": 589}], \"valueProb\": 99}, {\"key\": \"totalAmount\", \"value\": \"225.00\", \"keyProb\": 99, \"valuePos\": [{\"x\": 914, \"y\": 565}, {\"x\": 1005, \"y\": 563}, {\"x\": 1005, \"y\": 587}, {\"x\": 915, \"y\": 588}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"宽城区鼎欣便利店\", \"keyProb\": 99, \"valuePos\": [{\"x\": 703, \"y\": 181}, {\"x\": 860, \"y\": 181}, {\"x\": 860, \"y\": 206}, {\"x\": 703, \"y\": 206}], \"valueProb\": 99}, {\"key\": \"sellerTaxNumber\", \"value\": \"92220103MA150LA12D\", \"keyProb\": 99, \"valuePos\": [{\"x\": 911, \"y\": 240}, {\"x\": 1189, \"y\": 240}, {\"x\": 1189, \"y\": 270}, {\"x\": 911, \"y\": 270}], \"valueProb\": 99}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"王淮\", \"keyProb\": 99, \"valuePos\": [{\"x\": 176, \"y\": 754}, {\"x\": 219, \"y\": 754}, {\"x\": 219, \"y\": 778}, {\"x\": 176, \"y\": 778}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"销方开户银行:吉林银行股份有限公司长春青年路支行;银行账号:6231310101010033278;收款人:牟思羽;复核人:夏占蕊\", \"keyProb\": 99, \"valuePos\": [{\"x\": 51, \"y\": 602}, {\"x\": 831, \"y\": 602}, {\"x\": 831, \"y\": 645}, {\"x\": 51, \"y\": 645}], \"valueProb\": 99}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 394, \"y\": 27}, {\"x\": 795, \"y\": 28}, {\"x\": 795, \"y\": 75}, {\"x\": 394, \"y\": 74}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*烟草制品*烟\\\",\\\"specification\\\":\\\"\\\",\\\"unit\\\":\\\"\\\",\\\"quantity\\\":\\\"\\\",\\\"unitPrice\\\":\\\"\\\",\\\"amount\\\":\\\"222.77\\\",\\\"taxRate\\\":\\\"1%\\\",\\\"tax\\\":\\\"2.23\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}','待核对','smart',NULL),(26,1,NULL,'26352000001124849656','*信息化学品*拍立得相纸胶卷','2026-05-08',123.00,NULL,'待确认',NULL,'泉州市达芬崎电子商务有限公司',NULL,NULL,'待制证','2026-07-28 02:29:16.299','2026-07-28 02:29:23.126',NULL,NULL,'CNY','https://java-hce.oss-cn-beijing.aliyuncs.com/collected-documents/53bef116-f104-4c4b-89c4-06748b377b27.jpeg','{\"data\": {\"title\": \"电子发票（普通发票）\", \"drawer\": \"黄建轮\", \"remarks\": \"\", \"formType\": \"\", \"reviewer\": \"\", \"checkCode\": \"\", \"recipient\": \"\", \"invoiceTax\": \"1.22\", \"sellerName\": \"泉州市达芬崎电子商务有限公司\", \"specialTag\": \"\", \"invoiceCode\": \"\", \"invoiceDate\": \"2026年05月08日\", \"invoiceType\": \"数电普通发票\", \"machineCode\": \"\", \"totalAmount\": \"123.00\", \"passwordArea\": \"\", \"invoiceNumber\": \"26352000001124849656\", \"purchaserName\": \"徐彬\", \"invoiceDetails\": [{\"tax\": \"1.22\", \"unit\": \"\", \"amount\": \"121.78\", \"taxRate\": \"1%\", \"itemName\": \"*信息化学品*拍立得相纸胶卷\", \"quantity\": \"\", \"unitPrice\": \"\", \"specification\": \"FUJIFILM富士mini\"}], \"sellerTaxNumber\": \"91350503MAK6675L48\", \"sellerContactInfo\": \"\", \"printedInvoiceCode\": \"\", \"purchaserTaxNumber\": \"\", \"totalAmountInWords\": \"壹佰贰拾叁圆整\", \"invoiceAmountPreTax\": \"121.78\", \"printedInvoiceNumber\": \"\", \"purchaserContactInfo\": \"\", \"sellerBankAccountInfo\": \"\", \"purchaserBankAccountInfo\": \"\"}, \"angle\": 0, \"codes\": [{\"data\": \"01,32,,26352000001124849656,123.00,20260508,,940E\", \"type\": \"QRcode\", \"points\": [{\"x\": 31, \"y\": 841}, {\"x\": 137, \"y\": 841}, {\"x\": 137, \"y\": 947}, {\"x\": 31, \"y\": 947}]}], \"ftype\": 0, \"width\": 1080, \"height\": 2347, \"orgWidth\": 1080, \"orgHeight\": 2347, \"sliceRect\": {\"x0\": 3, \"x1\": 1080, \"x2\": 1080, \"x3\": 2, \"y0\": 819, \"y1\": 820, \"y2\": 1518, \"y3\": 1519}, \"algo_version\": \"\", \"prism_keyValueInfo\": [{\"key\": \"invoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceNumber\", \"value\": \"26352000001124849656\", \"keyProb\": 99, \"valuePos\": [{\"x\": 867, \"y\": 49}, {\"x\": 1035, \"y\": 50}, {\"x\": 1035, \"y\": 68}, {\"x\": 867, \"y\": 68}], \"valueProb\": 99}, {\"key\": \"printedInvoiceCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"printedInvoiceNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDate\", \"value\": \"2026年05月08日\", \"keyProb\": 100, \"valuePos\": [{\"x\": 868, \"y\": 81}, {\"x\": 985, \"y\": 81}, {\"x\": 985, \"y\": 99}, {\"x\": 868, \"y\": 99}], \"valueProb\": 100}, {\"key\": \"machineCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"checkCode\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserName\", \"value\": \"徐彬\", \"keyProb\": 100, \"valuePos\": [{\"x\": 98, \"y\": 165}, {\"x\": 133, \"y\": 165}, {\"x\": 133, \"y\": 184}, {\"x\": 98, \"y\": 184}], \"valueProb\": 100}, {\"key\": \"purchaserTaxNumber\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"purchaserBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"passwordArea\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceAmountPreTax\", \"value\": \"121.78\", \"keyProb\": 99, \"valuePos\": [{\"x\": 723, \"y\": 465}, {\"x\": 787, \"y\": 465}, {\"x\": 787, \"y\": 482}, {\"x\": 723, \"y\": 482}], \"valueProb\": 99}, {\"key\": \"invoiceTax\", \"value\": \"1.22\", \"keyProb\": 100, \"valuePos\": [{\"x\": 1006, \"y\": 465}, {\"x\": 1054, \"y\": 465}, {\"x\": 1054, \"y\": 482}, {\"x\": 1006, \"y\": 482}], \"valueProb\": 100}, {\"key\": \"totalAmountInWords\", \"value\": \"壹佰贰拾叁圆整\", \"keyProb\": 99, \"valuePos\": [{\"x\": 319, \"y\": 495}, {\"x\": 437, \"y\": 495}, {\"x\": 437, \"y\": 517}, {\"x\": 319, \"y\": 517}], \"valueProb\": 99}, {\"key\": \"totalAmount\", \"value\": \"123.00\", \"keyProb\": 99, \"valuePos\": [{\"x\": 794, \"y\": 496}, {\"x\": 870, \"y\": 496}, {\"x\": 870, \"y\": 515}, {\"x\": 794, \"y\": 515}], \"valueProb\": 99}, {\"key\": \"sellerName\", \"value\": \"泉州市达芬崎电子商务有限公司\", \"keyProb\": 99, \"valuePos\": [{\"x\": 611, \"y\": 165}, {\"x\": 843, \"y\": 165}, {\"x\": 843, \"y\": 185}, {\"x\": 611, \"y\": 185}], \"valueProb\": 99}, {\"key\": \"sellerTaxNumber\", \"value\": \"91350503MAK6675L48\", \"keyProb\": 100, \"valuePos\": [{\"x\": 790, \"y\": 217}, {\"x\": 1027, \"y\": 217}, {\"x\": 1027, \"y\": 241}, {\"x\": 790, \"y\": 241}], \"valueProb\": 100}, {\"key\": \"sellerContactInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"sellerBankAccountInfo\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"recipient\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"reviewer\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"drawer\", \"value\": \"黄建轮\", \"keyProb\": 99, \"valuePos\": [{\"x\": 159, \"y\": 659}, {\"x\": 212, \"y\": 659}, {\"x\": 212, \"y\": 679}, {\"x\": 159, \"y\": 679}], \"valueProb\": 99}, {\"key\": \"remarks\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"title\", \"value\": \"电子发票（普通发票）\", \"keyProb\": 99, \"valuePos\": [{\"x\": 346, \"y\": 34}, {\"x\": 690, \"y\": 33}, {\"x\": 690, \"y\": 71}, {\"x\": 347, \"y\": 73}], \"valueProb\": 99}, {\"key\": \"formType\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceType\", \"value\": \"数电普通发票\", \"keyProb\": 99, \"valuePos\": [{\"x\": 346, \"y\": 34}, {\"x\": 690, \"y\": 33}, {\"x\": 690, \"y\": 71}, {\"x\": 347, \"y\": 73}], \"valueProb\": 99}, {\"key\": \"specialTag\", \"value\": \"\", \"keyProb\": 100, \"valueProb\": 100}, {\"key\": \"invoiceDetails\", \"value\": \"[{\\\"itemName\\\":\\\"*信息化学品*拍立得相纸胶卷\\\",\\\"specification\\\":\\\"FUJIFILM富士mini\\\",\\\"unit\\\":\\\"\\\",\\\"quantity\\\":\\\"\\\",\\\"unitPrice\\\":\\\"\\\",\\\"amount\\\":\\\"121.78\\\",\\\"taxRate\\\":\\\"1%\\\",\\\"tax\\\":\\\"1.22\\\"}]\", \"keyProb\": 100, \"valueProb\": 100}]}','已确认','smart',NULL);
/*!40000 ALTER TABLE `source_vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_payables`
--

DROP TABLE IF EXISTS `supplier_payables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_payables` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `supplier_id` bigint NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `overdue_days` int NOT NULL DEFAULT '0',
  `aging_bucket` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supplier_payables_supplier_id_idx` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_payables`
--

LOCK TABLES `supplier_payables` WRITE;
/*!40000 ALTER TABLE `supplier_payables` DISABLE KEYS */;
INSERT INTO `supplier_payables` VALUES (18,1,1,972207806.04,'2025-01-20',0,'未到期','closed','2026-07-24 12:14:08.391','2025-06-30 18:00:00.000',NULL),(19,1,2,972207806.04,'2025-02-20',0,'未到期','closed','2026-07-24 12:14:08.391','2025-06-30 18:00:00.000',NULL),(20,1,3,972207806.04,'2025-03-20',0,'未到期','closed','2026-07-24 12:14:08.391','2025-06-30 18:00:00.000',NULL),(21,1,4,972207806.04,'2025-04-20',12,'1-30天','open','2026-07-24 12:14:08.391','2025-06-30 18:00:00.000',NULL),(22,1,5,972207806.03,'2025-05-20',40,'31-60天','open','2026-07-24 12:14:08.391','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `supplier_payables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `suppliers_company_id_idx` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (18,1,'江西紫宸科技有限公司','联系人1','0791-660000','供应商地址1','9136000000000X','active','2026-07-24 12:14:08.390','2025-06-30 18:00:00.000',NULL),(19,1,'上海杉杉科技有限公司','联系人2','0791-661001','供应商地址2','9136000010010X','active','2026-07-24 12:14:08.390','2025-06-30 18:00:00.000',NULL),(20,1,'东莞市翔丰华电池材料有限公司','联系人3','0791-662002','供应商地址3','9136000020020X','active','2026-07-24 12:14:08.390','2025-06-30 18:00:00.000',NULL),(21,1,'湖南中科电气股份有限公司','联系人4','0791-663003','供应商地址4','9136000030030X','active','2026-07-24 12:14:08.390','2025-06-30 18:00:00.000',NULL),(22,1,'山西贝特瑞新能源科技有限公司','联系人5','0791-664004','供应商地址5','9136000040040X','active','2026-07-24 12:14:08.390','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_connections`
--

DROP TABLE IF EXISTS `system_connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_connections` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `connection_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_tone` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sync_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sync_tone` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_label` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_sync_at` datetime(3) DEFAULT NULL,
  `auth_expires_at` date DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `system_connections_company_id_idx` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_connections`
--

LOCK TABLES `system_connections` WRITE;
/*!40000 ALTER TABLE `system_connections` DISABLE KEYS */;
INSERT INTO `system_connections` VALUES (1,1,'用友U8','erp','已授权','success','总账/供应链模块已对接','最近同步 2小时前','success','重新同步','2025-06-30 08:00:00.000','2026-06-30','2026-07-24 12:14:08.413','2025-06-30 18:00:00.000',NULL),(2,1,'金蝶云星空','erp','已授权','success','合并报表模块已对接','最近同步 1小时前','success','重新同步','2025-06-30 09:00:00.000','2026-06-30','2026-07-24 12:14:08.413','2025-06-30 18:00:00.000',NULL),(3,1,'工商银行直连','bank','需续期','warning','企业网银API授权即将到期','授权 2025-08-01 到期','warning','去续期','2025-06-29 22:00:00.000','2025-08-01','2026-07-24 12:14:08.413','2025-06-30 18:00:00.000',NULL),(4,1,'天猫/淘宝','ecommerce','已授权','success','官方旗舰店订单同步','最近同步 30分钟前','success','重新同步','2025-06-30 11:30:00.000','2026-06-30','2026-07-24 12:14:08.413','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `system_connections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_filings`
--

DROP TABLE IF EXISTS `tax_filings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_filings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `tax_type` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `form_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `form_detail` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_period_from` date NOT NULL,
  `tax_period_to` date NOT NULL,
  `filing_deadline` date NOT NULL,
  `output_tax` decimal(18,2) DEFAULT NULL,
  `input_tax` decimal(18,2) DEFAULT NULL,
  `tax_payable` decimal(18,2) DEFAULT NULL,
  `tax_diff` decimal(18,2) DEFAULT NULL,
  `diff_note` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待复核',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tax_filings_fiscal_period_id_idx` (`fiscal_period_id`),
  KEY `tax_filings_status_idx` (`status`),
  KEY `tax_filings_tax_type_idx` (`tax_type`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_filings`
--

LOCK TABLES `tax_filings` WRITE;
/*!40000 ALTER TABLE `tax_filings` DISABLE KEYS */;
INSERT INTO `tax_filings` VALUES (17,1,1,'增','增值税及附加税费申报表','附列资料（一）（二）','2025-06-01','2025-06-30','2025-07-15',139000000.00,49000000.00,39367256.90,0.00,'账票一致','已申报','2026-07-24 12:14:08.380','2025-06-30 18:00:00.000',NULL),(18,1,1,'企','企业所得税月（季）度预缴申报表','A类','2025-04-01','2025-06-30','2025-07-15',NULL,NULL,39367256.90,0.00,'与利润表勾稽一致','已申报','2026-07-24 12:14:08.380','2025-06-30 18:00:00.000',NULL),(19,1,1,'印','印花税纳税申报表','购销合同','2025-06-01','2025-06-30','2025-07-15',NULL,NULL,39367256.90,0.00,'','已申报','2026-07-24 12:14:08.380','2025-06-30 18:00:00.000',NULL),(20,1,1,'个','个人所得税扣缴申报表','工资薪金','2025-06-01','2025-06-30','2025-07-15',NULL,NULL,39367256.90,0.00,'','已申报','2026-07-24 12:14:08.380','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `tax_filings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trial_balances`
--

DROP TABLE IF EXISTS `trial_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trial_balances` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `fiscal_period_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `opening_debit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `opening_credit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `current_debit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `current_credit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `accum_debit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `accum_credit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `ending_debit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `ending_credit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `ending_direction` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_parent` tinyint(1) NOT NULL DEFAULT '0',
  `is_balanced` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trial_balances_fiscal_period_id_subject_id_key` (`fiscal_period_id`,`subject_id`)
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trial_balances`
--

LOCK TABLES `trial_balances` WRITE;
/*!40000 ALTER TABLE `trial_balances` DISABLE KEYS */;
INSERT INTO `trial_balances` VALUES (91,1,1,1,200000.00,0.00,200000.00,0.00,200000.00,0.00,2000000.00,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(92,1,1,2,377825662.26,0.00,377825662.26,0.00,377825662.26,0.00,3491654637.81,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(93,1,1,3,11736627.68,0.00,11736627.68,0.00,11736627.68,0.00,138032947.28,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(94,1,1,4,0.00,4686062.65,0.00,4686062.65,0.00,4686062.65,104671.46,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(95,1,1,5,822089616.97,0.00,822089616.97,0.00,822089616.97,0.00,4991807009.35,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(96,1,1,6,0.00,249405700.55,0.00,249405700.55,0.00,249405700.55,754978284.39,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(97,1,1,7,90265030.29,0.00,90265030.29,0.00,90265030.29,0.00,282128025.31,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(98,1,1,8,0.00,11325866.69,0.00,11325866.69,0.00,11325866.69,73147577.86,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(99,1,1,9,898377782.15,0.00,898377782.15,0.00,898377782.15,0.00,4242446791.89,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(100,1,1,10,64051880.75,0.00,64051880.75,0.00,64051880.75,0.00,1921709692.91,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(101,1,1,11,941052.97,0.00,941052.97,0.00,941052.97,0.00,304049780.41,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(102,1,1,12,0.00,9483617.65,0.00,9483617.65,0.00,9483617.65,394831395.92,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(103,1,1,13,0.00,2095950.28,0.00,2095950.28,0.00,2095950.28,115450641.37,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(104,1,1,14,407107343.52,0.00,407107343.52,0.00,407107343.52,0.00,12289566279.00,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(105,1,1,15,0.00,467009850.36,0.00,467009850.36,0.00,467009850.36,2941540215.06,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(106,1,1,16,5349301.33,0.00,5349301.33,0.00,5349301.33,0.00,336624425.16,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(107,1,1,17,0.00,21536787.35,0.00,21536787.35,0.00,21536787.35,1101787836.65,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(108,1,1,18,0.00,13869343.35,0.00,13869343.35,0.00,13869343.35,153527150.64,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(109,1,1,19,61844451.31,0.00,61844451.31,0.00,61844451.31,0.00,552142055.98,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(110,1,1,20,0.00,347122495.69,0.00,347122495.69,0.00,347122495.69,872984096.10,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(111,1,1,21,0.00,345818769.08,0.00,345818769.08,0.00,345818769.08,0.00,1901332741.65,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(112,1,1,22,0.00,321922.00,0.00,321922.00,0.00,321922.00,0.00,321922.00,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(113,1,1,23,41694034.54,0.00,41694034.54,0.00,41694034.54,0.00,0.00,1123592619.29,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(114,1,1,24,809807808.55,0.00,809807808.55,0.00,809807808.55,0.00,0.00,4861039030.19,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(115,1,1,25,159296.37,0.00,159296.37,0.00,159296.37,0.00,0.00,1139596.77,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(116,1,1,26,0.00,4659588.14,0.00,4659588.14,0.00,4659588.14,0.00,39621008.40,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(117,1,1,27,0.00,10479709.48,0.00,10479709.48,0.00,10479709.48,0.00,261299265.54,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(118,1,1,28,68169090.52,0.00,68169090.52,0.00,68169090.52,0.00,0.00,157469027.60,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(119,1,1,29,33075615.06,0.00,33075615.06,0.00,33075615.06,0.00,0.00,429592972.92,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(120,1,1,30,0.00,749151882.47,0.00,749151882.47,0.00,749151882.47,0.00,2402219761.85,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(121,1,1,31,621043.12,0.00,621043.12,0.00,621043.12,0.00,0.00,2763842.80,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(122,1,1,32,0.00,730511883.04,0.00,730511883.04,0.00,730511883.04,0.00,6570014282.31,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(123,1,1,33,0.00,25255633.96,0.00,25255633.96,0.00,25255633.96,0.00,297317421.86,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(124,1,1,34,0.00,1536884.48,0.00,1536884.48,0.00,1536884.48,0.00,7424281.51,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(125,1,1,35,0.00,105201122.58,0.00,105201122.58,0.00,105201122.58,0.00,913142896.11,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(126,1,1,36,5790378.13,0.00,5790378.13,0.00,5790378.13,0.00,0.00,183860194.43,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(127,1,1,37,0.00,222955865.69,0.00,222955865.69,0.00,222955865.69,0.00,1036405533.20,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(128,1,1,38,0.00,0.00,0.00,0.00,0.00,0.00,0.00,1127338649.00,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(129,1,1,39,83271915.34,0.00,83271915.34,0.00,83271915.34,0.00,0.00,3855047948.65,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(130,1,1,40,0.00,0.00,0.00,0.00,0.00,0.00,173201681.53,0.00,'借',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(131,1,1,41,0.00,847072.69,0.00,847072.69,0.00,847072.69,0.00,1417334.14,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(132,1,1,42,162147.27,0.00,162147.27,0.00,162147.27,0.00,0.00,4802650.86,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(133,1,1,43,0.00,0.00,0.00,0.00,0.00,0.00,0.00,412285589.68,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(134,1,1,44,0.00,31363261.66,0.00,31363261.66,0.00,31363261.66,0.00,6948347116.17,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000'),(135,1,1,45,0.00,427900808.29,0.00,427900808.29,0.00,427900808.29,0.00,2595919509.15,'贷',0,1,'2026-07-24 12:14:08.376','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `trial_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_id` bigint NOT NULL,
  `employee_id` bigint DEFAULT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login_at` datetime(3) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_key` (`username`),
  KEY `users_company_id_idx` (`company_id`),
  KEY `users_employee_id_idx` (`employee_id`),
  KEY `users_role_idx` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,2,'huangyy','$2a$10$seed_seed_seed_seed_seed_seed_seed_seed_se','黄友元','财务负责人',NULL,NULL,1,'2026-07-24 12:14:08.344','2025-06-30 18:00:00.000',NULL),(2,1,3,'liuzw','$2a$10$seed_seed_seed_seed_seed_seed_seed_seed_se','刘志文','财务专员',NULL,NULL,1,'2026-07-24 12:14:08.344','2025-06-30 18:00:00.000',NULL),(3,1,4,'lina','$2a$10$seed_seed_seed_seed_seed_seed_seed_seed_se','李娜','出纳',NULL,NULL,1,'2026-07-24 12:14:08.344','2025-06-30 18:00:00.000',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_business_facts`
--

DROP TABLE IF EXISTS `voucher_business_facts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_business_facts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint NOT NULL,
  `purchase_content` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contract_order_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inspection_receipt_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_total` decimal(18,2) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `voucher_business_facts_voucher_id_idx` (`voucher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_business_facts`
--

LOCK TABLES `voucher_business_facts` WRITE;
/*!40000 ALTER TABLE `voucher_business_facts` DISABLE KEYS */;
INSERT INTO `voucher_business_facts` VALUES (9,1,'锂离子电池负极材料','1,260吨','江苏·天津','PO-2025-NCM-0421','RK-20250612-07','44139200012345',56300000.00,'2026-07-24 12:14:08.359','2025-06-30 18:00:00.000'),(10,2,'油系针状焦','5,000吨','四川·眉山','PO-2025-COKE-0188','RK-20250528-03','44139200012890',86000000.00,'2026-07-24 12:14:08.359','2025-06-30 18:00:00.000');
/*!40000 ALTER TABLE `voucher_business_facts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_entries`
--

DROP TABLE IF EXISTS `voucher_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  `summary` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `debit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `credit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `direction` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `voucher_entries_voucher_id_idx` (`voucher_id`),
  KEY `voucher_entries_subject_id_idx` (`subject_id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_entries`
--

LOCK TABLES `voucher_entries` WRITE;
/*!40000 ALTER TABLE `voucher_entries` DISABLE KEYS */;
INSERT INTO `voucher_entries` VALUES (33,1,2,'货款入账',56300000.00,0.00,'借',1,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(34,1,5,'冲减应收账款',0.00,56300000.00,'贷',2,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(35,2,24,'支付采购款',86000000.00,0.00,'借',1,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(36,2,2,'银行存款支付',0.00,86000000.00,'贷',2,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(37,3,50,'折旧费用',58300000.00,0.00,'借',1,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(38,3,14,'累计折旧（固定资产）',0.00,58300000.00,'贷',2,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(39,4,50,'职工薪酬',261299265.54,0.00,'借',1,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(40,4,27,'应付职工薪酬',0.00,261299265.54,'贷',2,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(41,5,47,'结转成本',6066650863.45,0.00,'借',1,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(42,5,9,'库存商品结转',0.00,6066650863.45,'贷',2,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(43,6,28,'缴纳增值税',90000000.00,0.00,'借',1,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(44,6,2,'银行存款支付',0.00,90000000.00,'贷',2,'2026-07-24 12:14:08.363','2025-06-30 18:00:00.000'),(45,21,3,NULL,11.00,0.00,'借',1,'2026-07-27 05:22:39.531','2026-07-27 05:22:39.531'),(46,21,5,NULL,0.00,11.00,'贷',2,'2026-07-27 05:22:39.531','2026-07-27 05:22:39.531'),(47,22,2,NULL,11.00,0.00,'借',1,'2026-07-27 05:43:38.522','2026-07-27 05:43:38.522'),(48,22,4,NULL,0.00,11.00,'贷',2,'2026-07-27 05:43:38.522','2026-07-27 05:43:38.522'),(49,23,4,NULL,12.00,0.00,'借',1,'2026-07-27 07:11:08.068','2026-07-27 07:11:08.068'),(50,23,4,NULL,0.00,12.00,'贷',2,'2026-07-27 07:11:08.068','2026-07-27 07:11:08.068'),(51,24,3,NULL,12.00,0.00,'借',1,'2026-07-27 07:13:18.824','2026-07-27 07:13:18.824'),(52,24,3,NULL,0.00,12.00,'贷',2,'2026-07-27 07:13:18.824','2026-07-27 07:13:18.824'),(53,25,3,NULL,458.89,0.00,'借',1,'2026-07-27 14:30:29.077','2026-07-27 14:30:29.077'),(54,25,4,NULL,0.00,458.89,'贷',2,'2026-07-27 14:30:29.077','2026-07-27 14:30:29.077'),(55,26,3,NULL,225.00,0.00,'借',1,'2026-07-27 15:51:18.409','2026-07-27 15:51:18.409'),(56,26,4,NULL,0.00,225.00,'贷',2,'2026-07-27 15:51:18.409','2026-07-27 15:51:18.409');
/*!40000 ALTER TABLE `voucher_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_signatures`
--

DROP TABLE IF EXISTS `voucher_signatures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_signatures` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint NOT NULL,
  `signer_id` bigint NOT NULL,
  `signed_at` datetime(3) NOT NULL,
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `voucher_signatures_voucher_id_idx` (`voucher_id`),
  KEY `voucher_signatures_signer_id_idx` (`signer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_signatures`
--

LOCK TABLES `voucher_signatures` WRITE;
/*!40000 ALTER TABLE `voucher_signatures` DISABLE KEYS */;
INSERT INTO `voucher_signatures` VALUES (7,1,3,'2025-06-12 10:30:00.000','已到账','货款已收妥','2026-07-24 12:14:08.364'),(8,2,3,'2025-05-28 15:10:00.000','已支付','采购款已付','2026-07-24 12:14:08.364'),(9,6,3,'2025-06-20 09:20:00.000','已支付','税款已缴','2026-07-24 12:14:08.364');
/*!40000 ALTER TABLE `voucher_signatures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_verification_results`
--

DROP TABLE IF EXISTS `voucher_verification_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_verification_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint NOT NULL,
  `check_item` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_passed` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `voucher_verification_results_voucher_id_idx` (`voucher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_verification_results`
--

LOCK TABLES `voucher_verification_results` WRITE;
/*!40000 ALTER TABLE `voucher_verification_results` DISABLE KEYS */;
INSERT INTO `voucher_verification_results` VALUES (11,1,'发票真伪校验',1,'2026-07-24 12:14:08.360','2025-06-30 18:00:00.000'),(12,1,'合同一致性校验',1,'2026-07-24 12:14:08.360','2025-06-30 18:00:00.000'),(13,1,'审批流完整性',1,'2026-07-24 12:14:08.360','2025-06-30 18:00:00.000'),(14,2,'发票真伪校验',1,'2026-07-24 12:14:08.360','2025-06-30 18:00:00.000'),(15,2,'预算占用校验',1,'2026-07-24 12:14:08.360','2025-06-30 18:00:00.000'),(16,18,'资料完整，所有单据核对一致',1,'2026-07-27 07:08:25.895','2026-07-27 07:08:25.895'),(17,21,'资料完整，所有单据核对一致',1,'2026-07-27 14:26:28.168','2026-07-27 14:26:28.168');
/*!40000 ALTER TABLE `voucher_verification_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'finance_cloud'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-28 16:44:21
