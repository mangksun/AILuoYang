SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

START TRANSACTION;

INSERT INTO ticket_group (name, sort_order, status)
SELECT '核心景区票', 10, 'active'
WHERE NOT EXISTS (SELECT 1 FROM ticket_group WHERE name = '核心景区票');

INSERT INTO ticket_group (name, sort_order, status)
SELECT '城市文化票', 20, 'active'
WHERE NOT EXISTS (SELECT 1 FROM ticket_group WHERE name = '城市文化票');

INSERT INTO ticket_group (name, sort_order, status)
SELECT '山水休闲票', 30, 'active'
WHERE NOT EXISTS (SELECT 1 FROM ticket_group WHERE name = '山水休闲票');

INSERT INTO ticket_group (name, sort_order, status)
SELECT '亲子研学票', 40, 'active'
WHERE NOT EXISTS (SELECT 1 FROM ticket_group WHERE name = '亲子研学票');

INSERT INTO ticket_group (name, sort_order, status)
SELECT '夜游演艺票', 50, 'active'
WHERE NOT EXISTS (SELECT 1 FROM ticket_group WHERE name = '夜游演艺票');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '龙门石窟', '河南省洛阳市洛龙区龙门中街', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '龙门石窟');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '白马寺', '河南省洛阳市瀍河回族区洛白路', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '白马寺');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '隋唐洛阳城应天门', '河南省洛阳市老城区定鼎南路', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '隋唐洛阳城应天门');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '隋唐洛阳城明堂天堂', '河南省洛阳市老城区中州中路', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '隋唐洛阳城明堂天堂');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '九洲池', '河南省洛阳市西工区唐宫中路', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '九洲池');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '洛阳博物馆', '河南省洛阳市洛龙区聂泰路', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '洛阳博物馆');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '洛邑古城', '河南省洛阳市老城区九都东路', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '洛邑古城');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '关林', '河南省洛阳市洛龙区关林南街', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '关林');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '老君山', '河南省洛阳市栾川县七里坪村', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '老君山');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '龙潭大峡谷', '河南省洛阳市新安县石井镇', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '龙潭大峡谷');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '鸡冠洞', '河南省洛阳市栾川县城西', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '鸡冠洞');

INSERT INTO project (name, location, status, created_at, updated_at)
SELECT '重渡沟', '河南省洛阳市栾川县潭头镇', 'active', NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM project WHERE name = '重渡沟');

SET @core_group_id = (SELECT id FROM ticket_group WHERE name = '核心景区票' ORDER BY id LIMIT 1);
SET @culture_group_id = (SELECT id FROM ticket_group WHERE name = '城市文化票' ORDER BY id LIMIT 1);
SET @nature_group_id = (SELECT id FROM ticket_group WHERE name = '山水休闲票' ORDER BY id LIMIT 1);
SET @study_group_id = (SELECT id FROM ticket_group WHERE name = '亲子研学票' ORDER BY id LIMIT 1);
SET @night_group_id = (SELECT id FROM ticket_group WHERE name = '夜游演艺票' ORDER BY id LIMIT 1);

SET @longmen_id = (SELECT id FROM project WHERE name = '龙门石窟' ORDER BY id LIMIT 1);
SET @baima_id = (SELECT id FROM project WHERE name = '白马寺' ORDER BY id LIMIT 1);
SET @yingtianmen_id = (SELECT id FROM project WHERE name = '隋唐洛阳城应天门' ORDER BY id LIMIT 1);
SET @mingtang_id = (SELECT id FROM project WHERE name = '隋唐洛阳城明堂天堂' ORDER BY id LIMIT 1);
SET @jiuzhouchi_id = (SELECT id FROM project WHERE name = '九洲池' ORDER BY id LIMIT 1);
SET @museum_id = (SELECT id FROM project WHERE name = '洛阳博物馆' ORDER BY id LIMIT 1);
SET @luoyi_id = (SELECT id FROM project WHERE name = '洛邑古城' ORDER BY id LIMIT 1);
SET @guanlin_id = (SELECT id FROM project WHERE name = '关林' ORDER BY id LIMIT 1);
SET @laojunshan_id = (SELECT id FROM project WHERE name = '老君山' ORDER BY id LIMIT 1);
SET @longtan_id = (SELECT id FROM project WHERE name = '龙潭大峡谷' ORDER BY id LIMIT 1);
SET @jiguandong_id = (SELECT id FROM project WHERE name = '鸡冠洞' ORDER BY id LIMIT 1);
SET @chongdugou_id = (SELECT id FROM project WHERE name = '重渡沟' ORDER BY id LIMIT 1);

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @core_group_id, '龙门石窟成人票', 90.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @longmen_id, 'maxUses', 1)),
  'active', NULL, 5, TRUE, FALSE,
  '演示票种。适用于龙门石窟景区日间参观，建议按页面提示提前预约，实际开放时间与政策以景区公告为准。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '龙门石窟成人票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @core_group_id, '龙门石窟优惠票', 45.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @longmen_id, 'maxUses', 1)),
  'active', NULL, 5, TRUE, TRUE,
  '演示票种。适用于符合优惠政策的游客，入园需按景区要求核验证件。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '龙门石窟优惠票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @core_group_id, '白马寺成人票', 35.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @baima_id, 'maxUses', 1)),
  'active', NULL, 5, FALSE, FALSE,
  '演示票种。适用于白马寺景区参观，适合半日文化游线路。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '白马寺成人票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @culture_group_id, '关林成人票', 40.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @guanlin_id, 'maxUses', 1)),
  'active', NULL, 5, FALSE, FALSE,
  '演示票种。适用于关林景区参观，可与龙门石窟组成洛阳南线文化游。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '关林成人票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @culture_group_id, '隋唐洛阳城应天门成人票', 60.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @yingtianmen_id, 'maxUses', 1)),
  'active', NULL, 5, FALSE, FALSE,
  '演示票种。适用于隋唐洛阳城应天门遗址博物馆参观，适合城市历史文化游。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '隋唐洛阳城应天门成人票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @culture_group_id, '明堂天堂成人票', 90.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @mingtang_id, 'maxUses', 1)),
  'active', NULL, 5, FALSE, FALSE,
  '演示票种。适用于隋唐洛阳城明堂天堂景区参观，可与应天门联动游览。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '明堂天堂成人票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @night_group_id, '应天门夜游票', 68.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @yingtianmen_id, 'maxUses', 1)),
  'active', NULL, 5, TRUE, FALSE,
  '演示票种。适用于应天门夜景游览场景，具体场次以页面展示为准。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '应天门夜游票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @night_group_id, '九洲池夜游票', 30.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @jiuzhouchi_id, 'maxUses', 1)),
  'active', NULL, 5, TRUE, FALSE,
  '演示票种。适用于九洲池夜游及城市夜景游览，具体开放安排以景区公告为准。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '九洲池夜游票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @study_group_id, '洛阳博物馆预约票', 0.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @museum_id, 'maxUses', 1)),
  'active', NULL, 4, TRUE, FALSE,
  '演示预约票。洛阳博物馆常见为预约参观场景，实际预约规则以官方公告为准。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '洛阳博物馆预约票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @culture_group_id, '洛邑古城预约票', 0.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @luoyi_id, 'maxUses', 1)),
  'active', NULL, 4, TRUE, FALSE,
  '演示预约票。适用于洛邑古城游览预约和夜间城市漫游推荐。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '洛邑古城预约票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @nature_group_id, '老君山成人票', 100.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @laojunshan_id, 'maxUses', 1)),
  'active', NULL, 5, TRUE, FALSE,
  '演示票种。适用于老君山景区基础门票，索道、交通等项目以景区实际展示为准。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '老君山成人票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @nature_group_id, '龙潭大峡谷成人票', 80.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @longtan_id, 'maxUses', 1)),
  'active', NULL, 5, TRUE, FALSE,
  '演示票种。适用于龙潭大峡谷自然山水游览，适合周边一日游。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '龙潭大峡谷成人票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @nature_group_id, '鸡冠洞成人票', 80.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @jiguandong_id, 'maxUses', 1)),
  'active', NULL, 5, TRUE, FALSE,
  '演示票种。适用于鸡冠洞溶洞景观游览，适合亲子与避暑线路。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '鸡冠洞成人票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @nature_group_id, '重渡沟成人票', 120.00, 1, 1, 1, 1,
  JSON_ARRAY(JSON_OBJECT('projectId', @chongdugou_id, 'maxUses', 1)),
  'active', NULL, 5, TRUE, FALSE,
  '演示票种。适用于重渡沟山水休闲游览，适合夏季亲水和周边度假。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '重渡沟成人票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @study_group_id, '洛阳亲子研学联票', 128.00, 2, 2, 2, 2,
  JSON_ARRAY(
    JSON_OBJECT('projectId', @museum_id, 'maxUses', 1),
    JSON_OBJECT('projectId', @luoyi_id, 'maxUses', 1)
  ),
  'active', NULL, 4, TRUE, FALSE,
  '演示联票。包含洛阳博物馆预约和洛邑古城游览权益，适合亲子研学线路。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '洛阳亲子研学联票');

INSERT INTO ticket_type (
  group_id, name, price, valid_days, usable_days, total_uses, gate_uses,
  project_limits, status, expire_date, purchase_limit, need_reservation, need_approval,
  description, created_at, updated_at
)
SELECT @culture_group_id, '洛阳古都文化联票', 168.00, 2, 2, 3, 3,
  JSON_ARRAY(
    JSON_OBJECT('projectId', @yingtianmen_id, 'maxUses', 1),
    JSON_OBJECT('projectId', @mingtang_id, 'maxUses', 1),
    JSON_OBJECT('projectId', @jiuzhouchi_id, 'maxUses', 1)
  ),
  'active', NULL, 4, TRUE, FALSE,
  '演示联票。覆盖应天门、明堂天堂、九洲池等隋唐洛阳城核心文化点位。',
  NOW(3), NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM ticket_type WHERE name = '洛阳古都文化联票');

COMMIT;

UPDATE ticket_type
SET total_stock = 500, sold_stock = COALESCE(sold_stock, 0)
WHERE status = 'active' AND total_stock IS NULL;
