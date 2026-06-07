<template>
  <div class="page-container ai-admin-page">
    <div class="page-header">
      <h2>AI 后台</h2>
      <el-button :loading="loading" @click="loadAll">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <el-row :gutter="16" class="metric-row">
      <el-col :span="6">
        <el-card shadow="never" class="metric-card">
          <div class="metric-value">{{ overview.totalChats || 0 }}</div>
          <div class="metric-label">对话总量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="metric-card">
          <div class="metric-value">{{ overview.activeInspirations || 0 }}</div>
          <div class="metric-label">启用灵感词</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="metric-card">
          <div class="metric-value">{{ overview.activeKnowledge || 0 }}</div>
          <div class="metric-label">知识库条目</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="metric-card">
          <div class="metric-value">{{ overview.tokenUsage?.avgLatencyMs || 0 }}ms</div>
          <div class="metric-label">平均响应耗时</div>
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" class="admin-tabs">
      <el-tab-pane label="运营总览" name="overview">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>意图分布</template>
              <el-table :data="overview.intentDistribution || []" border>
                <el-table-column prop="intent" label="意图" />
                <el-table-column prop="count" label="次数" width="120" align="right" />
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>Token 与成本</template>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="Prompt Tokens">
                  {{ overview.tokenUsage?.promptTokens || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="Completion Tokens">
                  {{ overview.tokenUsage?.completionTokens || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="Total Tokens">
                  {{ overview.tokenUsage?.totalTokens || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="估算成本">
                  ¥{{ overview.tokenUsage?.estimatedCost || 0 }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="对话审计" name="logs">
        <el-table :data="chatLogs" v-loading="loading" border stripe>
          <el-table-column prop="id" label="ID" width="70" align="center" />
          <el-table-column prop="user_input" label="用户输入" min-width="220" show-overflow-tooltip />
          <el-table-column prop="ai_reply" label="AI 回复" min-width="260" show-overflow-tooltip />
          <el-table-column prop="intent" label="意图" width="130" />
          <el-table-column prop="latency_ms" label="耗时(ms)" width="100" align="right" />
          <el-table-column prop="status" label="状态" width="100" align="center" />
          <el-table-column prop="created_at" label="时间" width="190" />
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="logPager.page"
            v-model:page-size="logPager.pageSize"
            :total="logPager.total"
            layout="total, prev, pager, next"
            @current-change="loadChatLogs"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="灵感词" name="inspirations">
        <div class="toolbar">
          <el-button type="primary" @click="openInspirationDialog()">
            <el-icon><Plus /></el-icon>
            新增灵感词
          </el-button>
        </div>
        <el-table :data="inspirations" border stripe>
          <el-table-column prop="title" label="标题" width="180" />
          <el-table-column prop="prompt" label="提示词" min-width="320" show-overflow-tooltip />
          <el-table-column prop="sort_order" label="排序" width="90" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === 'active' ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click="openInspirationDialog(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="数字人配置" name="persona">
        <el-card shadow="never">
          <el-form :model="personaForm" label-width="120px" class="persona-form">
            <el-form-item label="名称">
              <el-input v-model="personaForm.name" maxlength="100" />
            </el-form-item>
            <el-form-item label="欢迎语">
              <el-input v-model="personaForm.welcome_message" type="textarea" :rows="2" />
            </el-form-item>
            <el-form-item label="System Prompt">
              <el-input v-model="personaForm.system_prompt" type="textarea" :rows="5" />
            </el-form-item>
            <el-form-item label="模型">
              <el-input v-model="personaForm.model" placeholder="deepseek-chat" />
            </el-form-item>
            <el-form-item label="Temperature">
              <el-input-number v-model="personaForm.temperature" :min="0" :max="2" :step="0.1" />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="personaForm.status" style="width: 180px">
                <el-option label="启用" value="active" />
                <el-option label="停用" value="disabled" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="savePersona">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="知识库" name="knowledge">
        <div class="toolbar">
          <el-button type="primary" @click="openKnowledgeDialog()">
            <el-icon><Plus /></el-icon>
            新增知识
          </el-button>
        </div>
        <el-table :data="knowledgeItems" border stripe>
          <el-table-column prop="title" label="标题" width="220" />
          <el-table-column prop="content" label="内容" min-width="320" show-overflow-tooltip />
          <el-table-column prop="source_type" label="来源" width="100" />
          <el-table-column prop="embedding_status" label="向量状态" width="110" />
          <el-table-column prop="status" label="状态" width="90" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click="openKnowledgeDialog(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="反馈" name="feedback">
        <el-table :data="feedback" border stripe>
          <el-table-column prop="id" label="ID" width="70" align="center" />
          <el-table-column prop="chat_log_id" label="对话ID" width="100" align="center" />
          <el-table-column prop="rating" label="评价" width="120" />
          <el-table-column prop="comment" label="备注" min-width="280" show-overflow-tooltip />
          <el-table-column prop="created_at" label="时间" width="190" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="inspirationDialogVisible" title="灵感词配置" width="560px">
      <el-form :model="inspirationForm" label-width="90px">
        <el-form-item label="标题">
          <el-input v-model="inspirationForm.title" maxlength="100" />
        </el-form-item>
        <el-form-item label="提示词">
          <el-input v-model="inspirationForm.prompt" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="inspirationForm.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="inspirationForm.status" style="width: 160px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inspirationDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveInspiration">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="knowledgeDialogVisible" title="知识库条目" width="680px">
      <el-form :model="knowledgeForm" label-width="90px">
        <el-form-item label="标题">
          <el-input v-model="knowledgeForm.title" maxlength="200" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="knowledgeForm.content" type="textarea" :rows="8" />
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="knowledgeForm.source_type" style="width: 160px">
            <el-option label="手动录入" value="manual" />
            <el-option label="FAQ" value="faq" />
            <el-option label="文档" value="document" />
          </el-select>
        </el-form-item>
        <el-form-item label="向量状态">
          <el-select v-model="knowledgeForm.embedding_status" style="width: 160px">
            <el-option label="待同步" value="pending" />
            <el-option label="已同步" value="synced" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="knowledgeForm.status" style="width: 160px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="knowledgeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveKnowledge">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  createAiInspiration,
  createAiKnowledge,
  getAiChatLogs,
  getAiFeedback,
  getAiInspirations,
  getAiKnowledge,
  getAiOverview,
  getAiPersona,
  updateAiInspiration,
  updateAiKnowledge,
  updateAiPersona,
} from '@/api/ai';

const activeTab = ref('overview');
const loading = ref(false);
const saving = ref(false);

const overview = ref<any>({});
const chatLogs = ref<any[]>([]);
const inspirations = ref<any[]>([]);
const knowledgeItems = ref<any[]>([]);
const feedback = ref<any[]>([]);

const logPager = reactive({ page: 1, pageSize: 20, total: 0 });

const personaForm = reactive<any>({
  name: '洛灵儿',
  welcome_message: '',
  system_prompt: '',
  model: 'deepseek-chat',
  temperature: 0.4,
  status: 'active',
});

const inspirationDialogVisible = ref(false);
const editingInspirationId = ref<number | null>(null);
const inspirationForm = reactive<any>({
  title: '',
  prompt: '',
  sort_order: 0,
  status: 'active',
});

const knowledgeDialogVisible = ref(false);
const editingKnowledgeId = ref<number | null>(null);
const knowledgeForm = reactive<any>({
  title: '',
  content: '',
  source_type: 'manual',
  embedding_status: 'pending',
  status: 'active',
});

async function loadOverview() {
  overview.value = await getAiOverview();
}

async function loadChatLogs() {
  const data: any = await getAiChatLogs({
    page: logPager.page,
    pageSize: logPager.pageSize,
  });
  chatLogs.value = data.list || [];
  logPager.total = data.total || 0;
}

async function loadInspirations() {
  const data: any = await getAiInspirations({ page: 1, pageSize: 100 });
  inspirations.value = data.list || [];
}

async function loadPersona() {
  const data: any = await getAiPersona();
  if (data) {
    Object.assign(personaForm, data);
    personaForm.temperature = Number(data.temperature ?? 0.4);
  }
}

async function loadKnowledge() {
  const data: any = await getAiKnowledge({ page: 1, pageSize: 100 });
  knowledgeItems.value = data.list || [];
}

async function loadFeedback() {
  const data: any = await getAiFeedback({ page: 1, pageSize: 100 });
  feedback.value = data.list || [];
}

async function loadAll() {
  loading.value = true;
  try {
    await Promise.all([
      loadOverview(),
      loadChatLogs(),
      loadInspirations(),
      loadPersona(),
      loadKnowledge(),
      loadFeedback(),
    ]);
  } finally {
    loading.value = false;
  }
}

function openInspirationDialog(row?: any) {
  editingInspirationId.value = row?.id || null;
  Object.assign(inspirationForm, {
    title: row?.title || '',
    prompt: row?.prompt || '',
    sort_order: row?.sort_order || 0,
    status: row?.status || 'active',
  });
  inspirationDialogVisible.value = true;
}

async function saveInspiration() {
  saving.value = true;
  try {
    if (editingInspirationId.value) {
      await updateAiInspiration(editingInspirationId.value, inspirationForm);
    } else {
      await createAiInspiration(inspirationForm);
    }
    ElMessage.success('保存成功');
    inspirationDialogVisible.value = false;
    await Promise.all([loadInspirations(), loadOverview()]);
  } finally {
    saving.value = false;
  }
}

async function savePersona() {
  saving.value = true;
  try {
    await updateAiPersona(personaForm);
    ElMessage.success('保存成功');
  } finally {
    saving.value = false;
  }
}

function openKnowledgeDialog(row?: any) {
  editingKnowledgeId.value = row?.id || null;
  Object.assign(knowledgeForm, {
    title: row?.title || '',
    content: row?.content || '',
    source_type: row?.source_type || 'manual',
    embedding_status: row?.embedding_status || 'pending',
    status: row?.status || 'active',
  });
  knowledgeDialogVisible.value = true;
}

async function saveKnowledge() {
  saving.value = true;
  try {
    if (editingKnowledgeId.value) {
      await updateAiKnowledge(editingKnowledgeId.value, knowledgeForm);
    } else {
      await createAiKnowledge(knowledgeForm);
    }
    ElMessage.success('保存成功');
    knowledgeDialogVisible.value = false;
    await Promise.all([loadKnowledge(), loadOverview()]);
  } finally {
    saving.value = false;
  }
}

onMounted(loadAll);
</script>

<style scoped lang="scss">
.ai-admin-page {
  .metric-row {
    margin-bottom: 16px;
  }

  .metric-card {
    border-radius: 6px;

    .metric-value {
      font-size: 28px;
      line-height: 36px;
      font-weight: 700;
      color: #1f2d3d;
    }

    .metric-label {
      margin-top: 6px;
      color: #7a8491;
      font-size: 13px;
    }
  }

  .admin-tabs {
    background: #fff;
    padding: 16px;
    border-radius: 6px;
  }

  .toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .persona-form {
    max-width: 760px;
  }
}
</style>
