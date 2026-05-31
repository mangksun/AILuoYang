<template>
  <div class="page-container">
    <div class="page-header">
      <h2>项目管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增项目
      </el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="项目名称" min-width="200" />
      <el-table-column prop="location" label="位置" min-width="200" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '停用' }}
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

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑项目' : '新增项目'"
      width="520px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入项目位置" maxlength="200" />
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
import { getProjects, createProject, updateProject } from '@/api/ticket';

interface ProjectItem {
  id: number;
  name: string;
  location: string;
  status: string;
}

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number>(0);
const tableData = ref<ProjectItem[]>([]);
const formRef = ref<FormInstance>();

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const form = reactive({
  name: '',
  location: '',
  status: 'active',
});

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入项目位置', trigger: 'blur' }],
};

async function loadData() {
  loading.value = true;
  try {
    const res = await getProjects({
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

function resetForm() {
  form.name = '';
  form.location = '';
  form.status = 'active';
}

function handleAdd() {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
}

function handleEdit(row: ProjectItem) {
  isEdit.value = true;
  editId.value = row.id;
  form.name = row.name;
  form.location = row.location;
  form.status = row.status;
  dialogVisible.value = true;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    const payload = {
      name: form.name,
      location: form.location,
      status: form.status,
    };
    if (isEdit.value) {
      await updateProject(editId.value, payload);
      ElMessage.success('编辑成功');
    } else {
      await createProject(payload);
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

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
