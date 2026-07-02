<template>
  <div class="page-container">
    <div class="page-header">
      <h2>小程序用户</h2>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="昵称/手机号"
        clearable
        style="width: 180px"
      />
      <el-select v-model="filters.role" placeholder="角色" clearable style="width: 120px">
        <el-option label="普通用户" value="user" />
        <el-option label="工作人员" value="staff" />
      </el-select>
      <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px">
        <el-option label="正常" value="active" />
        <el-option label="禁用" value="disabled" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="role" label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.role === 'staff' ? 'danger' : ''">
              {{ row.role === 'staff' ? '工作人员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="170" />
        <el-table-column prop="createdAt" label="注册时间" width="170" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
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
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="编辑用户"
      width="450px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户">
          <el-input :model-value="editNickname" disabled />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="普通用户" value="user" />
            <el-option label="工作人员" value="staff" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
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
import { ElMessage, type FormInstance } from 'element-plus';
import { getMiniappUsers, updateMiniappUser } from '@/api/user';

interface MiniappUserItem {
  id: number;
  nickname: string;
  phone: string;
  role: string;
  status: string;
  lastLoginAt: string;
  createdAt: string;
}

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const editId = ref<number>(0);
const editNickname = ref('');
const tableData = ref<MiniappUserItem[]>([]);
const formRef = ref<FormInstance>();

const filters = reactive({
  keyword: '',
  role: '',
  status: '',
});

const form = reactive({
  role: '',
  status: 'active',
});

const rules = {
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

async function loadData() {
  loading.value = true;
  try {
    const res = await getMiniappUsers({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
    });
    tableData.value = res?.list || [];
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
  filters.keyword = '';
  filters.role = '';
  filters.status = '';
  pagination.page = 1;
  loadData();
}

function handleEdit(row: MiniappUserItem) {
  editId.value = row.id;
  editNickname.value = row.nickname || `用户${row.id}`;
  form.role = row.role;
  form.status = row.status;
  dialogVisible.value = true;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await updateMiniappUser(editId.value, {
      role: form.role,
      status: form.status,
    });
    ElMessage.success('编辑成功');
    dialogVisible.value = false;
    loadData();
  } catch (err: any) {
    ElMessage.error(err.message || '操作失败');
  } finally {
    submitLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}
</style>
