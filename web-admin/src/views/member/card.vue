<template>
  <div class="page-container">
    <div class="page-header">
      <h2>会员卡管理</h2>
      <el-button type="primary" @click="handleAdd">新增会员卡</el-button>
    </div>

    <div class="filter-bar">
      <el-select v-model="filters.card_type" placeholder="卡类型" clearable style="width: 140px">
        <el-option label="年卡" value="annual" />
        <el-option label="次卡" value="times" />
        <el-option label="储值卡" value="stored" />
        <el-option label="计时收费" value="timed" />
      </el-select>
      <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px">
        <el-option label="正常" value="active" />
        <el-option label="冻结" value="frozen" />
        <el-option label="过期" value="expired" />
        <el-option label="禁用" value="disabled" />
      </el-select>
      <el-input
        v-model="filters.userId"
        placeholder="用户ID"
        clearable
        style="width: 160px"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="cardNo" label="卡号" min-width="150" show-overflow-tooltip />
      <el-table-column prop="cardType" label="卡类型" width="110" align="center">
        <template #default="{ row }">
          {{ cardTypeMap[row.cardType?.type] || row.cardType?.name || row.cardTypeId }}
        </template>
      </el-table-column>
      <el-table-column prop="userId" label="用户ID" width="100" align="center" />
      <el-table-column prop="balance" label="余额" width="100" align="right">
        <template #default="{ row }">
          {{ formatMoney(row.balance) }}
        </template>
      </el-table-column>
      <el-table-column prop="remainingUses" label="剩余次数" width="100" align="center">
        <template #default="{ row }">
          {{ row.remainingUses ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="activatedAt" label="激活时间" width="170" />
      <el-table-column prop="expireAt" label="过期时间" width="170" />
      <el-table-column prop="status" label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusMap[row.status] || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'active'"
            type="warning"
            link
            size="small"
            @click="handleFreeze(row)"
          >
            冻结
          </el-button>
          <el-button
            v-if="row.status === 'frozen'"
            type="success"
            link
            size="small"
            @click="handleActivate(row)"
          >
            激活
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="新增会员卡" width="500px" destroy-on-close @closed="resetForm">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="卡类型" prop="cardTypeId">
          <el-select v-model="formData.cardTypeId" placeholder="请选择卡类型" style="width: 100%">
            <el-option
              v-for="item in cardTypeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="formData.userId" placeholder="请输入用户ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import {
  getMemberCards,
  createMemberCard,
  freezeMemberCard,
  activateMemberCard,
  getMemberCardTypes,
} from '@/api/member';

const cardTypeMap: Record<string, string> = {
  annual: '年卡',
  times: '次卡',
  stored: '储值卡',
  timed: '计时收费',
};

const statusMap: Record<string, string> = {
  active: '正常',
  frozen: '冻结',
  expired: '过期',
  disabled: '禁用',
};

function statusTagType(status: string) {
  const map: Record<string, string> = {
    active: 'success',
    frozen: 'warning',
    expired: 'danger',
    disabled: 'info',
  };
  return map[status] || 'info';
}

function formatMoney(val: number | string | undefined) {
  if (val === undefined || val === null) return '0.00';
  return Number(val).toFixed(2);
}

const loading = ref(false);
const tableData = ref<any[]>([]);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const cardTypeOptions = ref<any[]>([]);

const filters = reactive({
  cardType: '',
  status: '',
  userId: '',
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const formData = reactive({
  cardTypeId: null as number | null,
  userId: '',
});

const formRules = {
  cardTypeId: [{ required: true, message: '请选择卡类型', trigger: 'change' }],
  userId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
};

async function fetchCardTypes() {
  try {
    const res = await getMemberCardTypes();
    cardTypeOptions.value = res.list || res.records || (Array.isArray(res) ? res : []);
  } catch {
    // error handled by interceptor
  }
}

async function handleSearch() {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    if (filters.cardType) params.cardTypeId = filters.cardType;
    if (filters.status) params.status = filters.status;
    if (filters.userId.trim()) params.userId = filters.userId.trim();
    const res = await getMemberCards(params);
    tableData.value = res.list || res.records || [];
    pagination.total = res.total || 0;
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  filters.cardType = '';
  filters.status = '';
  filters.userId = '';
  pagination.page = 1;
  handleSearch();
}

function handleAdd() {
  dialogVisible.value = true;
}

function resetForm() {
  formRef.value?.resetFields();
  Object.assign(formData, {
    cardTypeId: null,
    userId: '',
  });
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await createMemberCard({
      cardNo: `MC${Date.now()}`,
      cardTypeId: formData.cardTypeId,
      userId: Number(formData.userId),
    });
    ElMessage.success('新增成功');
    dialogVisible.value = false;
    handleSearch();
  } catch {
    // error handled by interceptor
  } finally {
    submitLoading.value = false;
  }
}

async function handleFreeze(row: any) {
  try {
    await ElMessageBox.confirm(
      `确认冻结卡号 ${row.cardNo}？冻结后该卡将无法使用。`,
      '冻结确认',
      { type: 'warning' }
    );
  } catch {
    return;
  }

  try {
    await freezeMemberCard(row.id);
    ElMessage.success('冻结成功');
    handleSearch();
  } catch {
    // error handled by interceptor
  }
}

async function handleActivate(row: any) {
  try {
    await ElMessageBox.confirm(
      `确认激活卡号 ${row.cardNo}？`,
      '激活确认',
      { type: 'info' }
    );
  } catch {
    return;
  }

  try {
    await activateMemberCard(row.id);
    ElMessage.success('激活成功');
    handleSearch();
  } catch {
    // error handled by interceptor
  }
}

fetchCardTypes();
handleSearch();
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 20px;
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
