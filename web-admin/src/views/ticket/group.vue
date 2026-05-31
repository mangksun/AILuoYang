<template>
  <div class="page-container">
    <div class="page-header">
      <h2>票种分组管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增分组
      </el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="分组名称" min-width="200" />
      <el-table-column prop="sortOrder" label="排序" width="100" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button
            :type="row.status === 'active' ? 'warning' : 'success'"
            link
            size="small"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 'active' ? '停用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分组' : '新增分组'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分组名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
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
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { getTicketGroups, createTicketGroup, updateTicketGroup } from '@/api/ticket';

interface GroupItem {
  id: number;
  name: string;
  sortOrder: number;
  status: string;
}

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number>(0);
const tableData = ref<GroupItem[]>([]);
const formRef = ref<FormInstance>();

const form = reactive({
  name: '',
  sortOrder: 0,
  status: 'active',
});

const rules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
};

async function loadData() {
  loading.value = true;
  try {
    const res = await getTicketGroups();
    tableData.value = Array.isArray(res) ? res : (res as any)?.list || [];
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.name = '';
  form.sortOrder = 0;
  form.status = 'active';
}

function handleAdd() {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
}

function handleEdit(row: GroupItem) {
  isEdit.value = true;
  editId.value = row.id;
  form.name = row.name;
  form.sortOrder = row.sortOrder;
  form.status = row.status;
  dialogVisible.value = true;
}

async function handleToggleStatus(row: GroupItem) {
  const newStatus = row.status === 'active' ? 'disabled' : 'active';
  try {
    await updateTicketGroup(row.id, { ...row, status: newStatus });
    ElMessage.success(newStatus === 'active' ? '已启用' : '已停用');
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
    const payload = {
      name: form.name,
      sortOrder: form.sortOrder,
      status: form.status,
    };
    if (isEdit.value) {
      await updateTicketGroup(editId.value, payload);
      ElMessage.success('编辑成功');
    } else {
      await createTicketGroup(payload);
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
</style>
