/*
 Navicat Premium Dump SQL

 Source Server         : 票务系统
 Source Server Type    : MySQL
 Source Server Version : 80046 (8.0.46)
 Source Host           : localhost:3307
 Source Schema         : ticketing

 Target Server Type    : MySQL
 Target Server Version : 80046 (8.0.46)
 File Encoding         : 65001

 Date: 07/06/2026 15:03:41
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin_user
-- ----------------------------
DROP TABLE IF EXISTS `admin_user`;
CREATE TABLE `admin_user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `merchant_id` int NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `admin_user_username_key`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admin_user
-- ----------------------------
INSERT INTO `admin_user` VALUES (1, 'admin', '$2a$10$RSE9X8DuvgPr/.Gl3.0gouiPgRJ4Nmrx5Vt3hHxS..JL0Yxj0UpX6', 'admin', 1, 'active', '2026-05-31 10:23:15.554', '2026-05-31 10:23:15.554');

-- ----------------------------
-- Table structure for ai_chat_log
-- ----------------------------
DROP TABLE IF EXISTS `ai_chat_log`;
CREATE TABLE `ai_chat_log`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `session_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_input` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ai_reply` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `intent` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `actions_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `latency_ms` int NULL DEFAULT NULL,
  `prompt_tokens` int NOT NULL DEFAULT 0,
  `completion_tokens` int NOT NULL DEFAULT 0,
  `total_tokens` int NOT NULL DEFAULT 0,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'success',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ai_chat_log
-- ----------------------------
INSERT INTO `ai_chat_log` VALUES (1, NULL, NULL, '听说应天门夜景极其壮丽，怎么买票？', '好的！应天门（隋唐洛阳城应天门遗址）的夜景确实美轮美奂，灯光映照下的恢弘城楼非常有穿越盛唐的感觉。我这就帮您拉起购票入口——', 'ticket_booking', '[{\"type\": \"show_ticket\", \"ticketTypeId\": 11, \"ticketName\": \"隋唐洛阳城应天门成人票\", \"price\": \"60\", \"date\": null, \"ticketCount\": 1}]', 6105, 0, 0, 0, 'success', '2026-06-07 06:44:25.121');
INSERT INTO `ai_chat_log` VALUES (2, NULL, NULL, '听说应天门夜景极其壮丽，怎么买票？', '应天门的夜景确实令人叹为观止，灯光映照下的隋唐风貌格外震撼！我这就帮您进入购票流程～', 'ticket_booking', '[{\"type\": \"show_ticket\", \"ticketTypeId\": 11, \"ticketName\": \"隋唐洛阳城应天门成人票\", \"price\": \"60\", \"date\": null, \"ticketCount\": 1}]', 5541, 0, 0, 0, 'success', '2026-06-07 06:56:29.434');
INSERT INTO `ai_chat_log` VALUES (3, NULL, NULL, '想看龙门石窟大佛，有推荐票吗？', '龙门石窟可是世界文化遗产，那尊卢舍那大佛确实震撼人心，依山而凿、慈悲庄严，亲眼见到比照片里更有冲击力！整个西山石窟群也很壮观，建议留出至少半天慢慢逛。\n\n关于门票类型，景区一般有全价票和半价优惠票，具体票价和是否有联票、导览服务等，以官方页面实时展示为准哦。\n\n如果你想现在就订票，告诉我**计划哪天去**、**要几张票**，我马上帮你下单～ 😊', 'recommendation', '[]', 12878, 0, 0, 0, 'success', '2026-06-07 06:56:50.440');
INSERT INTO `ai_chat_log` VALUES (4, NULL, NULL, '白马寺适合半日游吗？', '白马寺非常适合半日游！🏛️\n\n白马寺位于洛阳，有「中国第一古刹」之称，是中国第一座官办佛教寺院，规模适中、布局紧凑，**2.5～3小时**就能逛得比较从容。\n\n**半日游推荐路线：**\n- **山门 → 天王殿 → 大雄宝殿**（核心中轴线，感受千年古刹的厚重）\n- **齐云塔院**（寺内标志性古塔，值得绕塔一周）\n- **国际佛殿区**（泰国、缅甸、印度风格佛殿，拍照很出片）\n\n**小贴士：**\n- 上午去光线好，人也相对少，游览体验更佳\n- 逛完正好中午，可以去洛阳老城喝碗牛肉汤，半日行程完美收尾\n- 具体开放时间和票价建议以页面展示或官方信息为准哦\n\n如果有需要，随时告诉我，我可以帮你看看门票预订～', 'itinerary', '[]', 10633, 0, 0, 0, 'success', '2026-06-07 06:57:17.221');
INSERT INTO `ai_chat_log` VALUES (5, NULL, NULL, '我想去龙门石窟', '龙门石窟是中国四大石窟之一，位于河南洛阳，被誉为“世界石刻艺术宝库”，非常值得一游！👏\n\n**🌟 亮点推荐：**\n- **奉先寺卢舍那大佛**：龙门石窟的象征，气势恢宏，据说佛面是按照武则天的容貌雕刻的。\n- **万佛洞**：洞内密密麻麻雕刻了上万尊小佛，精妙绝伦。\n- **古阳洞**：龙门最早开凿的石窟，书法爱好者必看，内有著名的“龙门二十品”碑刻。\n- **夜游龙门**：如果时间合适，夜场灯光映照下的大佛别有一番震撼美。\n\n**📍 游玩路线建议：**\n西山石窟（精华集中）→ 东山石窟 → 香山寺 → 白园，全程约3-4小时。\n\n**🔔 小贴士：**\n- 建议上午去，光线正好打在卢舍那大佛上，拍照效果最佳。\n- 穿舒适的鞋子，沿伊河两岸步行路程较长。\n\n请问您是计划去龙门石窟游玩吗？如果需要**购买门票**，可以告诉我游玩日期和人数，我马上帮您处理～', 'chat', '[]', 14476, 0, 0, 0, 'success', '2026-06-07 06:58:17.366');
INSERT INTO `ai_chat_log` VALUES (6, NULL, NULL, '???????????????', '您好呀！😊 看起来您可能还在思考想问什么。我是您的旅游小助手，可以帮您：\n\n- 🏞️ **推荐景区**和游玩路线\n- 🎫 **协助购票**（告诉我想去哪个景点就好）\n- 📋 **提供游玩注意事项**\n\n有什么可以帮您的吗？尽管说～', 'chat', '[]', 4320, 0, 0, 0, 'success', '2026-06-07 07:01:30.287');
INSERT INTO `ai_chat_log` VALUES (7, NULL, NULL, '想看龙门石窟大佛，有推荐票吗？', '龙门石窟确实值得一去！卢舍那大佛是龙门石窟的精华所在，位于西山石窟的奉先寺，佛像高17米多，面容宁静慈悲，非常震撼。\n\n关于门票方面，龙门石窟一般提供以下类型供参考：\n\n- **常规门票**：包含西山石窟、东山石窟、香山寺、白园四大区域，卢舍那大佛就在西山石窟。\n- **夜游票**：部分季节会开放夜游，灯光映衬下的大佛别有一番韵味。\n\n不过具体的票价、实时开放信息和余票情况，还是建议以官方页面展示为准，这样最准确。\n\n如果你计划好了游玩日期和人数，可以告诉我，我可以帮你拉起购票入口 😊 请问你打算哪天去、几个人呢？', 'recommendation', '[]', 11991, 0, 0, 0, 'success', '2026-06-07 07:02:57.552');
INSERT INTO `ai_chat_log` VALUES (8, NULL, NULL, '白马寺适合半日游吗？', '白马寺非常适合半日游！它位于洛阳，是中国第一座佛教寺院，有\"中国第一古刹\"之称。\n\n**半日游的亮点：**\n- **核心游览区**：山门、天王殿、大佛殿、大雄宝殿、接引殿、清凉台等，大约1.5-2小时就能逛完。\n- **国际佛殿区**：寺内还有泰国、缅甸、印度风格的佛殿，异域风情十足，很出片。\n- **齐云塔院**：寺外东侧有座金代古塔，步行几分钟就到，值得顺路看看。\n\n**建议时间安排：**\n上午或下午各安排2.5-3小时就够了，节奏轻松不赶。白马寺离洛阳市区约半小时车程，可以搭配龙门石窟或洛阳博物馆凑成一日游。\n\n如果你打算去的话，想了解门票相关的事情吗？', 'itinerary', '[]', 8016, 0, 0, 0, 'success', '2026-06-07 07:03:11.527');

-- ----------------------------
-- Table structure for ai_feedback
-- ----------------------------
DROP TABLE IF EXISTS `ai_feedback`;
CREATE TABLE `ai_feedback`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `chat_log_id` int NOT NULL,
  `user_id` int NULL DEFAULT NULL,
  `rating` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ai_feedback
-- ----------------------------

-- ----------------------------
-- Table structure for ai_inspiration
-- ----------------------------
DROP TABLE IF EXISTS `ai_inspiration`;
CREATE TABLE `ai_inspiration`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prompt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ai_inspiration
-- ----------------------------
INSERT INTO `ai_inspiration` VALUES (1, '两天洛阳文化游', '帮我安排两天洛阳文化游，并推荐适合购买的门票', 10, 'active', '2026-06-07 05:53:57.661', '2026-06-07 05:53:57.661');
INSERT INTO `ai_inspiration` VALUES (2, '龙门石窟购票', '我想买龙门石窟门票，有什么推荐？', 20, 'active', '2026-06-07 05:53:57.661', '2026-06-07 05:53:57.661');

-- ----------------------------
-- Table structure for ai_knowledge_item
-- ----------------------------
DROP TABLE IF EXISTS `ai_knowledge_item`;
CREATE TABLE `ai_knowledge_item`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `embedding_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ai_knowledge_item
-- ----------------------------

-- ----------------------------
-- Table structure for ai_persona_config
-- ----------------------------
DROP TABLE IF EXISTS `ai_persona_config`;
CREATE TABLE `ai_persona_config`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '洛灵儿',
  `welcome_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `system_prompt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `temperature` decimal(4, 2) NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `updated_at` datetime(3) NOT NULL ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ai_persona_config
-- ----------------------------
INSERT INTO `ai_persona_config` VALUES (1, '洛灵儿', '你好，我是洛灵儿，可以帮你规划洛阳游玩路线和购票。', '保持亲和、准确、合规，不编造实时票价和库存。', 'deepseek-v4-pro', 0.40, 'active', '2026-06-07 05:53:57.667');

-- ----------------------------
-- Table structure for check_record
-- ----------------------------
DROP TABLE IF EXISTS `check_record`;
CREATE TABLE `check_record`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `card_id` int NULL DEFAULT NULL,
  `project_id` int NOT NULL,
  `gate_id` int NOT NULL,
  `check_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `result` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fail_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `checked_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of check_record
-- ----------------------------

-- ----------------------------
-- Table structure for gate
-- ----------------------------
DROP TABLE IF EXISTS `gate`;
CREATE TABLE `gate`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` int NOT NULL,
  `location` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of gate
-- ----------------------------

-- ----------------------------
-- Table structure for member_card
-- ----------------------------
DROP TABLE IF EXISTS `member_card`;
CREATE TABLE `member_card`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `card_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `card_type_id` int NOT NULL,
  `user_id` int NOT NULL,
  `balance` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `remaining_uses` int NOT NULL DEFAULT 0,
  `activated_at` datetime(3) NULL DEFAULT NULL,
  `expire_at` datetime(3) NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `member_card_card_no_key`(`card_no` ASC) USING BTREE,
  INDEX `member_card_card_type_id_fkey`(`card_type_id` ASC) USING BTREE,
  CONSTRAINT `member_card_card_type_id_fkey` FOREIGN KEY (`card_type_id`) REFERENCES `member_card_type` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of member_card
-- ----------------------------

-- ----------------------------
-- Table structure for member_card_type
-- ----------------------------
DROP TABLE IF EXISTS `member_card_type`;
CREATE TABLE `member_card_type`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `validity_days` int NOT NULL,
  `total_uses` int NULL DEFAULT NULL,
  `project_limits` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `anti_fraud_interval` int NOT NULL DEFAULT 0,
  `swipe_purchase_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of member_card_type
-- ----------------------------

-- ----------------------------
-- Table structure for merchant
-- ----------------------------
DROP TABLE IF EXISTS `merchant`;
CREATE TABLE `merchant`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of merchant
-- ----------------------------
INSERT INTO `merchant` VALUES (1, '默认商户', '{}', 'active', '2026-05-31 10:23:15.485', '2026-05-31 10:23:15.485');

-- ----------------------------
-- Table structure for miniapp_payment
-- ----------------------------
DROP TABLE IF EXISTS `miniapp_payment`;
CREATE TABLE `miniapp_payment`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `order_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `prepay_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `pay_amount` decimal(10, 2) NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `callback_payload` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `paid_at` datetime(3) NULL DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `miniapp_payment_order_id_key`(`order_id` ASC) USING BTREE,
  INDEX `miniapp_payment_user_id_fkey`(`user_id` ASC) USING BTREE,
  CONSTRAINT `miniapp_payment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `miniapp_user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of miniapp_payment
-- ----------------------------
INSERT INTO `miniapp_payment` VALUES (1, 1, 'ORD20260607177353', 4, 'mock_prepay_ORD20260607177353', NULL, 180.00, 'pending', NULL, NULL, '2026-06-07 04:14:13.044', '2026-06-07 04:14:13.044');
INSERT INTO `miniapp_payment` VALUES (2, 2, 'ORD20260607426911', 5, 'mock_prepay_ORD20260607426911', NULL, 120.00, 'pending', NULL, NULL, '2026-06-07 06:56:01.608', '2026-06-07 06:56:01.608');

-- ----------------------------
-- Table structure for miniapp_user
-- ----------------------------
DROP TABLE IF EXISTS `miniapp_user`;
CREATE TABLE `miniapp_user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unionid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `last_login_at` datetime(3) NULL DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `miniapp_user_openid_key`(`openid` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of miniapp_user
-- ----------------------------
INSERT INTO `miniapp_user` VALUES (1, 'mock_1f8af9932dd81dd434dc8773', NULL, NULL, NULL, NULL, 'active', '2026-06-07 03:52:57.401', '2026-06-07 03:52:57.418', '2026-06-07 03:52:57.418');
INSERT INTO `miniapp_user` VALUES (2, 'mock_cde1680fdfda3bb5dc9695ee', NULL, NULL, '测试旅人', NULL, 'active', '2026-06-07 04:11:51.538', '2026-06-07 04:11:35.542', '2026-06-07 04:11:51.540');
INSERT INTO `miniapp_user` VALUES (3, 'mock_934963fcd89fd96858a5caff', NULL, NULL, '测试旅人', NULL, 'active', '2026-06-07 04:12:09.323', '2026-06-07 04:12:09.324', '2026-06-07 04:12:09.324');
INSERT INTO `miniapp_user` VALUES (4, 'mock_86139e2eea9261a4b7e42b03', NULL, NULL, 'TestUser', NULL, 'active', '2026-06-07 04:14:12.899', '2026-06-07 04:14:12.901', '2026-06-07 04:14:12.901');
INSERT INTO `miniapp_user` VALUES (5, 'mock_56b90e9c8d1e201148dfef4c', NULL, NULL, NULL, NULL, 'active', '2026-06-07 06:56:01.427', '2026-06-07 06:56:01.474', '2026-06-07 06:56:01.474');

-- ----------------------------
-- Table structure for order
-- ----------------------------
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `ticket_type_id` int NOT NULL,
  `quantity` int NOT NULL,
  `visit_date` datetime(3) NULL DEFAULT NULL,
  `visitor_category` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'adult',
  `contact_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `total_amount` decimal(10, 2) NOT NULL,
  `pay_amount` decimal(10, 2) NOT NULL,
  `pay_method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pay_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `refund_amount` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `refunded_at` datetime(3) NULL DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `order_order_no_key`(`order_no` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order
-- ----------------------------
INSERT INTO `order` VALUES (1, 'ORD20260607177353', 4, 7, 2, '2026-06-10 00:00:00.000', 'adult', 'TestUser', '13800000000', 180.00, 180.00, 'wechat', 'unpaid', 'miniapp', 'pending', 0.00, NULL, '2026-06-07 04:14:13.028', '2026-06-07 04:14:13.028');
INSERT INTO `order` VALUES (2, 'ORD20260607426911', 5, 20, 1, NULL, 'adult', NULL, NULL, 120.00, 120.00, 'wechat', 'unpaid', 'miniapp', 'pending', 0.00, NULL, '2026-06-07 06:56:01.582', '2026-06-07 06:56:01.582');

-- ----------------------------
-- Table structure for ota_channel
-- ----------------------------
DROP TABLE IF EXISTS `ota_channel`;
CREATE TABLE `ota_channel`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `api_config_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ota_channel
-- ----------------------------
INSERT INTO `ota_channel` VALUES (1, 'douyin', NULL, 'active', '2026-06-07 06:34:51.382', '2026-06-07 06:34:51.382');
INSERT INTO `ota_channel` VALUES (2, 'douyin', NULL, 'active', '2026-06-07 06:35:05.242', '2026-06-07 06:35:05.242');

-- ----------------------------
-- Table structure for ota_product_mapping
-- ----------------------------
DROP TABLE IF EXISTS `ota_product_mapping`;
CREATE TABLE `ota_product_mapping`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel_id` int NOT NULL,
  `local_ticket_id` int NOT NULL,
  `remote_product_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remote_product_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `retail_price` decimal(10, 2) NOT NULL,
  `settlement_price` decimal(10, 2) NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ota_product_mapping_channel_id_fkey`(`channel_id` ASC) USING BTREE,
  CONSTRAINT `ota_product_mapping_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `ota_channel` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ota_product_mapping
-- ----------------------------
INSERT INTO `ota_product_mapping` VALUES (1, 1, 7, 'DY-LM-001', 'Douyin Longmen Adult Ticket', 90.00, 82.00, 'active', '2026-06-07 06:43:10.907', '2026-06-07 06:43:10.907');
INSERT INTO `ota_product_mapping` VALUES (2, 1, 7, 'DY-LM-001', 'Douyin Longmen Adult Ticket', 90.00, 82.00, 'active', '2026-06-07 06:45:38.361', '2026-06-07 06:45:38.361');

-- ----------------------------
-- Table structure for ota_sync_log
-- ----------------------------
DROP TABLE IF EXISTS `ota_sync_log`;
CREATE TABLE `ota_sync_log`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel_id` int NOT NULL,
  `order_id` int NULL DEFAULT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `local_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `remote_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `synced_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ota_sync_log_channel_id_fkey`(`channel_id` ASC) USING BTREE,
  CONSTRAINT `ota_sync_log_channel_id_fkey` FOREIGN KEY (`channel_id`) REFERENCES `ota_channel` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ota_sync_log
-- ----------------------------
INSERT INTO `ota_sync_log` VALUES (1, 1, NULL, 'verify', 'verified', 'pending', '2026-06-07 06:43:10.956', '2026-06-07 06:43:10.956');
INSERT INTO `ota_sync_log` VALUES (2, 1, NULL, 'verify', 'verified', 'pending', '2026-06-07 06:45:38.401', '2026-06-07 06:45:38.401');
INSERT INTO `ota_sync_log` VALUES (3, 1, NULL, 'verify', 'verified', 'pending', '2026-06-07 06:46:02.136', '2026-06-07 06:46:02.136');

-- ----------------------------
-- Table structure for project
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of project
-- ----------------------------
INSERT INTO `project` VALUES (7, '龙门石窟', '河南省洛阳市洛龙区龙门中街', 'active', '2026-06-07 03:44:42.732', '2026-06-07 03:44:42.732');
INSERT INTO `project` VALUES (8, '白马寺', '河南省洛阳市瀍河回族区洛白路', 'active', '2026-06-07 03:44:42.732', '2026-06-07 03:44:42.732');
INSERT INTO `project` VALUES (9, '隋唐洛阳城应天门', '河南省洛阳市老城区定鼎南路', 'active', '2026-06-07 03:44:42.732', '2026-06-07 03:44:42.732');
INSERT INTO `project` VALUES (10, '隋唐洛阳城明堂天堂', '河南省洛阳市老城区中州中路', 'active', '2026-06-07 03:44:42.732', '2026-06-07 03:44:42.732');
INSERT INTO `project` VALUES (11, '九洲池', '河南省洛阳市西工区唐宫中路', 'active', '2026-06-07 03:44:42.733', '2026-06-07 03:44:42.733');
INSERT INTO `project` VALUES (12, '洛阳博物馆', '河南省洛阳市洛龙区聂泰路', 'active', '2026-06-07 03:44:42.733', '2026-06-07 03:44:42.733');
INSERT INTO `project` VALUES (13, '洛邑古城', '河南省洛阳市老城区九都东路', 'active', '2026-06-07 03:44:42.733', '2026-06-07 03:44:42.733');
INSERT INTO `project` VALUES (14, '关林', '河南省洛阳市洛龙区关林南街', 'active', '2026-06-07 03:44:42.733', '2026-06-07 03:44:42.733');
INSERT INTO `project` VALUES (15, '老君山', '河南省洛阳市栾川县七里坪村', 'active', '2026-06-07 03:44:42.733', '2026-06-07 03:44:42.733');
INSERT INTO `project` VALUES (16, '龙潭大峡谷', '河南省洛阳市新安县石井镇', 'active', '2026-06-07 03:44:42.734', '2026-06-07 03:44:42.734');
INSERT INTO `project` VALUES (17, '鸡冠洞', '河南省洛阳市栾川县城西', 'active', '2026-06-07 03:44:42.734', '2026-06-07 03:44:42.734');
INSERT INTO `project` VALUES (18, '重渡沟', '河南省洛阳市栾川县潭头镇', 'active', '2026-06-07 03:44:42.734', '2026-06-07 03:44:42.734');

-- ----------------------------
-- Table structure for reconciliation
-- ----------------------------
DROP TABLE IF EXISTS `reconciliation`;
CREATE TABLE `reconciliation`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `order_count` int NOT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `local_amount` decimal(10, 2) NOT NULL,
  `platform_amount` decimal(10, 2) NOT NULL,
  `diff` decimal(10, 2) NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reconciliation
-- ----------------------------

-- ----------------------------
-- Table structure for refund
-- ----------------------------
DROP TABLE IF EXISTS `refund`;
CREATE TABLE `refund`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `refund_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `method` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `operator_id` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `refund_refund_no_key`(`refund_no` ASC) USING BTREE,
  INDEX `refund_order_id_fkey`(`order_id` ASC) USING BTREE,
  CONSTRAINT `refund_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of refund
-- ----------------------------

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `permissions_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `role_name_key`(`name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role
-- ----------------------------

-- ----------------------------
-- Table structure for ticket_group
-- ----------------------------
DROP TABLE IF EXISTS `ticket_group`;
CREATE TABLE `ticket_group`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ticket_group
-- ----------------------------
INSERT INTO `ticket_group` VALUES (1, '灵川', 0, 'disabled');
INSERT INTO `ticket_group` VALUES (2, '灵川', 1, 'disabled');
INSERT INTO `ticket_group` VALUES (3, '灵川', 1, 'disabled');
INSERT INTO `ticket_group` VALUES (4, '灵川', 0, 'disabled');
INSERT INTO `ticket_group` VALUES (5, '雁山', 0, 'disabled');
INSERT INTO `ticket_group` VALUES (6, '临桂', 0, 'disabled');
INSERT INTO `ticket_group` VALUES (8, '核心景区票', 10, 'active');
INSERT INTO `ticket_group` VALUES (9, '城市文化票', 20, 'active');
INSERT INTO `ticket_group` VALUES (10, '山水休闲票', 30, 'active');
INSERT INTO `ticket_group` VALUES (11, '亲子研学票', 40, 'active');
INSERT INTO `ticket_group` VALUES (12, '夜游演艺票', 50, 'active');

-- ----------------------------
-- Table structure for ticket_type
-- ----------------------------
DROP TABLE IF EXISTS `ticket_type`;
CREATE TABLE `ticket_type`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `valid_days` int NOT NULL DEFAULT 0,
  `usable_days` int NOT NULL DEFAULT 1,
  `total_uses` int NOT NULL DEFAULT 1,
  `gate_uses` int NOT NULL DEFAULT 1,
  `project_limits` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `expire_date` datetime(3) NULL DEFAULT NULL,
  `purchase_limit` int NULL DEFAULT NULL,
  `need_reservation` tinyint(1) NOT NULL DEFAULT 0,
  `need_approval` tinyint(1) NOT NULL DEFAULT 0,
  `total_stock` int NULL DEFAULT NULL,
  `sold_stock` int NOT NULL DEFAULT 0,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ticket_type_group_id_fkey`(`group_id` ASC) USING BTREE,
  CONSTRAINT `ticket_type_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `ticket_group` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ticket_type
-- ----------------------------
INSERT INTO `ticket_type` VALUES (1, 6, '象鼻山', 5.00, 1, 1, 1, 1, NULL, 'disabled', '2026-06-01 00:00:00.000', 2, 1, 0, NULL, 0, '', '2026-05-31 11:44:37.536', '2026-06-07 03:45:17.401');
INSERT INTO `ticket_type` VALUES (7, 8, '龙门石窟成人票', 90.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 7}]', 'active', NULL, 5, 1, 0, 500, 2, '演示票种。适用于龙门石窟景区日间参观，建议按页面提示提前预约，实际开放时间与政策以景区公告为准。', '2026-06-07 03:44:42.738', '2026-06-07 04:14:12.989');
INSERT INTO `ticket_type` VALUES (8, 8, '龙门石窟优惠票', 45.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 7}]', 'active', NULL, 5, 1, 1, 500, 0, '演示票种。适用于符合优惠政策的游客，入园需按景区要求核验证件。', '2026-06-07 03:44:42.739', '2026-06-07 03:44:42.739');
INSERT INTO `ticket_type` VALUES (9, 8, '白马寺成人票', 35.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 8}]', 'active', NULL, 5, 0, 0, 500, 0, '演示票种。适用于白马寺景区参观，适合半日文化游线路。', '2026-06-07 03:44:42.739', '2026-06-07 03:44:42.739');
INSERT INTO `ticket_type` VALUES (10, 9, '关林成人票', 40.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 14}]', 'active', NULL, 5, 0, 0, 500, 0, '演示票种。适用于关林景区参观，可与龙门石窟组成洛阳南线文化游。', '2026-06-07 03:44:42.739', '2026-06-07 03:44:42.739');
INSERT INTO `ticket_type` VALUES (11, 9, '隋唐洛阳城应天门成人票', 60.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 9}]', 'active', NULL, 5, 0, 0, 500, 0, '演示票种。适用于隋唐洛阳城应天门遗址博物馆参观，适合城市历史文化游。', '2026-06-07 03:44:42.740', '2026-06-07 03:44:42.740');
INSERT INTO `ticket_type` VALUES (12, 9, '明堂天堂成人票', 90.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 10}]', 'active', NULL, 5, 0, 0, 500, 0, '演示票种。适用于隋唐洛阳城明堂天堂景区参观，可与应天门联动游览。', '2026-06-07 03:44:42.740', '2026-06-07 03:44:42.740');
INSERT INTO `ticket_type` VALUES (13, 12, '应天门夜游票', 68.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 9}]', 'active', NULL, 5, 1, 0, 500, 0, '演示票种。适用于应天门夜景游览场景，具体场次以页面展示为准。', '2026-06-07 03:44:42.740', '2026-06-07 03:44:42.740');
INSERT INTO `ticket_type` VALUES (14, 12, '九洲池夜游票', 30.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 11}]', 'active', NULL, 5, 1, 0, 500, 0, '演示票种。适用于九洲池夜游及城市夜景游览，具体开放安排以景区公告为准。', '2026-06-07 03:44:42.740', '2026-06-07 03:44:42.740');
INSERT INTO `ticket_type` VALUES (15, 11, '洛阳博物馆预约票', 0.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 12}]', 'active', NULL, 4, 1, 0, 500, 0, '演示预约票。洛阳博物馆常见为预约参观场景，实际预约规则以官方公告为准。', '2026-06-07 03:44:42.741', '2026-06-07 03:44:42.741');
INSERT INTO `ticket_type` VALUES (16, 9, '洛邑古城预约票', 0.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 13}]', 'active', NULL, 4, 1, 0, 500, 0, '演示预约票。适用于洛邑古城游览预约和夜间城市漫游推荐。', '2026-06-07 03:44:42.741', '2026-06-07 03:44:42.741');
INSERT INTO `ticket_type` VALUES (17, 10, '老君山成人票', 100.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 15}]', 'active', NULL, 5, 1, 0, 500, 0, '演示票种。适用于老君山景区基础门票，索道、交通等项目以景区实际展示为准。', '2026-06-07 03:44:42.741', '2026-06-07 03:44:42.741');
INSERT INTO `ticket_type` VALUES (18, 10, '龙潭大峡谷成人票', 80.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 16}]', 'active', NULL, 5, 1, 0, 500, 0, '演示票种。适用于龙潭大峡谷自然山水游览，适合周边一日游。', '2026-06-07 03:44:42.741', '2026-06-07 03:44:42.741');
INSERT INTO `ticket_type` VALUES (19, 10, '鸡冠洞成人票', 80.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 17}]', 'active', NULL, 5, 1, 0, 500, 0, '演示票种。适用于鸡冠洞溶洞景观游览，适合亲子与避暑线路。', '2026-06-07 03:44:42.742', '2026-06-07 03:44:42.742');
INSERT INTO `ticket_type` VALUES (20, 10, '重渡沟成人票', 120.00, 1, 1, 1, 1, '[{\"maxUses\": 1, \"projectId\": 18}]', 'active', NULL, 5, 1, 0, 500, 1, '演示票种。适用于重渡沟山水休闲游览，适合夏季亲水和周边度假。', '2026-06-07 03:44:42.742', '2026-06-07 06:56:01.553');
INSERT INTO `ticket_type` VALUES (21, 11, '洛阳亲子研学联票', 128.00, 2, 2, 2, 2, '[{\"maxUses\": 1, \"projectId\": 12}, {\"maxUses\": 1, \"projectId\": 13}]', 'active', NULL, 4, 1, 0, 500, 0, '演示联票。包含洛阳博物馆预约和洛邑古城游览权益，适合亲子研学线路。', '2026-06-07 03:44:42.742', '2026-06-07 03:44:42.742');
INSERT INTO `ticket_type` VALUES (22, 9, '洛阳古都文化联票', 168.00, 2, 2, 3, 3, '[{\"maxUses\": 1, \"projectId\": 9}, {\"maxUses\": 1, \"projectId\": 10}, {\"maxUses\": 1, \"projectId\": 11}]', 'active', NULL, 4, 1, 0, 500, 0, '演示联票。覆盖应天门、明堂天堂、九洲池等隋唐洛阳城核心文化点位。', '2026-06-07 03:44:42.743', '2026-06-07 03:44:42.743');

-- ----------------------------
-- Table structure for verification
-- ----------------------------
DROP TABLE IF EXISTS `verification`;
CREATE TABLE `verification`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unused',
  `first_verified_at` datetime(3) NULL DEFAULT NULL,
  `verified_by` int NULL DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `verification_order_id_key`(`order_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of verification
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
