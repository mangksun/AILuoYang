SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS ai_chat_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(64) NULL,
  user_input TEXT NOT NULL,
  ai_reply TEXT NULL,
  intent VARCHAR(50) NULL,
  actions_json TEXT NULL,
  latency_ms INT NULL,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'success',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chat_log_id INT NOT NULL,
  user_id INT NULL,
  rating VARCHAR(20) NOT NULL,
  comment TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_inspiration (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  prompt TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_persona_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL DEFAULT '洛灵儿',
  welcome_message TEXT NULL,
  system_prompt TEXT NULL,
  model VARCHAR(100) NULL,
  temperature DECIMAL(4,2) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_knowledge_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content MEDIUMTEXT NOT NULL,
  source_type VARCHAR(30) NOT NULL DEFAULT 'manual',
  embedding_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO ai_inspiration (title, prompt, sort_order, status)
SELECT '两天洛阳文化游', '帮我安排两天洛阳文化游，并推荐适合购买的门票', 10, 'active'
WHERE NOT EXISTS (SELECT 1 FROM ai_inspiration WHERE title = '两天洛阳文化游');

INSERT INTO ai_inspiration (title, prompt, sort_order, status)
SELECT '龙门石窟购票', '我想买龙门石窟门票，有什么推荐？', 20, 'active'
WHERE NOT EXISTS (SELECT 1 FROM ai_inspiration WHERE title = '龙门石窟购票');

INSERT INTO ai_persona_config (name, welcome_message, system_prompt, model, temperature, status)
SELECT '洛灵儿', '你好，我是洛灵儿，可以帮你规划洛阳游玩路线和购票。', '保持亲和、准确、合规，不编造实时票价和库存。', 'deepseek-chat', 0.4, 'active'
WHERE NOT EXISTS (SELECT 1 FROM ai_persona_config WHERE status = 'active');
