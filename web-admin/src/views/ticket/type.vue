<template>
  <div class="page-container">
    <div class="page-header">
      <h2>票种管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增票种
      </el-button>
    </div>

    <div class="filter-bar">
      <el-select
        v-model="filters.groupId"
        placeholder="选择分组"
        clearable
        style="width: 180px"
        @change="handleSearch"
      >
        <el-option
          v-for="g in groupOptions"
          :key="g.id"
          :label="g.name"
          :value="g.id"
        />
      </el-select>
      <el-select
        v-model="filters.status"
        placeholder="选择状态"
        clearable
        style="width: 140px"
        @change="handleSearch"
      >
        <el-option label="启用" value="active" />
        <el-option label="停用" value="disabled" />
      </el-select>
      <el-input
        v-model="filters.keyword"
        placeholder="搜索票种名称"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" align="center" />
      <el-table-column prop="name" label="票种名称" min-width="160" />
      <el-table-column label="分组" width="120" align="center">
        <template #default="{ row }">
          {{ row.groupName || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="价格" width="100" align="right">
        <template #default="{ row }">
          {{ Number(row.price).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="validDays" label="有效期天数" width="100" align="center" />
      <el-table-column prop="availableDays" label="可用天数" width="100" align="center" />
      <el-table-column prop="totalTimes" label="总次数" width="90" align="center" />
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-popconfirm
            v-if="row.status === 'active'"
            title="确定要停用此票种吗？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="handleDisable(row)"
          >
            <template #reference>
              <el-button type="danger" link size="small">停用</el-button>
            </template>
          </el-popconfirm>
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
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑票种' : '新增票种'"
      width="650px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="所属分组" prop="groupId">
          <el-select v-model="form.groupId" placeholder="请选择所属分组" style="width: 100%">
            <el-option
              v-for="g in groupOptions"
              :key="g.id"
              :label="g.name"
              :value="g.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入票种名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="有效期天数" prop="validDays">
          <el-input-number v-model="form.validDays" :min="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="可用天数" prop="availableDays">
          <el-input-number v-model="form.availableDays" :min="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="总可用次数" prop="totalTimes">
          <el-input-number v-model="form.totalTimes" :min="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开闸次数" prop="gateOpenTimes">
          <el-input-number v-model="form.gateOpenTimes" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="限购数量" prop="purchaseLimit">
          <el-input-number v-model="form.purchaseLimit" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="需要预约">
          <el-switch v-model="form.needReservation" />
        </el-form-item>
        <el-form-item label="需要审核">
          <el-switch v-model="form.needApproval" />
        </el-form-item>
        <el-form-item label="过期日期" prop="expireDate">
          <el-date-picker
            v-model="form.expireDate"
            type="date"
            placeholder="请选择过期日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
            maxlength="500"
            show-word-limit
          />
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
import { ref, reactive, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance } from 'element-plus';
import {
  getTicketTypes,
  createTicketType,
  updateTicketType,
  disableTicketType,
  getTicketGroups,
} from '@/api/ticket';

interface TypeItem {
  id: number;
  name: string;
  groupId: number;
  groupName: string;
  price: number;
  validDays: number;
  availableDays: number;
  totalTimes: number;
  status: string;
}

interface GroupOption {
  id: number;
  name: string;
}

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number>(0);
const tableData = ref<TypeItem[]>([]);
const groupOptions = ref<GroupOption[]>([]);
const formRef = ref<FormInstance>();

const filters = reactive({
  groupId: '',
  status: '',
  keyword: '',
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const form = reactive({
  groupId: '',
  name: '',
  price: 0,
  validDays: 1,
  availableDays: 1,
  totalTimes: 1,
  gateOpenTimes: 0,
  purchaseLimit: 0,
  needReservation: false,
  needApproval: false,
  expireDate: '',
  description: '',
});

const rules = {
  groupId: [{ required: true, message: '请选择所属分组', trigger: 'change' }],
  name: [{ required: true, message: '请输入票种名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  validDays: [{ required: true, message: '请输入有效期天数', trigger: 'blur' }],
  availableDays: [{ required: true, message: '请输入可用天数', trigger: 'blur' }],
  totalTimes: [{ required: true, message: '请输入总可用次数', trigger: 'blur' }],
};

async function loadGroups() {
  try {
    const res = await getTicketGroups();
    groupOptions.value = Array.isArray(res) ? res : res?.list || [];
  } catch {
    // ignore
  }
}

async function loadData() {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    if (filters.groupId) params.groupId = filters.groupId;
    if (filters.status) params.status = filters.status;
    if (filters.keyword) params.keyword = filters.keyword;

    const res = await getTicketTypes(params);
    tableData.value = Array.isArray(res) ? res : res?.list || [];
    pagination.total = res?.total || 0;
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.page = 1;
  loadData();
}

function handleReset() {
  filters.groupId = '';
  filters.status = '';
  filters.keyword = '';
  pagination.page = 1;
  loadData();
}

function resetForm() {
  form.groupId = '';
  form.name = '';
  form.price = 0;
  form.validDays = 1;
  form.availableDays = 1;
  form.totalTimes = 1;
  form.gateOpenTimes = 0;
  form.purchaseLimit = 0;
  form.needReservation = false;
  form.needApproval = false;
  form.expireDate = '';
  form.description = '';
}

function handleAdd() {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
}

function handleEdit(row: TypeItem) {
  isEdit.value = true;
  editId.value = row.id;
  form.groupId = row.groupId;
  form.name = row.name;
  form.price = row.price;
  form.validDays = row.validDays;
  form.availableDays = row.availableDays;
  form.totalTimes = row.totalTimes;
  form.gateOpenTimes = (row as any).gateOpenTimes || 0;
  form.purchaseLimit = (row as any).purchaseLimit || 0;
  form.needReservation = (row as any).needReservation || false;
  form.needApproval = (row as any).needApproval || false;
  form.expireDate = (row as any).expireDate || '';
  form.description = (row as any).description || '';
  dialogVisible.value = true;
}

async function handleDisable(row: TypeItem) {
  try {
    await disableTicketType(row.id);
    ElMessage.success('已停用');
    loadData();
  } catch (err: any) {
    ElMessage.error(err.message || '操作失败');
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    const payload = { ...form };
    if (isEdit.value) {
      await updateTicketType(editId.value, payload);
      ElMessage.success('编辑成功');
    } else {
      await createTicketType(payload);
      ElMessage.success('新增成功');
    }
    dialogVisible.value = false;
    loadData();
  } catch (err: any) {
    ElMessage.error(err.message || '操作失败');
  } finally {
    submitLoading.value = false;
  }
}

onMounted(() => {
  loadGroups();
  loadData();
});
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 20px;
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
