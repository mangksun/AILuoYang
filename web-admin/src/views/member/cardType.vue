<template>
  <div class="page-container">
    <div class="page-header">
      <h2>会员卡类型管理</h2>
      <el-button type="primary" @click="handleAdd">新增卡类型</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="name" label="名称" min-width="120" />
      <el-table-column prop="type" label="类型" width="100" align="center">
        <template #default="{ row }">
          {{ typeMap[row.type] || row.type }}
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" width="100" align="right">
        <template #default="{ row }">
          {{ formatMoney(row.price) }}
        </template>
      </el-table-column>
      <el-table-column prop="valid_days" label="有效天数" width="100" align="center" />
      <el-table-column prop="total_times" label="总次数" width="90" align="center">
        <template #default="{ row }">
          {{ row.total_times ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="anti_cheat_interval" label="防作弊间隔(秒)" width="140" align="center">
        <template #default="{ row }">
          {{ row.anti_cheat_interval ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="allow_card_ticket" label="刷卡购票" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.allow_card_ticket ? 'success' : 'info'" size="small">
            {{ row.allow_card_ticket ? '开启' : '关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑卡类型' : '新增卡类型'"
      width="560px"
      destroy-on-close
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入卡类型名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="年卡" value="annual" />
            <el-option label="次卡" value="times" />
            <el-option label="储值卡" value="stored" />
            <el-option label="计时收费" value="timed" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="有效天数" prop="valid_days">
          <el-input-number
            v-model="formData.valid_days"
            :min="1"
            :step="30"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="总次数" prop="total_times">
          <el-input-number
            v-model="formData.total_times"
            :min="0"
            :step="10"
            style="width: 100%"
          />
          <div class="form-tip">次卡类型需填写，其他类型填 0 或留空</div>
        </el-form-item>
        <el-form-item label="防作弊间隔" prop="anti_cheat_interval">
          <el-input-number
            v-model="formData.anti_cheat_interval"
            :min="0"
            :step="60"
            style="width: 100%"
          />
          <div class="form-tip">两次刷卡的最小间隔（秒），0 表示不限制</div>
        </el-form-item>
        <el-form-item label="刷卡购票">
          <el-switch v-model="formData.allow_card_ticket" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { getMemberCardTypes, createMemberCardType, updateMemberCardType } from '@/api/member';

const typeMap: Record<string, string> = {
  annual: '年卡',
  times: '次卡',
  stored: '储值卡',
  timed: '计时收费',
};

function formatMoney(val: number | string | undefined) {
  if (val === undefined || val === null) return '0.00';
  return Number(val).toFixed(2);
}

const loading = ref(false);
const tableData = ref<any[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();

const formData = reactive({
  name: '',
  type: '',
  price: 0,
  valid_days: 365,
  total_times: 0,
  anti_cheat_interval: 0,
  allow_card_ticket: true,
  status: 'active',
});

const formRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  valid_days: [{ required: true, message: '请输入有效天数', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

async function fetchData() {
  loading.value = true;
  try {
    const res = await getMemberCardTypes();
    tableData.value = res.list || res.records || (Array.isArray(res) ? res : []);
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  isEdit.value = false;
  editId.value = null;
  dialogVisible.value = true;
}

function handleEdit(row: any) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(formData, {
    name: row.name,
    type: row.type,
    price: row.price,
    valid_days: row.valid_days,
    total_times: row.total_times ?? 0,
    anti_cheat_interval: row.anti_cheat_interval ?? 0,
    allow_card_ticket: row.allow_card_ticket ?? true,
    status: row.status,
  });
  dialogVisible.value = true;
}

function resetForm() {
  formRef.value?.resetFields();
  Object.assign(formData, {
    name: '',
    type: '',
    price: 0,
    valid_days: 365,
    total_times: 0,
    anti_cheat_interval: 0,
    allow_card_ticket: true,
    status: 'active',
  });
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    const payload = { ...formData };
    if (isEdit.value && editId.value !== null) {
      await updateMemberCardType(editId.value, payload);
      ElMessage.success('更新成功');
    } else {
      await createMemberCardType(payload);
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    fetchData();
  } catch {
    // error handled by interceptor
  } finally {
    submitLoading.value = false;
  }
}

fetchData();
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

.form-tip {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
  margin-top: 4px;
}
</style>
