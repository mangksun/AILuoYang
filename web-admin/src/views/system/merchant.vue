<template>
  <div class="page-container">
    <div class="page-header">
      <h2>商户配置</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增商户
      </el-button>
    </div>

    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="商户名称" min-width="200" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleConfig(row)">
              配置
            </el-button>
            <el-button type="warning" link size="small" @click="handleEdit(row)">
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

    <!-- 新增/编辑商户弹窗 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEdit ? '编辑商户' : '新增商户'"
      width="450px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商户名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleFormSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 配置弹窗 -->
    <el-dialog
      v-model="configDialogVisible"
      title="商户配置"
      width="500px"
      destroy-on-close
    >
      <el-form label-width="160px">
        <el-form-item label="刷卡购票开关">
          <el-switch v-model="config.swipePurchaseEnabled" />
        </el-form-item>
        <el-form-item label="身份证免票开关">
          <el-switch v-model="config.identityVerifyEnabled" />
        </el-form-item>
        <el-form-item label="计时收费开关">
          <el-switch v-model="config.timedChargeEnabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="configLoading" @click="handleConfigSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { getMerchants, createMerchant, updateMerchantConfig } from '@/api/user';

interface MerchantItem {
  id: number;
  name: string;
  status: string;
  swipePurchaseEnabled?: boolean;
  identityVerifyEnabled?: boolean;
  timedChargeEnabled?: boolean;
}

const loading = ref(false);
const submitLoading = ref(false);
const configLoading = ref(false);
const formDialogVisible = ref(false);
const configDialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number>(0);
const tableData = ref<MerchantItem[]>([]);
const formRef = ref<FormInstance>();

const form = reactive({
  name: '',
  status: 'active',
});

const config = reactive({
  swipePurchaseEnabled: false,
  identityVerifyEnabled: false,
  timedChargeEnabled: false,
});

const formRules = {
  name: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
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
    const res = await getMerchants({
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
  form.status = 'active';
}

function handleAdd() {
  isEdit.value = false;
  resetForm();
  formDialogVisible.value = true;
}

function handleEdit(row: MerchantItem) {
  isEdit.value = true;
  editId.value = row.id;
  form.name = row.name;
  form.status = row.status;
  formDialogVisible.value = true;
}

function handleConfig(row: MerchantItem) {
  editId.value = row.id;
  config.swipePurchaseEnabled = row.swipePurchaseEnabled ?? false;
  config.identityVerifyEnabled = row.identityVerifyEnabled ?? false;
  config.timedChargeEnabled = row.timedChargeEnabled ?? false;
  configDialogVisible.value = true;
}

async function handleFormSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    const payload = {
      name: form.name,
      status: form.status,
    };
    if (isEdit.value) {
      await updateMerchantConfig(editId.value, payload);
      ElMessage.success('编辑成功');
    } else {
      await createMerchant(payload);
      ElMessage.success('新增成功');
    }
    formDialogVisible.value = false;
    loadData();
  } catch (err: any) {
    ElMessage.error(err.message || '操作失败');
  } finally {
    submitLoading.value = false;
  }
}

async function handleConfigSubmit() {
  configLoading.value = true;
  try {
    await updateMerchantConfig(editId.value, {
      swipePurchaseEnabled: config.swipePurchaseEnabled,
      identityVerifyEnabled: config.identityVerifyEnabled,
      timedChargeEnabled: config.timedChargeEnabled,
    });
    ElMessage.success('配置保存成功');
    configDialogVisible.value = false;
    loadData();
  } catch (err: any) {
    ElMessage.error(err.message || '操作失败');
  } finally {
    configLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
</style>
