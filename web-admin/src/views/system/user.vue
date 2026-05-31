<template>
  <div class="page-container">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>

    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="role" label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row.role)">
              {{ roleMap[row.role] || row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="merchantId" label="商户ID" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
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
        <el-form-item label="用户名">
          <el-input :model-value="editUsername" disabled />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="操作员" value="operator" />
            <el-option label="收银员" value="cashier" />
            <el-option label="财务" value="finance" />
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
import { getUsers, updateUser } from '@/api/user';

interface UserItem {
  id: number;
  username: string;
  role: string;
  merchantId: number;
  status: string;
}

const roleMap: Record<string, string> = {
  admin: '管理员',
  operator: '操作员',
  cashier: '收银员',
  finance: '财务',
};

const roleTagType = (role: string) => {
  const map: Record<string, string> = {
    admin: 'danger',
    operator: '',
    cashier: 'success',
    finance: 'warning',
  };
  return map[role] || 'info';
};

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const editId = ref<number>(0);
const editUsername = ref('');
const tableData = ref<UserItem[]>([]);
const formRef = ref<FormInstance>();

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
    const res = await getUsers({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
    tableData.value = Array.isArray(res) ? res : res?.list || [];
    pagination.total = res?.total || 0;
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function handleEdit(row: UserItem) {
  editId.value = row.id;
  editUsername.value = row.username;
  form.role = row.role;
  form.status = row.status;
  dialogVisible.value = true;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await updateUser(editId.value, {
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
</style>
